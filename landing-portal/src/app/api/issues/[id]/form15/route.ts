import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issue5m1e, issueStatusHistory, notifications } from "@/db/schema";
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
    const {
      poNumber,
      defectQuantity,
      man,
      machine,
      material,
      method,
      measurement,
      environment,
      rootCause,
      proposedSolution,
    } = body;

    if (!defectQuantity || !rootCause || !proposedSolution) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ các trường bắt buộc (Số lượng lỗi, Nguyên nhân gốc, Đề xuất giải pháp)." }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback Mode: Form 15m saved!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const form5m1eId = `f15_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Insert issue_5m1e record
    await db
      .insert(issue5m1e)
      .values({
        id: form5m1eId,
        issueId: id,
        poNumber: poNumber || null,
        defectQuantity: Number(defectQuantity),
        man: man || null,
        machine: machine || null,
        material: material || null,
        method: method || null,
        measurement: measurement || null,
        environment: environment || null,
        rootCause: rootCause.trim(),
        proposedSolution: proposedSolution.trim(),
        submittedBy: user.id,
        submittedAt: now,
      })
      .execute();

    // 2. Update issue status to 'processing' and set form15_submitted_at
    await db
      .update(issues)
      .set({
        status: "processing",
        form15SubmittedAt: now,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(issues.id, id))
      .execute();

    // 3. Log status history
    await db
      .insert(issueStatusHistory)
      .values({
        id: `his_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        issueId: id,
        fromStatus: "pending",
        toStatus: "processing",
        changedBy: user.id,
        changedAt: now,
        note: "Đã hoàn thành Form 15 phút 5M+1E thủ công",
      })
      .execute();

    // 4. Create in-app notification
    await db
      .insert(notifications)
      .values({
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: user.id,
        issueId: id,
        type: "form15_submitted",
        title: "Đã hoàn thành phân tích 5M+1E",
        message: `Phiếu sự cố đã được phân tích 5M+1E và chuyển sang trạng thái Đang xử lý.`,
        isRead: 0,
        createdAt: now,
      })
      .execute();

    return NextResponse.json({
      success: true,
      message: "Hoàn thành Form 15 phút 5M+1E thành công!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message || "Lỗi lưu Form 15m" }, { status: 500 });
  }
}
