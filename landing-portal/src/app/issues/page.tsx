import Link from "next/link";
import {
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowRight,
  Sparkles,
  Siren,
  Wrench,
  Search,
  Building,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

export default async function IssuesListPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  const { tab = "all", q = "" } = await searchParams;
  let issuesList: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      let query = db.select().from(qualityIssues);

      const conditions = [];
      if (tab && tab !== "all") {
        conditions.push(eq(qualityIssues.status, tab as any));
      }
      if (q && q.trim()) {
        const qLower = `%${q.trim().toLowerCase()}%`;
        conditions.push(sql`LOWER(${qualityIssues.issueCode}) LIKE ${qLower} OR LOWER(${qualityIssues.poCode}) LIKE ${qLower} OR LOWER(${qualityIssues.description}) LIKE ${qLower}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      issuesList = await query.orderBy(desc(qualityIssues.createdAt)).limit(100);
    }
  } catch {
    issuesList = [];
  }

  const tabs = [
    { id: "all", label: "Tất cả", color: "text-[#004724]" },
    { id: "reported", label: "1. Vừa báo cáo (15p)", color: "text-amber-600" },
    { id: "investigating", label: "2. Đang điều tra 5M+1E", color: "text-blue-600" },
    { id: "root_cause_found", label: "3. Đã có nguyên nhân", color: "text-emerald-700" },
    { id: "assigned", label: "4. Đã giao việc", color: "text-indigo-600" },
    { id: "in_progress", label: "5. Đang xử lý", color: "text-blue-700" },
    { id: "monitoring", label: "7b. Đang theo dõi (3h-48h)", color: "text-purple-600" },
    { id: "phase2", label: "Phase 2 (GĐ)", color: "text-rose-600" },
    { id: "completed", label: "Hoàn thành", color: "text-[#004724]" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#004724] font-serif-luxury tracking-tight">
              Hoạt Động Sự Cố Chất Lượng (CLSK)
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Vòng lặp phản hồi 15 phút cảnh báo & quy trình 7 bước xử lý dứt điểm.
            </p>
          </div>

          <Link
            href="/issues/new"
            className="px-5 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center space-x-2 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ BÁO CÁO VẤN ĐỀ MỚI</span>
          </Link>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-1.5 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <Link
                key={t.id}
                href={`/issues?tab=${t.id}`}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#004724] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issuesList.length > 0 ? (
            issuesList.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/issues/${item.id}`}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 transition-all shadow-xs space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                    {item.issueCode}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    PO: {item.poCode}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors line-clamp-1">
                    [{item.productCode || "SK-DEMO"}] {item.productName || "Giày Skechers"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{item.workshopName || "Xưởng May 1"}</span>
                  <ArrowRight className="w-4 h-4 text-[#004724] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-600">Chưa có phiếu sự cố nào trong mục này</h3>
              <p className="text-xs text-slate-400">Bấm &ldquo;+ Báo Cáo Vấn Đề Mới&rdquo; để khởi tạo phiếu mới.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
