import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueAssignments, notifications } from "@/db/schema";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { handlerId, department } = body;

    if (!handlerId) {
      return NextResponse.json({ error: "Vui lòng chọn người xử lý (Handler)." }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Handler assigned!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const assignId = `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Insert assignment record
    await db
      .insert(issueAssignments)
      .values({
        id: assignId,
        issueId: id,
        department: department || user.department || "Phòng Bảo Trì",
        assignedDeptHead: user.id,
        handlerId,
        mnvConfirmed: 0,
        assignedAt: now,
      })
      .execute();

    // 2. Notify assigned handler
    await db
      .insert(notifications)
      .values({
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: handlerId,
        issueId: id,
        type: "assigned",
        title: "BẠN ĐƯỢC PHÂN CÔNG XỬ LÝ SỰ CỐ!",
        message: `Trưởng phòng ban ${user.fullName} đã cử bạn phụ trách xử lý sự cố. Vui lòng mở ứng dụng nhập MNV xác nhận.`,
        isRead: 0,
        createdAt: now,
      })
      .execute();

    return NextResponse.json({
      success: true,
      message: "Đã phân công người xử lý thành công!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
