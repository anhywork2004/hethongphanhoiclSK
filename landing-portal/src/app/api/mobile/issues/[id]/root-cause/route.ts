import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { sendPushToUsersByRoleInArea } from "@/lib/push";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  if ((payload.role as string) !== "LINE_LEADER") {
    return NextResponse.json({ error: "Chỉ Trưởng line mới được chốt nguyên nhân gốc" }, { status: 403 });
  }

  const issue = await prisma.qualityIssue.findUnique({ where: { id } });
  if (!issue) return NextResponse.json({ error: "Không tìm thấy sự cố" }, { status: 404 });
  if (issue.status !== "INVESTIGATING") {
    return NextResponse.json({ error: "Sự cố này chưa sẵn sàng để chốt nguyên nhân" }, { status: 409 });
  }

  const { rootCause, solution } = await req.json();
  if (!rootCause) {
    return NextResponse.json({ error: "Vui lòng nhập nguyên nhân gốc" }, { status: 400 });
  }

  const updated = await prisma.qualityIssue.update({
    where: { id },
    data: {
      rootCause,
      solution: solution || null,
      rootCauseDecidedById: payload.userId,
      rootCauseDecidedAt: new Date(),
      status: "ROOT_CAUSE_FOUND",
    },
  });

  await sendPushToUsersByRoleInArea(prisma, ["DEPARTMENT_HEAD"], issue.areaId, {
    title: `Đã có nguyên nhân gốc — PO ${issue.poCode}`,
    body: rootCause,
    data: { type: "NEED_ASSIGN", issueId: id },
  });

  return NextResponse.json(updated);
}
