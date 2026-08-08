import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, notifications, users } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function processSlaEscalations(d1: D1Database): Promise<{
  escalated15mCount: number;
  escalated90mCount: number;
}> {
  const db = drizzle(d1);
  const now = Math.floor(Date.now() / 1000);

  let escalated15mCount = 0;
  let escalated90mCount = 0;

  try {
    const expiredIssues = await db
      .select()
      .from(qualityIssues)
      .where(and(eq(qualityIssues.status, "reported"), lt(qualityIssues.form15Deadline, now)));

    for (const issue of expiredIssues) {
      escalated15mCount++;
      await db.insert(notifications).values({
        id: `notif_esc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: "system",
        roleTarget: "dept_head",
        issueId: issue.id,
        type: "timeout_alert",
        title: `⚠️ [SLA 15 PHÚT] Quá hạn điều tra phiếu ${issue.issueCode}`,
        message: `Phiếu sự cố ${issue.issueCode} tại ${issue.workshopName || "phân xưởng"} đã quá 15 phút điều tra 5M+1E.`,
        isRead: 0,
        createdAt: now,
      }).execute();
    }
  } catch (err) {
    console.error("[Process SLA Escalation Error]:", err);
  }

  return { escalated15mCount, escalated90mCount };
}
