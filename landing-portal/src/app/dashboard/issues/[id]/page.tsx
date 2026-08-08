import { notFound } from "next/navigation";
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
import { IssueDetailWorkflow } from "@/components/dashboard/issue-detail-workflow";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

async function getIssueDetail(id: string) {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return null;

    const db = drizzle(env.DB);
    const res = await db.select().from(qualityIssues).where(eq(qualityIssues.id, id)).limit(1);
    if (res.length === 0) return null;

    const issueItem = res[0];
    const forms = await db
      .select()
      .from(investigationForms)
      .where(eq(investigationForms.issueId, id))
      .orderBy(desc(investigationForms.submittedAt));

    const taskRes = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.issueId, id)).limit(1);
    const task = taskRes[0] || null;

    const monRes = await db.select().from(monitoringWindows).where(eq(monitoringWindows.issueId, id)).limit(1);
    const monitoring = monRes[0] || null;

    let parsedSizes: string[] = [];
    let parsedImages: string[] = [];
    try {
      parsedSizes = JSON.parse(issueItem.affectedSizes || "[]");
    } catch {
      parsedSizes = [];
    }
    try {
      parsedImages = JSON.parse(issueItem.images || "[]");
    } catch {
      parsedImages = [];
    }

    return {
      ...issueItem,
      affectedSizes: parsedSizes,
      images: parsedImages,
      forms,
      task,
      monitoring,
    };
  } catch {
    return null;
  }
}

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;
  const { id } = await params;
  const issue = await getIssueDetail(id);

  // Fallback demo issue for initial test
  const fallbackIssue = {
    id: id || "iss-demo-01",
    issueCode: "CLSK-20260808-1001",
    poCode: "PO-2026-8809",
    productCode: "SK-GO-WALK-6",
    productName: "Giày Thể Thao Skechers Go Walk Flex",
    affectedSizes: ["US 7", "US 8", "US 9"],
    workshopId: "ws-may-1",
    workshopName: "Xưởng May 1",
    teamName: "Tổ May 1",
    lineName: "Chuyền May 1A",
    areaId: "ws-may-1",
    detectionStage: "Công đoạn Gò mũi / Chuyền may 1A",
    description: "Quai may lệch chỉ 2mm, đường may nhăn quăn, hở keo gót đế dính kém",
    severity: "cao",
    status: "reported",
    reportedByName: "Nguyễn Văn An",
    reportedByMnv: "NV001",
    reportedAt: Math.floor(Date.now() / 1000) - 300,
    form15Deadline: Math.floor(Date.now() / 1000) + 600,
    form15Locked: 0,
    qaSubmitted: 0,
    llSubmitted: 0,
    cnSubmitted: 0,
    images: [],
    forms: [],
    task: null,
    monitoring: null,
    userRole: user?.role || "qa",
  };

  const targetIssue = issue || fallbackIssue;

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />
      <main className="max-w-7xl mx-auto py-6">
        <IssueDetailWorkflow issue={targetIssue as any} />
      </main>
    </div>
  );
}
