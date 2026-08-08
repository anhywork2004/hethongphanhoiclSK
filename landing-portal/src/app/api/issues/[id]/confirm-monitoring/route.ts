import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueMonitoring, issueResolutions, issueStatusHistory, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { hasNewIssue, note } = body;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Line leader confirmed monitoring!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    if (hasNewIssue) {
      // 1. Revert to 'pending' for new 5M+1E cycle, preserve old resolutions history!
      await db
        .update(issues)
        .set({
          status: "pending",
          form15SubmittedAt: null,
          form15Deadline: now + 15 * 60, // Reset 15m timer
          updatedAt: new Date().toISOString(),
        })
        .where(eq(issues.id, id))
        .execute();

      await db
        .insert(issueStatusHistory)
        .values({
          id: `his_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          issueId: id,
          fromStatus: "processing",
          toStatus: "pending",
          changedBy: user.id,
          changedAt: now,
          note: `Phát sinh vấn đề mới trong ca chạy thử. Ghi chú: ${note || "Yêu cầu phân tích lại 5M+1E"}`,
        })
        .execute();

      await db
        .insert(notifications)
        .values({
          id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: null,
          issueId: id,
          type: "new_issue",
          title: "PHÁT SINH SỰ CỐ MỚI - YÊU CẦU PHÂN TÍCH LẠI 5M+1E",
          message: `Trưởng line ${user.fullName} xác nhận phát sinh vấn đề mới. Tạo lại chu trình 15 phút 5M+1E.`,
          isRead: 0,
          createdAt: now,
        })
        .execute();

      return NextResponse.json({
        success: true,
        revertedToPending: true,
        message: "Đã ghi nhận phát sinh vấn đề mới! Phiếu quay lại bước 15 phút 5M+1E và giữ nguyên lịch sử cũ.",
      });
    } else {
      // 2. If repair is OK -> Change status to 'monitoring'
      const minDeadline = now + 3 * 3600; // +3 hours
      const maxDeadline = now + 48 * 3600; // +48 hours
      const monId = `mon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await db
        .update(issues)
        .set({
          status: "monitoring",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(issues.id, id))
        .execute();

      await db
        .insert(issueMonitoring)
        .values({
          id: monId,
          issueId: id,
          monitoringStartedAt: now,
          minDeadline,
          maxDeadline,
          reportEnabledAt: minDeadline,
          isOverdue: 0,
        })
        .execute();

      await db
        .insert(issueStatusHistory)
        .values({
          id: `his_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          issueId: id,
          fromStatus: "processing",
          toStatus: "monitoring",
          changedBy: user.id,
          changedAt: now,
          note: "Trưởng line xác nhận sửa thành công. Chuyển sang giai đoạn Theo Dõi (3h - 48h).",
        })
        .execute();

      return NextResponse.json({
        success: true,
        minDeadline,
        maxDeadline,
        message: "Trưởng line xác nhận sửa thành công! Đã kích hoạt giai đoạn Theo Dõi (tối thiểu 3h).",
      });
    }
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
