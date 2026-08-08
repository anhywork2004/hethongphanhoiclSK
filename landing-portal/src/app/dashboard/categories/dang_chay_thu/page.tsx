import Link from "next/link";
import { FlaskConical, ArrowRight, Clock, PlusCircle } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";

async function getChayThuIssues() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (!d1) return [];

    const db = getDb(d1);
    const res = await db.select().from(issues).where(sql`${issues.status} IN ('dang_chay_thu', 'monitoring')`);
    return res;
  } catch {
    return [];
  }
}

export default async function ChayThuCategoryPage() {
  const issuesList = await getChayThuIssues();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black uppercase">
                Giai Đoạn 3: Đóng Lần 1
              </span>
              <span className="text-xs text-slate-500 font-bold">Tổng: {issuesList.length} phiếu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury mt-1">
              Danh Mục Phiếu Đang Trong Ca Chạy Thử Nghiệm (3h - 48h)
            </h1>
          </div>
        </div>

        <Link
          href="/dashboard/report"
          className="px-4 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-extrabold uppercase tracking-wider shadow-md flex items-center space-x-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Báo Cáo Sự Cố Mới</span>
        </Link>
      </div>

      {/* Grid of Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issuesList.length > 0 ? (
          issuesList.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/issues/${item.id}`}
              className="p-5 rounded-3xl bg-white border border-purple-200 hover:border-purple-400 transition-all shadow-xs space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 text-[10px] font-black border border-purple-200">
                  {item.issueCode}
                </span>
                <CountdownTimer targetMinutes={(item.testRunHours || 3) * 60} createdTimeStr={item.closedOnceAt || item.createdAt} label="Chạy Thử" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                  [{item.productCode}] {item.productName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Phân xưởng: {item.workshopName || "Chặt & Chuẩn bị"}</span>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        ) : (
          /* Empty state / Fallback Demo Card */
          <Link
            href="/dashboard/issues/demo-01"
            className="p-6 rounded-3xl bg-white border border-purple-200 hover:border-purple-400 transition-all shadow-xs space-y-3 group col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black border border-purple-300">
                CLSK-2026-001 (DEMO)
              </span>
              <CountdownTimer targetMinutes={180} label="Chạy Thử 3h" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                [SK-GO-WALK-6] Giày Thể Thao Skechers Go Walk Flex
              </h3>
              <p className="text-xs text-slate-500 mt-1">Quai may lệch chỉ 2mm, đã sửa máy gò đinh & đang chạy thử ca 3 giờ.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Bắt đầu chạy thử: 3 giờ</span>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
