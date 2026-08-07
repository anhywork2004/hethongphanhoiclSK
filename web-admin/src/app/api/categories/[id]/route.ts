import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import type { StatusKind } from "@/generated/prisma/enums";

const VALID_KINDS: StatusKind[] = ["ACTIVE", "STOPPED", "MAINTENANCE"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const body = await req.json();
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  // Hành động riêng: đặt/bỏ mục này làm "mặc định hệ thống" cho 1 trong 3 nhóm gốc
  // (Hoạt động/Dừng/Bảo trì) — mobile app & KPI dùng mục này để tự đổi trạng thái máy.
  if ("setSystemDefault" in body) {
    if (current.type !== "MACHINE_STATUS") {
      return NextResponse.json(
        { error: "Chỉ áp dụng cho danh mục Trạng thái máy" },
        { status: 400 },
      );
    }
    const kind = body.setSystemDefault as StatusKind | null;
    if (kind !== null && !VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Nhóm không hợp lệ" }, { status: 400 });
    }
    if (kind) {
      await prisma.category.updateMany({
        where: { type: "MACHINE_STATUS", statusKind: kind, id: { not: id } },
        data: { statusKind: null },
      });
    }
    const updated = await prisma.category.update({
      where: { id },
      data: { statusKind: kind },
    });
    return NextResponse.json(updated);
  }

  const { name, days, colorHex, order } = body;

  if (name && name !== current.name) {
    const existing = await prisma.category.findUnique({
      where: { type_name: { type: current.type, name } },
    });
    if (existing) {
      return NextResponse.json({ error: "Tên danh mục đã tồn tại" }, { status: 409 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      days: current.type === "MAINTENANCE_PERIOD" ? (days != null ? Number(days) : null) : undefined,
      colorHex: colorHex ?? undefined,
      order,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
  }

  if (current.type === "MACHINE_STATUS" && current.statusKind) {
    return NextResponse.json(
      {
        error:
          "Đây đang là mục mặc định hệ thống — vui lòng đặt mục khác làm mặc định trước khi xoá",
      },
      { status: 409 },
    );
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Không thể xoá — danh mục này đang được dùng bởi máy móc" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
