import Link from "next/link";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import {
  PlusCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Factory,
  ArrowRight,
  LayoutGrid,
  List,
  RefreshCw,
  FileSpreadsheet,
  Search,
  ChevronDown,
  Trophy,
  Folder,
  Building,
  Package,
  Calendar,
  RotateCcw,
  BookOpen,
  Filter,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { TBSMark } from "@/components/brand-logo";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";

async function getDashboardStats() {
  let stats = { total: 0, cho_xu_ly: 0, dang_xu_ly: 0, da_xu_ly: 0 };
  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      const db = getDb(d1);
      const totalRes = await db.select({ value: count() }).from(issues);
      const choRes = await db.select({ value: count() }).from(issues).where(eq(issues.status, "cho_xu_ly"));
      const dangRes = await db.select({ value: count() }).from(issues).where(eq(issues.status, "dang_xu_ly"));
      const daRes = await db.select({ value: count() }).from(issues).where(eq(issues.status, "da_xu_ly"));

      stats.total = totalRes[0]?.value || 0;
      stats.cho_xu_ly = choRes[0]?.value || 0;
      stats.dang_xu_ly = dangRes[0]?.value || 0;
      stats.da_xu_ly = daRes[0]?.value || 0;
    }
  } catch {
    // Offline fallback
  }
  return stats;
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;
  const stats = await getDashboardStats();

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Buổi sáng vui vẻ" : hour < 18 ? "Buổi chiều năng lượng" : "Buổi tối an lành";
  const userNameDisplay = user?.fullName || user?.mnv || "Cán Bộ CLSK";

  return (
    <div className="space-y-6 text-slate-900 font-sans antialiased">
      
      {/* 1. PERSONALIZED HUMAN GREETING HEADER */}
      <div className="bg-gradient-to-r from-[#004724] via-[#0b5c32] to-[#16422f] rounded-3xl p-6 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <TBSMark size={48} className="ring-2 ring-emerald-400/40 rounded-2xl bg-white p-1" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {timeGreeting},
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 text-[10px] font-bold border border-emerald-500/40">
                MNV: {user?.mnv || "NV001"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif-luxury mt-0.5">
              {userNameDisplay} 👋
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 font-medium max-w-xl">
              &ldquo;Chúc bạn và Phân xưởng {user?.department || "Sản xuất"} một ca làm việc an toàn, đạt tiêu chuẩn 100% CLSK!&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
              2-HOUR FAST FEEDBACK
            </div>
            <div className="text-xs font-extrabold text-white">
              Quy trình 15p Cảnh Báo & 2h Xử Lý
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-[#8dc63f]" />
        </div>
      </div>

      {/* 2. MAIN WORKSPACE TOOLBAR & TAB "VIỆC CỦA TÔI" */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          {/* Tabs: Tất cả sự cố vs Việc của tôi */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button className="px-4 py-2 rounded-xl bg-[#004724] text-white font-bold text-xs flex items-center space-x-2 shadow-xs">
              <Folder className="w-3.5 h-3.5" />
              <span>Tất cả sự cố ({stats.total})</span>
            </button>
            <button className="px-4 py-2 rounded-xl text-slate-700 hover:text-[#004724] font-bold text-xs flex items-center space-x-2 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-[#004724]" />
              <span>Việc của tôi</span>
            </button>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button className="px-3.5 py-1.5 rounded-xl bg-white text-[#004724] font-extrabold flex items-center gap-1.5 shadow-xs">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới</span>
              </button>
              <button className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors">
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Refresh Button */}
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Làm mới</span>
            </Link>

            {/* Primary Action Button (+ Đăng ký báo cáo - TBS Corporate Green) */}
            <Link
              href="/dashboard/report"
              className="px-5 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ BÁO CÁO VẤN ĐỀ</span>
            </Link>

            {/* Export Excel Button */}
            <a
              href="/api/admin/export"
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#004724] text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#004724]" />
              <span>Excel</span>
            </a>
          </div>
        </div>

        {/* QUICK FILTER PILLS BAR */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5 text-xs font-semibold relative z-10">
          
          {/* Tất cả loại Pill */}
          <button className="px-4 py-2 rounded-full bg-emerald-100 text-[#004724] border border-emerald-300 font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#004724]" />
            <span>Tất cả loại</span>
          </button>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Danh mục Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors">
            <Folder className="w-3.5 h-3.5 text-amber-600" />
            <span>Danh mục</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Khu vực Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khu vực</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Nhóm SP Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span>Nhóm SP</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Tháng/Năm Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tháng/Năm</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Mới nhất Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 flex items-center gap-1.5 transition-colors">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mới nhất</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Reset Pill */}
          <button className="px-3 py-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

        </div>
      </div>

      {/* 3. QUICK STATS CARDS & VISUAL COUNTDOWN TIMERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/categories/cho_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 transition-all group shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-amber-600">{stats.cho_xu_ly}</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Chờ Xử Lý (15 Phút)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cảnh báo Zalo OA đã khởi tạo</p>
          </div>

          {/* Visual 15m Countdown Timer Badge */}
          <div className="pt-1">
            <CountdownTimer targetMinutes={15} label="Thời gian Zalo" />
          </div>
        </Link>

        <Link
          href="/dashboard/categories/dang_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 transition-all group shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-blue-600">{stats.dang_xu_ly}</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Đang Xử Lý (2 Giờ)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Phân tích nguyên nhân 4M+1E</p>
          </div>

          {/* Visual 2h Countdown Timer Badge */}
          <div className="pt-1">
            <CountdownTimer targetMinutes={120} label="Thời gian 4M+1E" />
          </div>
        </Link>

        <Link
          href="/dashboard/categories/da_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 transition-all group shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-emerald-700">{stats.da_xu_ly}</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Đã Xử Lý Xong
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Đã phê duyệt QA & khôi phục chuyền</p>
          </div>

          <div className="pt-1 inline-flex items-center space-x-1.5 text-xs text-[#004724] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đạt chuẩn CLSK</span>
          </div>
        </Link>

        <Link
          href="/dashboard/report"
          className="p-5 rounded-3xl bg-gradient-to-br from-[#004724] to-[#07361e] border border-emerald-800 text-white transition-all group shadow-md hover:scale-[1.02] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#004724] shadow-xs">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </div>

          <div>
            <h3 className="text-sm font-black text-white transition-colors">
              + Báo Cáo Phiếu Mới
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">Nhập lỗi sản phẩm 1-Touch</p>
          </div>

          <div className="pt-2 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
            Nhanh chóng • Chính xác
          </div>
        </Link>
      </div>

      {/* QUICK SHORTCUT CARDS */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 text-slate-900 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#004724] mb-4 flex items-center space-x-2">
          <Factory className="w-4 h-4 text-[#004724]" />
          <span>Hệ Thống Quản Lý CLSK TBS Group Kiên Giang 1</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/logs"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#004724] transition-colors">Nhật Ký Sửa Chữa</div>
              <div className="text-[11px] text-slate-500">Tra cứu lịch sử bảo trì</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#004724] transition-colors" />
          </Link>

          <Link
            href="/dashboard/inventory"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#004724] transition-colors">Kho Phụ Tùng Linh Kiện</div>
              <div className="text-[11px] text-slate-500">Vật tư sửa chữa thay thế</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#004724] transition-colors" />
          </Link>

          <Link
            href="/dashboard/bi"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#004724] transition-colors">BI Analytics Sếp Tổng</div>
              <div className="text-[11px] text-slate-500">Báo cáo & Xuất Excel</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#004724] transition-colors" />
          </Link>
        </div>
      </div>

    </div>
  );
}
