import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues, issueImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IssueDetailWorkflow } from "@/components/dashboard/issue-detail-workflow";

async function getIssueDetail(id: string) {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (!d1) return null;

    const db = getDb(d1);
    const res = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
    if (res.length === 0) return null;

    const issueItem = res[0];
    const imgRes = await db.select().from(issueImages).where(eq(issueImages.issueId, id));

    let parsedSizes: string[] = [];
    try {
      parsedSizes = JSON.parse(issueItem.affectedSizes || "[]");
    } catch {
      parsedSizes = [issueItem.affectedSizes];
    }

    let parsedRepairedImgs: string[] = [];
    try {
      parsedRepairedImgs = JSON.parse(issueItem.repairedImages || "[]");
    } catch {
      // empty
    }

    return {
      ...issueItem,
      affectedSizes: parsedSizes,
      initialImages: imgRes.map((img) => img.imageUrl),
      repairedImages: parsedRepairedImgs,
    };
  } catch {
    return null;
  }
}

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await getIssueDetail(id);

  // Demo fallback item if D1 is offline
  const fallbackIssue = {
    id: id || "demo-01",
    issueCode: "CLSK-2026-001",
    productCode: "SK-GO-WALK-6",
    productName: "Giày Thể Thao Skechers Go Walk Flex",
    affectedSizes: ["38", "39", "40"],
    workshopName: "[PX01] Phân xưởng Chặt & Chuẩn bị",
    detectionStage: "Công đoạn Gò mũi / Chuyền may 2",
    description: "Quai may lệch chỉ 2mm, đường may nhăn quăn, hở keo gót đế dính kém",
    severity: "cao",
    status: "cho_xu_ly",
    createdByName: "Nguyễn Văn An",
    createdByMnv: "NV001",
    createdAt: new Date().toLocaleString("vi-VN"),
    initialDefectQty: 35,
    repairedDefectQty: 0,
  };

  const targetIssue = issue || fallbackIssue;

  if (!targetIssue) {
    notFound();
  }

  return (
    <div className="py-4">
      <IssueDetailWorkflow issue={targetIssue} />
    </div>
  );
}
