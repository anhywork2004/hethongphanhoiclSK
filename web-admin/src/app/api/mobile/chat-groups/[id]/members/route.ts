import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { sendPushToUsers } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const { employeeCode } = await req.json();
  if (!employeeCode) return NextResponse.json({ error: "Thiếu mã nhân viên" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { employeeCode } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });

  const existingMember = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (existingMember) {
    return NextResponse.json({ error: "Nhân viên đã ở trong nhóm" }, { status: 409 });
  }

  const existingInvitation = await prisma.groupInvitation.findFirst({
    where: { groupId: id, invitedUserId: user.id, status: "PENDING" },
  });
  if (existingInvitation) {
    return NextResponse.json({ error: "Đã có lời mời đang chờ nhân viên này phản hồi" }, { status: 409 });
  }

  const invitation = await prisma.groupInvitation.create({
    data: { groupId: id, invitedUserId: user.id, invitedById: payload.userId },
    include: { invitedUser: { select: userPublicSelect } },
  });

  await sendPushToUsers(prisma, [user.id], {
    title: "Lời mời vào nhóm chat",
    body: `${payload.name} đã mời bạn vào một nhóm chat`,
    data: { type: "INVITATION", invitationId: invitation.id },
  });

  return NextResponse.json(invitation, { status: 201 });
}
