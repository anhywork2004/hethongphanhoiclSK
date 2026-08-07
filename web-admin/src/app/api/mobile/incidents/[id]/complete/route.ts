import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { getOrCreateAreaMaintenanceGroup } from "@/lib/area-chat-group";
import { sendPushToGroupMembers, sendPushToUsers } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const { repairDetail, partsReplaced, proofImages } = await req.json();
  if (!repairDetail) {
    return NextResponse.json({ error: "Thiếu thông tin hoàn thành công việc" }, { status: 400 });
  }
  if (!Array.isArray(proofImages) || proofImages.length === 0) {
    return NextResponse.json({ error: "Cần ít nhất 1 ảnh minh chứng" }, { status: 400 });
  }

  const incident = await prisma.incident.findUnique({ where: { id }, include: { machine: true } });
  if (!incident) return NextResponse.json({ error: "Không tìm thấy sự cố" }, { status: 404 });
  if (incident.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Sự cố chưa được nhận hoặc đã hoàn thành" }, { status: 409 });
  }
  if (incident.assignedToId !== payload.userId) {
    return NextResponse.json({ error: "Bạn không phải người đang xử lý sự cố này" }, { status: 403 });
  }

  const completedAt = new Date();
  const startTime = incident.acceptedAt ?? incident.createdAt;
  const durationMinutes = Math.max(
    1,
    Math.round((completedAt.getTime() - startTime.getTime()) / 60000),
  );

  const activeStatus = await prisma.category.findFirst({
    where: { type: "MACHINE_STATUS", statusKind: "ACTIVE" },
    orderBy: { isDefault: "desc" },
  });
  if (!activeStatus) {
    return NextResponse.json(
      { error: "Chưa có danh mục Trạng thái máy cho nhóm ACTIVE" },
      { status: 400 },
    );
  }

  // Cloudflare D1 không hỗ trợ interactive transaction ($transaction(async (tx) => ...)) —
  // phải dùng dạng batch (mảng các operation), nên phải tự sinh id cho maintenanceLog trước
  // để ratingRequest có thể tham chiếu ngay trong cùng batch thay vì đợi kết quả insert.
  const maintenanceLogId = crypto.randomUUID();
  const group = await getOrCreateAreaMaintenanceGroup(prisma, incident.machine.areaId);

  const [updatedIncident] = await prisma.$transaction([
    prisma.incident.update({
      where: { id },
      data: { status: "DONE", completedAt },
      include: {
        machine: true,
        reporter: { select: userPublicSelect },
        assignedTo: { select: userPublicSelect },
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        id: maintenanceLogId,
        incidentId: id,
        machineId: incident.machineId,
        technicianId: payload.userId,
        startTime,
        endTime: completedAt,
        durationMinutes,
        repairDetail,
        partsReplaced: partsReplaced || null,
        proofImages: proofImages ? JSON.stringify(proofImages) : null,
      },
    }),
    prisma.ratingRequest.create({
      data: { maintenanceLogId, operatorId: incident.reporterId },
    }),
    prisma.machine.update({
      where: { id: incident.machineId },
      data: { statusId: activeStatus.id },
    }),
    prisma.chatMessage.create({
      data: {
        groupId: group.id,
        senderId: payload.userId,
        type: "SYSTEM",
        incidentId: id,
        content: `${payload.name} đã hoàn thành công việc (${durationMinutes} phút)`,
      },
    }),
  ]);

  await sendPushToGroupMembers(
    prisma,
    group.id,
    {
      title: `${incident.machine.name} (${incident.machine.code})`,
      body: `${payload.name} đã hoàn thành công việc (${durationMinutes} phút)`,
      data: { type: "INCIDENT_COMPLETED", incidentId: id, groupId: group.id },
    },
    payload.userId,
  );
  await sendPushToUsers(prisma, [incident.reporterId], {
    title: `${incident.machine.name} (${incident.machine.code})`,
    body: "Sự cố đã được xử lý xong — vui lòng đánh giá tay nghề bảo trì",
    data: { type: "RATING_REQUEST", maintenanceLogId },
  });

  return NextResponse.json(updatedIncident);
}
