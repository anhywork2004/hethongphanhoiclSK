import { PrismaClient } from "@/generated/prisma-workerd/client";
import type { PrismaClient as SharedPrismaClient } from "@/generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";
import { sendPushToUsers, sendPushToUsersByRoleInArea } from "@/lib/push";

// push.ts được viết chung cho cả 2 client Prisma sinh ra từ cùng 1 schema (nodejs cho local
// dev, workerd cho Cloudflare) — 2 client này giống nhau về mặt runtime nhưng TypeScript coi
// là 2 kiểu riêng biệt, nên phải ép kiểu tường minh ở đây.
function asSharedPrisma(prisma: PrismaClient): SharedPrismaClient {
  return prisma as unknown as SharedPrismaClient;
}

const VERIFY_MIN_MS = 3 * 60 * 60 * 1000; // 3 giờ — sớm nhất Trưởng line được xác nhận
const VERIFY_PING_INTERVAL_MS = 20 * 60 * 1000; // 20 phút — nhắc lại trong cửa sổ 3-48h

// Chạy định kỳ (Cron Trigger) — không đi qua Next.js request pipeline nên tự tạo Prisma
// riêng từ D1 binding (env.DB được Workers runtime truyền thẳng vào scheduled handler).
export async function runQualityIssueReminderSweep(env: { DB?: D1Database }) {
  if (!env.DB) return;
  const prisma = new PrismaClient({ adapter: new PrismaD1(env.DB) });
  const now = Date.now();

  try {
    await lockExpiredInvestigations(prisma, now);
    await pingUnconfirmedVerifications(prisma, now);
    await autoConfirmExpiredVerifications(prisma, now);
  } finally {
    await prisma.$disconnect();
  }
}

// Hết 15 phút mà vẫn thiếu bản 5M+1E (chưa đủ 3/3) → khoá nộp, báo Trưởng phòng ban khu vực đó.
// Phiếu vẫn tiếp tục với các bản đã có (không chặn Trưởng line chốt nguyên nhân sau đó).
async function lockExpiredInvestigations(prisma: PrismaClient, now: number) {
  const candidates = await prisma.qualityIssue.findMany({
    where: {
      status: { in: ["REPORTED", "INVESTIGATING"] },
      investigationLocked: false,
      investigationDeadline: { not: null, lt: new Date(now) },
    },
    include: { _count: { select: { submissions: true } } },
  });

  for (const issue of candidates) {
    if (issue._count.submissions >= 3) continue; // đã đủ 3/3 trước khi cron chạy, không cần khoá

    await prisma.qualityIssue.update({
      where: { id: issue.id },
      data: { investigationLocked: true },
    });

    await sendPushToUsersByRoleInArea(asSharedPrisma(prisma), ["DEPARTMENT_HEAD"], issue.areaId, {
      title: "Quá hạn điều tra 5M+1E",
      body: `Phiếu sự cố (PO ${issue.poCode}) đã hết 15 phút nhưng chưa đủ 3 bản 5M+1E (${issue._count.submissions}/3).`,
      data: { type: "INVESTIGATION_LOCKED", issueId: issue.id },
    });
  }
}

// Trong cửa sổ 3h-48h sau khi bảo trì hoàn thành, nhắc Trưởng line xác nhận mỗi 20 phút.
async function pingUnconfirmedVerifications(prisma: PrismaClient, now: number) {
  const candidates = await prisma.maintenanceTask.findMany({
    where: { status: "DONE", verifiedStatus: "PENDING" },
    include: { issue: true },
  });

  for (const task of candidates) {
    if (!task.completedAt || !task.verifyDeadline) continue;
    const completedAtMs = task.completedAt.getTime();
    const verifyDeadlineMs = task.verifyDeadline.getTime();
    if (now < completedAtMs + VERIFY_MIN_MS) continue; // chưa tới 3h
    if (now > verifyDeadlineMs) continue; // đã quá 48h, xử lý ở autoConfirm

    const lastPingAt = (task.lastVerifyPingAt ?? task.completedAt).getTime();
    if (now - lastPingAt < VERIFY_PING_INTERVAL_MS) continue;

    await sendPushToUsersByRoleInArea(asSharedPrisma(prisma), ["LINE_LEADER"], task.issue.areaId, {
      title: "Cần xác nhận hoàn thành",
      body: `Việc sửa chữa cho phiếu PO ${task.issue.poCode} đã xong — vào xác nhận Đã/Chưa hoàn thành.`,
      data: { type: "VERIFY_PING", issueId: task.issueId, taskId: task.id },
    });

    await prisma.maintenanceTask.update({
      where: { id: task.id },
      data: { lastVerifyPingAt: new Date(now) },
    });
  }
}

// Quá 48h không ai xác nhận → tự động coi là Đã hoàn thành.
async function autoConfirmExpiredVerifications(prisma: PrismaClient, now: number) {
  const candidates = await prisma.maintenanceTask.findMany({
    where: {
      status: "DONE",
      verifiedStatus: "PENDING",
      verifyDeadline: { not: null, lt: new Date(now) },
    },
    include: { issue: true },
  });

  for (const task of candidates) {
    await prisma.$transaction([
      prisma.maintenanceTask.update({
        where: { id: task.id },
        data: { verifiedStatus: "CONFIRMED_DONE", verifiedAt: new Date(now) },
      }),
      prisma.qualityIssue.update({
        where: { id: task.issueId },
        data: { status: "DONE" },
      }),
    ]);

    await sendPushToUsers(asSharedPrisma(prisma), [task.issue.reporterId, task.assigneeId], {
      title: "Đã tự động xác nhận hoàn thành",
      body: `Phiếu PO ${task.issue.poCode} đã tự động chuyển Hoàn thành sau 48h không có phản hồi.`,
      data: { type: "AUTO_CONFIRMED", issueId: task.issueId, taskId: task.id },
    });
  }
}
