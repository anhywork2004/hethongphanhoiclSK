import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { userPublicSelect } from "@/lib/selects";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const prisma = await getPrisma();

  const [invitations, announcements, ratingRequests, acceptedIncidents] = await Promise.all([
    prisma.groupInvitation.findMany({
      where: { invitedUserId: payload.userId, status: "PENDING" },
      include: {
        group: true,
        invitedBy: { select: userPublicSelect },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { createdBy: { select: userPublicSelect } },
    }),
    prisma.ratingRequest.findMany({
      where: { operatorId: payload.userId, status: "PENDING" },
      include: {
        maintenanceLog: {
          include: {
            machine: true,
            technician: { select: userPublicSelect },
            incident: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Sự cố do chính người này báo, đã được nhân viên bảo trì nhận việc (hoặc đã xong) —
    // để họ theo dõi "ai đang xử lý, nhận lúc mấy giờ" ngay trong mục Thông báo.
    prisma.incident.findMany({
      where: { reporterId: payload.userId, acceptedAt: { not: null } },
      orderBy: { acceptedAt: "desc" },
      take: 20,
      include: { machine: true, assignedTo: { select: userPublicSelect } },
    }),
  ]);

  const items = [
    ...invitations.map((inv: any) => ({
      kind: "INVITATION" as const,
      id: inv.id,
      createdAt: inv.createdAt,
      invitation: inv,
    })),
    ...announcements.map((ann: any) => ({
      kind: "ANNOUNCEMENT" as const,
      id: ann.id,
      createdAt: ann.createdAt,
      announcement: ann,
    })),
    ...ratingRequests.map((r: any) => ({
      kind: "RATING_REQUEST" as const,
      id: r.id,
      createdAt: r.createdAt,
      ratingRequest: r,
    })),
    ...acceptedIncidents.map((inc: any) => ({
      kind: "INCIDENT_ACCEPTED" as const,
      id: inc.id,
      createdAt: inc.acceptedAt!,
      incident: inc,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(items);
}
