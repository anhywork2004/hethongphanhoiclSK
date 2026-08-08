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

  if (payload.role !== "MAINTENANCE") {
    return NextResponse.json({ error: "Chỉ nhân viên bảo trì mới được nhận việc" }, { status: 403 });
  }

  const incident = await prisma.incident.findUnique({ where: { id }, include: { machine: true } });
  if (!incident) return NextResponse.json({ error: "Không tìm thấy sự cố" }, { status: 404 });
  if (incident.status !== "PENDING") {
    return NextResponse.json({ error: "Sự cố này đã có người nhận" }, { status: 409 });
  }

  // Mỗi nhân viên bảo trì chỉ được nhận 1 việc tại 1 thời điểm — phải hoàn thành việc đang
  // xử lý trước khi nhận việc mới, tránh trôi việc/quên việc.
  const activeJob = await prisma.incident.findFirst({
    where: { assignedToId: payload.userId, status: "ACCEPTED" },
    include: { machine: true },
  });
  if (activeJob) {
    return NextResponse.json(
      {
        error: `Bạn đang xử lý máy ${activeJob.machine.name} (${activeJob.machine.code}) — vui lòng hoàn thành trước khi nhận việc khác`,
      },
      { status: 409 },
    );
  }

  const updated = await prisma.incident.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      assignedToId: payload.userId,
      acceptedAt: new Date(),
    },
    include: {
      machine: true,
      reporter: { select: userPublicSelect },
      assignedTo: { select: userPublicSelect },
    },
  });

  const group = await getOrCreateAreaMaintenanceGroup(prisma, incident.machine.areaId);
  await prisma.chatMessage.create({
    data: {
      groupId: group.id,
      senderId: payload.userId,
      type: "SYSTEM",
      incidentId: id,
      content: `${payload.name} đã nhận việc`,
    },
  });

  await sendPushToGroupMembers(
    prisma,
    group.id,
    {
      title: `${incident.machine.name} (${incident.machine.code})`,
      body: `${payload.name} đã nhận việc`,
      data: { type: "INCIDENT_ACCEPTED", incidentId: id, groupId: group.id },
    },
    payload.userId,
  );
  await sendPushToUsers(prisma, [updated.reporterId], {
    title: `${incident.machine.name} (${incident.machine.code})`,
    body: `${payload.name} đã nhận xử lý sự cố bạn báo`,
    data: { type: "INCIDENT_ACCEPTED", incidentId: id },
  });

  return NextResponse.json(updated);
}
