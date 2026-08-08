import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { users, zaloGroupMembers, zaloNotificationLog, ZaloGroupType } from "@/db/schema";

export interface IssueNotificationPayload {
  id: string;
  issueCode: string;
  productCode: string;
  productName: string;
  affectedSizes: string[];
  workshopId?: string | null;
  workshopName?: string | null;
  detectionStage: string;
  description: string;
  severity: string;
  createdByName: string;
  createdByMnv: string;
  createdAt: string;
}

export interface ImagePayload {
  imageUrl: string;
}

/**
 * Builds template text according to target Zalo group
 */
export function buildZaloMessageTemplate(
  groupType: ZaloGroupType,
  issue: IssueNotificationPayload,
  images: ImagePayload[]
): { text: string; actionUrl?: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://clsk.tbskg1.vn";
  const issueUrl = `${baseUrl}/dashboard/categories/cho_xu_ly`;

  const severityMap: Record<string, string> = {
    thap: "Thấp",
    trung_binh: "Trung Bình",
    cao: "Cao ⚠️",
    khan_cap: "KHẨN CẤP 🚨",
  };
  const severityText = severityMap[issue.severity] || issue.severity;
  const sizesText = issue.affectedSizes.join(", ");
  const imageCountText = images.length > 0 ? ` (Kèm ${images.length} hình minh chứng)` : "";

  if (groupType === "truc_tiep_xu_ly") {
    // Nhóm 1 — "Trực tiếp xử lý" (Hành động trong 15 phút)
    const text = 
      `🚨 [TBS SK1 - PHẢN HỒI CLSK 15 PHÚT]\n` +
      `Phiếu mới: ${issue.issueCode}\n` +
      `----------------------------------------\n` +
      `• Phân xưởng: ${issue.workshopName || "Chưa xác định"}\n` +
      `• Công đoạn phát hiện: ${issue.detectionStage}\n` +
      `• Mã sản phẩm: ${issue.productCode} - ${issue.productName}\n` +
      `• Sizes bị ảnh hưởng: ${sizesText}\n` +
      `• Mức độ nghiêm trọng: ${severityText}\n` +
      `• Người phát hiện: ${issue.createdByName} (${issue.createdByMnv})\n` +
      `• Mô tả lỗi: ${issue.description}${imageCountText}\n` +
      `----------------------------------------\n` +
      `⚡ Yêu cầu Nhóm 4M+1E (Trưởng Line/Tổ trưởng/QA/Công nghệ) phản hồi & xử lý trong 15 phút!`;

    return { text, actionUrl: issueUrl };
  } else if (groupType === "dua_giai_phap") {
    // Nhóm 2 — "Tiếp nhận đưa giải pháp xử lý" (Trưởng phòng ban)
    const text = 
      `📋 [TBS SK1 - ĐỀ XUẤT GIẢI PHÁP CLSK]\n` +
      `Thông báo phiếu vấn đề: ${issue.issueCode}\n` +
      `----------------------------------------\n` +
      `• Phân xưởng: ${issue.workshopName || "N/A"}\n` +
      `• Sản phẩm: ${issue.productCode} - ${issue.productName}\n` +
      `• Công đoạn: ${issue.detectionStage}\n` +
      `• Mức độ: ${severityText}\n` +
      `• Mô tả hiện tượng: ${issue.description}\n` +
      `----------------------------------------\n` +
      `👉 Đề nghị Trưởng phòng ban liên quan xem xét & chuẩn bị phương án khắc phục root cause (5M+1E).`;

    return { text, actionUrl: issueUrl };
  } else {
    // Nhóm 3 — "Tiếp nhận thông tin" (Ban Giám Đốc)
    const text = 
      `ℹ️ [TBS SK1 - BẢN TIN CHẤT LƯỢNG SẢN XUẤT]\n` +
      `Phiếu báo lỗi phát sinh: ${issue.issueCode}\n` +
      `----------------------------------------\n` +
      `• Xưởng: ${issue.workshopName || "N/A"} | Công đoạn: ${issue.detectionStage}\n` +
      `• SP: ${issue.productCode} (${sizesText})\n` +
      `• Mức độ: ${severityText}\n` +
      `• Người báo: ${issue.createdByName}\n` +
      `----------------------------------------\n` +
      `Bản tin tự động từ 2-Hour Fast Feedback Loop (Chỉ dùng để theo dõi).`;

    return { text };
  }
}

/**
 * Sends Zalo OA notification asynchronously to all 3 groups without blocking issue creation.
 */
