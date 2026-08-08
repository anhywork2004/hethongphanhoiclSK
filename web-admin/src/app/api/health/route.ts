import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  let dbStatus = "unknown";
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      await d1.prepare("SELECT 1").first();
      dbStatus = "connected";
    } else {
      dbStatus = "no_binding";
    }
  } catch (err: unknown) {
    const e = err as Error;
    dbStatus = `error: ${e.message}`;
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "TBS Skechers KG1 CLSK Feedback System",
      version: "1.0.0",
      database: dbStatus,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "99",
      },
    }
  );
}
