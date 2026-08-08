import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import {
  qualityIssues,
  investigationForms,
  auditLogs,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyInvestigationProgress } from "@/lib/notifications";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ forms: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(investigationForms).where(eq(investigationForms.issueId, id));

    return NextResponse.json({ success: true, forms: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const {
      poCode,
      images,
      whysDialog,
      man,
      machine,
      material,
      method,
      measurement,
      environment,
      rootCauseCategory,
      rootCauseConclusion,
      userRoleOverride,
    } = body;

    if (!rootCauseConclusion || !rootCauseConclusion.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập kết luận nguyên nhân gốc rễ sau khi phân tích 5 Whys" },
        { status: 400 }
      );
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const issueRes = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (issueRes.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    }

    const issue = issueRes[0];

    // Check 15-minute deadline & lock status
    if (issue.form15Locked === 1) {
      return NextResponse.json(
        { error: "Phiếu đã bị khoá do quá hạn 15 phút điều tra. Vui lòng liên hệ Trưởng phòng ban." },
        { status: 403 }
      );
    }

    // Determine submitter role (from session or override)
    let submitterRole = user?.role || userRoleOverride || "qa";
    if (!["qa", "line_leader", "technology"].includes(submitterRole)) {
      submitterRole = userRoleOverride || "qa";
    }

    // Check if user has already submitted a form for this issue
    const existingForm = await db
      .select()
      .from(investigationForms)
      .where(and(eq(investigationForms.issueId, id), eq(investigationForms.userRole, submitterRole)))
      .limit(1);

    const formId = existingForm[0]?.id || `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const formData = {
      id: formId,
      issueId: id,
      userId: user?.id || `usr-${submitterRole}`,
      userName: user?.fullName || (submitterRole === "qa" ? "Lê Thị Cúc" : submitterRole === "line_leader" ? "Trần Văn Bình" : "Phạm Văn Dũng"),
      userMnv: user?.mnv || (submitterRole === "qa" ? "QA001" : submitterRole === "line_leader" ? "TL001" : "CN001"),
      userRole: submitterRole,
      poCode: poCode || issue.poCode,
      images: JSON.stringify(Array.isArray(images) ? images : []),
      whysDialogJson: JSON.stringify(Array.isArray(whysDialog) ? whysDialog : []),
      man: man || null,
      machine: machine || null,
      material: material || null,
      method: method || null,
      measurement: measurement || null,
      environment: environment || null,
      rootCauseCategory: rootCauseCategory || "Machine",
      rootCauseConclusion: rootCauseConclusion.trim(),
      submittedAt: now,
    };

    if (existingForm.length > 0) {
      await db.update(investigationForms).set(formData).where(eq(investigationForms.id, formId)).execute();
    } else {
      await db.insert(investigationForms).values(formData).execute();
    }

    // Update submission flags on issue
    const updatePayload: Partial<typeof qualityIssues.$inferInsert> = {
      updatedAt: now,
    };

    if (submitterRole === "qa") updatePayload.qaSubmitted = 1;
    if (submitterRole === "line_leader") updatePayload.llSubmitted = 1;
    if (submitterRole === "technology") updatePayload.cnSubmitted = 1;

    // Check if we have all 3 forms
    const currentForms = await db.select().from(investigationForms).where(eq(investigationForms.issueId, id));
    const distinctRoles = new Set(currentForms.map((f) => f.userRole));
    distinctRoles.add(submitterRole);

    const isAll3Ready = distinctRoles.size >= 3;
    if (isAll3Ready && issue.status === "reported") {
      updatePayload.status = "investigating";
    }

    await db.update(qualityIssues).set(updatePayload).where(eq(qualityIssues.id, id)).execute();

    // Log Audit Trail
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: id,
      userId: user?.id || `usr-${submitterRole}`,
      userMnv: user?.mnv || submitterRole.toUpperCase(),
      userName: user?.fullName || "Người điều tra",
      action: `Nộp form 5M+1E (${submitterRole.toUpperCase()})`,
      fromStatus: issue.status,
      toStatus: updatePayload.status || issue.status,
      detailsJson: JSON.stringify({
        rootCauseCategory: formData.rootCauseCategory,
        rootCauseConclusion: formData.rootCauseConclusion,
        isAll3Ready,
      }),
      createdAt: now,
    }).execute();

    // Notify LL when all 3 forms are submitted
    if (isAll3Ready) {
      notifyInvestigationProgress(
        { id: issue.id, issueCode: issue.issueCode, areaId: issue.areaId },
        true,
        false
      ).catch((err) => console.error("[Notify 3 of 3 Error]:", err));
    }

    return NextResponse.json({
      success: true,
      form: formData,
      isAll3Ready,
      totalSubmitted: distinctRoles.size,
    });
  } catch (err: any) {
    console.error("[Form15 POST Error]:", err);
    return NextResponse.json({ error: err.message || "Nộp form 5M+1E thất bại" }, { status: 500 });
  }
}
