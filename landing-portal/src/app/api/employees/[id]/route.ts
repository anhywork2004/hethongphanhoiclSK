import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { leaveAllAreaMaintenanceGroups, syncMaintenanceAreaMembership } from "@/lib/area-chat-group";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const body = await req.json();
  const { employeeCode, name, phone, role, password, areaId } = body;

  const data: Record<string, unknown> = { employeeCode, name, phone, role, areaId: areaId || null };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      employeeCode: true,
      name: true,
      phone: true,
      role: true,
      areaId: true,
      area: { select: { id: true, name: true } },
    },
  });

  // Đồng bộ lại nhóm chat theo khu vực nếu là nhân viên bảo trì; nếu đổi sang vai trò khác
  // thì rời hết các nhóm khu vực (không còn thấy cảnh báo sự cố nữa).
  if (role === "MAINTENANCE") {
    await syncMaintenanceAreaMembership(prisma, user.id, areaId || null);
  } else {
    await leaveAllAreaMaintenanceGroups(prisma, user.id);
  }

  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
