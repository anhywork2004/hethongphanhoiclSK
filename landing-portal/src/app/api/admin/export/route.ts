import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;

    let data: any[] = [];
    if (env?.DB) {
      const db = drizzle(env.DB);
      data = await db.select().from(qualityIssues).orderBy(desc(qualityIssues.createdAt));
    }

    const headers = ["Mã Phiếu", "Mã PO", "Mã SP", "Tên SP", "Phân Xưởng", "Công Đoạn", "Mức Độ", "Trạng Thái", "Người Báo Lỗi", "Thời Gian Ghi Nhận"];
    const rows = data.map((item) => [
      `"${item.issueCode}"`,
      `"${item.poCode || ""}"`,
      `"${item.productCode || ""}"`,
      `"${(item.productName || "").replace(/"/g, '""')}"`,
      `"${item.workshopName || ""}"`,
      `"${item.detectionStage || ""}"`,
      `"${item.severity || ""}"`,
      `"${item.status || ""}"`,
      `"${item.reportedByName || item.reportedByMnv || ""}"`,
      `"${item.createdAt ? new Date(item.createdAt * 1000).toLocaleString("vi-VN") : ""}"`,
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
