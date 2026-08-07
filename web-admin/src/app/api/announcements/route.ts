import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { userPublicSelect } from "@/lib/selects";
import { sendPushToUsers } from "@/lib/push";
import { NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: userPublicSelect } },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const { title, content, image } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Thiếu tiêu đề hoặc nội dung" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { title, content, image: image || null, createdById: (session!.user as { id: string }).id },
  });

  const allUsers = await prisma.user.findMany({ select: { id: true } });
  await sendPushToUsers(
    prisma,
    allUsers.map((u) => u.id),
    { title: `📢 ${title}`, body: content, data: { type: "ANNOUNCEMENT", announcementId: announcement.id } },
  );

  return NextResponse.json(announcement, { status: 201 });
}
