import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import {
  qualityIssues,
  investigationForms,
  maintenanceTasks,
  monitoringWindows,
  auditLogs,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ error: "D1 Database unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const found = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);

    if (found.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy phiếu sự cố" }, { status: 404 });
    }

    const issue = found[0];

    // 1. Fetch all 3 investigation forms (QA, LL, CN)
    const forms = await db
      .select()
      .from(investigationForms)
      .where(eq(investigationForms.issueId, id))
      .orderBy(desc(investigationForms.submittedAt));

    // 2. Fetch maintenance task (if any)
    const taskRes = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.issueId, id)).limit(1);
    const task = taskRes[0] || null;

    // 3. Fetch monitoring window (if any)
    const monRes = await db.select().from(monitoringWindows).where(eq(monitoringWindows.issueId, id)).limit(1);
    const monitoring = monRes[0] || null;

    // 4. Fetch audit logs
    const audits = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.issueId, id))
      .orderBy(desc(auditLogs.createdAt));

    let parsedSizes: string[] = [];
    let parsedImages: any[] = [];
    try {
      parsedSizes = JSON.parse(issue.affectedSizes || "[]");
    } catch {
      parsedSizes = [];
    }
    try {
      parsedImages = JSON.parse(issue.images || "[]");
    } catch {
      parsedImages = [];
    }

    const formattedForms = forms.map((f) => {
      let fImages = [];
      let fDialog = [];
      try {
        fImages = JSON.parse(f.images || "[]");
      } catch {
        fImages = [];
      }
      try {
        fDialog = JSON.parse(f.whysDialogJson || "[]");
      } catch {
        fDialog = [];
      }
      return {
        ...f,
        images: fImages,
        whysDialog: fDialog,
      };
    });

    let formattedTask = null;
    if (task) {
      let parts = [];
      let imgB = [];
      let imgA = [];
      try {
        parts = JSON.parse(task.partsUsedJson || "[]");
      } catch {
        parts = [];
      }
      try {
        imgB = JSON.parse(task.imagesBeforeJson || "[]");
      } catch {
        imgB = [];
      }
      try {
        imgA = JSON.parse(task.imagesAfterJson || "[]");
      } catch {
        imgA = [];
      }
      formattedTask = {
        ...task,
        partsUsed: parts,
        imagesBefore: imgB,
        imagesAfter: imgA,
      };
    }

    return NextResponse.json({
      success: true,
      issue: {
        ...issue,
        affectedSizes: parsedSizes,
        images: parsedImages,
        forms: formattedForms,
        task: formattedTask,
        monitoring,
        auditLogs: audits,
      },
    });
  } catch (err: any) {
    console.error("[Issue Detail API Error]:", err);
    return NextResponse.json({ error: err.message || "Lỗi tải chi tiết phiếu" }, { status: 500 });
  }
}
