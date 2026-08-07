import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import type { CategoryType } from "@/generated/prisma/enums";

const VALID_TYPES: CategoryType[] = ["AREA", "PRODUCTION_LINE", "TEAM"];

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as CategoryType | null;
  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Loại danh mục không hợp lệ" }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    where: { type },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const body = await req.json();
  const { type, name, colorHex, order } = body;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Loại danh mục không hợp lệ" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Thiếu tên danh mục" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { type_name: { type, name } } });
  if (existing) {
    return NextResponse.json({ error: "Tên danh mục đã tồn tại" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      type,
      name,
      colorHex: colorHex || null,
      order: order ?? 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
