import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { workshops } from "@/db/schema";
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
      // Fallback default workshops
      const defaultWorkshops = [
        { id: "ws_1", workshopCode: "PX01", workshopName: "Phân xưởng Chặt & Chuẩn bị", description: "Công đoạn cắt chặt da/vải", isActive: true },
        { id: "ws_2", workshopCode: "PX02", workshopName: "Phân xưởng May 1", description: "Công đoạn may quai giày", isActive: true },
        { id: "ws_3", workshopCode: "PX03", workshopName: "Phân xưởng May 2", description: "Chuyền may quai cao cấp", isActive: true },
        { id: "ws_4", workshopCode: "PX04", workshopName: "Phân xưởng Gò & Đế", description: "Lắp ráp đế và gò thành hình", isActive: true },
        { id: "ws_5", workshopCode: "PX05", workshopName: "Phân xưởng Hoàn thiện & Đóng gói", description: "Kiểm tra chất lượng và bao gói", isActive: true },
      ];
      return NextResponse.json({ workshops: defaultWorkshops });
    }

    const db = drizzle(d1);
    const list = await db.select().from(workshops).where(eq(workshops.isActive, 1));
    return NextResponse.json({ workshops: list });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workshopCode, workshopName, description } = body;
    if (!workshopCode || !workshopName) {
      return NextResponse.json({ error: "workshopCode and workshopName are required" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 database not available" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const newWs = {
      id: `ws_${Date.now()}`,
      workshopCode: String(workshopCode).trim().toUpperCase(),
      workshopName: String(workshopName).trim(),
      description: description ? String(description).trim() : null,
      isActive: 1,
      createdAt: new Date().toISOString(),
    };

    await db.insert(workshops).values(newWs);
    return NextResponse.json({ success: true, workshop: newWs });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
