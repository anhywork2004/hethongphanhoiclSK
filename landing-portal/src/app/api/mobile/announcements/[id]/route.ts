import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { createdBy: { select: userPublicSelect } },
  });

  if (!announcement) {
    return NextResponse.json({ error: "Không tìm thấy thông báo" }, { status: 404 });
  }

  return NextResponse.json(announcement);
}
