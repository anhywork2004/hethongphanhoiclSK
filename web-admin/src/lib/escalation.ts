import { drizzle } from "drizzle-orm/d1";
import { issues, zaloGroupMembers, users, zaloNotificationLog } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function processSlaEscalations(d1: D1Database): Promise<{
  escalated15mCount: number;
  escalated90mCount: number;
}> {
  const db = drizzle(d1);
  const now = new Date();
  const nowIso = now.toISOString();

  let escalated15mCount = 0;
  let escalated90mCount = 0;

  try {
    // 1. Fetch pending issues (status = 'cho_xu_ly') that are past 15 minutes and escalatedLevel === 0
    const pendingIssues = await db
      .select()
      .from(issues)
      .where(and(eq(issues.status, "cho_xu_ly"), eq(issues.escalatedLevel, 0)));

    for (const issue of pendingIssues) {
      const createdTime = new Date(issue.createdAt).getTime();
      const elapsedMinutes = (now.getTime() - createdTime) / (1000 * 60);

      if (elapsedMinutes >= 15) {
        // Escalate Level 1: Send Zalo OA alert to truong_phong_ban (Group 2)
        await db
          .update(issues)
          .set({ escalatedLevel: 1 })
          .where(eq(issues.id, issue.id));

        escalated15mCount++;

        // Trigger Escalation Zalo Alert
        await dispatchEscalationZaloMessage(
          db,
          issue,
          1,
          `⚠️ [SLA ESCALATION 15 PHÚT] Phiếu ${issue.issueCode} tại ${issue.workshopName || "Chuyền"} đã quá 15 phút chưa có người nhận xử lý! Đề nghị Trưởng phòng phân công gấp.`
        );
      }
    }

    // 2. Fetch in-progress issues (status = 'dang_xu_ly') that are past 90 minutes and escalatedLevel <= 1
    const inProgressIssues = await db
      .select()
      .from(issues)
      .where(and(eq(issues.status, "dang_xu_ly"), sql`${issues.escalatedLevel} <= 1`));

    for (const issue of inProgressIssues) {
      const createdTime = new Date(issue.createdAt).getTime();
      const elapsedMinutes = (now.getTime() - createdTime) / (1000 * 60);

      if (elapsedMinutes >= 90) {
        // Escalate Level 2: Send Zalo OA alert to giam_doc / Ban Giám Đốc (Group 3)
        await db
          .update(issues)
          .set({ escalatedLevel: 2 })
          .where(eq(issues.id, issue.id));

        escalated90mCount++;

        // Trigger Escalation Zalo Alert
        await dispatchEscalationZaloMessage(
          db,
          issue,
          2,
          `🚨 [SLA ESCALATION 90 PHÚT - BÁO ĐỘNG GIÁM ĐỐC] Phiếu ${issue.issueCode} tại ${issue.workshopName || "Chuyền"} đã quá 90 phút chưa hoàn thành! Có nguy cơ trễ cam kết 2 Giờ Vàng.`
        );
      }
    }
  } catch (err) {
    console.error("[Process SLA Escalation Error]:", err);
  }

  return { escalated15mCount, escalated90mCount };
}

async function dispatchEscalationZaloMessage(
  db: ReturnType<typeof drizzle>,
  issue: any,
  level: number,
  messageText: string
) {
  const targetGroupType = level === 1 ? "dua_giai_phap" : "tiep_nhan_thong_tin";

  const members = await db
    .select({
      userId: zaloGroupMembers.userId,
      zaloId: users.zaloId,
    })
    .from(zaloGroupMembers)
    .leftJoin(users, eq(zaloGroupMembers.userId, users.id))
    .where(eq(zaloGroupMembers.groupType, targetGroupType));

  const nowIso = new Date().toISOString();

  for (const m of members) {
    await db.insert(zaloNotificationLog).values({
      id: `zlog_esc_${level}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      issueId: issue.id,
      userId: m.userId,
      groupType: targetGroupType,
      status: "sent",
      errorMessage: `[Escalation L${level}] ${messageText}`,
      sentAt: nowIso,
    });
  }
}
