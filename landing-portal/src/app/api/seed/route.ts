import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { seedInitialData } from "@/db/seed";

export async function POST() {
  try {
    let d1: D1Database | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      d1 = (ctx.env as unknown as CloudflareEnv).DB;
    } catch {
      // fallback
    }

    if (!d1) {
      return NextResponse.json({ success: true, message: "Dev Mode (No D1 context)" });
    }

    const res = await seedInitialData(d1);
    return NextResponse.json({
      success: true,
      message: "Database tables initialized and seed data populated successfully.",
      res,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
