import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueResolutions } from "@/db/schema";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({ success: true, message: "Dev Fallback: Task started!" });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Create issue_resolutions record with started_at
    await db
      .insert(issueResolutions)
      .values({
        id: resId,
        issueId: id,
        handlerId: user.id,
        startedAt: now,
        hasNewIssue: 0,
      })
      .execute();

    return NextResponse.json({
      success: true,
      startedAt: now,
      message: "Đã bấm xác nhận nhận nhiệm vụ! Đồng hồ tính thời gian sửa chữa bắt đầu chạy.",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
