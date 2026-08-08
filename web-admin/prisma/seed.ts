import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const areaA = await prisma.category.upsert({
    where: { type_name: { type: "AREA", name: "Xưởng A" } },
    update: {},
    create: { type: "AREA", name: "Xưởng A", order: 0 },
  });
  const teamA1 = await prisma.category.upsert({
    where: { type_name: { type: "TEAM", name: "Tổ 1" } },
    update: {},
    create: { type: "TEAM", name: "Tổ 1", order: 0 },
  });
  const lineA1 = await prisma.category.upsert({
    where: { type_name: { type: "PRODUCTION_LINE", name: "Chuyền 1" } },
    update: {},
    create: { type: "PRODUCTION_LINE", name: "Chuyền 1", order: 0 },
  });

  await prisma.issueFailureCategory.upsert({
    where: { id: "fail-may" },
    update: {},
    create: { id: "fail-may", name: "Lỗi máy móc", order: 0 },
  });
  await prisma.issueFailureCategory.upsert({
    where: { id: "fail-nvl" },
    update: {},
    create: { id: "fail-nvl", name: "Lỗi nguyên vật liệu", order: 1 },
  });
  await prisma.issueFailureCategory.upsert({
    where: { id: "fail-thao-tac" },
    update: {},
    create: { id: "fail-thao-tac", name: "Lỗi thao tác", order: 2 },
  });

  await prisma.partCategory.upsert({
    where: { id: "part-vong-bi" },
    update: {},
    create: { id: "part-vong-bi", name: "Vòng bi", order: 0 },
  });
  await prisma.partCategory.upsert({
    where: { id: "part-day-curoa" },
    update: {},
    create: { id: "part-day-curoa", name: "Dây curoa", order: 1 },
  });

  const users: { code: string; name: string; role: string; phone: string; areaId?: string }[] = [
    { code: "ADM001", name: "Quản trị viên", role: "ADMIN", phone: "0900000001" },
    { code: "NV001", name: "Nguyễn Văn Vận Hành", role: "OPERATOR", phone: "0900000002", areaId: areaA.id },
    { code: "QA001", name: "Trần Thị QA", role: "QA", phone: "0900000003", areaId: areaA.id },
    { code: "LL001", name: "Lê Văn Trưởng Line", role: "LINE_LEADER", phone: "0900000004", areaId: areaA.id },
    { code: "CN001", name: "Phạm Văn Công Nghệ", role: "TECHNOLOGY", phone: "0900000005", areaId: areaA.id },
    { code: "TP001", name: "Hoàng Văn Trưởng Phòng", role: "DEPARTMENT_HEAD", phone: "0900000006", areaId: areaA.id },
    { code: "BT001", name: "Đỗ Văn Bảo Trì", role: "MAINTENANCE", phone: "0900000007", areaId: areaA.id },
    { code: "GD001", name: "Vũ Thị Giám Đốc", role: "DIRECTOR", phone: "0900000008" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { employeeCode: u.code },
      update: {},
      create: {
        employeeCode: u.code,
        name: u.name,
        phone: u.phone,
        passwordHash: password,
        role: u.role as never,
        areaId: u.areaId,
      },
    });
  }

  console.log("Seed done.", { areaA: areaA.id, teamA1: teamA1.id, lineA1: lineA1.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
