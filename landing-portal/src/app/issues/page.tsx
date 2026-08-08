import Link from "next/link";
import { PlusCircle, Clock, AlertTriangle, CheckCircle2, XCircle, Package, ArrowRight } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueImages } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function getIssuesByStatus(status: string) {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) return [];

    const db = drizzle(env.DB);
    const rows = await db.select().from(issues).where(eq(issues.status, status as any)).orderBy(desc(issues.createdAt)).limit(50);
    return rows;
  } catch {
    return [];
  }
}

export default async function IssuesListPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "pending" } = await searchParams;
  const currentTab = ["pending", "processing", "resolved", "cannot_resolve"].includes(tab) ? tab : "pending";

  const issuesList = await getIssuesByStatus(currentTab);

  const tabs = [
    { id: "pending", label: "Chờ xử lý (15p)", icon: Clock, color: "text-amber-600", activeBg: "bg-amber-500 text-white" },
    { id: "processing", label: "Đang xử lý (5M+1E)", icon: AlertTriangle, color: "text-blue-600", activeBg: "bg-blue-600 text-white" },
    { id: "resolved", label: "Đã xử lý xong", icon: CheckCircle2, color: "text-[#004724]", activeBg: "bg-[#004724] text-white" },
    { id: "cannot_resolve", label: "Không thể xử lý", icon: XCircle, color: "text-rose-600", activeBg: "bg-rose-600 text-white" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
            Danh Sách Phiếu Vấn Đề CLSK
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            TBS Group Kiên Giang 1 • Vòng lặp phản hồi chất lượng nhanh (2 Giờ Vàng)
          </p>
        </div>

        <Link
          href="/issues/new"
          className="px-5 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center space-x-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>+ BÁO CÁO VẤN ĐỀ</span>
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          const IconComp = t.icon;
          return (
            <Link
              key={t.id}
              href={`/issues?tab=${t.id}`}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive ? t.activeBg + " shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? "text-white" : t.color}`} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issuesList.length > 0 ? (
          issuesList.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/issues/${item.id}`}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 transition-all shadow-xs space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                  {item.issueCode}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{item.createdAt.slice(0, 10)}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors line-clamp-1">
                  [{item.productCode}] {item.productName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{item.workshopName || "Phân xưởng Chặt & Chuẩn bị"}</span>
                <ArrowRight className="w-4 h-4 text-[#004724] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        ) : (
          /* Empty / Fallback Card */
          <Link
            href="/dashboard/issues/demo-01"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 transition-all shadow-xs space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                CLSK-2026-001 (DEMO)
              </span>
              <span className="text-[11px] font-mono text-slate-500">Mẫu thử</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">
                [SK-GO-WALK-6] Giày Thể Thao Skechers Go Walk Flex
              </h3>
              <p className="text-xs text-slate-500 mt-1">Quai may lệch chỉ 2mm, hở keo gót đế.</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Phân xưởng Chặt & Chuẩn bị</span>
              <ArrowRight className="w-4 h-4 text-[#004724] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
