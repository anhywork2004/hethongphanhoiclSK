import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueEscalations, notifications } from "@/db/schema";
import { and, eq, isNull, lt } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback Cron Trigger Mode" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    // Find overdue pending issues where form15_deadline < now and form15_submitted_at IS NULL
    const overdueIssues = await db
      .select()
      .from(issues)
      .where(and(eq(issues.status, "pending"), isNull(issues.form15SubmittedAt), lt(issues.form15Deadline, now)))
      .execute();

    let escalatedCount = 0;

    for (const item of overdueIssues) {
      const escId = `esc15_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const notiId = `noti15_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // 1. Log escalation
      await db
        .insert(issueEscalations)
        .values({
          id: escId,
          issueId: item.id,
          type: "form15_timeout",
          escalatedTo: null,
          escalatedAt: now,
          note: `Phiếu mã ${item.issueCode} quá hạn 15 phút chưa được phân tích 5M+1E. Cảnh báo leo thang Quản Lý Phân Xưởng.`,
        })
        .execute();

      // 2. Insert notification alert
      await db
        .insert(notifications)
        .values({
          id: notiId,
          employeeId: null,
          issueId: item.id,
          type: "form15_escalated",
          title: "CẢNH BÁO LEO THANG 15 PHÚT QUÁ HẠN!",
          message: `Phiếu lỗi ${item.issueCode} thuộc phân xưởng ${item.workshopName || "sản xuất"} đã quá hạn 15 phút.`,
          isRead: 0,
          createdAt: now,
        })
        .execute();

      escalatedCount++;
    }

    return NextResponse.json({
      success: true,
      escalatedCount,
      overdueTotal: overdueIssues.length,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
