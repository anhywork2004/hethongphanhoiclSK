import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;

    let data: Array<{
      issueCode: string;
      productCode: string;
      productName: string;
      workshopName: string | null;
      detectionStage: string;
      severity: string;
      status: string;
      createdByName: string;
      createdAt: string;
    }> = [];

    if (d1) {
      const db = getDb(d1);
      data = await db
        .select({
          issueCode: issues.issueCode,
          productCode: issues.productCode,
          productName: issues.productName,
          workshopName: issues.workshopName,
          detectionStage: issues.detectionStage,
          severity: issues.severity,
          status: issues.status,
          createdByName: issues.createdByName,
          createdAt: issues.createdAt,
        })
        .from(issues)
        .orderBy(desc(issues.createdAt));
    }

    // Build CSV content with UTF-8 BOM
    const headers = ["Mã Phiếu", "Mã SP", "Tên SP", "Phân Xưởng", "Công Đoạn", "Mức Độ", "Trạng Thái", "Người Báo Lỗi", "Thời Gian Ghi Nhận"];
    const rows = data.map((item) => [
      `"${item.issueCode}"`,
      `"${item.productCode}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.workshopName || ""}"`,
      `"${item.detectionStage}"`,
      `"${item.severity}"`,
      `"${item.status}"`,
      `"${item.createdByName}"`,
      `"${item.createdAt}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Bao-Cao-CLSK-Skechers-KG1-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Không thể xuất báo cáo: ${e.message}` }, { status: 500 });
  }
}
