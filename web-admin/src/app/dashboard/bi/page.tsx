import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { PieChart, BarChart3, TrendingUp, AlertCircle, ShieldCheck, Activity } from "lucide-react";

export default async function BIPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;

  const allowedRoles = ["truong_phong_ban", "giam_doc", "tong_giam_doc", "admin"];
  if (user?.role && !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <PieChart className="w-7 h-7 text-indigo-400" />
            <span>BI Tổng Quan Phân Tích Chất Lượng</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dành cho Trưởng phòng, Giám đốc & Admin • Giám sát các chỉ số phản hồi 2 giờ (Giai đoạn 1 UI Frame).
          </p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold">
          Role: {user?.role || "Manager"}
        </div>
      </div>

      {/* KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Phiếu Ghi Nhận</div>
          <div className="text-3xl font-black text-white">0</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Thời gian trung bình: -- phút</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Đáp Ứng 2 Giờ</div>
          <div className="text-3xl font-black text-blue-400">100%</div>
          <div className="text-[11px] text-blue-300">Cam kết chỉ tiêu nhà máy</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lỗi Cần Phân Công 4M</div>
          <div className="text-3xl font-black text-amber-400">0</div>
          <div className="text-[11px] text-amber-300">Chờ xác minh nguyên nhân</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đóng Lỗi Thành Công</div>
          <div className="text-3xl font-black text-emerald-400">0</div>
          <div className="text-[11px] text-emerald-300">Đã kiểm tra chất lượng</div>
        </div>
      </div>

      {/* BI Frame Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-700 animate-pulse" />
          <h3 className="text-base font-bold text-slate-300">Biểu Đồ Phân Loại Lỗi Theo Phân Xưởng</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Khung biểu đồ phân tích tỷ lệ lỗi giữa xưởng Chặt, May 1, May 2, Gò và Hoàn thiện (Được tích hợp Recharts ở Giai đoạn 2).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
          <Activity className="w-12 h-12 text-slate-700 animate-pulse" />
          <h3 className="text-base font-bold text-slate-300">Xu Hướng Sự Cố Theo Giờ & Ca Sản Xuất</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Khung theo dõi dòng thời gian phát sinh sự cố trong ca làm việc để khoanh vùng sự cố máy móc & công nghệ.
          </p>
        </div>
      </div>
    </div>
  );
}
