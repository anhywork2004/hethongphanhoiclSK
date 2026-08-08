import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ categories: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(issueCategories);
    return NextResponse.json({ success: true, categories: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, description, factoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên danh mục lỗi không được để trống" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newCat = {
      id: catId,
      factoryId: factoryId || "fac-tbs-kg1",
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : null,
      description: description ? description.trim() : null,
      order: 0,
      isActive: 1,
      createdAt: now,
    };

    await db.insert(issueCategories).values(newCat).execute();
    return NextResponse.json({ success: true, category: newCat });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
