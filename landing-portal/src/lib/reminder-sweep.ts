import { PrismaClient } from "@/generated/prisma-workerd/client";
import type { PrismaClient as SharedPrismaClient } from "@/generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";
import { getOrCreateAreaMaintenanceGroup } from "@/lib/area-chat-group";
import { sendPushToGroupMembers, sendPushToUsers } from "@/lib/push";

// area-chat-group.ts / push.ts được viết chung cho cả 2 client Prisma sinh ra từ cùng 1
// schema (nodejs cho local dev, workerd cho Cloudflare) — 2 client này giống nhau về mặt
// runtime nhưng TypeScript coi là 2 kiểu riêng biệt, nên phải ép kiểu tường minh ở đây.
function asSharedPrisma(prisma: PrismaClient): SharedPrismaClient {
  return prisma as unknown as SharedPrismaClient;
}

const RESEND_INTERVAL_MS = 10 * 60 * 1000; // 10 phút — chưa ai nhận việc thì gửi lại cảnh báo
const COMPLETION_PING_INTERVAL_MS = 20 * 60 * 1000; // 20 phút — đã nhận việc nhưng chưa xác nhận xong

// Chạy định kỳ (Cron Trigger) — không đi qua Next.js request pipeline nên tự tạo Prisma
// riêng từ D1 binding (env.DB được Workers runtime truyền thẳng vào scheduled handler).
export async function runIncidentReminderSweep(env: { DB?: D1Database }) {
  if (!env.DB) return;
  const prisma = new PrismaClient({ adapter: new PrismaD1(env.DB) });
  const now = Date.now();

  try {
    await resendUnacceptedAlerts(prisma, now);
    await pingUnconfirmedCompletions(prisma, now);
  } finally {
    await prisma.$disconnect();
  }
}

async function resendUnacceptedAlerts(prisma: PrismaClient, now: number) {
  const candidates = await prisma.incident.findMany({
    where: { status: "PENDING" },
    include: { machine: true },
  });

  for (const incident of candidates) {
    const lastSentAt = (incident.lastResendAt ?? incident.createdAt).getTime();
    if (now - lastSentAt < RESEND_INTERVAL_MS) continue;

    const nextResendCount = incident.resendCount + 1;
    const group = await getOrCreateAreaMaintenanceGroup(asSharedPrisma(prisma), incident.machine.areaId);

    await prisma.chatMessage.create({
      data: {
        groupId: group.id,
        senderId: incident.reporterId,
        type: "INCIDENT_ALERT",
        incidentId: incident.id,
        content: `[Gửi lại lần ${nextResendCount}] Máy ${incident.machine.name} (${incident.machine.code}) vẫn chưa có ai nhận việc: ${incident.description}`,
      },
    });

    await sendPushToGroupMembers(asSharedPrisma(prisma), group.id, {
      title: `Nhắc lại: ${incident.machine.name} (${incident.machine.code})`,
      body: `Sự cố vẫn chưa được nhận (đã gửi lại ${nextResendCount} lần)`,
      data: { type: "INCIDENT_ALERT", incidentId: incident.id, groupId: group.id },
    });

    await prisma.incident.update({
      where: { id: incident.id },
      data: { resendCount: nextResendCount, lastResendAt: new Date(now) },
    });
  }
}

async function pingUnconfirmedCompletions(prisma: PrismaClient, now: number) {
  const candidates = await prisma.incident.findMany({
    where: { status: "ACCEPTED", assignedToId: { not: null } },
    include: { machine: true },
  });

  for (const incident of candidates) {
    const lastPingAt = (incident.lastCompletionPingAt ?? incident.acceptedAt ?? incident.createdAt).getTime();
    if (now - lastPingAt < COMPLETION_PING_INTERVAL_MS) continue;
    if (!incident.assignedToId) continue;

    await sendPushToUsers(asSharedPrisma(prisma), [incident.assignedToId], {
      title: `Việc đã xong chưa? ${incident.machine.name} (${incident.machine.code})`,
      body: "Nhớ bấm Hoàn thành công việc trong app nếu bạn đã sửa xong nhé.",
      data: { type: "COMPLETION_PING", incidentId: incident.id },
    });

    await prisma.incident.update({
      where: { id: incident.id },
      data: { lastCompletionPingAt: new Date(now) },
    });
  }
}
