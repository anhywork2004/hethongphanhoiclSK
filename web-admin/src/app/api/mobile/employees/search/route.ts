import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

// Dùng để Trưởng phòng ban tìm nhân viên Bảo trì CÙNG khu vực khi giao việc — luôn lọc theo
// areaId của người gọi, không cho tìm/gán người ở khu vực khác.
export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const me = await prisma.user.findUnique({ where: { id: payload.userId }, select: { areaId: true } });

  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";

  const employees = await prisma.user.findMany({
    where: {
      employeeCode: { contains: code },
      role: "MAINTENANCE",
      areaId: me?.areaId ?? undefined,
    },
    select: { id: true, employeeCode: true, name: true, phone: true, role: true },
    take: 20,
  });

  return NextResponse.json(employees);
}
