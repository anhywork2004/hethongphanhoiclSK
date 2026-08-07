import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { getOrCreateAreaMaintenanceGroup } from "@/lib/area-chat-group";
import { sendPushToGroupMembers } from "@/lib/push";
import { NextResponse } from "next/server";

async function getDefaultStatusId(
  prisma: Awaited<ReturnType<typeof getPrisma>>,
  statusKind: "ACTIVE" | "STOPPED" | "MAINTENANCE",
) {
  const category = await prisma.category.findFirst({
    where: { type: "MACHINE_STATUS", statusKind },
    orderBy: { isDefault: "desc" },
  });
  if (!category) {
    throw new Error(`Chưa có danh mục Trạng thái máy cho nhóm ${statusKind}`);
  }
  return category.id;
}

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  // Chỉ hiện sự cố của máy thuộc khu vực/xưởng của chính nhân viên đang đăng nhập —
  // nhân viên chưa được gán khu vực thì vẫn thấy toàn bộ (không có gì để lọc theo).
  const me = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { areaId: true },
  });

  const incidents = await prisma.incident.findMany({
    where: me?.areaId ? { machine: { areaId: me.areaId } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      machine: true,
      reporter: { select: userPublicSelect },
      assignedTo: { select: userPublicSelect },
      category: true,
    },
  });

  return NextResponse.json(incidents);
}

export async function POST(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const { machineId, description, images, categoryId, customCategoryText } = await req.json();
  if (!machineId || !description || !categoryId) {
    return NextResponse.json({ error: "Thiếu thông tin báo lỗi" }, { status: 400 });
  }

  const machine = await prisma.machine.findUnique({ where: { id: machineId } });
  if (!machine) {
    return NextResponse.json({ error: "Không tìm thấy máy" }, { status: 404 });
  }

  const category = await prisma.failureCategory.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Danh mục hư không hợp lệ" }, { status: 400 });
  }
  if (category.isOther && !customCategoryText?.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập danh mục hư cụ thể" }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      machineId,
      reporterId: payload.userId,
      description,
      images: images ? JSON.stringify(images) : null,
      status: "PENDING",
      categoryId,
      customCategoryText: category.isOther ? customCategoryText.trim() : null,
    },
    include: { machine: true, reporter: { select: userPublicSelect }, category: true },
  });

  const stoppedStatusId = await getDefaultStatusId(prisma, "STOPPED");
  await prisma.machine.update({ where: { id: machineId }, data: { statusId: stoppedStatusId } });

  const categoryLabel = category.isOther ? customCategoryText.trim() : category.name;
  const group = await getOrCreateAreaMaintenanceGroup(prisma, machine.areaId);
  await prisma.chatMessage.create({
    data: {
      groupId: group.id,
      senderId: payload.userId,
      type: "INCIDENT_ALERT",
      incidentId: incident.id,
      content: `${payload.name} báo lỗi máy ${machine.name} (${machine.code}) tại ${machine.location} [${categoryLabel}]: ${description}`,
    },
  });

  await sendPushToGroupMembers(
    prisma,
    group.id,
    {
      title: `Báo lỗi: ${machine.name} (${machine.code})`,
      body: `${payload.name}: ${description}`,
      data: { type: "INCIDENT_ALERT", incidentId: incident.id, groupId: group.id },
    },
    payload.userId,
  );

  return NextResponse.json(incident, { status: 201 });
}
