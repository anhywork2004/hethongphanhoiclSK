import { ClipboardList, Wrench, ShieldCheck, Filter, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function RepairLogsPage() {
  let issueLogs: Array<{
    id: string;
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

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      const db = getDb(d1);
      issueLogs = await db
        .select({
          id: issues.id,
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
        .orderBy(desc(issues.createdAt))
        .limit(50);
    }
  } catch {
    // Fallback if D1 binding is unavailable during static generation
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "da_xu_ly":
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold flex items-center space-x-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span>Đã Xử Lý</span></span>;
      case "dang_xu_ly":
        return <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-semibold flex items-center space-x-1"><Clock className="w-3 h-3 text-blue-400" /><span>Đang Xử Lý</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-semibold flex items-center space-x-1"><AlertTriangle className="w-3 h-3 text-amber-400" /><span>Chờ Xử Lý</span></span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ClipboardList className="w-7 h-7 text-blue-400" />
            <span>Nhật Ký Lịch Sử Sửa Chữa & Khắc Phục (4M+1E)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi chi tiết thời gian phản hồi, phân xưởng phát hiện lỗi và minh chứng khắc phục nhà máy.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Real-time Logs</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm theo Mã phiếu, SP, Tên SP..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        </div>
        <div>
          <select className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">Tất cả phân xưởng</option>
            <option value="Xưởng Chặt">Xưởng Chặt</option>
            <option value="Xưởng May 1">Xưởng May 1</option>
            <option value="Xưởng May 2">Xưởng May 2</option>
            <option value="Xưởng Gò">Xưởng Gò</option>
            <option value="Xưởng Hoàn Thiện">Xưởng Hoàn Thiện</option>
          </select>
        </div>
        <div>
          <select className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="cho_xu_ly">Chờ xử lý (Trong 15 phút)</option>
            <option value="dang_xu_ly">Đang xử lý</option>
            <option value="da_xu_ly">Đã xử lý (Xác minh 4M+1E)</option>
          </select>
        </div>
      </div>

      {/* Repair Logs Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mã Phiếu</th>
                <th className="px-5 py-3.5">Mã & Tên Sản Phẩm</th>
                <th className="px-5 py-3.5">Phân Xưởng</th>
                <th className="px-5 py-3.5">Công Đoạn</th>
                <th className="px-5 py-3.5">Người Báo Lỗi</th>
                <th className="px-5 py-3.5">Mức Độ</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {issueLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    Chưa có nhật ký ghi nhận. Bạn có thể bấm &quot;Báo Cáo Vấn Đề&quot; để tạo phiếu mới.
                  </td>
                </tr>
              ) : (
                issueLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">{log.issueCode}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{log.productCode}</div>
                      <div className="text-[11px] text-slate-400">{log.productName}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-300">{log.workshopName || "Chưa chọn"}</td>
                    <td className="px-5 py-4 text-slate-400">{log.detectionStage}</td>
                    <td className="px-5 py-4 font-medium text-white">{log.createdByName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold text-slate-300">
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(log.status)}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{log.createdAt}</td>
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
