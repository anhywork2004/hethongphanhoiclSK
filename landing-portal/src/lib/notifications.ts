import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, or } from "drizzle-orm";
import { notifications, users, Role } from "@/db/schema";

export interface CreateNotificationParams {
  userId?: string | null;
  roleTarget?: string | null;
  areaId?: string | null;
  issueId?: string | null;
  type: string;
  title: string;
  message: string;
}

/**
 * Gửi thông báo In-App + Zalo OA + Email tới người dùng hoặc nhóm vai trò
 */
export async function sendNotification(params: CreateNotificationParams): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  let d1: D1Database | undefined;
  let zaloToken: string | undefined;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv & { ZALO_OA_ACCESS_TOKEN?: string };
    d1 = env.DB;
    zaloToken = env.ZALO_OA_ACCESS_TOKEN || process.env.ZALO_OA_ACCESS_TOKEN;
  } catch {
    zaloToken = process.env.ZALO_OA_ACCESS_TOKEN;
  }

  if (!d1) {
    console.warn("[Notification Service] DB binding unavailable, logging notification to console:", params);
    return;
  }

  const db = drizzle(d1);

  try {
    // 1. Tìm danh sách người nhận
    let targetUsers: { id: string; zaloId: string | null; email: string | null }[] = [];

    if (params.userId) {
      const uRes = await db.select({ id: users.id, zaloId: users.zaloId, email: users.email }).from(users).where(eq(users.id, params.userId));
      targetUsers = uRes;
    } else if (params.roleTarget) {
      if (params.areaId && params.roleTarget !== "director" && params.roleTarget !== "general_director" && params.roleTarget !== "admin") {
        // Lọc theo vai trò + khu vực (Xưởng)
        const uRes = await db
          .select({ id: users.id, zaloId: users.zaloId, email: users.email })
          .from(users)
          .where(and(eq(users.role, params.roleTarget as any), eq(users.areaId, params.areaId)));
        targetUsers = uRes;
      } else {
        // Toàn nhà máy (GĐ/TGĐ/Admin hoặc khi không giới hạn khu vực)
        const uRes = await db
          .select({ id: users.id, zaloId: users.zaloId, email: users.email })
          .from(users)
          .where(eq(users.role, params.roleTarget as any));
        targetUsers = uRes;
      }
    }

    // Nếu không tìm thấy user cụ thể, vẫn lưu 1 bản ghi notification chung
    if (targetUsers.length === 0) {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId || null,
        roleTarget: params.roleTarget || null,
        areaId: params.areaId || null,
        issueId: params.issueId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        channel: "in_app",
        status: "sent",
        isRead: 0,
        createdAt: now,
      }).execute();
      return;
    }

    // 2. Lưu In-App notification cho từng user
    for (const u of targetUsers) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(notifications).values({
        id: notifId,
        userId: u.id,
        roleTarget: params.roleTarget || null,
        areaId: params.areaId || null,
        issueId: params.issueId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        channel: "in_app",
        status: "sent",
        isRead: 0,
        createdAt: now,
      }).execute();

      // 3. Gửi Zalo OA nếu có Token và zaloId
      if (zaloToken && u.zaloId) {
        try {
          await fetch("https://openapi.zalo.me/v3.0/oa/message/transaction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              access_token: zaloToken,
            },
            body: JSON.stringify({
              recipient: { user_id: u.zaloId },
              message: { text: `[TBS HTPH-CLSK] ${params.title}\n${params.message}` },
            }),
          });
        } catch (zErr) {
          console.warn("[Zalo OA Dispatch Error]:", zErr);
        }
      }
    }
  } catch (err) {
    console.error("[Notification Service Exception]:", err);
  }
}

/**
 * Bước 1: Thông báo sự cố mới vừa báo cáo (QA, LL, CN cần điều tra 15p; SX chỉ FYI)
 */
export async function notifyNewIssueReported(issue: {
  id: string;
  issueCode: string;
  poCode: string;
  productName?: string | null;
  workshopName?: string | null;
  detectionStage: string;
  description: string;
  areaId?: string | null;
}) {
  const title = `🚨 [CLSK 15P] Sự cố mới: ${issue.issueCode} (PO: ${issue.poCode})`;
  const baseMsg = `Tại ${issue.workshopName || "Xưởng"} - ${issue.detectionStage}: ${issue.description}`;

  // 1. QA (yêu cầu nộp 5M+1E)
  await sendNotification({
    roleTarget: "qa",
    areaId: issue.areaId,
    issueId: issue.id,
    type: "issue_investigate_request",
    title,
    message: `${baseMsg}. Yêu cầu QA điều tra 5M+1E trong 15 phút!`,
  });

  // 2. Line Leader (yêu cầu nộp 5M+1E)
  await sendNotification({
    roleTarget: "line_leader",
    areaId: issue.areaId,
    issueId: issue.id,
    type: "issue_investigate_request",
    title,
    message: `${baseMsg}. Yêu cầu Trưởng Line điều tra 5M+1E trong 15 phút!`,
  });

  // 3. Công nghệ (yêu cầu nộp 5M+1E)
  await sendNotification({
    roleTarget: "technology",
    areaId: issue.areaId,
    issueId: issue.id,
    type: "issue_investigate_request",
    title,
    message: `${baseMsg}. Yêu cầu Kỹ sư Công nghệ điều tra 5M+1E trong 15 phút!`,
  });

  // 4. Cán bộ sản xuất (chỉ FYI)
  await sendNotification({
    roleTarget: "worker",
    areaId: issue.areaId,
    issueId: issue.id,
    type: "issue_fyi",
    title: `ℹ️ [FYI] Báo cáo sự cố ${issue.issueCode}`,
    message: `${baseMsg}. Thông tin theo dõi ca sản xuất.`,
  });
}

