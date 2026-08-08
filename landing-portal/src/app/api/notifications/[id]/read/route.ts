import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true });
    }

    const db = drizzle(env.DB);
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, id))
      .execute();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
