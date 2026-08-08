import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { CustomUserSession } from "@/lib/auth.config";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userSession = session.user as unknown as CustomUserSession;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    let d1: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      d1 = (ctx.env as unknown as CloudflareEnv).DB;
    } catch {
      // offline fallback
    }

    if (!d1) {
      // Dev mode fallback response
      return NextResponse.json({
        success: true,
        message: "Đã cập nhật mật khẩu mới thành công (Dev Fallback Mode)!",
      });
    }

    const db = drizzle(d1);
    const foundUsers = await db.select().from(users).where(eq(users.mnv, userSession.mnv)).limit(1);
    const userRecord = foundUsers[0];

    if (userRecord) {
      const isMatch = await bcrypt.compare(currentPassword, userRecord.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: now })
      .where(eq(users.mnv, userSession.mnv))
      .execute();

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
