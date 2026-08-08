import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { zaloNotificationLog, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ logs: [] });
    }

    const db = drizzle(env.DB);

    const logList = await db
      .select({
        id: zaloNotificationLog.id,
        issueId: zaloNotificationLog.issueId,
        userId: zaloNotificationLog.userId,
        groupType: zaloNotificationLog.groupType,
        status: zaloNotificationLog.status,
        errorMessage: zaloNotificationLog.errorMessage,
        sentAt: zaloNotificationLog.sentAt,
        userName: users.fullName,
        userMnv: users.mnv,
        userZaloId: users.zaloId,
      })
      .from(zaloNotificationLog)
      .leftJoin(users, eq(zaloNotificationLog.userId, users.id))
      .orderBy(desc(zaloNotificationLog.sentAt))
      .limit(100);

    return NextResponse.json({ success: true, logs: logList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Zalo logs" }, { status: 500 });
  }
}
