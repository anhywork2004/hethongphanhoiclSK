import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { seedInitialData } from "@/db/seed";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    if (!d1) {
      return NextResponse.json({ success: true, message: "Dev Mode (No D1 context)" });
    }

    const res = await seedInitialData(d1);
    return NextResponse.json({ success: true, message: "Đã khởi tạo thành công dữ liệu mẫu Phase 1!", res });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
