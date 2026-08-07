import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";
import type { CategoryType } from "@/generated/prisma/enums";

const VALID_TYPES: CategoryType[] = ["AREA", "TEAM", "PRODUCTION_LINE"];

export async function GET(req: Request) {
  const { response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const url = new URL(req.url);
  const type = url.searchParams.get("type") as CategoryType | null;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Loại danh mục không hợp lệ" }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    where: { type },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}
