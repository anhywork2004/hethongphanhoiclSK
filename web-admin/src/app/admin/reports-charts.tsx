"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PARETO_COLORS = ["#EF4444", "#F97316", "#EAB308", "#3B82F6", "#8B5CF6", "#6B7280", "#EC4899", "#10B981"];

function ChartCard({
  title,
  color,
  wide,
  height = 280,
  children,
}: {
  title: string;
  color: string;
  wide?: boolean;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ${wide ? "lg:col-span-2" : ""}`}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold" style={{ color }}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h2>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

function availabilityColor(value: number) {
  if (value >= 95) return "#10B981";
  if (value >= 90) return "#F59E0B";
  return "#EF4444";
}

export default function ReportsCharts({
  machinesByStatus,
  incidentsByDay,
  incidentsByCategory,
  availabilityByArea,
}: {
  machinesByStatus: { status: string; count: number; colorHex: string }[];
  incidentsByDay: { date: string; count: number }[];
  incidentsByCategory: { category: string; count: number }[];
  availabilityByArea: { area: string; availability: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ChartCard title="Tình trạng thiết bị" color="#16A34A">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={machinesByStatus}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
            >
              {machinesByStatus.map((entry, i) => (
                <Cell key={i} fill={entry.colorHex} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={`Sự cố phát sinh theo ngày (${incidentsByDay.length} ngày gần nhất)`}
        color="#2563EB"
      >
        <ResponsiveContainer>
          <LineChart data={incidentsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2563EB" }}
              name="Số sự cố"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tỷ lệ máy hoạt động ổn định theo khu vực / xưởng" color="#9333EA">
        {availabilityByArea.length === 0 ? (
          <p className="text-sm text-slate-400">Không có dữ liệu</p>
        ) : (
          <ResponsiveContainer>
            <BarChart data={availabilityByArea} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
              <YAxis type="category" dataKey="area" width={120} fontSize={11} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Bar dataKey="availability" name="Availability" radius={[0, 6, 6, 0]}>
                {availabilityByArea.map((a, i) => (
                  <Cell key={i} fill={availabilityColor(a.availability)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Top nhóm/danh mục hư hỏng phổ biến" color="#E11D48">
        <ResponsiveContainer>
          <BarChart data={incidentsByCategory} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" allowDecimals={false} fontSize={12} />
            <YAxis type="category" dataKey="category" width={160} fontSize={11} />
            <Tooltip />
            <Bar dataKey="count" name="Số sự cố" radius={[0, 6, 6, 0]}>
              {incidentsByCategory.map((_, i) => (
                <Cell key={i} fill={PARETO_COLORS[i % PARETO_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}

function TechnicianTick({
  x,
  y,
  payload,
  stats,
}: {
  x?: string | number;
  y?: string | number;
  payload?: { value: string };
  stats: { name: string; repairs: number; avgRating: number }[];
}) {
  const stat = stats.find((t) => t.name === payload?.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={-3} textAnchor="end" fontSize={15} fontWeight={700} fill="#1e293b">
        {payload?.value}
      </text>
      <text x={0} y={15} textAnchor="end" fontSize={13} fill="#D97706">
        {stat && stat.avgRating > 0 ? `⭐ ${stat.avgRating.toFixed(1)}` : "Chưa có đánh giá"}
      </text>
    </g>
  );
}

export function TechnicianChart({
  technicianStats,
}: {
  technicianStats: { name: string; repairs: number; avgRating: number }[];
}) {
  const top5 = technicianStats.slice(0, 5);
  return (
    <ChartCard title="Top 5 nhân viên bảo trì sửa nhiều nhất" color="#0891B2" height={320}>
      {top5.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có dữ liệu sửa chữa</p>
      ) : (
        <ResponsiveContainer>
          <BarChart data={top5} layout="vertical" margin={{ left: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" allowDecimals={false} fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={(props) => <TechnicianTick {...props} stats={top5} />}
            />
            <Tooltip formatter={(v) => [`${v}`, "Số lượt sửa"]} />
            <Bar dataKey="repairs" name="Số lượt sửa" fill="#0891B2" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
