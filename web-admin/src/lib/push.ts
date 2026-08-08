import { getPrisma } from "@/lib/prisma";

type Prisma = Awaited<ReturnType<typeof getPrisma>>;

type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_PUSH_CHUNK_SIZE = 100;

async function sendExpoPushMessages(messages: PushMessage[]) {
  for (let i = 0; i < messages.length; i += EXPO_PUSH_CHUNK_SIZE) {
    const chunk = messages.slice(i, i + EXPO_PUSH_CHUNK_SIZE);
    try {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
    } catch {
      // Gửi push là best-effort — không để lỗi mạng tới Expo làm hỏng luồng nghiệp vụ chính.
    }
  }
}

export async function sendPushToUsers(
  prisma: Prisma,
  userIds: string[],
  notification: { title: string; body: string; data?: Record<string, unknown> },
  excludeUserId?: string,
) {
  const targetIds = userIds.filter((id) => id !== excludeUserId);
  if (targetIds.length === 0) return;

  const users = await prisma.user.findMany({
    where: { id: { in: targetIds }, pushToken: { not: null } },
    select: { pushToken: true },
  });

  const messages = users
    .map((u: { pushToken: string | null }) => u.pushToken)
    .filter((token: string | null): token is string => !!token)
    .map((token: string) => ({
      to: token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: "default" as const,
    }));

  if (messages.length === 0) return;
  await sendExpoPushMessages(messages);
}

export async function sendPushToGroupMembers(
  prisma: Prisma,
  groupId: string,
  notification: { title: string; body: string; data?: Record<string, unknown> },
  excludeUserId?: string,
) {
  const members = await prisma.chatGroupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  await sendPushToUsers(
    prisma,
    members.map((m: { userId: string }) => m.userId),
    notification,
    excludeUserId,
  );
}

export async function sendPushToUsersByRoleInArea(
  prisma: any,
  role: any,
  areaId: any,
  notification: { title: string; body: string; data?: Record<string, unknown> },
  excludeUserId?: string
) {
  // Mock fallback for legacy push notifications
  return;
}

