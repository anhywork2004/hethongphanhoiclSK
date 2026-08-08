import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { sendPushToUsersByRoleInArea } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const task = await prisma.maintenanceTask.findUnique({ where: { id }, include: { issue: true } });
  if (!task) return NextResponse.json({ error: "Không tìm thấy việc" }, { status: 404 });
  if (task.assigneeId !== payload.userId) {
    return NextResponse.json({ error: "Bạn không phải người đang xử lý việc này" }, { status: 403 });
  }
  if (task.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Việc này chưa được nhận hoặc đã hoàn thành" }, { status: 409 });
  }

  const { repairDetail, partsReplaced, imagesBefore, imagesAfter } = await req.json();
  if (!repairDetail) {
    return NextResponse.json({ error: "Vui lòng mô tả đã sửa chữa những gì" }, { status: 400 });
  }
  if (!Array.isArray(imagesBefore) || imagesBefore.length === 0) {
    return NextResponse.json({ error: "Cần ít nhất 1 ảnh trước khi sửa" }, { status: 400 });
  }
  if (!Array.isArray(imagesAfter) || imagesAfter.length === 0) {
    return NextResponse.json({ error: "Cần ít nhất 1 ảnh sau khi sửa" }, { status: 400 });
  }

  const now = new Date();
  const [updatedTask] = await prisma.$transaction([
    prisma.maintenanceTask.update({
      where: { id },
      data: {
        status: "DONE",
        completedAt: now,
        repairDetail,
        partsReplaced: partsReplaced ? JSON.stringify(partsReplaced) : null,
        imagesBefore: JSON.stringify(imagesBefore),
        imagesAfter: JSON.stringify(imagesAfter),
        // Reset về trạng thái chờ Trưởng line xác nhận "xong/chưa" — 48h theo dõi chỉ bắt đầu
        // sau khi Trưởng line xác nhận sửa chữa đạt yêu cầu (xem /confirm-repair).
        monitoringStartedAt: null,
        verifyDeadline: null,
        verifiedStatus: "PENDING",
        verifiedAt: null,
        verifiedById: null,
      },
    }),
  ]);

  // Cả Trưởng line (người xác nhận) và Trưởng phòng ban (người giao việc) đều được báo khi bảo
  // trì hoàn thành.
  await sendPushToUsersByRoleInArea(prisma, ["LINE_LEADER", "DEPARTMENT_HEAD"], task.issue.areaId, {
    title: `Đã hoàn thành sửa chữa — PO ${task.issue.poCode}`,
    body: `${payload.name} đã hoàn thành. Trưởng line vào kiểm tra xem đã đạt yêu cầu chưa.`,
    data: { type: "TASK_DONE", issueId: task.issueId, taskId: id },
  });

  return NextResponse.json(updatedTask);
}
