import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

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

  const { name, colorHex, order } = body;

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

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Không thể xoá — danh mục này đang được sử dụng" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
