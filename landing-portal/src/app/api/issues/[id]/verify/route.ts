import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession;

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const allowedRoles = ["qa", "truong_line", "to_truong", "truong_phong_ban", "admin", "giam_doc"];
    if (user.role && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Chỉ QA / Tổ trưởng / Trưởng phòng mới được quyền nghiệm thu 4M+1E" }, { status: 403 });
    }

    const { id: issueId } = await params;
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    if (!d1) {
      return NextResponse.json({ error: "D1 binding not found" }, { status: 500 });
    }

    const db = getDb(d1);
    const existing = await db.select().from(issues).where(eq(issues.id, issueId));

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    await db
      .update(issues)
      .set({
        status: "resolved",
        qaApproverMnv: user.mnv || user.id,
        qaApprovedAt: nowIso,
        resolvedAt: nowIso,
      })
      .where(eq(issues.id, issueId));

    return NextResponse.json({
      success: true,
      message: "Phê duyệt nghiệm thu QA thành công! Phiếu đã chính thức đóng.",
      issueId,
      qaApprovedAt: nowIso,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Lỗi phê duyệt QA: ${e.message}` }, { status: 500 });
  }
}
