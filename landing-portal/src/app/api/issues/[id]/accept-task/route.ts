import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, maintenanceTasks, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyTaskAccepted } from "@/lib/notifications";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (issueRes.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    const issue = issueRes[0];

    const currentUserId = user?.id || "usr-handler";

    // Business Constraint: 1 person can only have 1 active task in 'accepted' status at a time
    const activeTasks = await db
      .select()
      .from(maintenanceTasks)
      .where(and(eq(maintenanceTasks.assignedToId, currentUserId), eq(maintenanceTasks.status, "accepted")));

    if (activeTasks.length > 0 && activeTasks[0].issueId !== id) {
      return NextResponse.json(
        {
          error: `Bạn đang có 1 sự cố (${activeTasks[0].issueId}) đang xử lý! Vui lòng hoàn thành công việc hiện tại trước khi nhận việc mới.`,
        },
        { status: 400 }
      );
    }

    // Update maintenance task status to 'accepted' and set acceptedAt
    await db
      .update(maintenanceTasks)
      .set({
        status: "accepted",
        acceptedAt: now,
      })
      .where(eq(maintenanceTasks.issueId, id))
      .execute();

    // Update quality issue status to 'in_progress'
    await db
      .update(qualityIssues)
      .set({
        status: "in_progress",
        updatedAt: now,
      })
      .where(eq(qualityIssues.id, id))
      .execute();

    // Log Audit Trail
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: currentUserId,
      userMnv: user?.mnv || "KT001",
      userName: user?.fullName || "Đỗ Văn Hùng",
      action: "Nhận việc xử lý sự cố (Bước 5)",
      fromStatus: issue.status,
      toStatus: "in_progress",
      detailsJson: JSON.stringify({ acceptedAt: now }),
      createdAt: now,
    }).execute();

    // Notify Reporter and LL
    notifyTaskAccepted({
      issueId: issue.id,
      issueCode: issue.issueCode,
      reporterId: issue.reportedById,
      areaId: issue.areaId,
      technicianName: user?.fullName || "Đỗ Văn Hùng",
    }).catch((err) => console.error("[Notify Accept Error]:", err));

    return NextResponse.json({
      success: true,
      status: "in_progress",
      acceptedAt: now,
    });
  } catch (err: any) {
    console.error("[Accept Task API Error]:", err);
    return NextResponse.json({ error: err.message || "Nhận việc thất bại" }, { status: 500 });
  }
}
