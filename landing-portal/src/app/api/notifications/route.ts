import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { desc, eq, or, and } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const db = drizzle(env.DB);
    let query;

    if (user?.id) {
      query = db
        .select()
        .from(notifications)
        .where(
          or(
            eq(notifications.userId, user.id),
            eq(notifications.roleTarget, user.role),
            eq(notifications.roleTarget, "all")
          )
        );
    } else {
      query = db.select().from(notifications);
    }

    const rows = await query.orderBy(desc(notifications.createdAt)).limit(50);
    const unreadCount = rows.filter((r) => r.isRead === 0).length;

    return NextResponse.json({ success: true, notifications: rows, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, markAllRead } = body;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    if (markAllRead) {
      await db.update(notifications).set({ isRead: 1 }).execute();
    } else if (id) {
      await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).execute();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
