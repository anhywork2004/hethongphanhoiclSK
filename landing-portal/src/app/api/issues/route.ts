import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, auditLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { notifyNewIssueReported } from "@/lib/notifications";
import { desc, eq, and, or, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const areaIdParam = searchParams.get("areaId");
    const factoryIdParam = searchParams.get("factoryId");
    const searchQ = searchParams.get("q");

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ issues: [] });
    }

    const db = drizzle(env.DB);
    const conditions = [];

    if (statusParam && statusParam !== "all") {
      conditions.push(eq(qualityIssues.status, statusParam as any));
    }
    if (areaIdParam && areaIdParam !== "all") {
      conditions.push(
        or(
          eq(qualityIssues.areaId, areaIdParam),
          eq(qualityIssues.workshopId, areaIdParam)
        )
      );
    }
    if (factoryIdParam && factoryIdParam !== "all") {
      conditions.push(eq(qualityIssues.factoryId, factoryIdParam));
    }
    if (searchQ && searchQ.trim()) {
      const qLower = `%${searchQ.trim().toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${qualityIssues.issueCode}) LIKE ${qLower}`,
          sql`LOWER(${qualityIssues.poCode}) LIKE ${qLower}`,
          sql`LOWER(${qualityIssues.productName}) LIKE ${qLower}`,
          sql`LOWER(${qualityIssues.description}) LIKE ${qLower}`
        )
      );
    }

    let query = db.select().from(qualityIssues);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(qualityIssues.createdAt)).limit(100);

    const formatted = rows.map((r) => {
      let parsedSizes: string[] = [];
      let parsedImages: any[] = [];
      try {
        parsedSizes = JSON.parse(r.affectedSizes || "[]");
      } catch {
        parsedSizes = [];
      }
      try {
        parsedImages = JSON.parse(r.images || "[]");
      } catch {
        parsedImages = [];
      }

      return {
        ...r,
        affectedSizes: parsedSizes,
        images: parsedImages,
      };
    });

    return NextResponse.json({ success: true, issues: formatted });
  } catch (err: any) {
    console.error("[Issues GET Error]:", err);
    return NextResponse.json({ error: err.message || "Lỗi tải danh sách phiếu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const {
      poCode,
      productCode,
      productName,
      affectedSizes,
      areaId,
      workshopId,
      workshopName,
      teamName,
      lineName,
      categoryId,
      categoryName,
      detectionStage,
      description,
      severity,
      images,
    } = body;

    if (!poCode || !description || !detectionStage) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Mã PO, Công đoạn phát hiện và Mô tả sự cố" },
        { status: 400 }
      );
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      return NextResponse.json({ error: "Không tìm thấy kết nối D1 Database" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const nowD = new Date();
    const yyyymmdd = nowD.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const issueCode = `CLSK-${yyyymmdd}-${randomSuffix}`;
    const issueId = `iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const form15Deadline = now + 15 * 60; // 15 minutes SLA

    const newIssue = {
      id: issueId,
      factoryId: user?.factoryId || "fac-tbs-kg1",
      issueCode,
      areaId: areaId || user?.areaId || "ws-may-1",
      workshopId: workshopId || "ws-may-1",
      workshopName: workshopName || "Xưởng May 1",
      teamName: teamName || "Tổ May 1",
      lineName: lineName || "Chuyền May 1A",
      categoryId: categoryId || null,
      categoryName: categoryName || "Sự cố kỹ thuật",
      poCode: poCode.trim().toUpperCase(),
      productCode: productCode ? productCode.trim().toUpperCase() : "SK-DEMO",
      productName: productName ? productName.trim() : "Giày Skechers",
      affectedSizes: JSON.stringify(Array.isArray(affectedSizes) ? affectedSizes : []),
      detectionStage: detectionStage.trim(),
      description: description.trim(),
      severity: severity || "medium",
      images: JSON.stringify(Array.isArray(images) ? images : []),
      status: "reported" as const,

      reportedById: user?.id || "usr-worker",
      reportedByName: user?.fullName || "Nguyễn Văn An",
      reportedByMnv: user?.mnv || "NV001",
      reportedAt: now,
      form15Deadline,
      form15Locked: 0,
      qaSubmitted: 0,
      llSubmitted: 0,
      cnSubmitted: 0,

      createdAt: now,
      updatedAt: now,
    };

    await db.insert(qualityIssues).values(newIssue).execute();

    // Log Audit Trail
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId,
      userId: user?.id || "usr-worker",
      userMnv: user?.mnv || "NV001",
      userName: user?.fullName || "Nguyễn Văn An",
      action: "Tạo phiếu báo cáo sự cố (Bước 1)",
      fromStatus: null,
      toStatus: "reported",
      detailsJson: JSON.stringify({ issueCode, poCode: newIssue.poCode, description: newIssue.description }),
      createdAt: now,
    }).execute();

    // Trigger Step 1 Notifications to 4 groups (QA, LL, CN + Worker FYI)
    notifyNewIssueReported({
      id: issueId,
      issueCode,
      poCode: newIssue.poCode,
      productName: newIssue.productName,
      workshopName: newIssue.workshopName,
      detectionStage: newIssue.detectionStage,
      description: newIssue.description,
      areaId: newIssue.areaId,
    }).catch((err) => console.error("[Notify Step 1 Error]:", err));

    return NextResponse.json({
      success: true,
      issue: {
        ...newIssue,
        affectedSizes: Array.isArray(affectedSizes) ? affectedSizes : [],
        images: Array.isArray(images) ? images : [],
      },
    });
  } catch (err: any) {
    console.error("[Issues POST Error]:", err);
    return NextResponse.json({ error: err.message || "Tạo phiếu sự cố thất bại" }, { status: 500 });
  }
}
