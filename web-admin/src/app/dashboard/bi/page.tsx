import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { PieChart, BarChart3, TrendingUp, ShieldCheck, Activity, Clock, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";

export default async function BIPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;

  const allowedRoles = ["truong_phong_ban", "giam_doc", "tong_giam_doc", "admin"];
  if (user?.role && !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  // Fetch real metrics from Prisma (mobile incidents)
  let totalIncidents = 0;
  let pendingCount = 0;
  let acceptedCount = 0;
  let doneCount = 0;
  let avgDurationMinutes: number | null = null;
  let recentIncidents: any[] = [];
  let byCategory: { name: string; count: number }[] = [];
  let byArea: { name: string; count: number }[] = [];

  try {
    const prisma = await getPrisma();

    const [total, pending, accepted, done] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { status: "PENDING" } }),
      prisma.incident.count({ where: { status: "ACCEPTED" } }),
      prisma.incident.count({ where: { status: "DONE" } }),
    ]);
    totalIncidents = total;
    pendingCount = pending;
    acceptedCount = accepted;
    doneCount = done;

    // Avg repair duration for completed incidents
    const doneIncidents = await prisma.incident.findMany({
      where: { status: "DONE", acceptedAt: { not: null }, completedAt: { not: null } },
      select: { acceptedAt: true, completedAt: true },
      take: 100,
    });
    if (doneIncidents.length > 0) {
      const totalMin = doneIncidents.reduce((sum, inc) => {
        const dur = (new Date(inc.completedAt!).getTime() - new Date(inc.acceptedAt!).getTime()) / 60000;
        return sum + Math.max(1, Math.round(dur));
      }, 0);
      avgDurationMinutes = Math.round(totalMin / doneIncidents.length);
    }

    // Breakdown by failure category
    const cats = await prisma.failureCategory.findMany({
      include: { _count: { select: { incidents: true } } },
      orderBy: { incidents: { _count: "desc" } },
      take: 6,
    });
    byCategory = cats
      .filter((c) => c._count.incidents > 0)
      .map((c) => ({ name: c.name, count: c._count.incidents }));

    // Breakdown by area
    const areas = await prisma.category.findMany({
      where: { type: "AREA" },
      include: { machinesByArea: { include: { _count: { select: { incidents: true } } } } },
      take: 10,
    });
    byArea = areas
      .map((a) => ({
        name: a.name,
        count: a.machinesByArea.reduce((sum, m) => sum + m._count.incidents, 0),
      }))
      .filter((a) => a.count > 0)
      .sort((a, b) => b.count - a.count);

    // Recent incidents for trend
    recentIncidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
        completedAt: true,
        machine: { select: { name: true, code: true } },
        reporter: { select: { name: true } },
        assignedTo: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  } catch {
    // fallback
  }

  // SLA: % of DONE incidents closed within 2 hours (120 min)
  let slaRate = 100;
  let slaCount = 0;
  try {
    const prisma = await getPrisma();
    const allDone = await prisma.incident.findMany({
      where: { status: "DONE", acceptedAt: { not: null }, completedAt: { not: null } },
      select: { acceptedAt: true, completedAt: true },
    });
    if (allDone.length > 0) {
      slaCount = allDone.filter((inc) => {
        const dur = (new Date(inc.completedAt!).getTime() - new Date(inc.acceptedAt!).getTime()) / 60000;
        return dur <= 120;
      }).length;
      slaRate = Math.round((slaCount / allDone.length) * 100);
    }
  } catch { /* fallback */ }

  // Max bar count for proportional width
  const maxCatCount = Math.max(1, ...byCategory.map((c) => c.count));
  const maxAreaCount = Math.max(1, ...byArea.map((a) => a.count));

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <PieChart className="w-7 h-7 text-blue-400" />
            <span>BI Tổng Quan Phân Tích — Sự Cố Máy Móc &amp; Bảo Trì</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dành cho Trưởng phòng, Giám đốc &amp; Admin · Dữ liệu thực từ D1 (Prisma incidents).
          </p>
        </div>
        <div className="px-3 py-2 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-300 text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Role: {user?.role || "Manager"}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Sự Cố</div>
          <div className="text-3xl font-black text-white">{totalIncidents}</div>
          <div className="text-[11px] text-blue-400 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Từ Mobile App (QR Scan)</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ SLA 2 Giờ</div>
          <div className="text-3xl font-black text-blue-400">{slaRate}%</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {slaCount} / {totalIncidents > 0 ? doneCount : 0} sự cố đóng trong 2h
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang Chờ / Đang Sửa</div>
          <div className="text-3xl font-black text-amber-400">{pendingCount + acceptedCount}</div>
          <div className="text-[11px] text-amber-300 font-medium">
            {pendingCount} chờ · {acceptedCount} đang sửa
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Hoàn Thành</div>
          <div className="text-3xl font-black text-emerald-400">{doneCount}</div>
          <div className="text-[11px] text-emerald-300 font-medium">
            {avgDurationMinutes != null ? `TB ${avgDurationMinutes} phút / sự cố` : "Chưa có dữ liệu"}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Phân Loại Theo Danh Mục Hư Hỏng</h3>
          </div>
          {byCategory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Chưa có dữ liệu sự cố.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {byCategory.map((cat) => {
                const pct = Math.round((cat.count / maxCatCount) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-blue-400">{cat.count} sự cố</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Area */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Phân Bố Sự Cố Theo Khu Vực / Xưởng</h3>
          </div>
          {byArea.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">Chưa có dữ liệu theo khu vực.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {byArea.map((area) => {
                const pct = Math.round((area.count / maxAreaCount) * 100);
                return (
                  <div key={area.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{area.name}</span>
                      <span className="text-emerald-400">{area.count} sự cố</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sự Cố Gần Đây</h3>
        </div>
        {recentIncidents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Chưa có sự cố nào được ghi nhận.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Mã</th>
                  <th className="p-3">Máy</th>
                  <th className="p-3">Người Báo</th>
                  <th className="p-3">Danh Mục</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Bảo Trì</th>
                  <th className="p-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {recentIncidents.map((inc) => {
                  const statusBadge = inc.status === "DONE"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : inc.status === "ACCEPTED"
                    ? "bg-blue-950 text-blue-300 border-blue-800"
                    : "bg-amber-950 text-amber-300 border-amber-800";
                  return (
                    <tr key={inc.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-400">#{inc.id.slice(-8).toUpperCase()}</td>
                      <td className="p-3 font-bold text-white">{inc.machine?.name}</td>
                      <td className="p-3">{inc.reporter?.name}</td>
                      <td className="p-3 text-slate-400">{inc.category?.name || "--"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusBadge}`}>
                          {inc.status === "DONE" ? "Đã xong" : inc.status === "ACCEPTED" ? "Đang sửa" : "Chờ"}
                        </span>
                      </td>
                      <td className="p-3">{inc.assignedTo?.name || "--"}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(inc.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
