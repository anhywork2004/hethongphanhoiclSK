import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";

  const employees = await prisma.user.findMany({
    where: {
      employeeCode: { contains: code },
      role: "MAINTENANCE",
    },
    select: { id: true, employeeCode: true, name: true, phone: true, role: true },
    take: 20,
  });

  return NextResponse.json(employees);
}
