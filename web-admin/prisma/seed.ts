import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const statusActive = await prisma.category.upsert({
    where: { type_name: { type: "MACHINE_STATUS", name: "Đang hoạt động" } },
    update: {},
    create: {
      type: "MACHINE_STATUS",
      name: "Đang hoạt động",
      statusKind: "ACTIVE",
      isDefault: true,
      colorHex: "#16A34A",
      order: 0,
    },
  });
  await prisma.category.upsert({
    where: { type_name: { type: "MACHINE_STATUS", name: "Đang dừng" } },
    update: {},
    create: {
      type: "MACHINE_STATUS",
      name: "Đang dừng",
      statusKind: "STOPPED",
      isDefault: true,
      colorHex: "#F97316",
      order: 1,
    },
  });
  await prisma.category.upsert({
    where: { type_name: { type: "MACHINE_STATUS", name: "Đang bảo trì" } },
    update: {},
    create: {
      type: "MACHINE_STATUS",
      name: "Đang bảo trì",
      statusKind: "MAINTENANCE",
      isDefault: true,
      colorHex: "#2563EB",
      order: 2,
    },
  });
  await prisma.category.upsert({
    where: { type_name: { type: "MAINTENANCE_PERIOD", name: "1 tháng" } },
    update: {},
    create: { type: "MAINTENANCE_PERIOD", name: "1 tháng", days: 30, order: 0 },
  });
  await prisma.category.upsert({
    where: { type_name: { type: "MAINTENANCE_PERIOD", name: "3 tháng" } },
    update: {},
    create: { type: "MAINTENANCE_PERIOD", name: "3 tháng", days: 90, order: 1 },
  });
  await prisma.category.upsert({
    where: { type_name: { type: "MAINTENANCE_PERIOD", name: "6 tháng" } },
    update: {},
    create: { type: "MAINTENANCE_PERIOD", name: "6 tháng", days: 180, order: 2 },
  });

  const admin = await prisma.user.upsert({
    where: { employeeCode: "ADM001" },
    update: {},
    create: {
      employeeCode: "ADM001",
      name: "Quản trị viên",
      phone: "0900000001",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.upsert({
    where: { employeeCode: "NV001" },
    update: {},
    create: {
      employeeCode: "NV001",
      name: "Nguyễn Văn Vận Hành",
      phone: "0900000002",
      passwordHash: password,
      role: "OPERATOR",
    },
  });

  const tech1 = await prisma.user.upsert({
    where: { employeeCode: "BT001" },
    update: {},
    create: {
      employeeCode: "BT001",
      name: "Trần Văn Bảo Trì",
      phone: "0900000003",
      passwordHash: password,
      role: "MAINTENANCE",
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { employeeCode: "BT002" },
    update: {},
    create: {
      employeeCode: "BT002",
      name: "Lê Thị Kỹ Thuật",
      phone: "0900000004",
      passwordHash: password,
      role: "MAINTENANCE",
    },
  });

  await prisma.machine.upsert({
    where: { code: "MAY001" },
    update: {},
    create: {
      code: "MAY001",
      name: "Máy CNC số 1",
      location: "Xưởng A - Khu vực 1",
      specs: "Công suất 5.5kW, năm sản xuất 2020",
      statusId: statusActive.id,
    },
  });

  await prisma.machine.upsert({
    where: { code: "MAY002" },
    update: {},
    create: {
      code: "MAY002",
      name: "Máy ép nhựa số 2",
      location: "Xưởng B - Khu vực 3",
      specs: "Công suất 11kW, năm sản xuất 2019",
      statusId: statusActive.id,
    },
  });

  const failureCategories = [
    { id: "cat-dien", name: "Hệ thống Điện / Điện tử", order: 1 },
    { id: "cat-co-khi", name: "Cơ khí / Truyền động", order: 2 },
    { id: "cat-thuy-luc", name: "Thủy lực / Khí nén", order: 3 },
    { id: "cat-phan-mem", name: "Phần mềm / Lỗi vận hành", order: 4 },
    { id: "cat-hao-mon", name: "Hao mòn tự nhiên / Vật tư tiêu hao", order: 5 },
    { id: "cat-con-nguoi", name: "Lỗi do con người", order: 6 },
    { id: "cat-khac", name: "Khác", order: 7, isOther: true },
  ];
  for (const cat of failureCategories) {
    await prisma.failureCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  const group = await prisma.chatGroup.upsert({
    where: { id: "default-maintenance-group" },
    update: {},
    create: {
      id: "default-maintenance-group",
      name: "Nhóm Bảo trì",
    },
  });

  for (const user of [tech1, tech2]) {
    await prisma.chatGroupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
      update: {},
      create: { groupId: group.id, userId: user.id },
    });
  }

  console.log({ admin: admin.employeeCode, operator: operator.employeeCode });
  console.log("Mật khẩu mặc định cho tất cả tài khoản seed: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
