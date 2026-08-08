import Link from "next/link";
import { Briefcase, Clock, ArrowRight, UserCheck, Wrench, CheckCircle2 } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { qualityIssues, maintenanceTasks } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

export default async function TasksPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let assignedTasks: any[] = [];
  let pendingAssignmentIssues: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);

      // 1. Issues waiting for TP assignment
      pendingAssignmentIssues = await db
        .select()
        .from(qualityIssues)
        .where(eq(qualityIssues.status, "root_cause_found"))
        .orderBy(desc(qualityIssues.updatedAt));

      // 2. Tasks assigned to this user or in progress
      if (user?.id) {
        assignedTasks = await db
          .select({
            task: maintenanceTasks,
            issue: qualityIssues,
          })
          .from(maintenanceTasks)
          .leftJoin(qualityIssues, eq(maintenanceTasks.issueId, qualityIssues.id))
          .where(eq(maintenanceTasks.assignedToId, user.id))
          .orderBy(desc(maintenanceTasks.assignedAt));
      }
    }
  } catch {
    // fallback
  }

  const isDeptHead = user?.role === "dept_head" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="p-6 rounded-3xl bg-[#004724] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#8dc63f]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">
                KHÔNG GIAN ĐIỀU HÀNH CÔNG VIỆC
              </div>
              <h1 className="text-2xl font-black font-serif-luxury tracking-tight mt-0.5">
                Quản Lý Công Việc & Nhiệm Vụ Sửa Chữa
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                Dành cho Trưởng phòng ban (giao việc) và Kỹ thuật viên (nhận việc & đếm giờ sửa chữa).
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: For TP - Issues Awaiting Department Assignment */}
        {isDeptHead && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase text-[#004724] tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#004724]" />
                <span>Phiếu Đã Có Nguyên Nhân Đang Chờ Trưởng Phòng Giao Việc ({pendingAssignmentIssues.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignmentIssues.length > 0 ? (
                pendingAssignmentIssues.map((iss) => (
                  <Link
                    key={iss.id}
                    href={`/dashboard/issues/${iss.id}`}
                    className="p-5 rounded-3xl bg-white border border-emerald-200 hover:border-[#004724] shadow-xs space-y-3 group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-[#004724] text-[10px] font-black">
                        {iss.issueCode}
                      </span>
                      <span className="text-xs font-mono text-slate-500">PO: {iss.poCode}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">
                        [{iss.productCode}] {iss.productName}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{iss.description}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                      <strong>Nguyên nhân gốc:</strong> {iss.rootCauseSummary || "Đã tổng hợp"}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#004724] font-bold">
                      <span>{iss.workshopName}</span>
                      <span className="flex items-center gap-1">
                        <span>Giao việc ngay</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 font-medium">
                  Không có phiếu nào đang chờ giao việc.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 2: For Technicians - My Assigned Tasks */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-black uppercase text-[#004724] tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-[#004724]" />
            <span>Nhiệm Vụ Được Giao Của Tôi ({assignedTasks.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedTasks.length > 0 ? (
              assignedTasks.map(({ task, issue }) => (
                <Link
                  key={task.id}
                  href={`/dashboard/issues/${task.issueId}`}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 shadow-xs space-y-3 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      task.status === "pending"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : task.status === "accepted"
                        ? "bg-blue-100 text-blue-900 border border-blue-300 animate-pulse"
                        : "bg-emerald-100 text-[#004724]"
                    }`}>
                      {task.status === "pending" && "Cần trợ giúp / Nhận việc"}
                      {task.status === "accepted" && "⏱️ Đang sửa chữa"}
                      {task.status === "done" && "✅ Đã sửa xong"}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Mã: {issue?.issueCode || task.issueId}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">
                      {issue?.productName || "Thiết bị phân xưởng"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{issue?.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#004724] font-bold">
                    <span>{issue?.workshopName || "Xưởng May 1"}</span>
                    <span className="flex items-center gap-1">
                      <span>Vào xử lý</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 font-medium">
                Bạn chưa có nhiệm vụ nào được giao hoặc đã hoàn thành hết các công việc.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
