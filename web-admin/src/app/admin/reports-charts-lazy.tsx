"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type ReportsChartsType from "./reports-charts";
import type { TechnicianChart as TechnicianChartType } from "./reports-charts";

// Tải recharts (thư viện nặng) hoàn toàn phía trình duyệt, không đưa vào bundle server/Worker.
const ReportsCharts = dynamic(() => import("./reports-charts"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      Đang tải biểu đồ...
    </div>
  ),
});

const TechnicianChart = dynamic(() => import("./reports-charts").then((m) => m.TechnicianChart), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      Đang tải biểu đồ...
    </div>
  ),
});

export default function ReportsChartsLazy(props: ComponentProps<typeof ReportsChartsType>) {
  return <ReportsCharts {...props} />;
}

export function TechnicianChartLazy(props: ComponentProps<typeof TechnicianChartType>) {
  return <TechnicianChart {...props} />;
}
