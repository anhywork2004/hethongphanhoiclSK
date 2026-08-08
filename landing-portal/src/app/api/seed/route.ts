import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { seedInitialData } from "@/db/seed";

export async function POST() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ error: "Không tìm thấy kết nối D1 Database" }, { status: 500 });
    }

    const result = await seedInitialData(env.DB);
    return NextResponse.json({
      message: "Khởi tạo dữ liệu mẫu thành công với đầy đủ 8 vai trò test (Mật khẩu: 123456)!",
      ...result,
    });
  } catch (err: any) {
    console.error("[Seed API Error]:", err);
    return NextResponse.json({ error: err.message || "Khởi tạo dữ liệu thất bại" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
