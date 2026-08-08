import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { sizes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    let d1: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      d1 = (ctx.env as unknown as CloudflareEnv).DB;
    } catch {
      // fallback
    }

    if (!d1) {
      // Default fallback sizes
      const defaultSizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"].map((sz) => ({
        id: `sz_${sz}`,
        sizeCode: sz,
        sizeName: `Size ${sz}`,
        isActive: true,
      }));
      return NextResponse.json({ sizes: defaultSizes });
    }

    const db = drizzle(d1);
    const list = await db.select().from(sizes).where(eq(sizes.isActive, true));
    return NextResponse.json({ sizes: list });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sizeCode, sizeName } = body;
    if (!sizeCode) {
      return NextResponse.json({ error: "sizeCode is required" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 database not available" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const newSize = {
      id: `sz_${Date.now()}`,
      sizeCode: String(sizeCode).trim(),
      sizeName: sizeName ? String(sizeName).trim() : `Size ${sizeCode}`,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await db.insert(sizes).values(newSize);
    return NextResponse.json({ success: true, size: newSize });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
