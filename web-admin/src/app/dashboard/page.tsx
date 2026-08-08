import Link from "next/link";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { PlusCircle, Clock, ShieldAlert, CheckCircle2, Factory, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/80 border border-blue-800/40 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-4">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Sáng Kiến "2-Hour Fast Feedback Loop"</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Xin chào, {user?.fullName || user?.mnv || "Cán bộ CLSK"}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            {user?.department} • Chức vụ: {user?.position || "Cán bộ sản xuất"}. Chào mừng bạn đến với hệ thống phản hồi chất lượng 2 giờ của Nhà máy TBS Skechers Kiên Giang 1.
          </p>

          <div className="mt-6 flex items-center space-x-4">
            <Link
              href="/dashboard/report"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Phiếu Báo Cáo Lỗi</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of quick info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">15 Phút Phản Hồi Ban Đầu</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Các role nhóm 15 phút (Trưởng line, Tổ trưởng, QA, Kỹ sư Công nghệ) nhận được thông báo khoanh vùng sự cố ngay khi phiếu gửi thành công.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">2 Giờ Khắc Phục Lỗi</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quy trình khoanh vùng sản phẩm bị ảnh hưởng, xác minh nguyên nhân 4M+1E và bàn giao bảo trì xử lý tức thì.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Lưu Trữ Ảnh R2 Minh Chứng</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mọi phiếu báo lỗi đều đính kèm minh chứng hình ảnh tải trực tiếp lên Cloudflare R2, lưu vết rõ ràng trên database D1.
          </p>
        </div>
      </div>

      {/* Direct Shortcuts */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <Factory className="w-4 h-4 text-blue-400" />
          <span>Lối Tắt Thao Tác Nhanh</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/report"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Form Báo Cáo Lỗi</div>
              <div className="text-xs text-slate-500">Tạo phiếu CLSK mới</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </Link>

          <Link
            href="/dashboard/categories/cho_xu_ly"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Phiếu Chưa Xử Lý</div>
              <div className="text-xs text-slate-500">Xem danh sách chờ</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>

          <Link
            href="/dashboard/logs"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Nhật Ký Sửa Chữa</div>
              <div className="text-xs text-slate-500">Lịch sử khắc phục</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            href="/dashboard/bi"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">BI Tổng Quan</div>
              <div className="text-xs text-slate-500">Báo cáo chỉ số</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
