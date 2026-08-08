import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueResolutions, issueEscalations } from "@/db/schema";
import { eq, desc, avg } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env.DB) {
      return NextResponse.json({
        success: true,
        counts: { pending: 3, processing: 2, monitoring: 1, resolved: 5, cannot_resolve: 0 },
        overdueCount: 1,
        avgDurationSeconds: 1450,
        recentIssues: [],
      });
    }

    const db = drizzle(env.DB);

    // Counts by status
    const pendingList = await db.select().from(issues).where(eq(issues.status, "pending"));
    const processingList = await db.select().from(issues).where(eq(issues.status, "processing"));
    const monitoringList = await db.select().from(issues).where(eq(issues.status, "monitoring"));
    const resolvedList = await db.select().from(issues).where(eq(issues.status, "resolved"));
    const cannotList = await db.select().from(issues).where(eq(issues.status, "cannot_resolve"));

    // Overdue count
    const escalations = await db.select().from(issueEscalations);

    // Avg duration
    const avgRes = await db.select({ value: avg(issueResolutions.durationSeconds) }).from(issueResolutions);
    const avgDurationSeconds = Math.round(Number(avgRes[0]?.value || 0));

    // 10 Recent issues
    const recentIssues = await db.select().from(issues).orderBy(desc(issues.createdAt)).limit(10);

    return NextResponse.json({
      success: true,
      counts: {
        pending: pendingList.length,
        processing: processingList.length,
        monitoring: monitoringList.length,
        resolved: resolvedList.length,
        cannot_resolve: cannotList.length,
      },
      overdueCount: escalations.length,
      avgDurationSeconds,
      recentIssues,
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
