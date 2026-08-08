import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { partCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ parts: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(partCategories);
    return NextResponse.json({ success: true, parts: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, unit, inStock, factoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên linh kiện không được để trống" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const partId = `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newPart = {
      id: partId,
      factoryId: factoryId || "fac-tbs-kg1",
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : null,
      unit: unit || "Cái",
      inStock: inStock ? Number(inStock) : 100,
      isActive: 1,
      createdAt: now,
    };

    await db.insert(partCategories).values(newPart).execute();
    return NextResponse.json({ success: true, part: newPart });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
