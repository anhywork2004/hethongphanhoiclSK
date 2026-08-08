import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueMonitoring, issueEscalations, notifications } from "@/db/schema";
import { and, eq, isNull, lt } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback Cron Monitoring Mode" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    // Find monitoring items where max_deadline < now and closed_at IS NULL
    const overdueMonitoring = await db
      .select()
      .from(issueMonitoring)
      .where(and(isNull(issueMonitoring.closedAt), lt(issueMonitoring.maxDeadline, now)))
      .execute();

    let overdueCount = 0;

    for (const item of overdueMonitoring) {
      // Set is_overdue = 1
      await db
        .update(issueMonitoring)
        .set({ isOverdue: 1 })
        .where(eq(issueMonitoring.id, item.id))
        .execute();

      // Insert escalation log
      await db
        .insert(issueEscalations)
        .values({
          id: `esc48_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          issueId: item.issueId,
          type: "monitoring_overdue",
          escalatedTo: null,
          escalatedAt: now,
          note: `Ca theo dõi phiếu ${item.issueId} đã quá hạn tối đa 48 giờ chưa được đóng lỗi.`,
        })
        .execute();

      // Notification
      await db
        .insert(notifications)
        .values({
          id: `noti48_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: null,
          issueId: item.issueId,
          type: "monitoring_overdue",
          title: "CẢNH BÁO QUÁ HẠN 48 GIỜ THEO DÕI!",
          message: `Phiếu sự cố ${item.issueId} đã quá hạn 48 giờ theo dõi chưa đóng lỗi.`,
          isRead: 0,
          createdAt: now,
        })
        .execute();

      overdueCount++;
    }

    return NextResponse.json({
      success: true,
      overdueCount,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
