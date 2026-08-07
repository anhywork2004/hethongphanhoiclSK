import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { sendPushToGroupMembers } from "@/lib/push";
import { NextResponse } from "next/server";

async function assertMember(
  prisma: Awaited<ReturnType<typeof getPrisma>>,
  groupId: string,
  userId: string,
) {
  const membership = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!membership;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  if (!(await assertMember(prisma, id, payload.userId))) {
    return NextResponse.json({ error: "Bạn không thuộc nhóm này" }, { status: 403 });
  }

  const url = new URL(req.url);
  const since = url.searchParams.get("since");

  const messages = await prisma.chatMessage.findMany({
    where: {
      groupId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      sender: { select: userPublicSelect },
      incident: {
        include: {
          machine: { include: { team: true, productionLine: true } },
          reporter: { select: userPublicSelect },
          assignedTo: { select: userPublicSelect },
        },
      },
    },
  });

  // Mobile app chỉ cần tên danh mục (Tổ/Chuyền) để hiển thị trên thẻ cảnh báo sự cố.
  const flattened = messages.map((m) => {
    if (!m.incident) return m;
    return {
      ...m,
      incident: {
        ...m.incident,
        machine: {
          ...m.incident.machine,
          team: m.incident.machine.team?.name ?? null,
          productionLine: m.incident.machine.productionLine?.name ?? null,
        },
      },
    };
  });

  return NextResponse.json(flattened);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  if (!(await assertMember(prisma, id, payload.userId))) {
    return NextResponse.json({ error: "Bạn không thuộc nhóm này" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Thiếu nội dung tin nhắn" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { groupId: id, senderId: payload.userId, type: "TEXT", content },
    include: { sender: { select: userPublicSelect } },
  });

  const group = await prisma.chatGroup.findUnique({ where: { id } });
  await sendPushToGroupMembers(
    prisma,
    id,
    {
      title: group?.name || payload.name,
      body: `${payload.name}: ${content}`,
      data: { type: "CHAT_MESSAGE", groupId: id },
    },
    payload.userId,
  );

  return NextResponse.json(message, { status: 201 });
}
