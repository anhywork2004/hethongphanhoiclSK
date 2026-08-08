import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { code } = await params;

  const machine = await prisma.machine.findUnique({
    where: { code: decodeURIComponent(code) },
    include: {
      status: true,
      area: true,
      team: true,
      productionLine: true,
      maintenancePeriod: true,
      incidents: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          reporter: { select: userPublicSelect },
          assignedTo: { select: userPublicSelect },
          category: true,
        },
      },
    },
  });

  if (!machine) {
    return NextResponse.json({ error: "Không tìm thấy máy với mã này" }, { status: 404 });
  }

  // Mobile app chỉ cần tên danh mục để hiển thị, không cần biết chi tiết danh mục.
  return NextResponse.json({
    ...machine,
    status: machine.status.name,
    area: machine.area?.name ?? null,
    team: machine.team?.name ?? null,
    productionLine: machine.productionLine?.name ?? null,
    maintenancePeriod: machine.maintenancePeriod?.name ?? null,
  });
}
