import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { sendPushToUsers, sendPushToUsersByRoleInArea } from "@/lib/push";
import { NextResponse } from "next/server";

const VERIFY_WINDOW_MS = 48 * 60 * 60 * 1000;

// Bước 1 — ngay khi bảo trì bấm "Hoàn thành" (không giới hạn giờ chờ), Trưởng line xác nhận
// việc sửa chữa đã đạt yêu cầu hay chưa:
// - "Chưa" → trả việc lại cho bảo trì làm lại (task quay về ACCEPTED).
// - "Xong" → bắt đầu giai đoạn theo dõi 3-48h (monitoringStartedAt), sau đó mới tới bước
//   /verify để Trưởng line "Đóng vấn đề" hoặc "Kiểm tra lại".
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  if (payload.role !== "LINE_LEADER") {
    return NextResponse.json({ error: "Chỉ Trưởng line mới được xác nhận sửa chữa" }, { status: 403 });
  }

  const task = await prisma.maintenanceTask.findUnique({ where: { id }, include: { issue: true } });
  if (!task) return NextResponse.json({ error: "Không tìm thấy việc" }, { status: 404 });

  const me = await prisma.user.findUnique({ where: { id: payload.userId }, select: { areaId: true } });
  if (task.issue.areaId && task.issue.areaId !== me?.areaId) {
    return NextResponse.json({ error: "Việc này không thuộc khu vực của bạn" }, { status: 403 });
  }
  if (task.status !== "DONE" || task.monitoringStartedAt) {
    return NextResponse.json(
      { error: "Việc này không ở trạng thái chờ xác nhận sửa chữa" },
      { status: 409 },
    );
  }

  const { adequate } = await req.json();
  if (typeof adequate !== "boolean") {
    return NextResponse.json({ error: "Thiếu giá trị xác nhận" }, { status: 400 });
  }

  if (!adequate) {
    const updatedTask = await prisma.maintenanceTask.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        completedAt: null,
      },
    });

    await sendPushToUsers(prisma, [task.assigneeId], {
      title: `Cần làm lại — PO ${task.issue.poCode}`,
      body: "Trưởng line xác nhận sửa chữa chưa đạt yêu cầu — vui lòng làm lại.",
      data: { type: "REPAIR_REJECTED", issueId: task.issueId, taskId: id },
    });

    return NextResponse.json(updatedTask);
  }

  const now = new Date();
  const updatedTask = await prisma.maintenanceTask.update({
    where: { id },
    data: {
      monitoringStartedAt: now,
      verifyDeadline: new Date(now.getTime() + VERIFY_WINDOW_MS),
    },
  });

  await sendPushToUsersByRoleInArea(prisma, ["DEPARTMENT_HEAD"], task.issue.areaId, {
    title: `Đang theo dõi sau sửa chữa — PO ${task.issue.poCode}`,
    body: "Trưởng line xác nhận sửa chữa đạt yêu cầu, đang trong giai đoạn theo dõi 3-48h.",
    data: { type: "MONITORING_STARTED", issueId: task.issueId, taskId: id },
  });

  return NextResponse.json(updatedTask);
}
