import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { desc, eq, or, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const db = drizzle(env.DB);

    const filterCondition = user?.id
      ? or(eq(notifications.employeeId, user.id), isNull(notifications.employeeId))
      : isNull(notifications.employeeId);

    const rows = await db
      .select()
      .from(notifications)
      .where(filterCondition)
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const unreadCount = rows.filter((r) => r.isRead === 0).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: rows,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
