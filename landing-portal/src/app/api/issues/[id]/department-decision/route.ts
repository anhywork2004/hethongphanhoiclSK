import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueDepartmentDecisions, issueStatusHistory, notifications } from "@/db/schema";
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
    const { department, decision, reason } = body;

    if (!decision || (decision === "cannot_resolve" && !reason?.trim())) {
      return NextResponse.json({ error: "Vui lòng nhập lý do nếu chọn Không Thể Xử Lý." }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Department decision recorded" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const decisionId = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Record department decision
    await db
      .insert(issueDepartmentDecisions)
      .values({
        id: decisionId,
        issueId: id,
        department: department || user.department || "Phòng Chuyên Môn",
        decision,
        reason: reason || null,
        decidedBy: user.id,
        decidedAt: now,
      })
      .execute();

    // 2. If decision is 'cannot_resolve', update status to cannot_resolve
    if (decision === "cannot_resolve") {
      await db
        .update(issues)
        .set({
          status: "cannot_resolve",
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
          toStatus: "cannot_resolve",
          changedBy: user.id,
          changedAt: now,
          note: `Phòng ban chọn Không Thể Xử Lý. Lý do: ${reason}`,
        })
        .execute();

      await db
        .insert(notifications)
        .values({
          id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: null,
          issueId: id,
          type: "cannot_resolve",
          title: "SỰ CỐ KHÔNG THỂ XỬ LÝ!",
          message: `Phiếu lỗi ${id} đã được phòng ban xác nhận không thể xử lý. Chờ chỉ đạo Ban Giám Đốc.`,
          isRead: 0,
          createdAt: now,
        })
        .execute();
    } else {
      // Notification for agreed solution
      await db
        .insert(notifications)
        .values({
          id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId: null,
          issueId: id,
          type: "agree_solution",
          title: "Phòng Ban Đồng Ý Giải Pháp",
          message: `Phòng ban ${department} đã thống nhất phương án xử lý sự cố.`,
          isRead: 0,
          createdAt: now,
        })
        .execute();
    }

    return NextResponse.json({
      success: true,
      message: decision === "cannot_resolve" ? "Đã ghi nhận sự cố Không Thể Xử Lý." : "Đã chấp thuận đề xuất giải pháp!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
