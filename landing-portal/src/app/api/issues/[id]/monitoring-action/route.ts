import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, monitoringWindows, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyFinalCloseOrReinvestigate } from "@/lib/notifications";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { action, note, bypassTimeCheck } = body; // 'close' | 'reinvestigate'

    if (!action || !["close", "reinvestigate"].includes(action)) {
      return NextResponse.json({ error: "Hành động không hợp lệ ('close' hoặc 'reinvestigate')" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (issueRes.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    const issue = issueRes[0];

    const monRes = await db.select().from(monitoringWindows).where(eq(monitoringWindows.issueId, id)).limit(1);
    if (monRes.length === 0) {
      return NextResponse.json({ error: "Phiếu chưa bước vào giai đoạn theo dõi 3h-48h" }, { status: 400 });
    }
    const mon = monRes[0];

    // Check if within 3h - 48h window unless bypassTimeCheck is requested for QA/admin test
    const isWithinWindow = now >= mon.minDeadline && now <= mon.maxDeadline;
    if (!isWithinWindow && !bypassTimeCheck && user?.role !== "admin") {
      if (now < mon.minDeadline) {
        const minutesLeft = Math.ceil((mon.minDeadline - now) / 60);
        return NextResponse.json(
          {
            error: `Chưa đủ thời gian theo dõi tối thiểu 3 giờ! Còn ${minutesLeft} phút nữa mới có thể thao tác.`,
          },
          { status: 400 }
        );
      }
    }

    if (action === "close") {
      // Đóng vấn đề -> Hoàn thành -> Báo Ban Giám Đốc
      await db
        .update(monitoringWindows)
        .set({
          status: "closed_done",
          closedById: user?.id || "usr-lineleader",
          closedByName: user?.fullName || "Trần Văn Bình",
          closedAt: now,
        })
        .where(eq(monitoringWindows.issueId, id))
        .execute();

      await db
        .update(qualityIssues)
        .set({ status: "completed", updatedAt: now })
        .where(eq(qualityIssues.id, id))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        userId: user?.id || "usr-lineleader",
        userMnv: user?.mnv || "TL001",
        userName: user?.fullName || "Trần Văn Bình",
        action: "Line Leader đóng hoàn tất vấn đề sau thời gian theo dõi (Bước 7b)",
        fromStatus: issue.status,
        toStatus: "completed",
        detailsJson: JSON.stringify({ note }),
        createdAt: now,
      }).execute();

      notifyFinalCloseOrReinvestigate({
        id: issue.id,
        issueCode: issue.issueCode,
        isClosedDone: true,
        isReinvestigate: false,
        areaId: issue.areaId,
      }).catch((err) => console.error("[Notify Close Error]:", err));

      return NextResponse.json({ success: true, status: "completed" });
    }

    if (action === "reinvestigate") {
      // Sự cố tái diễn -> Quay lại Bước 2 Điều tra 5M+1E, mở lại form cho QA/LL/CN
      await db
        .update(monitoringWindows)
        .set({
          status: "reinvestigate_requested",
          reinvestigateReason: note || "Sự cố có dấu hiệu tái diễn trong ca chạy thử",
        })
        .where(eq(monitoringWindows.issueId, id))
        .execute();

      await db
        .update(qualityIssues)
        .set({
          status: "investigating",
          form15Locked: 0, // unlock forms
          updatedAt: now,
        })
        .where(eq(qualityIssues.id, id))
        .execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        userId: user?.id || "usr-lineleader",
        userMnv: user?.mnv || "TL001",
        userName: user?.fullName || "Trần Văn Bình",
        action: "Yêu cầu kiểm tra lại / Sự cố tái diễn (Bước 7b -> Bước 2)",
        fromStatus: issue.status,
        toStatus: "investigating",
        detailsJson: JSON.stringify({ reason: note }),
        createdAt: now,
      }).execute();

      notifyFinalCloseOrReinvestigate({
        id: issue.id,
        issueCode: issue.issueCode,
        isClosedDone: false,
        isReinvestigate: true,
        areaId: issue.areaId,
      }).catch((err) => console.error("[Notify Reinvestigate Error]:", err));

      return NextResponse.json({ success: true, status: "investigating" });
    }

    return NextResponse.json({ error: "Thao tác không xác định" }, { status: 400 });
  } catch (err: any) {
    console.error("[Monitoring Action API Error]:", err);
    return NextResponse.json({ error: err.message || "Thao tác theo dõi thất bại" }, { status: 500 });
  }
}
