import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { sendPushToUsersByRoleInArea, sendPushToUsers } from "@/lib/push";
import { NextResponse } from "next/server";

const VERIFY_MIN_MS = 3 * 60 * 60 * 1000;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  if (payload.role !== "LINE_LEADER") {
    return NextResponse.json({ error: "Chỉ Trưởng line mới được xác nhận" }, { status: 403 });
  }

  const task = await prisma.maintenanceTask.findUnique({ where: { id }, include: { issue: true } });
  if (!task) return NextResponse.json({ error: "Không tìm thấy việc" }, { status: 404 });
  if (task.issue.areaId && task.issue.areaId !== (await prisma.user.findUnique({ where: { id: payload.userId }, select: { areaId: true } }))?.areaId) {
    return NextResponse.json({ error: "Việc này không thuộc khu vực của bạn" }, { status: 403 });
  }
  if (task.status !== "DONE" || task.verifiedStatus !== "PENDING") {
    return NextResponse.json({ error: "Việc này không ở trạng thái chờ xác nhận" }, { status: 409 });
  }
  if (!task.completedAt) {
    return NextResponse.json({ error: "Thiếu thời gian hoàn thành" }, { status: 409 });
  }

  const now = Date.now();
  if (now < task.completedAt.getTime() + VERIFY_MIN_MS) {
    return NextResponse.json(
      { error: "Chưa đủ 3 giờ kể từ lúc hoàn thành — vui lòng chờ thêm" },
      { status: 409 },
    );
  }

  const { confirmed } = await req.json();
  if (typeof confirmed !== "boolean") {
    return NextResponse.json({ error: "Thiếu giá trị xác nhận" }, { status: 400 });
  }

  if (confirmed) {
    const [updatedTask] = await prisma.$transaction([
      prisma.maintenanceTask.update({
        where: { id },
        data: { verifiedStatus: "CONFIRMED_DONE", verifiedAt: new Date(now), verifiedById: payload.userId },
      }),
      prisma.qualityIssue.update({ where: { id: task.issueId }, data: { status: "DONE" } }),
    ]);

    await sendPushToUsers(prisma, [task.issue.reporterId, task.assigneeId], {
      title: `Đã xác nhận hoàn thành — PO ${task.issue.poCode}`,
      body: `Trưởng line đã xác nhận hoàn thành.`,
      data: { type: "TASK_VERIFIED", issueId: task.issueId, taskId: id },
    });

    return NextResponse.json(updatedTask);
  }

  // Chưa hoàn thành — giữ nguyên phiếu gốc, mở lại 5M+1E cho 3 role điều tra tiếp.
  const [updatedTask] = await prisma.$transaction([
    prisma.maintenanceTask.update({
      where: { id },
      data: { verifiedStatus: "REJECTED", verifiedAt: new Date(now), verifiedById: payload.userId },
    }),
    prisma.qualityIssue.update({
      where: { id: task.issueId },
      data: { status: "INVESTIGATING", investigationLocked: false },
    }),
  ]);

  await sendPushToUsersByRoleInArea(prisma, ["QA", "LINE_LEADER", "TECHNOLOGY"], task.issue.areaId, {
    title: `Chưa hoàn thành — PO ${task.issue.poCode}`,
    body: "Trưởng line xác nhận chưa hoàn thành — cần điều tra lại 5M+1E.",
    data: { type: "REOPENED", issueId: task.issueId, taskId: id },
  });

  return NextResponse.json(updatedTask);
}
