const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export type Role = "OPERATOR" | "MAINTENANCE" | "ADMIN";

export type User = {
  id: string;
  employeeCode: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  area?: { id: string; name: string } | null;
  stats?: { totalRepairs: number; avgRating: number | null; ratedCount: number } | null;
};

export type Machine = {
  id: string;
  code: string;
  serialNumber: string | null;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  area: string | null;
  team: string | null;
  productionLine: string | null;
  model: string | null;
  manufacturer: string | null;
  origin: string | null;
  manufactureYear: number | null;
  yearInUse: number | null;
  specs: string | null;
  status: string;
  maintenancePeriod: string | null;
  incidents?: Incident[];
};

export type FailureCategory = {
  id: string;
  name: string;
  isOther: boolean;
  order: number;
};

export type Incident = {
  id: string;
  machineId: string;
  description: string;
  images: string | null;
  status: "PENDING" | "ACCEPTED" | "DONE";
  reporter: User;
  assignedTo: User | null;
  acceptedAt: string | null;
  completedAt: string | null;
  resendCount: number;
  createdAt: string;
  machine?: Machine;
  category?: FailureCategory | null;
  customCategoryText?: string | null;
};

export type ChatGroup = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  members: { id: string; userId: string; user: User }[];
  messages: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  groupId: string;
  senderId: string | null;
  sender: User | null;
  type: "TEXT" | "INCIDENT_ALERT" | "SYSTEM";
  content: string;
  incidentId: string | null;
  incident?: Incident | null;
  createdAt: string;
};

export type GroupInvitation = {
  id: string;
  groupId: string;
  group: { id: string; name: string };
  invitedUserId: string;
  invitedBy: User;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  respondedAt: string | null;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  createdBy: User;
  createdAt: string;
};

export type MaintenanceLog = {
  id: string;
  incidentId: string;
  machine: Machine;
  technician: User;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  repairDetail: string;
  partsReplaced: string | null;
  proofImages: string | null;
  skillRating: number | null;
  ratingSubmittedAt: string | null;
  createdAt: string;
};

export type RatingRequest = {
  id: string;
  maintenanceLogId: string;
  operatorId: string;
  status: "PENDING" | "SUBMITTED";
  createdAt: string;
  respondedAt: string | null;
  maintenanceLog: MaintenanceLog;
};

export type NotificationItem =
  | { kind: "INVITATION"; id: string; createdAt: string; invitation: GroupInvitation }
  | { kind: "ANNOUNCEMENT"; id: string; createdAt: string; announcement: Announcement }
  | { kind: "RATING_REQUEST"; id: string; createdAt: string; ratingRequest: RatingRequest }
  | { kind: "INCIDENT_ACCEPTED"; id: string; createdAt: string; incident: Incident };

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error || "Đã có lỗi xảy ra", res.status);
  }

  return data as T;
}

export const api = {
  login: (employeeCode: string, password: string) =>
    request<{ token: string; user: User }>("/api/mobile/login", {
      method: "POST",
      body: { employeeCode, password },
    }),

  me: (token: string) => request<User>("/api/mobile/me", { token }),

  updateAvatar: (token: string, avatarUrl: string) =>
    request<User>("/api/mobile/me", { method: "PUT", token, body: { avatarUrl } }),

  changePassword: (token: string, oldPassword: string, newPassword: string) =>
    request<{ ok: true }>("/api/mobile/me/password", {
      method: "POST",
      token,
      body: { oldPassword, newPassword },
    }),

  getMachineByCode: (token: string, code: string) =>
    request<Machine>(`/api/mobile/machines/${encodeURIComponent(code)}`, { token }),

  listIncidents: (token: string) => request<Incident[]>("/api/mobile/incidents", { token }),

  createIncident: (
    token: string,
    payload: {
      machineId: string;
      description: string;
      images?: string[];
      categoryId: string;
      customCategoryText?: string;
    },
  ) => request<Incident>("/api/mobile/incidents", { method: "POST", token, body: payload }),

  listFailureCategories: (token: string) =>
    request<FailureCategory[]>("/api/mobile/failure-categories", { token }),

  acceptIncident: (token: string, incidentId: string) =>
    request<Incident>(`/api/mobile/incidents/${incidentId}/accept`, { method: "POST", token }),

  completeIncident: (
    token: string,
    incidentId: string,
    payload: {
      repairDetail: string;
      partsReplaced?: string;
      proofImages?: string[];
    },
  ) =>
    request<Incident>(`/api/mobile/incidents/${incidentId}/complete`, {
      method: "POST",
      token,
      body: payload,
    }),

  listChatGroups: (token: string) => request<ChatGroup[]>("/api/mobile/chat-groups", { token }),

  createChatGroup: (token: string, name: string) =>
    request<ChatGroup>("/api/mobile/chat-groups", { method: "POST", token, body: { name } }),

  updateChatGroup: (token: string, groupId: string, payload: { name?: string; image?: string }) =>
    request<ChatGroup>(`/api/mobile/chat-groups/${groupId}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  addChatGroupMember: (token: string, groupId: string, employeeCode: string) =>
    request<GroupInvitation>(`/api/mobile/chat-groups/${groupId}/members`, {
      method: "POST",
      token,
      body: { employeeCode },
    }),

  listNotifications: (token: string) =>
    request<NotificationItem[]>("/api/mobile/notifications", { token }),

  getAnnouncement: (token: string, id: string) =>
    request<Announcement>(`/api/mobile/announcements/${id}`, { token }),

  respondToInvitation: (token: string, invitationId: string, action: "accept" | "reject") =>
    request<GroupInvitation>(`/api/mobile/notifications/invitations/${invitationId}/${action}`, {
      method: "POST",
      token,
    }),

  submitRating: (token: string, ratingRequestId: string, skillRating: number) =>
    request<{ ok: true }>(`/api/mobile/notifications/ratings/${ratingRequestId}/submit`, {
      method: "POST",
      token,
      body: { skillRating },
    }),

  listMessages: (token: string, groupId: string, since?: string) =>
    request<ChatMessage[]>(
      `/api/mobile/chat-groups/${groupId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`,
      { token },
    ),

  sendMessage: (token: string, groupId: string, content: string) =>
    request<ChatMessage>(`/api/mobile/chat-groups/${groupId}/messages`, {
      method: "POST",
      token,
      body: { content },
    }),

  searchEmployees: (token: string, code: string) =>
    request<User[]>(`/api/mobile/employees/search?code=${encodeURIComponent(code)}`, { token }),

  uploadImage: (token: string, base64: string, mimeType: string) =>
    request<{ url: string }>("/api/mobile/upload", {
      method: "POST",
      token,
      body: { base64, mimeType },
    }),

  registerPushToken: (token: string, pushToken: string) =>
    request<{ ok: true }>("/api/mobile/push-token", {
      method: "POST",
      token,
      body: { token: pushToken },
    }),
};

export function resolveImageUrl(path: string) {
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export { API_URL, ApiError };
