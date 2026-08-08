"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  targetMinutes: number; // 15 or 120
  createdTimeStr?: string;
  label?: string;
}

export function CountdownTimer({ targetMinutes, createdTimeStr, label }: CountdownTimerProps) {
  const [timeLeftSec, setTimeLeftSec] = useState<number>(targetMinutes * 60);

  useEffect(() => {
    const createdTime = createdTimeStr ? new Date(createdTimeStr).getTime() : Date.now();
    const deadlineTime = createdTime + targetMinutes * 60 * 1000;

    const updateTimer = () => {
      const remainingSec = Math.max(0, Math.floor((deadlineTime - Date.now()) / 1000));
      setTimeLeftSec(remainingSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetMinutes, createdTimeStr]);

  const mins = Math.floor(timeLeftSec / 60);
  const secs = timeLeftSec % 60;
  const isUrgent = mins < 5;
  const isExpired = timeLeftSec === 0;

  const totalSec = targetMinutes * 60;
  const percentage = Math.min(100, Math.max(0, (timeLeftSec / totalSec) * 100));

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
      <div className="relative flex items-center justify-center w-5 h-5">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
        ) : (
          <Clock className="w-4 h-4 text-[#004724]" />
        )}
      </div>

      <div className="flex items-center space-x-1 font-mono text-xs font-black">
        {label && <span className="text-[10px] text-slate-500 font-sans font-bold uppercase">{label}:</span>}
        <span className={isExpired ? "text-rose-600 font-bold" : isUrgent ? "text-rose-600 font-bold" : "text-[#004724]"}>
          {isExpired ? "EXPIRED" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
        <div
          className={`h-full transition-all duration-500 ${
            isUrgent ? "bg-rose-500" : mins < targetMinutes / 2 ? "bg-amber-500" : "bg-[#004724]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
