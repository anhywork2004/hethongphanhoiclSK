import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, maintenanceTasks, departments, users, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyTaskAssigned } from "@/lib/notifications";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { departmentId, assignedToId } = body;

    if (!departmentId || !assignedToId) {
      return NextResponse.json(
        { error: "Vui lòng chọn phòng ban liên quan và nhân viên thực hiện cùng khu vực" },
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

    // Fetch department details
    const deptRes = await db.select().from(departments).where(eq(departments.id, departmentId)).limit(1);
    const dept = deptRes[0];

    // Fetch assignee details & verify area
    const assigneeRes = await db.select().from(users).where(eq(users.id, assignedToId)).limit(1);
    if (assigneeRes.length === 0) return NextResponse.json({ error: "Không tìm thấy nhân viên được giao" }, { status: 404 });
    const assignee = assigneeRes[0];

    // Validate that assignee is in the same area/workshop if area is defined
    if (issue.areaId && assignee.areaId && issue.areaId !== assignee.areaId) {
      return NextResponse.json(
        { error: "Nhân viên được giao phải thuộc cùng khu vực/phân xưởng với phiếu sự cố!" },
        { status: 400 }
      );
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Upsert or insert maintenance task
    const existingTask = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.issueId, id)).limit(1);
    if (existingTask.length > 0) {
      await db
        .update(maintenanceTasks)
        .set({
          departmentId,
          departmentName: dept?.name || "Phòng Bảo Trì",
          assignedById: user?.id || "usr-depthead",
          assignedByName: user?.fullName || "Hoàng Văn Giang",
          assignedToId: assignee.id,
          assignedToName: assignee.fullName,
          assignedToMnv: assignee.mnv,
          assignedAt: now,
          status: "pending",
        })
        .where(eq(maintenanceTasks.issueId, id))
        .execute();
    } else {
      await db.insert(maintenanceTasks).values({
        id: taskId,
        issueId: id,
        departmentId,
        departmentName: dept?.name || "Phòng Bảo Trì",
        assignedById: user?.id || "usr-depthead",
        assignedByName: user?.fullName || "Hoàng Văn Giang",
        assignedToId: assignee.id,
        assignedToName: assignee.fullName,
        assignedToMnv: assignee.mnv,
        assignedAt: now,
        status: "pending",
        partsUsedJson: "[]",
        imagesBeforeJson: "[]",
        imagesAfterJson: "[]",
      }).execute();
    }

    // Update issue status to 'assigned'
    await db
      .update(qualityIssues)
      .set({ status: "assigned", updatedAt: now })
      .where(eq(qualityIssues.id, id))
      .execute();

    // Log Audit Trail
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || "usr-depthead",
      userMnv: user?.mnv || "TP001",
      userName: user?.fullName || "Hoàng Văn Giang",
      action: "Trưởng phòng giao việc (Bước 4)",
      fromStatus: issue.status,
      toStatus: "assigned",
      detailsJson: JSON.stringify({
        departmentName: dept?.name,
        assignedToName: assignee.fullName,
        assignedToMnv: assignee.mnv,
      }),
      createdAt: now,
    }).execute();

    // Trigger Notification to Assigned Staff
    notifyTaskAssigned({
      issueId: issue.id,
      issueCode: issue.issueCode,
      assignedToId: assignee.id,
      departmentName: dept?.name,
    }).catch((err) => console.error("[Notify Assign Error]:", err));

    return NextResponse.json({
      success: true,
      status: "assigned",
      task: {
        departmentName: dept?.name,
        assignedToName: assignee.fullName,
      },
    });
  } catch (err: any) {
    console.error("[Assign API Error]:", err);
    return NextResponse.json({ error: err.message || "Giao việc thất bại" }, { status: 500 });
  }
}
