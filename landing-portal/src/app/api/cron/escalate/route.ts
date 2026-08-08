import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { processSlaEscalations } from "@/lib/escalation";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    if (!d1) {
      return NextResponse.json({ error: "D1 Database binding missing" }, { status: 500 });
    }

    const result = await processSlaEscalations(d1);

    return NextResponse.json({
      success: true,
      message: "Quét đôn đốc SLA Zalo hoàn tất",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Lỗi quét đôn đốc: ${e.message}` }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
