import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues } from "@/db/schema";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { notifyNewIssueReported } from "@/lib/notifications";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env?.DB) {
      return NextResponse.json({ error: "D1 database binding not found" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const userIssues = await db
      .select()
      .from(qualityIssues)
      .where(eq(qualityIssues.reportedByMnv, payload.employeeCode))
      .orderBy(desc(qualityIssues.createdAt))
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
    const env = ctx.env as unknown as CloudflareEnv;

    if (!env?.DB) {
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

    const issueId = `iss_${Date.now()}`;
    const issueCode = `CLSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = Math.floor(Date.now() / 1000);
    const db = drizzle(env.DB);

    const newIssue = {
      id: issueId,
      factoryId: "fac-tbs-kg1",
      issueCode,
      poCode: body.poCode || "PO-MOBILE-DEMO",
      productCode: body.poCode || productCode,
      productName,
      affectedSizes: JSON.stringify(affectedSizes),
      workshopId,
      workshopName,
      detectionStage,
      description,
      severity: (severity as any) || "trung_binh",
      status: "reported" as any,
      reportedByMnv: payload.employeeCode,
      reportedByName: payload.name || payload.employeeCode,
      reportedAt: now,
      form15Deadline: now + 15 * 60,
      images: JSON.stringify(images),
      createdAt: now,
    };

    await db.insert(qualityIssues).values(newIssue).execute();

    notifyNewIssueReported({
      id: issueId,
      issueCode,
      poCode: newIssue.poCode,
      productName,
      workshopName,
      detectionStage,
      description,
    }).catch((err) => console.error("Async notify error:", err));

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