export async function sendZaloIssueNotifications(
  issue: IssueNotificationPayload,
  images: ImagePayload[] = []
): Promise<void> {
  const now = new Date().toISOString();

  let d1: D1Database | undefined;
  let accessToken: string | undefined;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    d1 = env.DB;
    accessToken = env.ZALO_OA_ACCESS_TOKEN || process.env.ZALO_OA_ACCESS_TOKEN;
  } catch {
    // Process env fallback
    accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
  }

  if (!d1) {
    console.warn("[Zalo OA Service] D1 Database binding is missing, skipping notification logging.");
    return;
  }

  const db = drizzle(d1);

  try {
    // Fetch all Zalo group members with user details
    const groupMembers = await db
      .select({
        memberId: zaloGroupMembers.id,
        userId: zaloGroupMembers.userId,
        groupType: zaloGroupMembers.groupType,
        workshopId: zaloGroupMembers.workshopId,
        zaloId: users.zaloId,
        fullName: users.fullName,
        mnv: users.mnv,
        role: users.role,
      })
      .from(zaloGroupMembers)
      .leftJoin(users, eq(zaloGroupMembers.userId, users.id));

    // Target Groups Filter:
    // Group 1: Filtered by workshopId matching issue.workshopId (or matching members if workshopId is null)
    const group1Members = groupMembers.filter((m) => {
      if (m.groupType !== "truc_tiep_xu_ly") return false;
      if (!issue.workshopId || !m.workshopId) return true;
      return m.workshopId === issue.workshopId;
    });

    // Group 2: All members in dua_giai_phap
    const group2Members = groupMembers.filter((m) => m.groupType === "dua_giai_phap");

    // Group 3: All members in tiep_nhan_thong_tin
    const group3Members = groupMembers.filter((m) => m.groupType === "tiep_nhan_thong_tin");

    const targets: { groupType: ZaloGroupType; members: typeof groupMembers }[] = [
      { groupType: "truc_tiep_xu_ly", members: group1Members },
      { groupType: "dua_giai_phap", members: group2Members },
      { groupType: "tiep_nhan_thong_tin", members: group3Members },
    ];

    for (const target of targets) {
      const template = buildZaloMessageTemplate(target.groupType, issue, images);

      if (target.members.length === 0) {
        // Log entry even if no explicit users assigned in group
        await db.insert(zaloNotificationLog).values({
          id: `zlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          issueId: issue.id,
          userId: null,
          groupType: target.groupType,
          status: "sent",
          errorMessage: "No registered group members found in DB.",
          sentAt: now,
        }).execute();
        continue;
      }

      for (const member of target.members) {
        const userZaloId = member.zaloId;
        const logId = `zlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (!accessToken) {
          // Mock mode: log failure/mock status gracefully when token is absent
          await db.insert(zaloNotificationLog).values({
            id: logId,
            issueId: issue.id,
            userId: member.userId,
            groupType: target.groupType,
            status: "failed",
            errorMessage: `Mock mode: ZALO_OA_ACCESS_TOKEN is missing. (Recipient Zalo ID: ${userZaloId || "N/A"})`,
            sentAt: now,
          }).execute();
          continue;
        }

        // Send real Zalo OA API request if access token is present
        try {
          const res = await fetch("https://openapi.zalo.me/v3.0/oa/message/transaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              access_token: accessToken,
            },
            body: JSON.stringify({
              recipient: { user_id: userZaloId },
              message: {
                text: template.text,
              },
            }),
          });

          const resData: any = await res.json();
          if (resData.error === 0) {
            await db.insert(zaloNotificationLog).values({
              id: logId,
              issueId: issue.id,
              userId: member.userId,
              groupType: target.groupType,
              status: "sent",
              errorMessage: null,
              sentAt: now,
            }).execute();
          } else {
            await db.insert(zaloNotificationLog).values({
              id: logId,
              issueId: issue.id,
              userId: member.userId,
              groupType: target.groupType,
              status: "failed",
              errorMessage: `Zalo API Error (${resData.error}): ${resData.message || "Unknown error"}`,
              sentAt: now,
            }).execute();
          }
        } catch (fetchErr: any) {
          await db.insert(zaloNotificationLog).values({
            id: logId,
            issueId: issue.id,
            userId: member.userId,
            groupType: target.groupType,
            status: "failed",
            errorMessage: fetchErr.message || "Network request failed",
            sentAt: now,
          }).execute();
        }
      }
    }
  } catch (err: any) {
    console.error("[Zalo OA Service Error]:", err);
  }
}
