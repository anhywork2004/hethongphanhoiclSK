import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { sendPushToUsersByRoleInArea } from "@/lib/push";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

const INVESTIGATION_WINDOW_MS = 15 * 60 * 1000;
const INVESTIGATOR_ROLES = ["QA", "LINE_LEADER", "TECHNOLOGY"];

const issueInclude = {
  reporter: { select: userPublicSelect },
  area: true,
  team: true,
  productionLine: true,
  failureCategory: true,
  submissions: { include: { submitter: { select: userPublicSelect } } },
  task: {
    include: {
      assignee: { select: userPublicSelect },
      assignedBy: { select: userPublicSelect },
    },
  },
} as const;

// Danh sách phiếu liên quan tới người dùng hiện tại — dùng cho "Hoạt động sự cố gần đây" ở Trang
// chủ. Phạm vi mở rộng theo vai trò để nhóm điều tra/xử lý cũng thấy được sự cố cần họ xử lý,
// không chỉ phiếu do chính họ báo cáo:
// - Vận hành: chỉ phiếu do chính mình báo cáo.
// - QA/Trưởng line/Công nghệ/Trưởng phòng ban: phiếu tự báo cáo + mọi phiếu trong khu vực mình.
// - Bảo trì: phiếu tự báo cáo + phiếu đang/đã được giao cho mình.
// - Giám đốc: toàn bộ phiếu (không giới hạn khu vực).
export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const me = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { areaId: true },
  });

  let where: Prisma.QualityIssueWhereInput = { reporterId: payload.userId };
  if (payload.role === "DIRECTOR") {
    where = {};
  } else if (["QA", "LINE_LEADER", "TECHNOLOGY", "DEPARTMENT_HEAD"].includes(payload.role) && me?.areaId) {
    where = { OR: [{ reporterId: payload.userId }, { areaId: me.areaId }] };
  } else if (payload.role === "MAINTENANCE") {
    where = { OR: [{ reporterId: payload.userId }, { task: { assigneeId: payload.userId } }] };
  }

  const issues = await prisma.qualityIssue.findMany({
    where,
    include: issueInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(issues);
}

export async function POST(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const { teamId, productionLineId, failureCategoryId, poCode, description, images } =
    await req.json();

  if (!poCode || !description) {
    return NextResponse.json({ error: "Thiếu mã PO hoặc mô tả" }, { status: 400 });
  }

  // Phiếu luôn thuộc khu vực của chính người báo cáo — mọi nhân viên (trừ Admin) đều gắn với
  // đúng 1 khu vực, dùng để định tuyến thông báo/phân việc cho đúng QA/Trưởng line/Công nghệ/
  // Trưởng phòng ban/Bảo trì cùng khu vực. Không lấy areaId từ client vì mobile không có picker
  // chọn khu vực (chỉ chọn Tổ/Chuyền).
  const reporter = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { areaId: true },
  });

  const issue = await prisma.qualityIssue.create({
    data: {
      reporterId: payload.userId,
      areaId: reporter?.areaId ?? null,
      teamId: teamId || null,
      productionLineId: productionLineId || null,
      failureCategoryId: failureCategoryId || null,
      poCode,
      description,
      images: images ? JSON.stringify(images) : null,
      status: "REPORTED",
      investigationDeadline: new Date(Date.now() + INVESTIGATION_WINDOW_MS),
    },
    include: issueInclude,
  });

  await sendPushToUsersByRoleInArea(
    prisma,
    INVESTIGATOR_ROLES,
    issue.areaId,
    {
      title: `Sự cố mới — PO ${issue.poCode}`,
      body: `${payload.name} báo cáo: ${description}`,
      data: { type: "NEED_INVESTIGATE", issueId: issue.id },
    },
    payload.userId,
  );

  return NextResponse.json(issue, { status: 201 });
}
