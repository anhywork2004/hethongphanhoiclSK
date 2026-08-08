import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { issues } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      status,
      initialDefectQty,
      repairedDefectQty,
      closedOnceAt,
      closedTwiceAt,
      repairedImages,
      aiCauseDiagnosis,
      testRunHours,
    } = body;

    let d1: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      d1 = (ctx.env as unknown as CloudflareEnv).DB;
    } catch {
      // offline fallback
    }

    if (!d1) {
      return NextResponse.json({
        success: true,
        message: "Đã cập nhật trạng thái phiếu thành công (Dev Fallback Mode)!",
      });
    }

    const db = drizzle(d1);
    const updatePayload: Record<string, unknown> = {};

    if (status) updatePayload.status = status;
    if (initialDefectQty !== undefined) updatePayload.initialDefectQty = initialDefectQty;
    if (repairedDefectQty !== undefined) updatePayload.repairedDefectQty = repairedDefectQty;
    if (closedOnceAt) updatePayload.closedOnceAt = closedOnceAt;
    if (closedTwiceAt) updatePayload.closedTwiceAt = closedTwiceAt;
    if (repairedImages) updatePayload.repairedImages = JSON.stringify(repairedImages);
    if (aiCauseDiagnosis) updatePayload.aiCauseDiagnosis = aiCauseDiagnosis;
    if (testRunHours) updatePayload.testRunHours = testRunHours;

    await db.update(issues).set(updatePayload).where(eq(issues.id, id)).execute();

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật phiếu thành công!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
