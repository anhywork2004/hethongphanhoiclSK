import { ClipboardList, ShieldCheck, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function RepairLogsPage() {
  let issueLogs: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      issueLogs = await db
        .select()
        .from(qualityIssues)
        .orderBy(desc(qualityIssues.createdAt))
        .limit(50);
    }
  } catch {
    // fallback
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#004724] tracking-tight flex items-center space-x-2 font-serif-luxury">
            <ClipboardList className="w-6 h-6" />
            <span>Nhật Ký Lịch Sử Sửa Chữa & Khắc Phục CLSK</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi chi tiết thời gian phản hồi, phân xưởng phát hiện lỗi và minh chứng khắc phục.
          </p>
        </div>
      </div>

      {/* Repair Logs Data Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mã Phiếu</th>
                <th className="px-5 py-3.5">Mã & Tên Sản Phẩm</th>
                <th className="px-5 py-3.5">Phân Xưởng</th>
                <th className="px-5 py-3.5">Công Đoạn</th>
                <th className="px-5 py-3.5">Người Báo Lỗi</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5">Thời Gian Báo Cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {issueLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Chưa có nhật ký ghi nhận. Bấm &ldquo;Báo Cáo Vấn Đề&rdquo; để tạo phiếu mới.
                  </td>
                </tr>
              ) : (
                issueLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#004724]">{log.issueCode}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{log.productCode}</div>
                      <div className="text-[11px] text-slate-500">{log.productName}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{log.workshopName || "Xưởng May 1"}</td>
                    <td className="px-5 py-4 text-slate-600">{log.detectionStage}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{log.reportedByName || log.reportedByMnv}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#004724] text-[10px] font-black uppercase">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                      {log.createdAt ? new Date(log.createdAt * 1000).toLocaleString("vi-VN") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
