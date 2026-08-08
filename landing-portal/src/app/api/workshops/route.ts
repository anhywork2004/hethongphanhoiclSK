import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { areas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({
        workshops: [
          { id: "ws-may-1", workshopCode: "PX01", workshopName: "Phân xưởng May 1" },
          { id: "ws-go-1", workshopCode: "PX02", workshopName: "Phân xưởng Gò 1" },
          { id: "ws-de-1", workshopCode: "PX03", workshopName: "Phân xưởng Đóng Gói" },
        ],
      });
    }

    const db = drizzle(env.DB);
    const rows = await db.select().from(areas).where(eq(areas.type, "workshop"));
    const formatted = rows.map((r) => ({
      id: r.id,
      workshopCode: r.code,
      workshopName: r.name,
    }));

    return NextResponse.json({ workshops: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
