import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const membership = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: payload.userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Bạn không thuộc nhóm này" }, { status: 403 });
  }

  const { name, image } = await req.json();

  const group = await prisma.chatGroup.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(image !== undefined ? { image } : {}),
    },
  });

  return NextResponse.json(group);
}
