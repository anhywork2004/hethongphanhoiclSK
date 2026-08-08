import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

const machineInclude = {
  area: true,
  team: true,
  productionLine: true,
  status: true,
  maintenancePeriod: true,
  machineType: true,
} as const;

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const machines = await prisma.machine.findMany({
    orderBy: { createdAt: "desc" },
    include: machineInclude,
  });
  return NextResponse.json(machines);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();

  const body = await req.json();
  const {
    code,
    serialNumber,
    name,
    location,
    latitude,
    longitude,
    areaId,
    teamId,
    productionLineId,
    machineTypeId,
    model,
    manufacturer,
    origin,
    manufactureYear,
    yearInUse,
    specs,
    statusId,
    maintenancePeriodId,
  } = body;

  if (!code || !name || !location) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const existing = await prisma.machine.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Mã tài sản đã tồn tại" }, { status: 409 });
  }

  let resolvedStatusId = statusId || null;
  if (!resolvedStatusId) {
    const defaultActive = await prisma.category.findFirst({
      where: { type: "MACHINE_STATUS", statusKind: "ACTIVE" },
    });
    resolvedStatusId = defaultActive?.id;
  }
  if (!resolvedStatusId) {
    return NextResponse.json(
      { error: "Chưa có danh mục Trạng thái máy — vui lòng tạo trong Danh mục trước" },
      { status: 400 },
    );
  }

  const machine = await prisma.machine.create({
    data: {
      code,
      serialNumber: serialNumber || null,
      name,
      location,
      latitude: latitude != null && latitude !== "" ? Number(latitude) : null,
      longitude: longitude != null && longitude !== "" ? Number(longitude) : null,
      areaId: areaId || null,
      teamId: teamId || null,
      productionLineId: productionLineId || null,
      machineTypeId: machineTypeId || null,
      model: model || null,
      manufacturer: manufacturer || null,
      origin: origin || null,
      manufactureYear: manufactureYear ? Number(manufactureYear) : null,
      yearInUse: yearInUse ? Number(yearInUse) : null,
      specs,
      statusId: resolvedStatusId,
      maintenancePeriodId: maintenancePeriodId || null,
    },
    include: machineInclude,
  });

  return NextResponse.json(machine, { status: 201 });
}
