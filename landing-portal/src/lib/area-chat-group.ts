import { getPrisma } from "@/lib/prisma";

type Prisma = Awaited<ReturnType<typeof getPrisma>>;

const AREA_GROUP_PREFIX = "area-maint-";

function areaGroupId(areaId: string | null) {
  return areaId ? `${AREA_GROUP_PREFIX}${areaId}` : `${AREA_GROUP_PREFIX}none`;
}

// Tạo (nếu chưa có) và trả về nhóm chat bảo trì ứng với 1 khu vực/xưởng cụ thể.
// areaId=null -> nhóm chung cho máy/nhân viên chưa gán khu vực.
export async function getOrCreateAreaMaintenanceGroup(prisma: Prisma, areaId: string | null) {
  const groupId = areaGroupId(areaId);
  let group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
  if (!group) {
    let areaName = "Chưa phân khu vực";
    if (areaId) {
      const area = await prisma.category.findUnique({ where: { id: areaId } });
      areaName = area?.name || areaName;
    }
    group = await prisma.chatGroup.create({
      data: { id: groupId, name: `Bảo trì - ${areaName}` },
    });
  }
  return group;
}

// Rời tất cả các nhóm chat bảo trì theo khu vực mà nhân viên này đang là thành viên.
export async function leaveAllAreaMaintenanceGroups(prisma: Prisma, userId: string) {
  await prisma.chatGroupMember.deleteMany({
    where: { userId, groupId: { startsWith: AREA_GROUP_PREFIX } },
  });
}

// Đồng bộ nhân viên bảo trì vào đúng 1 nhóm chat theo khu vực/xưởng — rời nhóm khu vực cũ
// (nếu có) rồi tham gia nhóm khu vực mới, đảm bảo không thấy được nhóm của khu vực khác.
export async function syncMaintenanceAreaMembership(
  prisma: Prisma,
  userId: string,
  areaId: string | null,
) {
  await leaveAllAreaMaintenanceGroups(prisma, userId);
  const group = await getOrCreateAreaMaintenanceGroup(prisma, areaId);
  const existing = await prisma.chatGroupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
  });
  if (!existing) {
    await prisma.chatGroupMember.create({ data: { groupId: group.id, userId } });
  }
  return group;
}
