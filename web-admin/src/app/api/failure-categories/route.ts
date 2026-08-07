import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const categories = await prisma.failureCategory.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const { name, isOther, order } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Thiếu tên danh mục" }, { status: 400 });
  }

  const category = await prisma.failureCategory.create({
    data: { name, isOther: Boolean(isOther), order: order ?? 0 },
  });

  return NextResponse.json(category, { status: 201 });
}
