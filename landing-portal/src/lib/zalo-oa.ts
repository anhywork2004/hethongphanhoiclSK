import { drizzle } from "drizzle-orm/d1";
import { users, notifications } from "@/db/schema";

export interface IssueNotificationPayload {
  id: string;
  issueCode: string;
  productName: string;
  workshopName: string;
  description: string;
  createdAt: string;
}

export async function sendZaloGroupNotification(
  d1: D1Database,
  issue: IssueNotificationPayload,
  groupType: string
) {
  const db = drizzle(d1);
  const now = Math.floor(Date.now() / 1000);

  const notifId = `zalo_notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(notifications).values({
    id: notifId,
    userId: "system",
    roleTarget: "all",
    issueId: issue.id,
    type: "issue_alert",
    title: `[ZALO OA] Thông Báo Sự Cố ${issue.issueCode}`,
    message: `Sự cố: ${issue.description} tại ${issue.workshopName}. Bấm vào để xử lý.`,
    isRead: 0,
    createdAt: now,
  }).execute();

  return { success: true };
}

export const sendZaloIssueNotifications = sendZaloGroupNotification;

