import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { areas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ areas: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(areas);
    return NextResponse.json({ success: true, areas: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, type, parentId, factoryId } = body;

    if (!name || !code || !type) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ Tên, Mã và Loại khu vực" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const areaId = `area_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newArea = {
      id: areaId,
      factoryId: factoryId || "fac-tbs-kg1",
      parentId: parentId || null,
      type: type as "workshop" | "team" | "line",
      name: name.trim(),
      code: code.trim().toUpperCase(),
      order: 0,
      isActive: 1,
      createdAt: now,
    };

    await db.insert(areas).values(newArea).execute();
    return NextResponse.json({ success: true, area: newArea });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Thiếu id khu vực" }, { status: 400 });

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    await db.delete(areas).where(eq(areas.id, id)).execute();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
