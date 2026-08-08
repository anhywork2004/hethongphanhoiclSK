import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueAssignments, notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { mnvInput } = body;

    if (!mnvInput) {
      return NextResponse.json({ error: "Vui lòng nhập Mã Nhân Viên (MNV)." }, { status: 400 });
    }

    const cleanInput = mnvInput.trim().toUpperCase().replace(/O/g, "0");
    const userMnvClean = user.mnv.trim().toUpperCase().replace(/O/g, "0");

    if (cleanInput !== userMnvClean) {
      return NextResponse.json(
        { error: "Mã Nhân Viên nhập vào KHÔNG KHỚP với tài khoản được cử xử lý! Vui lòng thử lại." },
        { status: 403 }
      );
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: MNV confirmed!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    // Update assignment mnvConfirmed = 1
    await db
      .update(issueAssignments)
      .set({
        mnvConfirmed: 1,
        confirmedAt: now,
      })
      .where(and(eq(issueAssignments.issueId, id), eq(issueAssignments.handlerId, user.id)))
      .execute();

    // Create notification for line_leader & team_leader
    await db
      .insert(notifications)
      .values({
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: null,
        issueId: id,
        type: "handler_confirmed",
        title: "Kỹ Thuật Đã Đăng Nhập Xác Nhận MNV!",
        message: `Kỹ thuật viên ${user.fullName} (${user.mnv}) đã xác nhận danh tính chính chủ và chuẩn bị tiến hành sửa chữa.`,
        isRead: 0,
        createdAt: now,
      })
      .execute();

    return NextResponse.json({
      success: true,
      message: "Xác nhận MNV thành công! Bạn đã sẵn sàng tiếp nhận nhiệm vụ.",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
