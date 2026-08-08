import { getPrisma } from "@/lib/prisma";
import { ClipboardList, Hourglass, Wrench, CheckCircle2 } from "lucide-react";
import ReportsCharts from "./reports-charts-lazy";
import { PageHeader } from "@/components/page-header";
import AreaFilter from "./area-filter";

const TREND_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_LABEL: Record<string, string> = {
  REPORTED: "Vừa báo cáo",
  INVESTIGATING: "Đang điều tra",
  ROOT_CAUSE_FOUND: "Đã có nguyên nhân",
  ASSIGNED: "Đã giao việc",
  IN_PROGRESS: "Đang xử lý",
  DONE: "Hoàn thành",
};

function dayKey(d: Date) {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ areaId?: string }>;
}) {
  const prisma = await getPrisma();
  const since14d = new Date(Date.now() - TREND_DAYS * DAY_MS);
  const { areaId } = await searchParams;

  const issueWhere = areaId ? { areaId } : {};

  const [
    areas,
    totalCount,
    openCount,
    doneCount,
    statusGroups,
    issuesByDayRaw,
    issuesWithArea,
    openIssues,
    tasksForDuration,
  ] = await Promise.all([
    prisma.category.findMany({ where: { type: "AREA" }, orderBy: { order: "asc" } }),
    prisma.qualityIssue.count({ where: issueWhere }),
    prisma.qualityIssue.count({ where: { ...issueWhere, status: { not: "DONE" } } }),
    prisma.qualityIssue.count({ where: { ...issueWhere, status: "DONE" } }),
    prisma.qualityIssue.groupBy({ by: ["status"], _count: { _all: true }, where: issueWhere }),
    prisma.qualityIssue.findMany({
      where: { createdAt: { gte: since14d }, ...issueWhere },
      select: { createdAt: true },
    }),
    prisma.qualityIssue.findMany({
      where: issueWhere,
      select: { area: { select: { name: true } } },
    }),
    prisma.qualityIssue.findMany({
      where: { ...issueWhere, status: { not: "DONE" } },
      orderBy: { createdAt: "asc" },
      take: 8,
      select: {
        id: true,
        poCode: true,
        description: true,
        status: true,
        createdAt: true,
        reporter: { select: { name: true } },
        team: { select: { name: true } },
        productionLine: { select: { name: true } },
        failureCategory: { select: { name: true } },
      },
    }),
    prisma.maintenanceTask.findMany({
      where: { status: "DONE", completedAt: { not: null }, issue: issueWhere },
      select: {
        completedAt: true,
        acceptedAt: true,
        createdAt: true,
        issue: { select: { failureCategory: { select: { name: true } } } },
      },
    }),
  ]);

  const kpiCards = [
    {
      label: "Tổng số phiếu",
      value: totalCount,
      unit: "Phiếu",
      icon: ClipboardList,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Đang xử lý",
      value: openCount,
      unit: "Phiếu",
      icon: Hourglass,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Cần điều tra 5M+1E",
      value: statusGroups.find((g) => g.status === "REPORTED" || g.status === "INVESTIGATING")
        ? statusGroups
            .filter((g) => g.status === "REPORTED" || g.status === "INVESTIGATING")
            .reduce((sum, g) => sum + g._count._all, 0)
        : 0,
      unit: "Phiếu",
      icon: Wrench,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      label: "Đã hoàn thành",
      value: doneCount,
      unit: "Phiếu",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  const issuesByStatus = statusGroups.map((g) => ({
    status: g.status,
    statusLabel: STATUS_LABEL[g.status] || g.status,
    count: g._count._all,
  }));

  const dayBuckets = new Map<string, number>();
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    dayBuckets.set(dayKey(new Date(Date.now() - i * DAY_MS)), 0);
  }
  for (const issue of issuesByDayRaw) {
    const key = dayKey(new Date(issue.createdAt));
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
  }
  const issuesByDay = Array.from(dayBuckets.entries()).map(([date, count]) => ({ date, count }));

  const areaCountMap = new Map<string, number>();
  for (const issue of issuesWithArea) {
    const area = issue.area?.name || "Chưa phân khu vực";
    areaCountMap.set(area, (areaCountMap.get(area) || 0) + 1);
  }
  const issuesByArea = Array.from(areaCountMap.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  // --- Top 5 lỗi: rank, tên lỗi, số lượng, thời gian xử lý trung bình ---
  const failureStats = new Map<string, { count: number; totalMinutes: number; withDuration: number }>();
  for (const task of tasksForDuration) {
    const name = task.issue.failureCategory?.name || "Chưa phân loại";
    const entry = failureStats.get(name) || { count: 0, totalMinutes: 0, withDuration: 0 };
    entry.count++;
    if (task.completedAt) {
      const startTime = task.acceptedAt ?? task.createdAt;
      const minutes = Math.max(1, Math.round((task.completedAt.getTime() - startTime.getTime()) / 60000));
      entry.totalMinutes += minutes;
      entry.withDuration++;
    }
    failureStats.set(name, entry);
  }
  const top5Failures = Array.from(failureStats.entries())
    .map(([name, s]) => ({
      name,
      count: s.count,
      avgHours: s.withDuration > 0 ? Number((s.totalMinutes / s.withDuration / 60).toFixed(1)) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Tổng quan">
        <AreaFilter areas={areas} />
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
                <Icon size={20} className={c.iconColor} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xl font-bold text-slate-800">{c.value}</div>
                <div className="truncate text-xs text-slate-500">
                  {c.label} · {c.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-800">Báo cáo &amp; Thống kê</h2>
      <ReportsCharts issuesByStatus={issuesByStatus} issuesByDay={issuesByDay} issuesByArea={issuesByArea} />

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-base font-bold text-rose-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600" />
            Top 5 lỗi thường gặp
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2">#</th>
                <th className="px-5 py-2">Tên lỗi</th>
                <th className="px-5 py-2 text-right">Số lượng</th>
                <th className="px-5 py-2 text-right">TB xử lý (giờ)</th>
              </tr>
            </thead>
            <tbody>
              {top5Failures.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-400" colSpan={4}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {top5Failures.map((f, i) => (
                <tr key={f.name} className="border-t border-slate-100">
                  <td className="px-5 py-2 font-mono">{i + 1}</td>
                  <td className="px-5 py-2">{f.name}</td>
                  <td className="px-5 py-2 text-right font-semibold text-rose-600">{f.count}</td>
                  <td className="px-5 py-2 text-right text-slate-600">
                    {f.avgHours != null ? f.avgHours : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-base font-bold text-amber-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-600" />
            Sự cố cần xử lý gấp
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2">PO</th>
                <th className="px-5 py-2">Tổ / Chuyền</th>
                <th className="px-5 py-2">Trạng thái</th>
                <th className="px-5 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {openIssues.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-400" colSpan={4}>
                    Không có sự cố nào đang chờ xử lý
                  </td>
                </tr>
              )}
              {openIssues.map((issue) => (
                <tr key={issue.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 font-mono">{issue.poCode}</td>
                  <td className="px-5 py-2">
                    {issue.team?.name || "-"} / {issue.productionLine?.name || "-"}
                  </td>
                  <td className="px-5 py-2">
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {STATUS_LABEL[issue.status] || issue.status}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-slate-600">
                    {new Date(issue.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
