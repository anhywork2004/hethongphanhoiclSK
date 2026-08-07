import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const { name, isOther, order } = await req.json();

  const category = await prisma.failureCategory.update({
    where: { id },
    data: { name, isOther: Boolean(isOther), order },
  });

  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  try {
    await prisma.failureCategory.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "Không thể xoá — danh mục này đang được dùng trong sự cố đã ghi nhận" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
