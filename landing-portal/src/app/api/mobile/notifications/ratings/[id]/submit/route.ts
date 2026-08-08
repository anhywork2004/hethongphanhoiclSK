import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const { skillRating } = await req.json();
  if (!skillRating || skillRating < 1 || skillRating > 5) {
    return NextResponse.json({ error: "Đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
  }

  const ratingRequest = await prisma.ratingRequest.findUnique({ where: { id } });
  if (!ratingRequest) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu đánh giá" }, { status: 404 });
  }
  if (ratingRequest.operatorId !== payload.userId) {
    return NextResponse.json({ error: "Yêu cầu này không dành cho bạn" }, { status: 403 });
  }
  if (ratingRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Yêu cầu đã được xử lý" }, { status: 409 });
  }

  const respondedAt = new Date();
  await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id: ratingRequest.maintenanceLogId },
      data: { skillRating: Number(skillRating), ratingSubmittedAt: respondedAt },
    }),
    prisma.ratingRequest.update({
      where: { id },
      data: { status: "SUBMITTED", respondedAt },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
