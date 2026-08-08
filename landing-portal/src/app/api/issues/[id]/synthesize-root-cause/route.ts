import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyRootCauseOrPhase2 } from "@/lib/notifications";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { action, rootCauseSummary, proposedSolution, notes } = body;

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const found = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (found.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });

    const issue = found[0];

    // Branch 1: Cannot resolve -> Escalate directly to Phase 2 for Directors (GĐ/TGĐ)
    if (action === "phase2") {
      const updateData = {
        status: "phase2" as const,
        phase2Status: "pending",
        phase2Notes: notes || "Line Leader xác định sự cố vượt thẩm quyền / không thể xử lý tại chuyền.",
        updatedAt: now,
      };

      await db.update(qualityIssues).set(updateData).where(eq(qualityIssues.id, id)).execute();

      await db.insert(auditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        issueId: id,
        userId: user?.id || "usr-lineleader",
        userMnv: user?.mnv || "TL001",
        userName: user?.fullName || "Trần Văn Bình",
        action: "Chuyển sang Phase 2 (Ban Giám Đốc)",
        fromStatus: issue.status,
        toStatus: "phase2",
        detailsJson: JSON.stringify({ notes: updateData.phase2Notes }),
        createdAt: now,
      }).execute();

      notifyRootCauseOrPhase2({
        id: issue.id,
        issueCode: issue.issueCode,
        isPhase2: true,
        areaId: issue.areaId,
      }).catch((err) => console.error("[Phase 2 Notification Error]:", err));

      return NextResponse.json({ success: true, status: "phase2" });
    }

    // Branch 2: LL confirms root cause & proposed solution -> Ready for TP job assignment
    if (!rootCauseSummary || !rootCauseSummary.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập Nguyên nhân gốc rễ chính thức sau khi tổng hợp" },
        { status: 400 }
      );
    }

    const updateData = {
      status: "root_cause_found" as const,
      rootCauseSummary: rootCauseSummary.trim(),
      proposedSolution: proposedSolution ? proposedSolution.trim() : null,
      rootCauseDecidedById: user?.id || "usr-lineleader",
      rootCauseDecidedByName: user?.fullName || "Trần Văn Bình",
      rootCauseDecidedAt: now,
      updatedAt: now,
    };

    await db.update(qualityIssues).set(updateData).where(eq(qualityIssues.id, id)).execute();

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || "usr-lineleader",
      userMnv: user?.mnv || "TL001",
      userName: user?.fullName || "Trần Văn Bình",
      action: "Chốt nguyên nhân & đề xuất giải pháp (Bước 3)",
      fromStatus: issue.status,
      toStatus: "root_cause_found",
      detailsJson: JSON.stringify({
        rootCauseSummary: updateData.rootCauseSummary,
        proposedSolution: updateData.proposedSolution,
      }),
      createdAt: now,
    }).execute();

    notifyRootCauseOrPhase2({
      id: issue.id,
      issueCode: issue.issueCode,
      rootCauseSummary: updateData.rootCauseSummary,
      proposedSolution: updateData.proposedSolution,
      isPhase2: false,
      areaId: issue.areaId,
    }).catch((err) => console.error("[Notify Step 3 Error]:", err));

    return NextResponse.json({ success: true, status: "root_cause_found" });
  } catch (err: any) {
    console.error("[Synthesize API Error]:", err);
    return NextResponse.json({ error: err.message || "Lỗi tổng hợp nguyên nhân" }, { status: 500 });
  }
}
