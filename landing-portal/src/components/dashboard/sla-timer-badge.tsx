"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SlaTimerBadgeProps {
  createdAt: string;
  status: string;
}

export function SlaTimerBadge({ createdAt, status }: SlaTimerBadgeProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [timerState, setTimerState] = useState<"normal" | "warning" | "danger" | "completed">("normal");

  useEffect(() => {
    if (status === "da_xu_ly" || status === "khong_the_xu_ly") {
      setTimerState("completed");
      setTimeLeftStr("Đã Đóng");
      return;
    }

    const createdMs = new Date(createdAt).getTime();
    const slaDeadlineMs = createdMs + 2 * 60 * 60 * 1000; // 2 Hours SLA

    const updateTimer = () => {
      const nowMs = Date.now();
      const diffMs = slaDeadlineMs - nowMs;

      if (diffMs <= 0) {
        setTimerState("danger");
        const overdueMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
        setTimeLeftStr(`Quá hạn ${overdueMins}m!`);
      } else {
        const mins = Math.floor(diffMs / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

        if (mins < 30) {
          setTimerState("warning");
        } else {
          setTimerState("normal");
        }
        setTimeLeftStr(`Còn ${formatted}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (timerState === "completed") {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-[11px] font-bold">
        <CheckCircle2 className="w-3 h-3" />
        <span>Đã Đóng</span>
      </span>
    );
  }

  if (timerState === "danger") {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950/90 border border-red-800 text-red-400 text-[11px] font-extrabold animate-pulse">
        <AlertTriangle className="w-3 h-3 text-red-400" />
        <span>{timeLeftStr}</span>
      </span>
    );
  }

  if (timerState === "warning") {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-800 text-amber-300 text-[11px] font-bold">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>{timeLeftStr}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-300 text-[11px] font-semibold">
      <Clock className="w-3 h-3 text-blue-400" />
      <span>{timeLeftStr}</span>
    </span>
  );
}
