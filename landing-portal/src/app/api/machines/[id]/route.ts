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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

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

  if (!statusId) {
    return NextResponse.json({ error: "Vui lòng chọn trạng thái máy" }, { status: 400 });
  }

  const machine = await prisma.machine.update({
    where: { id },
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
      statusId,
      maintenancePeriodId: maintenancePeriodId || null,
    },
    include: machineInclude,
  });

  return NextResponse.json(machine);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  await prisma.machine.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
