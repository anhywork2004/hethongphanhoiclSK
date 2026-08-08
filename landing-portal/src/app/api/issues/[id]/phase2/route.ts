import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const { phase2Notes, phase2Status } = body; // 'handled' | 'closed'

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (issueRes.length === 0) return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    const issue = issueRes[0];

    const updateData = {
      phase2Status: phase2Status || "handled",
      phase2Notes: phase2Notes || "Ban Giám Đốc đã xem xét và chỉ đạo xử lý.",
      phase2HandledById: user?.id || "usr-director",
      phase2HandledByName: user?.fullName || "Vũ Thị Mai",
      phase2HandledAt: now,
      updatedAt: now,
    };

    await db.update(qualityIssues).set(updateData).where(eq(qualityIssues.id, id)).execute();

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || "usr-director",
      userMnv: user?.mnv || "GD001",
      userName: user?.fullName || "Vũ Thị Mai",
      action: "Ban Giám Đốc xử lý sự cố Phase 2",
      fromStatus: issue.status,
      toStatus: issue.status,
      detailsJson: JSON.stringify(updateData),
      createdAt: now,
    }).execute();

    return NextResponse.json({ success: true, ...updateData });
  } catch (err: any) {
    console.error("[Phase 2 API Error]:", err);
    return NextResponse.json({ error: err.message || "Xử lý Phase 2 thất bại" }, { status: 500 });
  }
}
