import Link from "next/link";
import { ClipboardList, Clock, ArrowRight, CheckCircle2, User, Wrench } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueStatusHistory, issueResolutions, issues } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function RepairHistoryPage() {
  let historyList: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      historyList = await db.select().from(issueStatusHistory).orderBy(desc(issueStatusHistory.changedAt)).limit(50);
    }
  } catch {
    historyList = [];
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Nhật Ký Sửa Chữa & Lịch Sử Sự Cố</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Audit log toàn bộ quá trình xử lý 2 Giờ</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        {historyList.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {historyList.map((item) => (
              <div key={item.id} className="py-3.5 flex items-start justify-between space-x-4">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4 text-[#004724]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-[#004724]">Phiếu: {item.issueId}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.fromStatus || "mới"} → {item.toStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">{item.note || "Đã cập nhật trạng thái phiếu xử lý."}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(item.changedAt * 1000).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Chưa có nhật ký sửa chữa nào ghi nhận.</p>
          </div>
        )}
      </div>
    </div>
  );
}
