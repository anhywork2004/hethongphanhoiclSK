import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues, issueImages } from "@/db/schema";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { sendZaloIssueNotifications } from "@/lib/zalo-oa";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    if (!d1) {
      return NextResponse.json({ error: "D1 database binding not found" }, { status: 500 });
    }

    const db = getDb(d1);
    const userIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.createdByMnv, payload.employeeCode))
      .orderBy(desc(issues.createdAt))
      .limit(50);

    return NextResponse.json(userIssues);
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Lỗi truy vấn: ${e.message}` }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    if (!d1) {
      return NextResponse.json({ error: "D1 database binding not found" }, { status: 500 });
    }

    const body = await req.json();
    const {
      productCode = "SP-DEMO",
      productName = "Giày Skechers Demo",
      affectedSizes = ["39", "40", "41"],
      workshopId = null,
      workshopName = "Phân Xưởng May 2",
      detectionStage = "Chuyền May 2",
      description,
      severity = "trung_binh",
      images = [],
    } = body;

    if (!description) {
      return NextResponse.json({ error: "Mô tả sự cố không được để trống" }, { status: 400 });
    }

    const issueId = `ISSUE-${Date.now()}`;
    const issueCode = `CLSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const db = getDb(d1);

    await db.insert(issues).values({
      id: issueId,
      issueCode,
      productCode: body.poCode || productCode,
      productName,
      affectedSizes: JSON.stringify(affectedSizes),
      workshopId,
      workshopName,
      detectionStage,
      description,
      severity: (severity as any) || "medium",
      status: "pending",
      createdByMnv: payload.employeeCode,
      createdByName: payload.name || payload.employeeCode,
      createdAt: nowIso,
    });

    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        await db.insert(issueImages).values({
          id: `IMG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          issueId,
          r2Key: String(imgUrl),
          imageUrl: imgUrl,
          stage: "report",
          createdAt: nowIso,
        });
      }
    }

    // Trigger async Zalo OA 3 groups notification
    sendZaloIssueNotifications(
      {
        id: issueId,
        issueCode,
        productCode: body.poCode || productCode,
        productName,
        affectedSizes,
        workshopId,
        workshopName: workshopName || "Chưa phân xưởng",
        detectionStage,
        description,
        severity,
        createdByName: payload.name || payload.employeeCode,
        createdByMnv: payload.employeeCode,
        createdAt: nowIso,
      },
      images.map((imgUrl: string) => ({ imageUrl: imgUrl }))
    ).catch((err) => {
      console.error("Zalo OA notification async error:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tạo phiếu báo lỗi CLSK thành công",
        issueId,
        issueCode,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Lỗi tạo phiếu: ${e.message}` }, { status: 500 });
  }
}