/**
 * Bước 2: Thông báo khi đủ 3/3 form 5M+1E hoặc quá hạn 15 phút
 */
export async function notifyInvestigationProgress(
  issue: { id: string; issueCode: string; areaId?: string | null },
  isComplete3Of3: boolean,
  isTimeout: boolean
) {
  if (isComplete3Of3) {
    // Báo riêng cho LL để tổng hợp
    await sendNotification({
      roleTarget: "line_leader",
      areaId: issue.areaId,
      issueId: issue.id,
      type: "form15_ready_for_synthesis",
      title: `⚡ [ĐỦ 3/3 FORM] Tổng hợp nguyên nhân & giải pháp cho ${issue.issueCode}`,
      message: `Cả 3 vai trò (QA, LL, CN) đã hoàn thành phân tích 5M+1E. Mời Trưởng line vào xem 3 bản và chốt nguyên nhân gốc!`,
    });
  } else if (isTimeout) {
    // Quá hạn 15 phút -> Báo Trưởng phòng ban (TP)
    await sendNotification({
      roleTarget: "dept_head",
      areaId: issue.areaId,
      issueId: issue.id,
      type: "form15_timeout_locked",
      title: `⚠️ [QUÁ HẠN 15P] Phiếu ${issue.issueCode} chưa đủ 3 form 5M+1E`,
      message: `Đã hết hạn 15 phút điều tra nhưng chưa đủ 3/3 form. Phiếu đã khoá nộp bổ sung để chuyển Trưởng phòng ban xem xét.`,
    });
  }
}

/**
 * Bước 3: Thông báo khi có nguyên nhân gốc & giải pháp hoặc chuyển Phase 2
 */
export async function notifyRootCauseOrPhase2(issue: {
  id: string;
  issueCode: string;
  rootCauseSummary?: string | null;
  proposedSolution?: string | null;
  isPhase2: boolean;
  areaId?: string | null;
}) {
  if (issue.isPhase2) {
    // Báo thẳng Ban Giám Đốc (GĐ/TGĐ)
    await sendNotification({
      roleTarget: "director",
      issueId: issue.id,
      type: "phase2_escalated",
      title: `🚨 [PHASE 2 - SOS] Phiếu ${issue.issueCode} không thể xử lý tại xưởng`,
      message: `Trưởng Line báo cáo sự cố không thể xử lý tại phân xưởng. Đề nghị Ban Giám Đốc vào màn hình Phase 2 để xử lý.`,
    });
    await sendNotification({
      roleTarget: "general_director",
      issueId: issue.id,
      type: "phase2_escalated",
      title: `🚨 [PHASE 2 - SOS] Phiếu ${issue.issueCode} chuyển Ban Giám Đốc`,
      message: `Sự cố chất lượng cần ý kiến chỉ đạo cấp cao từ Ban Giám Đốc.`,
    });
  } else {
    // Đã có nguyên nhân -> Báo LL + tất cả TP phòng ban
    await sendNotification({
      roleTarget: "dept_head",
      issueId: issue.id,
      type: "root_cause_found",
      title: `📋 [ĐÃ CÓ NGUYÊN NHÂN] Phiếu ${issue.issueCode} sẵn sàng giao việc`,
      message: `Nguyên nhân gốc: ${issue.rootCauseSummary || "Đã xác định"}. Mời Trưởng phòng ban vào tab Công việc để giao nhân viên sửa chữa.`,
    });
  }
}

/**
 * Bước 4: Thông báo khi TP giao việc cho nhân viên
 */
export async function notifyTaskAssigned(task: {
  issueId: string;
  issueCode: string;
  assignedToId: string;
  departmentName?: string | null;
}) {
  await sendNotification({
    userId: task.assignedToId,
    issueId: task.issueId,
    type: "task_assigned",
    title: `🔧 [GIAO VIỆC MỚI] Bạn được giao xử lý sự cố ${task.issueCode}`,
    message: `Trưởng phòng đã chỉ định bạn tiếp nhận khắc phục sự cố ${task.issueCode}. Vui lòng vào tab Công việc để nhận việc.`,
  });
}

