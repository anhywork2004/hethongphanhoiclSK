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

const STATUS_COLORS: Record<string, string> = {
  REPORTED: "#F59E0B",
  INVESTIGATING: "#3B82F6",
  ROOT_CAUSE_FOUND: "#8B5CF6",
  ASSIGNED: "#06B6D4",
  IN_PROGRESS: "#EC4899",
  DONE: "#10B981",
};

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

export default function ReportsCharts({
  issuesByStatus,
  issuesByDay,
  issuesByArea,
}: {
  issuesByStatus: { status: string; statusLabel: string; count: number }[];
  issuesByDay: { date: string; count: number }[];
  issuesByArea: { area: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <ChartCard title="Trạng thái phiếu sự cố" color="#16A34A">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={issuesByStatus}
              dataKey="count"
              nameKey="statusLabel"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
            >
              {issuesByStatus.map((entry, i) => (
                <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94A3B8"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={`Sự cố phát sinh theo ngày (${issuesByDay.length} ngày gần nhất)`}
        color="#2563EB"
      >
        <ResponsiveContainer>
          <LineChart data={issuesByDay}>
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

      <ChartCard title="Số lượng sự cố theo khu vực / phân xưởng" color="#9333EA" wide>
        {issuesByArea.length === 0 ? (
          <p className="text-sm text-slate-400">Không có dữ liệu</p>
        ) : (
          <ResponsiveContainer>
            <BarChart data={issuesByArea} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="area" width={140} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Số sự cố" radius={[0, 6, 6, 0]}>
                {issuesByArea.map((_, i) => (
                  <Cell key={i} fill="#9333EA" fillOpacity={1 - i * 0.1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

export function TechnicianChart({
  data,
}: {
  data: { technician: string; count: number }[];
}) {
  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="technician" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" name="Số công việc" />
      </BarChart>
    </ResponsiveContainer>
  );
}

