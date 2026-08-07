import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import type { TaskStatus } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";

const issueInclude = {
  reporter: { select: userPublicSelect },
  team: true,
  productionLine: true,
  area: true,
  failureCategory: true,
} as const;

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const me = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, areaId: true },
  });
  if (!me) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

  const items: Array<Record<string, unknown>> = [];

  // 1. QA/Trưởng line/Công nghệ: sự cố trong khu vực mình chưa nộp 5M+1E.
  if (["QA", "LINE_LEADER", "TECHNOLOGY"].includes(me.role)) {
    const issues = await prisma.qualityIssue.findMany({
      where: {
        status: { in: ["REPORTED", "INVESTIGATING"] },
        areaId: me.areaId,
        submissions: { none: { submitterId: me.id } },
      },
      include: issueInclude,
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    for (const issue of issues) {
      items.push({
        kind: "NEED_INVESTIGATE",
        id: `investigate-${issue.id}`,
        createdAt: issue.createdAt,
        issue,
      });
    }
  }

  // 2. Trưởng line: sự cố khu vực mình đã đủ 5M+1E (hoặc bị khoá hạn), chưa chốt nguyên nhân.
  if (me.role === "LINE_LEADER") {
    const issues = await prisma.qualityIssue.findMany({
      where: { status: "INVESTIGATING", areaId: me.areaId },
      include: { ...issueInclude, submissions: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    for (const issue of issues) {
      if (issue.submissions.length >= 3 || issue.investigationLocked) {
        items.push({
          kind: "NEED_ROOT_CAUSE",
          id: `rootcause-${issue.id}`,
          createdAt: issue.createdAt,
          issue,
        });
      }
    }
  }

  // 3. Trưởng phòng ban: sự cố khu vực mình đã có nguyên nhân gốc, chưa giao việc.
  if (me.role === "DEPARTMENT_HEAD") {
    const issues = await prisma.qualityIssue.findMany({
      where: { status: "ROOT_CAUSE_FOUND", areaId: me.areaId },
      include: issueInclude,
      orderBy: { rootCauseDecidedAt: "desc" },
      take: 30,
    });
    for (const issue of issues) {
      items.push({
        kind: "NEED_ASSIGN",
        id: `assign-${issue.id}`,
        createdAt: issue.rootCauseDecidedAt ?? issue.createdAt,
        issue,
      });
    }
  }

  // 4. Bảo trì: việc vừa được giao (chưa nhận).
  if (me.role === "MAINTENANCE") {
    const tasks = await prisma.maintenanceTask.findMany({
      where: { assigneeId: me.id, status: "PENDING" },
      include: { issue: { include: issueInclude } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    for (const task of tasks) {
      items.push({
        kind: "TASK_ASSIGNED",
        id: `task-assigned-${task.id}`,
        createdAt: task.createdAt,
        task,
      });
    }
  }

  // 5. Người báo cáo + Trưởng line khu vực: việc vừa được bảo trì nhận (ai nhận lúc mấy giờ).
  const acceptedStatuses: TaskStatus[] = ["ACCEPTED", "DONE"];
  const acceptedTasksWhere =
    me.role === "LINE_LEADER"
      ? { status: { in: acceptedStatuses }, acceptedAt: { not: null }, issue: { areaId: me.areaId } }
      : { status: { in: acceptedStatuses }, acceptedAt: { not: null }, issue: { reporterId: me.id } };
  const acceptedTasks = await prisma.maintenanceTask.findMany({
    where: acceptedTasksWhere,
    include: { issue: { include: issueInclude }, assignee: { select: userPublicSelect } },
    orderBy: { acceptedAt: "desc" },
    take: 30,
  });
  for (const task of acceptedTasks) {
    items.push({
      kind: "TASK_ACCEPTED",
      id: `task-accepted-${task.id}`,
      createdAt: task.acceptedAt,
      task,
    });
  }

  // 6. Trưởng line: việc đã hoàn thành, chờ xác nhận (cửa sổ 3-48h).
  if (me.role === "LINE_LEADER") {
    const tasks = await prisma.maintenanceTask.findMany({
      where: { status: "DONE", verifiedStatus: "PENDING", issue: { areaId: me.areaId } },
      include: { issue: { include: issueInclude }, assignee: { select: userPublicSelect } },
      orderBy: { completedAt: "desc" },
      take: 30,
    });
    for (const task of tasks) {
      items.push({
        kind: "NEED_VERIFY",
        id: `verify-${task.id}`,
        createdAt: task.completedAt,
        task,
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

  return NextResponse.json(items.slice(0, 50));
}
