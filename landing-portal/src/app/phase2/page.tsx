import Link from "next/link";
import { Siren, Clock, CheckCircle2, ArrowRight, Building, FileText } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, investigationForms } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

export default async function Phase2Page() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let phase2List: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      phase2List = await db
        .select()
        .from(qualityIssues)
        .where(eq(qualityIssues.status, "phase2"))
        .orderBy(desc(qualityIssues.updatedAt));
    }
  } catch {
    phase2List = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-3xl bg-rose-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Siren className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-rose-200 tracking-widest">
                DÀNH CHO BAN GIÁM ĐỐC (GĐ / TGĐ)
              </div>
              <h1 className="text-2xl font-black font-serif-luxury tracking-tight mt-0.5">
                Màn Hình Xử Lý Sự Cố Phase 2
              </h1>
              <p className="text-xs text-rose-100 mt-1 font-medium">
                Tổng hợp các sự cố không thể xử lý ở cấp phân xưởng, cần ý kiến chỉ đạo từ Ban Giám Đốc.
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
            {phase2List.length} Phiếu đang chờ GĐ xử lý
          </div>
        </div>

        {/* Phase 2 List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phase2List.length > 0 ? (
            phase2List.map((iss) => (
              <Link
                key={iss.id}
                href={`/dashboard/issues/${iss.id}`}
                className="p-6 rounded-3xl bg-white border border-rose-200 hover:border-rose-500 shadow-sm space-y-3 transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                    {iss.issueCode}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    PO: {iss.poCode}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    [{iss.productCode || "SK-DEMO"}] {iss.productName || "Giày Skechers"}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{iss.description}</p>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 font-medium">
                  <strong>Ghi chú chuyển Phase 2:</strong> {iss.phase2Notes || "Chuyển Ban Giám Đốc xử lý."}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>{iss.workshopName || "Phân xưởng May 1"}</span>
                  <span className="text-rose-600 flex items-center gap-1">
                    <span>Xem chi tiết & Chỉ đạo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Không có sự cố nào đang chờ xử lý Phase 2</h3>
              <p className="text-xs text-slate-500">Tất cả các vấn đề đang được giải quyết suôn sẻ tại các phân xưởng.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
