import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ logs: [] });
    }

    const db = drizzle(env.DB);
    const logList = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(100);
    return NextResponse.json({ success: true, logs: logList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
