import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { sendPushToUsersByRoleInArea } from "@/lib/push";
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

// Danh sách phiếu liên quan tới người dùng hiện tại — dùng cho "Hoạt động sự cố gần đây" +
// "Lịch sử báo lỗi của bạn" ở Trang chủ (chính là các phiếu do họ báo cáo).
export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const issues = await prisma.qualityIssue.findMany({
    where: { reporterId: payload.userId },
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
