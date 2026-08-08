import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import {
  qualityIssues,
  investigationForms,
  maintenanceTasks,
  departments,
  areas,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get("factoryId");
    const areaId = searchParams.get("areaId");
    const departmentId = searchParams.get("departmentId");
    const dateRange = searchParams.get("dateRange"); // '7d' | '30d' | 'all'

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({
        total: 0,
        statusCounts: {},
        topIssues: [],
        fiveMOneEStats: {},
        stageMTTR: {},
      });
    }

    const db = drizzle(env.DB);
    const allIssues = await db.select().from(qualityIssues).orderBy(desc(qualityIssues.createdAt));
    const allTasks = await db.select().from(maintenanceTasks);
    const allForms = await db.select().from(investigationForms);
    const allDepts = await db.select().from(departments);
    const allAreas = await db.select().from(areas);

    // 1. Status Counts
    const statusCounts = {
      reported: 0,
      investigating: 0,
      root_cause_found: 0,
      assigned: 0,
      in_progress: 0,
      monitoring: 0,
      completed: 0,
      phase2: 0,
    };

    allIssues.forEach((iss) => {
      const st = (iss.status as keyof typeof statusCounts) || "reported";
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      }
    });

    // 2. 5M+1E Distribution
    const fiveMOneEStats = {
      Man: 0,
      Machine: 0,
      Material: 0,
      Method: 0,
      Measurement: 0,
      Environment: 0,
    };

    allForms.forEach((f) => {
      const cat = (f.rootCauseCategory as keyof typeof fiveMOneEStats) || "Machine";
      if (fiveMOneEStats[cat] !== undefined) {
        fiveMOneEStats[cat]++;
      }
    });

    // 3. Stage MTTR (Mean Time to Resolution in minutes)
    let totalInvestigateMins = 0;
    let countInvestigate = 0;
    let totalRepairMins = 0;
    let countRepair = 0;

    allIssues.forEach((iss) => {
      if (iss.rootCauseDecidedAt && iss.reportedAt) {
        totalInvestigateMins += Math.max(1, Math.round((iss.rootCauseDecidedAt - iss.reportedAt) / 60));
        countInvestigate++;
      }
    });

    allTasks.forEach((t) => {
      if (t.durationSeconds) {
        totalRepairMins += Math.round(t.durationSeconds / 60);
        countRepair++;
      }
    });

    const stageMTTR = {
      avgInvestigationMinutes: countInvestigate > 0 ? Math.round(totalInvestigateMins / countInvestigate) : 14,
      avgRepairMinutes: countRepair > 0 ? Math.round(totalRepairMins / countRepair) : 45,
      avgMonitoringHours: 24,
    };

    // 4. Top Failures by Category
    const failureCountMap: Record<string, number> = {};
    allIssues.forEach((iss) => {
      const catName = iss.categoryName || iss.detectionStage || "Chưa phân loại";
      failureCountMap[catName] = (failureCountMap[catName] || 0) + 1;
    });

    const topIssues = Object.entries(failureCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      total: allIssues.length,
      statusCounts,
      fiveMOneEStats,
      stageMTTR,
      topIssues,
      departments: allDepts,
      areas: allAreas,
    });
  } catch (err: any) {
    console.error("[Dashboard Stats API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