/**
 * Bước 5: Thông báo khi nhân viên nhận việc (bắt đầu bấm giờ)
 */
export async function notifyTaskAccepted(task: {
  issueId: string;
  issueCode: string;
  reporterId?: string | null;
  areaId?: string | null;
  technicianName: string;
}) {
  await sendNotification({
    roleTarget: "line_leader",
    areaId: task.areaId,
    issueId: task.issueId,
    type: "task_in_progress",
    title: `⏱️ [ĐANG XỬ LÝ] Kỹ thuật viên ${task.technicianName} đã nhận việc ${task.issueCode}`,
    message: `Đồng hồ đếm giờ sửa chữa đã được kích hoạt real-time.`,
  });
}

/**
 * Bước 6 & 7a: Thông báo hoàn thành sửa chữa & LL xác nhận
 */
export async function notifyRepairCompletion(task: {
  issueId: string;
  issueCode: string;
  areaId?: string | null;
  isConfirmedByLL?: boolean;
  isRejectedByLL?: boolean;
  technicianId?: string | null;
}) {
  if (task.isConfirmedByLL) {
    await sendNotification({
      roleTarget: "dept_head",
      areaId: task.areaId,
      issueId: task.issueId,
      type: "repair_monitoring_started",
      title: `🧪 [THEO DÕI 3H-48H] Phiếu ${task.issueCode} đã sửa xong & đang theo dõi`,
      message: `Trưởng Line đã xác nhận sửa hoàn tất. Hệ thống đang đếm giờ theo dõi chất lượng (tối thiểu 3h, tối đa 48h).`,
    });
  } else if (task.isRejectedByLL) {
    if (task.technicianId) {
      await sendNotification({
        userId: task.technicianId,
        issueId: task.issueId,
        type: "repair_rejected_redo",
        title: `❌ [CHƯA ĐẠT - LÀM LẠI] Phiếu ${task.issueCode} cần sửa lại`,
        message: `Trưởng Line kiểm tra chưa đạt yêu cầu. Vui lòng kiểm tra lại thiết bị và cập nhật lại báo cáo sửa chữa.`,
      });
    }
  } else {
    // Kỹ thuật viên vừa bấm hoàn thành sửa chữa -> Báo LL và TP
    await sendNotification({
      roleTarget: "line_leader",
      areaId: task.areaId,
      issueId: task.issueId,
      type: "repair_pending_confirmation",
      title: `✅ [CHỜ XÁC NHẬN] Kỹ thuật đã sửa xong phiếu ${task.issueCode}`,
      message: `Đã có mô tả sửa chữa, danh sách linh kiện và ảnh minh chứng. Mời Trưởng line vào bấm 'Xong' hoặc 'Chưa xong'.`,
    });
  }
}

/**
 * Bước 7b: Thông báo đóng hoàn thành vấn đề hoặc yêu cầu kiểm tra lại
 */
export async function notifyFinalCloseOrReinvestigate(issue: {
  id: string;
  issueCode: string;
  isClosedDone: boolean;
  isReinvestigate: boolean;
  areaId?: string | null;
}) {
  if (issue.isClosedDone) {
    // Báo toàn diện Ban Giám Đốc (GĐ/TGĐ)
    await sendNotification({
      roleTarget: "director",
      issueId: issue.id,
      type: "issue_completed_success",
      title: `🎉 [HOÀN THÀNH] Phiếu ${issue.issueCode} đã đóng đạt chuẩn CLSK`,
      message: `Sự cố chất lượng đã hoàn tất toàn bộ quy trình và qua thời gian theo dõi đạt chuẩn 100%.`,
    });
    await sendNotification({
      roleTarget: "general_director",
      issueId: issue.id,
      type: "issue_completed_success",
      title: `🎉 [BÁO CÁO GĐ] Sự cố ${issue.issueCode} đã xử lý dứt điểm`,
      message: `Sự cố chất lượng đã được giải quyết triệt để sau giai đoạn theo dõi 3-48h.`,
    });
  } else if (issue.isReinvestigate) {
    // Báo QA, LL, CN điều tra lại
    await sendNotification({
      roleTarget: "qa",
      areaId: issue.areaId,
      issueId: issue.id,
      type: "issue_reinvestigate",
      title: `🔄 [TÁI DIỄN - ĐIỀU TRA LẠI] Phiếu ${issue.issueCode} yêu cầu mở lại 5M+1E`,
      message: `Sự cố có dấu hiệu tái diễn trong giai đoạn theo dõi. Mời QA, LL, CN nộp form 5M+1E bổ sung.`,
    });
  }
}
