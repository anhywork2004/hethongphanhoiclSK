import Link from "next/link";
import { Siren, ArrowRight, AlertTriangle, PlusCircle, ShieldAlert, PhoneCall, Building2 } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { sql } from "drizzle-orm";

async function getKhongTheXuLyIssues() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (!d1) return [];

    const db = getDb(d1);
    const res = await db
      .select()
      .from(issues)
      .where(sql`${issues.status} IN ('khong_the_xu_ly', 'cannot_resolve')`);
    return res;
  } catch {
    return [];
  }
}

export default async function KhongTheXuLyCategoryPage() {
  const issuesList = await getKhongTheXuLyIssues();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Emergency Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-red-800 to-rose-950 border border-rose-700/80 rounded-3xl p-6 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-rose-400 opacity-50"></span>
            <Siren className="w-7 h-7 text-rose-300 relative z-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[10px] font-black uppercase tracking-wider">
                🚨 SOS BÁO ĐỘNG KHẨN CẤP
              </span>
              <span className="text-xs text-rose-200/90 font-bold">Tổng: {issuesList.length} phiếu SOS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif-luxury mt-1">
              Danh Mục Phiếu Không Thể Xử Lý (Trực Cực Gấp - Báo Động Ban Giám Đốc)
            </h1>
            <p className="text-xs text-rose-100/80 mt-0.5">
              Cảnh báo tự động gửi đến Ban Giám Đốc & Trưởng Phòng Ban để chỉ đạo phương án can thiệp trực tiếp.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/report"
          className="px-5 py-3 rounded-2xl bg-white text-rose-950 hover:bg-rose-50 text-xs font-black uppercase tracking-wider shadow-md flex items-center space-x-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 text-rose-700 stroke-[2.5]" />
          <span>+ BÁO CÁO PHIẾU MỚI</span>
        </Link>
      </div>

      {/* Grid of SOS Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issuesList.length > 0 ? (
          issuesList.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/issues/${item.id}`}
              className="p-5 rounded-3xl bg-white border-2 border-rose-300 hover:border-rose-600 transition-all shadow-md space-y-3 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center space-x-1">
                <Siren className="w-3 h-3" />
                <span>🚨 SOS KHẨN CẤP</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 text-[10px] font-black border border-rose-200">
                  {item.issueCode}
                </span>
                <span className="text-[10px] font-bold text-rose-600 uppercase">Phòng ban trả về</span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                  [{item.productCode}] {item.productName}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-rose-800 font-bold">
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xưởng: {item.workshopName || "Chặt & May"}</span>
                </span>
                <div className="flex items-center space-x-1 text-rose-700 group-hover:translate-x-1 transition-transform">
                  <span>Chỉ đạo gấp</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          /* Empty state / Fallback Demo SOS Card */
          <Link
            href="/dashboard/issues/demo-01"
            className="p-6 rounded-3xl bg-white border border-rose-200 hover:border-rose-400 transition-all shadow-xs space-y-3 group col-span-1"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black border border-rose-300 flex items-center space-x-1">
                <Siren className="w-3 h-3 text-rose-600" />
                <span>CLSK-2026-SOS (MẪU ĐEMO)</span>
              </span>
              <span className="text-[10px] font-extrabold text-rose-600 uppercase">Cần chỉ đạo</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                [SK-GO-WALK-6] Giày Thể Thao Skechers Go Walk Flex
              </h3>
              <p className="text-xs text-slate-500 mt-1">Lỗi da dệt ép nhiệt không bám keo vượt quá năng lực sửa tại chuyền. Cần hỗ trợ từ Phòng Công Nghệ / Kỹ Thuật Tập Đoàn.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Trạng thái: 🚨 SOS Không thể xử lý</span>
              <ArrowRight className="w-4 h-4 text-rose-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
