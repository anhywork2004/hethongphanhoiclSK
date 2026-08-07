import { getPrisma } from "@/lib/prisma";
import { Wrench, PlayCircle, AlertTriangle, Settings } from "lucide-react";
import ReportsCharts, { TechnicianChartLazy } from "./reports-charts-lazy";
import { PageHeader } from "@/components/page-header";
import AreaFilter from "./area-filter";

const TREND_DAYS = 14;
const UPCOMING_DUE_DAYS = 7; // Sắp đến hạn bảo trì nếu còn <= 7 ngày
const DAY_MS = 24 * 60 * 60 * 1000;

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

  const machineWhere = areaId ? { areaId } : {};
  const byMachineArea = areaId ? { machine: { areaId } } : {};

  const [
    areas,
    machineCount,
    statusCategories,
    machineStatusGroups,
    machines,
    incidentsByDayRaw,
    incidentsWithCategory,
    openIncidentsCount,
    openIncidents,
  ] = await Promise.all([
    prisma.category.findMany({ where: { type: "AREA" }, orderBy: { order: "asc" } }),
    prisma.machine.count({ where: machineWhere }),
    prisma.category.findMany({ where: { type: "MACHINE_STATUS" }, orderBy: { order: "asc" } }),
    prisma.machine.groupBy({ by: ["statusId"], _count: { _all: true }, where: machineWhere }),
    prisma.machine.findMany({
      where: machineWhere,
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        area: { select: { name: true } },
        status: { select: { id: true, name: true, statusKind: true, colorHex: true } },
        maintenancePeriod: { select: { name: true, days: true } },
      },
    }),
    prisma.incident.findMany({
      where: { createdAt: { gte: since14d }, ...byMachineArea },
      select: { createdAt: true },
    }),
    prisma.incident.findMany({
      where: byMachineArea,
      select: { categoryId: true, category: { select: { name: true } } },
    }),
    prisma.incident.count({ where: { status: { in: ["PENDING", "ACCEPTED"] }, ...byMachineArea } }),
    prisma.incident.findMany({
      where: { status: { in: ["PENDING", "ACCEPTED"] }, ...byMachineArea },
      orderBy: { createdAt: "asc" },
      take: 8,
      select: {
        id: true,
        status: true,
        description: true,
        createdAt: true,
        machine: { select: { code: true, name: true } },
        category: { select: { name: true } },
        customCategoryText: true,
        assignedTo: { select: { name: true } },
      },
    }),
  ]);

  const statusKindById = new Map(statusCategories.map((c) => [c.id, c.statusKind]));
  function countByKind(kind: string) {
    return machineStatusGroups
      .filter((g) => statusKindById.get(g.statusId) === kind)
      .reduce((sum, g) => sum + g._count._all, 0);
  }
  const activeCount = countByKind("ACTIVE");
  const maintenanceCount = countByKind("MAINTENANCE");

  // --- Lịch bảo trì định kỳ: quá hạn / sắp đến hạn ---
  const lastMaintenanceByMachine = await prisma.maintenanceLog.groupBy({
    by: ["machineId"],
    _max: { startTime: true },
    where: byMachineArea,
  });
  const lastMaintenanceMap = new Map<string, Date>();
  for (const g of lastMaintenanceByMachine) {
    if (g._max.startTime) lastMaintenanceMap.set(g.machineId, new Date(g._max.startTime));
  }

  const machinesWithSchedule = machines.filter((m) => m.maintenancePeriod?.days != null);
  const overdueMachines: { machine: (typeof machines)[number]; daysOverdue: number }[] = [];
  const upcomingMachines: { machine: (typeof machines)[number]; daysLeft: number }[] = [];
  for (const m of machinesWithSchedule) {
    const periodDays = m.maintenancePeriod!.days!;
    const lastMaintenance = lastMaintenanceMap.get(m.id) || m.createdAt;
    const daysSince = (Date.now() - new Date(lastMaintenance).getTime()) / DAY_MS;
    const daysLeft = Math.floor(periodDays - daysSince);
    if (daysLeft < 0) {
      overdueMachines.push({ machine: m, daysOverdue: -daysLeft });
    } else if (daysLeft <= UPCOMING_DUE_DAYS) {
      upcomingMachines.push({ machine: m, daysLeft });
    }
  }
  overdueMachines.sort((a, b) => b.daysOverdue - a.daysOverdue);
  upcomingMachines.sort((a, b) => a.daysLeft - b.daysLeft);

  // --- Hiệu suất nhân viên bảo trì: số lượt sửa + số sao trung bình ---
  const maintenanceByTechnician = await prisma.maintenanceLog.groupBy({
    by: ["technicianId"],
    _count: { _all: true },
    _avg: { skillRating: true },
    where: byMachineArea,
  });
  const technicians = await prisma.user.findMany({
    where: { id: { in: maintenanceByTechnician.map((g) => g.technicianId) } },
    select: { id: true, name: true },
  });
  const technicianNameById = new Map(technicians.map((t) => [t.id, t.name]));
  const technicianStats = maintenanceByTechnician
    .map((g) => ({
      name: technicianNameById.get(g.technicianId) || "Không rõ",
      repairs: g._count._all,
      avgRating: g._avg.skillRating != null ? Number(g._avg.skillRating.toFixed(1)) : 0,
    }))
    .sort((a, b) => b.repairs - a.repairs);

  // --- Tỷ lệ máy hoạt động ổn định theo khu vực / xưởng ---
  const areaMachineCounts = new Map<string, number>();
  const areaActiveCounts = new Map<string, number>();
  for (const m of machines) {
    const area = m.area?.name || "Chưa phân khu vực";
    areaMachineCounts.set(area, (areaMachineCounts.get(area) || 0) + 1);
    if (m.status.statusKind === "ACTIVE") {
      areaActiveCounts.set(area, (areaActiveCounts.get(area) || 0) + 1);
    }
  }
  const availabilityByArea = Array.from(areaMachineCounts.entries())
    .map(([area, count]) => {
      const active = areaActiveCounts.get(area) || 0;
      return { area, availability: Number(((active / count) * 100).toFixed(1)) };
    })
    .sort((a, b) => b.availability - a.availability);

  const kpiCards = [
    {
      label: "Tổng số máy",
      value: machineCount,
      unit: "Máy",
      icon: Wrench,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Đang hoạt động",
      value: activeCount,
      unit: "Máy",
      icon: PlayCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Đang báo sự cố (Cần xử lý)",
      value: openIncidentsCount,
      unit: "Sự cố",
      icon: AlertTriangle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      label: "Đang bảo trì / Quá hạn bảo trì",
      value: maintenanceCount,
      unit: `Máy · Quá hạn: ${overdueMachines.length}`,
      icon: Settings,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  // --- Biểu đồ ---
  const machinesByStatus = machineStatusGroups.map((g) => {
    const cat = statusCategories.find((c) => c.id === g.statusId);
    return {
      status: cat?.name || "Không rõ",
      count: g._count._all,
      colorHex: cat?.colorHex || "#94A3B8",
    };
  });

  const dayBuckets = new Map<string, number>();
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    dayBuckets.set(dayKey(new Date(Date.now() - i * DAY_MS)), 0);
  }
  for (const inc of incidentsByDayRaw) {
    const key = dayKey(new Date(inc.createdAt));
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
  }
  const incidentsByDay = Array.from(dayBuckets.entries()).map(([date, count]) => ({ date, count }));

  const categoryMap = new Map<string, number>();
  for (const inc of incidentsWithCategory) {
    const key = inc.category?.name || "Chưa phân loại";
    categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
  }
  const incidentsByCategory = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // --- Bảng dữ liệu ---
  const statusLabel: Record<string, string> = { PENDING: "Chờ xử lý", ACCEPTED: "Đã nhận việc" };

  return (
    <div>
      <PageHeader title="Tổng quan">
        <AreaFilter areas={areas} />
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
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
      <ReportsCharts
        machinesByStatus={machinesByStatus}
        incidentsByDay={incidentsByDay}
        incidentsByCategory={incidentsByCategory}
        availabilityByArea={availabilityByArea}
      />

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-base font-bold text-rose-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-600" />
            Sự cố cần xử lý gấp
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2">Mã tài sản</th>
                <th className="px-5 py-2">Danh mục hư</th>
                <th className="px-5 py-2">Trạng thái</th>
                <th className="px-5 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {openIncidents.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-400" colSpan={4}>
                    Không có sự cố nào đang chờ xử lý
                  </td>
                </tr>
              )}
              {openIncidents.map((inc) => (
                <tr key={inc.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 font-mono">{inc.machine.code}</td>
                  <td className="px-5 py-2">
                    {inc.customCategoryText || inc.category?.name || "Chưa phân loại"}
                  </td>
                  <td className="px-5 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        inc.status === "PENDING"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {statusLabel[inc.status]}
                      {inc.assignedTo ? ` · ${inc.assignedTo.name}` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-slate-600">
                    {new Date(inc.createdAt).toLocaleString("vi-VN", {
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

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-base font-bold text-amber-600">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-600" />
            Máy sắp đến hạn bảo trì định kỳ
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2">Mã tài sản</th>
                <th className="px-5 py-2">Tên máy</th>
                <th className="px-5 py-2 text-right">Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {overdueMachines.length === 0 && upcomingMachines.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-400" colSpan={3}>
                    Không có máy nào sắp/quá hạn bảo trì
                  </td>
                </tr>
              )}
              {overdueMachines.map(({ machine, daysOverdue }) => (
                <tr key={machine.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 font-mono">{machine.code}</td>
                  <td className="px-5 py-2">{machine.name}</td>
                  <td className="px-5 py-2 text-right font-semibold text-rose-600">
                    Quá hạn {daysOverdue} ngày
                  </td>
                </tr>
              ))}
              {upcomingMachines.map(({ machine, daysLeft }) => (
                <tr key={machine.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 font-mono">{machine.code}</td>
                  <td className="px-5 py-2">{machine.name}</td>
                  <td className="px-5 py-2 text-right font-semibold text-amber-600">
                    Còn {daysLeft} ngày
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <TechnicianChartLazy technicianStats={technicianStats} />
      </div>
    </div>
  );
}
