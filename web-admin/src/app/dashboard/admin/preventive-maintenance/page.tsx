import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { Wrench, Calendar, Plus, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export default async function PreventiveMaintenancePage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const sampleSchedules = [
    {
      id: "PM-001",
      machineCode: "MC-CUT-01",
      machineName: "Máy Chặt Tự Động Atom 1",
      title: "Bảo trì định kỳ hàng tháng & tra dầu định hình",
      frequency: "Hàng tháng",
      nextDueDate: "2026-08-15",
      status: "CHỜ THỰC HIỆN",
      assignedTo: "Nguyễn Văn Bảo (Kỹ thuật)",
    },
    {
      id: "PM-002",
      machineCode: "MC-STITCH-05",
      machineName: "Máy Lập Trình May Brother 2",
      title: "Vệ sinh ổ chao, kiểm tra căng chỉ & sensor",
      frequency: "Hàng tuần",
      nextDueDate: "2026-08-10",
      status: "ĐÃ HOÀN THÀNH",
      assignedTo: "Trần Quốc Huy (Kỹ thuật)",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Wrench className="w-7 h-7 text-blue-400" />
            <span>Quản Lý Lập Lịch Bảo Trì Định Kỳ (Preventive Maintenance)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lập kế hoạch phòng ngừa sự cố MMTB, tự động nhắc nhở lịch tra dầu và kiểm tra kỹ thuật định kỳ nhà máy.
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all">
          <Plus className="w-4 h-4" />
          <span>TẠO LỊCH BẢO TRÌ MỚI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleSchedules.map((schedule) => (
          <div key={schedule.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-blue-400 font-bold">
                  {schedule.machineCode}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{schedule.machineName}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  schedule.status === "ĐÃ HOÀN THÀNH"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}
              >
                {schedule.status}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-medium bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {schedule.title}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Chu kỳ: {schedule.frequency}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Hạn chót: {schedule.nextDueDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Phụ trách: <strong className="text-white">{schedule.assignedTo}</strong></span>
              <button className="text-blue-400 hover:text-blue-300 font-semibold underline">Chi tiết checklist</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
