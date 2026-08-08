import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const invitation = await prisma.groupInvitation.findUnique({ where: { id } });
  if (!invitation) return NextResponse.json({ error: "Không tìm thấy lời mời" }, { status: 404 });
  if (invitation.invitedUserId !== payload.userId) {
    return NextResponse.json({ error: "Lời mời này không dành cho bạn" }, { status: 403 });
  }
  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Lời mời đã được xử lý" }, { status: 409 });
  }

  const updated = await prisma.groupInvitation.update({
    where: { id },
    data: { status: "REJECTED", respondedAt: new Date() },
  });

  return NextResponse.json(updated);
}
