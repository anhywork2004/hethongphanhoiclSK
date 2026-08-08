import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const groups = await prisma.chatGroup.findMany({
    where: { members: { some: { userId: payload.userId } } },
    include: {
      members: { include: { user: { select: userPublicSelect } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  if (payload.role !== "MAINTENANCE" && payload.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Chỉ nhân viên bảo trì mới được tạo nhóm chat" },
      { status: 403 },
    );
  }

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Thiếu tên nhóm" }, { status: 400 });

  const group = await prisma.chatGroup.create({
    data: {
      name,
      members: { create: [{ userId: payload.userId }] },
    },
    include: { members: { include: { user: { select: userPublicSelect } } } },
  });

  return NextResponse.json(group, { status: 201 });
}
