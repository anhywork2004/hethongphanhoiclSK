import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, monitoringWindows, auditLogs } from "@/db/schema";
import { notifyInvestigationProgress, notifyFinalCloseOrReinvestigate } from "@/lib/notifications";
import { eq, and, lt } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ message: "D1 unavailable" });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    let lockedCount = 0;
    let autoClosedCount = 0;

    // 1. Check 15-minute investigation timeouts (status == 'reported' and form15Deadline < now and form15Locked == 0)
    const expiredIssues = await db
      .select()
      .from(qualityIssues)
      .where(
        and(
          eq(qualityIssues.status, "reported"),
          lt(qualityIssues.form15Deadline, now),
          eq(qualityIssues.form15Locked, 0)
        )
      );

    for (const issue of expiredIssues) {
      // Check how many forms submitted
      const totalSubmitted = (issue.qaSubmitted || 0) + (issue.llSubmitted || 0) + (issue.cnSubmitted || 0);
      if (totalSubmitted < 3) {
        await db
          .update(qualityIssues)
          .set({ form15Locked: 1, form15LockedAt: now, updatedAt: now })
          .where(eq(qualityIssues.id, issue.id))
          .execute();

        await db.insert(auditLogs).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          issueId: issue.id,
          userId: "system",
          userMnv: "SYSTEM",
          userName: "Hệ thống tự động",
          action: "Quá hạn 15 phút điều tra -> Khoá nộp form & chuyển Trưởng phòng (Bước 2)",
          fromStatus: issue.status,
          toStatus: issue.status,
          detailsJson: JSON.stringify({ totalSubmitted, form15Deadline: issue.form15Deadline }),
          createdAt: now,
        }).execute();

        notifyInvestigationProgress({ id: issue.id, issueCode: issue.issueCode, areaId: issue.areaId }, false, true).catch(
          (err) => console.error("[Cron 15m Notify Error]:", err)
        );

        lockedCount++;
      }
    }

    // 2. Check 48-hour monitoring auto-close timeouts (status == 'monitoring' and maxDeadline < now)
    const expiredMonitoring = await db
      .select()
      .from(monitoringWindows)
      .where(and(eq(monitoringWindows.status, "monitoring"), lt(monitoringWindows.maxDeadline, now)));

    for (const mon of expiredMonitoring) {
      await db
        .update(monitoringWindows)
        .set({
          status: "auto_closed",
          closedByName: "Hệ thống tự động (Quá 48h)",
          closedAt: now,
        })
        .where(eq(monitoringWindows.id, mon.id))
        .execute();

      await db
        .update(qualityIssues)
        .set({ status: "completed", updatedAt: now })
        .where(eq(qualityIssues.id, mon.issueId))
        .execute();

      const issueRows = await db.select().from(qualityIssues).where(eq(qualityIssues.id, mon.issueId)).limit(1);
      const issue = issueRows[0];

      if (issue) {
        await db.insert(auditLogs).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          issueId: issue.id,
          userId: "system",
          userMnv: "SYSTEM",
          userName: "Hệ thống tự động",
          action: "Quá 48 giờ theo dõi -> Tự động đóng hoàn tất phiếu (Bước 7b)",
          fromStatus: "monitoring",
          toStatus: "completed",
          detailsJson: JSON.stringify({ maxDeadline: mon.maxDeadline }),
          createdAt: now,
        }).execute();

        notifyFinalCloseOrReinvestigate({
          id: issue.id,
          issueCode: issue.issueCode,
          isClosedDone: true,
          isReinvestigate: false,
          areaId: issue.areaId,
        }).catch((err) => console.error("[Cron 48h Notify Error]:", err));

        autoClosedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      locked15mCount: lockedCount,
      autoClosed48hCount: autoClosedCount,
      checkedAt: now,
    });
  } catch (err: any) {
    console.error("[Cron Check Timeouts Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
