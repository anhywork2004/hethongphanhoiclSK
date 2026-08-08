import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, maintenanceTasks, auditLogs } from "@/db/schema";
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
    const { repairDescription, partsUsed, imagesBefore, imagesAfter } = body;

    if (!repairDescription || !repairDescription.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập mô tả chi tiết các bước và kết quả sửa chữa" },
        { status: 400 }
      );
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

    const acceptedAt = task?.acceptedAt || now - 600;
    const durationSeconds = Math.max(1, now - acceptedAt);

    const taskUpdateData = {
      status: "done",
      completedAt: now,
      durationSeconds,
      repairDescription: repairDescription.trim(),
      partsUsedJson: JSON.stringify(Array.isArray(partsUsed) ? partsUsed : []),
      imagesBeforeJson: JSON.stringify(Array.isArray(imagesBefore) ? imagesBefore : []),
      imagesAfterJson: JSON.stringify(Array.isArray(imagesAfter) ? imagesAfter : []),
    };

    if (task) {
      await db.update(maintenanceTasks).set(taskUpdateData).where(eq(maintenanceTasks.issueId, id)).execute();
    } else {
      await db.insert(maintenanceTasks).values({
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        departmentId: user?.departmentId || "dept-bao-tri",
        assignedById: "usr-depthead",
        assignedToId: user?.id || "usr-handler",
        assignedToName: user?.fullName || "Đỗ Văn Hùng",
        assignedAt: acceptedAt,
        acceptedAt,
        ...taskUpdateData,
      }).execute();
    }

    // Keep issue in progress or update timestamp
    await db.update(qualityIssues).set({ updatedAt: now }).where(eq(qualityIssues.id, id)).execute();

    // Log Audit Trail
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || "usr-handler",
      userMnv: user?.mnv || "KT001",
      userName: user?.fullName || "Đỗ Văn Hùng",
      action: "Kỹ thuật viên hoàn thành sửa chữa (Bước 6)",
      fromStatus: issue.status,
      toStatus: issue.status,
      detailsJson: JSON.stringify({
        durationMinutes: Math.round(durationSeconds / 60),
        partsCount: Array.isArray(partsUsed) ? partsUsed.length : 0,
      }),
      createdAt: now,
    }).execute();

    // Notify Line Leader (to confirm) and Department Head (TP)
    notifyRepairCompletion({
      issueId: issue.id,
      issueCode: issue.issueCode,
      areaId: issue.areaId,
      isConfirmedByLL: false,
      isRejectedByLL: false,
    }).catch((err) => console.error("[Notify Step 6 Error]:", err));

    return NextResponse.json({
      success: true,
      durationSeconds,
      completedAt: now,
    });
  } catch (err: any) {
    console.error("[Complete Repair API Error]:", err);
    return NextResponse.json({ error: err.message || "Hoàn thành sửa chữa thất bại" }, { status: 500 });
  }
}
