import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueResolutions, issueImages, notifications } from "@/db/schema";
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
    const { partsUsed, imagesBefore, imagesAfter } = body;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Repair completed!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    // Find active resolution record
    const activeRes = await db
      .select()
      .from(issueResolutions)
      .where(and(eq(issueResolutions.issueId, id), eq(issueResolutions.handlerId, user.id)))
      .limit(1);

    const resRecord = activeRes[0];
    const startedAt = resRecord?.startedAt || now - 60;
    const durationSeconds = Math.max(0, now - startedAt);

    if (resRecord) {
      await db
        .update(issueResolutions)
        .set({
          completedAt: now,
          partsUsed: partsUsed || null,
          durationSeconds,
        })
        .where(eq(issueResolutions.id, resRecord.id))
        .execute();
    }

    // Save proof images before & after
    if (Array.isArray(imagesBefore)) {
      for (const r2Key of imagesBefore) {
        await db.insert(issueImages).values({
          id: `img_b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          issueId: id,
          r2Key,
          stage: "before_fix",
          uploadedBy: user.id,
          uploadedAt: now,
        }).execute();
      }
    }

    if (Array.isArray(imagesAfter)) {
      for (const r2Key of imagesAfter) {
        await db.insert(issueImages).values({
          id: `img_a_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          issueId: id,
          r2Key,
          stage: "after_fix",
          uploadedBy: user.id,
          uploadedAt: now,
        }).execute();
      }
    }

    // Notify line_leader
    await db
      .insert(notifications)
      .values({
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employeeId: null,
        issueId: id,
        type: "repair_completed",
        title: "Kỹ Thuật Đã Bấm Hoàn Thành Sửa Chữa!",
        message: `Kỹ thuật viên ${user.fullName} đã hoàn thành sửa chữa trong ${Math.round(durationSeconds / 60)} phút. Vui lòng Trưởng line xác nhận.`,
        isRead: 0,
        createdAt: now,
      })
      .execute();

    return NextResponse.json({
      success: true,
      durationSeconds,
      message: `Đã hoàn thành sửa chữa thành công trong ${durationSeconds} giây!`,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
