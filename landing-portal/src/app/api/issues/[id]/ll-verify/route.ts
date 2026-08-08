import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, maintenanceTasks, monitoringWindows, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyRepairCompletion } from "@/lib/notifications";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { decision, rejectReason } = body; // 'approve' | 'reject'

    if (!decision || !["approve", "reject"].includes(decision)) {
      return NextResponse.json({ error: "Quyết định không hợp lệ ('approve' hoặc 'reject')" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (issueRes.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    const issue = issueRes[0];

    const taskRes = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.issueId, id)).limit(1);
    const task = taskRes[0];

    if (decision === "reject") {
      // Revert task to 'accepted' and issue to 'in_progress'
      if (task) {
        await db
          .update(maintenanceTasks)
          .set({ status: "accepted", completedAt: null })
          .where(eq(maintenanceTasks.issueId, id))
          .execute();
      }

      await db
        .update(qualityIssues)
        .set({ status: "in_progress", updatedAt: now })
        .where(eq(qualityIssues.id, id))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        userId: user?.id || "usr-lineleader",
        userMnv: user?.mnv || "TL001",
        userName: user?.fullName || "Trần Văn Bình",
        action: "Trưởng Line từ chối nghiệm thu: Chưa xong, làm lại (Bước 7a)",
        fromStatus: issue.status,
        toStatus: "in_progress",
        detailsJson: JSON.stringify({ rejectReason }),
        createdAt: now,
      }).execute();

      notifyRepairCompletion({
        issueId: issue.id,
        issueCode: issue.issueCode,
        areaId: issue.areaId,
        isRejectedByLL: true,
        technicianId: task?.assignedToId,
      }).catch((err) => console.error("[Notify LL Reject Error]:", err));

      return NextResponse.json({ success: true, status: "in_progress", action: "reject" });
    }

    // Decision === 'approve' (Xong) -> Transition to 'monitoring' & start 3h-48h window
    const minDeadline = now + 3 * 3600; // +3 hours
    const maxDeadline = now + 48 * 3600; // +48 hours

    const existingMon = await db.select().from(monitoringWindows).where(eq(monitoringWindows.issueId, id)).limit(1);
    if (existingMon.length > 0) {
      await db
        .update(monitoringWindows)
        .set({
          confirmedByLlId: user?.id || "usr-lineleader",
          confirmedByLlName: user?.fullName || "Trần Văn Bình",
          confirmedAt: now,
          minDeadline,
          maxDeadline,
          status: "monitoring",
        })
        .where(eq(monitoringWindows.issueId, id))
        .execute();
    } else {
      await db.insert(monitoringWindows).values({
        id: `mon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        confirmedByLlId: user?.id || "usr-lineleader",
        confirmedByLlName: user?.fullName || "Trần Văn Bình",
        confirmedAt: now,
        minDeadline,
        maxDeadline,
        status: "monitoring",
      }).execute();
    }

    await db
      .update(qualityIssues)
      .set({ status: "monitoring", updatedAt: now })
      .where(eq(qualityIssues.id, id))
      .execute();

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || "usr-lineleader",
      userMnv: user?.mnv || "TL001",
      userName: user?.fullName || "Trần Văn Bình",
      action: "Trưởng Line xác nhận Xong -> Kích hoạt theo dõi 3h - 48h (Bước 7a)",
      fromStatus: issue.status,
      toStatus: "monitoring",
      detailsJson: JSON.stringify({ minDeadline, maxDeadline }),
      createdAt: now,
    }).execute();

    notifyRepairCompletion({
      issueId: issue.id,
      issueCode: issue.issueCode,
      areaId: issue.areaId,
      isConfirmedByLL: true,
    }).catch((err) => console.error("[Notify LL Approve Error]:", err));

    return NextResponse.json({
      success: true,
      status: "monitoring",
      minDeadline,
      maxDeadline,
    });
  } catch (err: any) {
    console.error("[LL Verify API Error]:", err);
    return NextResponse.json({ error: err.message || "Xác nhận thất bại" }, { status: 500 });
  }
}
