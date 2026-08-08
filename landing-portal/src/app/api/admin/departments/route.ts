import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ departments: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(departments);
    return NextResponse.json({ success: true, departments: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, description, factoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên phòng ban không được để trống" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const deptId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newDept = {
      id: deptId,
      factoryId: factoryId || "fac-tbs-kg1",
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : null,
      description: description ? description.trim() : null,
      isActive: 1,
      createdAt: now,
    };

    await db.insert(departments).values(newDept).execute();
    return NextResponse.json({ success: true, department: newDept });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Thiếu id phòng ban" }, { status: 400 });

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    await db.delete(departments).where(eq(departments.id, id)).execute();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
