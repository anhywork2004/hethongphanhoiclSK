import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, monitoringWindows, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { issueId, action, customMinutes } = body;
    // action: 'expire_15m' | 'reach_3h' | 'expire_48h' | 'custom_offset'

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    if (!issueId) {
      return NextResponse.json({ error: "Vui lòng cung cấp mã issueId để áp dụng Time-Travel" }, { status: 400 });
    }

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, issueId)).limit(1);
    if (issueRes.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    const issue = issueRes[0];

    if (action === "expire_15m") {
      // Fast forward 15 minutes: set reportedAt to 20 mins ago and deadline to 5 mins ago
      const simulatedReportedAt = now - 20 * 60;
      const simulatedDeadline = now - 5 * 60;

      await db
        .update(qualityIssues)
        .set({
          reportedAt: simulatedReportedAt,
          form15Deadline: simulatedDeadline,
          form15Locked: 1,
          form15LockedAt: now,
          updatedAt: now,
        })
        .where(eq(qualityIssues.id, issueId))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId,
        userId: user?.id || "usr-admin",
        userMnv: user?.mnv || "ADMIN01",
        userName: user?.fullName || "Admin Time-Travel",
        action: "⚡ Time-Travel: Nhảy quá hạn 15 phút điều tra (+15m)",
        fromStatus: issue.status,
        toStatus: issue.status,
        detailsJson: JSON.stringify({ action, simulatedDeadline }),
        createdAt: now,
      }).execute();

      return NextResponse.json({
        success: true,
        message: "Đã nhảy mốc thời gian: Hết hạn 15 phút điều tra 5M+1E và khoá phiếu thành công!",
        form15Locked: 1,
      });
    }

    if (action === "reach_3h") {
      // Fast forward 3 hours into the monitoring window
      const simulatedConfirmedAt = now - 3.5 * 3600;
      const simulatedMinDeadline = now - 0.5 * 3600; // đã qua 3h
      const simulatedMaxDeadline = simulatedConfirmedAt + 48 * 3600;

      await db
        .update(monitoringWindows)
        .set({
          confirmedAt: simulatedConfirmedAt,
          minDeadline: simulatedMinDeadline,
          maxDeadline: simulatedMaxDeadline,
        })
        .where(eq(monitoringWindows.issueId, issueId))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId,
        userId: user?.id || "usr-admin",
        userMnv: user?.mnv || "ADMIN01",
        userName: user?.fullName || "Admin Time-Travel",
        action: "⚡ Time-Travel: Nhảy qua mốc tối thiểu 3 giờ theo dõi (+3h)",
        fromStatus: issue.status,
        toStatus: issue.status,
        detailsJson: JSON.stringify({ simulatedMinDeadline }),
        createdAt: now,
      }).execute();

      return NextResponse.json({
        success: true,
        message: "Đã nhảy mốc thời gian: Đạt điều kiện theo dõi 3 giờ. Các nút 'Đóng vấn đề' / 'Kiểm tra lại' đã được mở khoá!",
      });
    }

    if (action === "expire_48h") {
      // Fast forward 48 hours to trigger auto-close
      const simulatedConfirmedAt = now - 50 * 3600;
      const simulatedMaxDeadline = now - 2 * 3600;

      await db
        .update(monitoringWindows)
        .set({
          confirmedAt: simulatedConfirmedAt,
          minDeadline: simulatedConfirmedAt + 3 * 3600,
          maxDeadline: simulatedMaxDeadline,
          status: "auto_closed",
          closedByName: "Hệ thống tự động (Quá 48h)",
          closedAt: now,
        })
        .where(eq(monitoringWindows.issueId, issueId))
        .execute();

      await db
        .update(qualityIssues)
        .set({ status: "completed", updatedAt: now })
        .where(eq(qualityIssues.id, issueId))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId,
        userId: user?.id || "usr-admin",
        userMnv: user?.mnv || "ADMIN01",
        userName: user?.fullName || "Admin Time-Travel",
        action: "⚡ Time-Travel: Nhảy quá 48 giờ theo dõi -> Tự động đóng hoàn thành (+48h)",
        fromStatus: issue.status,
        toStatus: "completed",
        detailsJson: JSON.stringify({ simulatedMaxDeadline }),
        createdAt: now,
      }).execute();

      return NextResponse.json({
        success: true,
        message: "Đã nhảy mốc thời gian: Quá 48 giờ theo dõi và tự động đóng hoàn thành phiếu!",
        status: "completed",
      });
    }

    return NextResponse.json({ error: "Hành động Time-Travel không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    console.error("[Time-Travel API Error]:", err);
    return NextResponse.json({ error: err.message || "Time-Travel thất bại" }, { status: 500 });
  }
}
