import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, investigationForms, maintenanceTasks, departments, areas } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Activity,
  Layers,
  Wrench,
  Package,
} from "lucide-react";
import { desc } from "drizzle-orm";

export default async function BIDashboardPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let allIssues: any[] = [];
  let allForms: any[] = [];
  let allTasks: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      const [iRows, fRows, tRows] = await Promise.all([
        db.select().from(qualityIssues).orderBy(desc(qualityIssues.createdAt)),
        db.select().from(investigationForms),
        db.select().from(maintenanceTasks),
      ]);
      allIssues = iRows;
      allForms = fRows;
      allTasks = tRows;
    }
  } catch {
    // fallback
  }

  // 1. Status Counts
  const counts = {
    reported: allIssues.filter((i) => i.status === "reported").length,
    investigating: allIssues.filter((i) => i.status === "investigating").length,
    root_cause_found: allIssues.filter((i) => i.status === "root_cause_found").length,
    in_progress: allIssues.filter((i) => i.status === "in_progress" || i.status === "assigned").length,
    monitoring: allIssues.filter((i) => i.status === "monitoring").length,
    completed: allIssues.filter((i) => i.status === "completed").length,
    phase2: allIssues.filter((i) => i.status === "phase2").length,
  };

  // 2. 5M+1E Distribution
  const fiveM1E = {
    Man: allForms.filter((f) => f.rootCauseCategory === "Man").length,
    Machine: allForms.filter((f) => f.rootCauseCategory === "Machine").length,
    Material: allForms.filter((f) => f.rootCauseCategory === "Material").length,
    Method: allForms.filter((f) => f.rootCauseCategory === "Method").length,
    Measurement: allForms.filter((f) => f.rootCauseCategory === "Measurement").length,
    Environment: allForms.filter((f) => f.rootCauseCategory === "Environment").length,
  };

  // 3. Top Failures
  const failureCountMap: Record<string, number> = {};
  allIssues.forEach((i) => {
    const name = i.categoryName || i.detectionStage || "Chưa phân loại";
    failureCountMap[name] = (failureCountMap[name] || 0) + 1;
  });

  const topFailures = Object.entries(failureCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                BI Analytics & Thống Kê CLSK Toàn Nhà Máy
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ số MTTR, phân bố 5M+1E, tỷ lệ hoàn thành theo phân xưởng và top lỗi phát sinh.
              </p>
            </div>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tổng Số Phiếu</span>
            <div className="text-2xl font-black text-slate-900 font-serif-luxury">{allIssues.length}</div>
            <div className="text-[11px] text-emerald-700 font-bold">100% dữ liệu D1</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Đang Xử Lý & Sửa</span>
            <div className="text-2xl font-black text-blue-700 font-serif-luxury">{counts.in_progress + counts.investigating}</div>
            <div className="text-[11px] text-blue-600 font-bold">Đang chạy real-time</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Đang Theo Dõi (3h-48h)</span>
            <div className="text-2xl font-black text-purple-700 font-serif-luxury">{counts.monitoring}</div>
            <div className="text-[11px] text-purple-600 font-bold">Cửa sổ ổn định</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#004724]">Đã Hoàn Thành</span>
            <div className="text-2xl font-black text-[#004724] font-serif-luxury">{counts.completed}</div>
            <div className="text-[11px] text-emerald-600 font-bold">Đạt chuẩn 100%</div>
          </div>
        </div>

        {/* 5M+1E Distribution & MTTR Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 5M+1E Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-[#004724] tracking-wider border-b border-slate-200 pb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#004724]" />
              <span>Phân Bố Nguyên Nhân Gốc Theo 6 Yếu Tố 5M+1E</span>
            </h3>

            <div className="space-y-3">
              {[
                { label: "1. Machine (Máy móc & Thiết bị)", count: fiveM1E.Machine, color: "bg-amber-500" },
                { label: "2. Man (Con người & Thao tác)", count: fiveM1E.Man, color: "bg-blue-500" },
                { label: "3. Material (Nguyên vật liệu)", count: fiveM1E.Material, color: "bg-emerald-500" },
                { label: "4. Method (Phương pháp SOP)", count: fiveM1E.Method, color: "bg-purple-500" },
                { label: "5. Measurement (Đo lường & Hiệu chuẩn)", count: fiveM1E.Measurement, color: "bg-indigo-500" },
                { label: "6. Environment (Môi trường xưởng)", count: fiveM1E.Environment, color: "bg-teal-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{item.label}</span>
                    <span className="font-mono text-[#004724]">{item.count} vụ</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${Math.min(100, Math.max(10, item.count * 20))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Common Failures */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-[#004724] tracking-wider border-b border-slate-200 pb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Top 5 Danh Mục Lỗi Thường Gặp Nhất</span>
            </h3>

            <div className="space-y-3">
              {topFailures.length > 0 ? (
                topFailures.map((tf, i) => (
                  <div
                    key={tf.name}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#004724] flex items-center justify-center font-black text-[10px]">
                        #{i + 1}
                      </span>
                      <span className="text-slate-900">{tf.name}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-black">
                      {tf.count} sự cố
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">Chưa có dữ liệu lỗi.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
