import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueMonitoring, issueStatusHistory, notifications } from "@/db/schema";
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
    const { qtyBefore, qtyAfter, imagesBefore, imagesAfter } = body;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Monitoring closed!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    // Verify monitoring min_deadline (3h)
    const monRows = await db.select().from(issueMonitoring).where(eq(issueMonitoring.issueId, id)).limit(1);
    const monItem = monRows[0];

    if (monItem && monItem.minDeadline && now < monItem.minDeadline) {
      const remainingMinutes = Math.ceil((monItem.minDeadline - now) / 60);
      return NextResponse.json(
        { error: `Chưa đủ thời gian 3 giờ chạy thử nghiệm tối thiểu. Còn lại ${remainingMinutes} phút nữa mới được báo cáo hoàn thành.` },
        { status: 400 }
      );
    }

    // Update issue_monitoring
    if (monItem) {
      await db
        .update(issueMonitoring)
        .set({
          closedBy: user.id,
          closedAt: now,
          qtyBefore: qtyBefore !== undefined ? Number(qtyBefore) : monItem.qtyBefore,
          qtyAfter: qtyAfter !== undefined ? Number(qtyAfter) : monItem.qtyAfter,
          imagesBefore: Array.isArray(imagesBefore) ? JSON.stringify(imagesBefore) : monItem.imagesBefore,
          imagesAfter: Array.isArray(imagesAfter) ? JSON.stringify(imagesAfter) : monItem.imagesAfter,
        })
        .where(eq(issueMonitoring.id, monItem.id))
        .execute();
    }

    // Set issue status = 'resolved'
    await db
      .update(issues)
      .set({
        status: "resolved",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(issues.id, id))
      .execute();

    // Log status history
    await db
      .insert(issueStatusHistory)
      .values({
        id: `his_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        issueId: id,
        fromStatus: "monitoring",
        toStatus: "resolved",
        changedBy: user.id,
        changedAt: now,
        note: "Đã hoàn thành ca chạy thử nghiệm và đóng phiếu xử lý lỗi thành công.",
      })
      .execute();

    // Notify stakeholders
    await db
      .insert(notifications)
      .values({
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: null,
        issueId: id,
        type: "issue_resolved",
        title: "PHIẾU SỰ CỐ ĐÃ ĐƯỢC ĐÓNG LỖI HOÀN TẤT!",
        message: `Phiếu lỗi ${id} đã được đóng lỗi thành công sau ca chạy thử nghiệm đạt tiêu chuẩn.`,
        isRead: 0,
        createdAt: now,
      })
      .execute();

    return NextResponse.json({
      success: true,
      message: "Đã báo cáo hoàn thành ca chạy thử nghiệm và ĐÓNG LỖI thành công!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
