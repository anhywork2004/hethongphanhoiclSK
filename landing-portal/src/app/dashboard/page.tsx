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
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { count, eq } from "drizzle-orm";

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

  return (
    <div className="space-y-6 text-slate-900 font-sans antialiased">
      
      {/* MAIN WORKSPACE TOP HEADER & TOOLBAR (Matching Image 2) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Workspace Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Thư Viện Cải Tiến & Báo Cáo CLSK
              </h1>
              <p className="text-xs text-slate-400">
                Sáng kiến 2-Hour Fast Feedback Loop • Nhà máy TBS Skechers Kiên Giang 1
              </p>
            </div>
          </div>

          {/* Action Control Buttons (Matching Image 2 Top Right) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-1.5 shadow">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới</span>
              </button>
              <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors">
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Refresh Button */}
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Làm mới</span>
            </Link>

            {/* Primary Action Button (+ Đăng ký / Báo cáo) */}
            <Link
              href="/dashboard/report"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-900/40 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Đăng ký báo cáo</span>
            </Link>

            {/* Export Excel Button */}
            <a
              href="/api/admin/export"
              className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800/60 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </a>
          </div>
        </div>

        {/* QUICK FILTER PILLS BAR (Matching Image 2 Exactly) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5 text-xs font-medium">
          
          {/* Tất cả loại Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#b8860b]/20 text-amber-300 border border-[#b8860b]/40 font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Tất cả loại</span>
          </button>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Danh mục Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Danh mục</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Khu vực Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Khu vực</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Nhóm SP Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>Nhóm SP</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Tháng/Năm Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tháng/Năm</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Mới nhất Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mới nhất</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Reset Pill */}
          <button className="px-3 py-2 rounded-full bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

        </div>

        {/* COUNTER SUMMARY BAR (Matching Image 2) */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center space-x-6 text-xs text-slate-400 font-semibold">
          <div className="flex items-center space-x-1.5">
            <Folder className="w-3.5 h-3.5 text-blue-400" />
            <span>Tổng: <strong className="text-white">{stats.total}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã lọc: <strong className="text-white">{stats.total}</strong></span>
          </div>
        </div>

      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/categories/cho_xu_ly"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-amber-400">{stats.cho_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
            Chờ Xử Lý (15 Phút)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cảnh báo Zalo OA đã khởi tạo</p>
        </Link>

        <Link
          href="/dashboard/categories/dang_xu_ly"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-blue-400">{stats.dang_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
            Đang Xử Lý (2 Giờ)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Đang phân tích nguyên nhân 4M+1E</p>
        </Link>

        <Link
          href="/dashboard/categories/da_xu_ly"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-emerald-400">{stats.da_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
            Đã Xử Lý Xong
          </h3>
          <p className="text-xs text-slate-400 mt-1">Đã phê duyệt QA & khôi phục chuyền</p>
        </Link>

        <Link
          href="/dashboard/report"
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 to-indigo-950/60 border border-blue-700/50 hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-3 text-sm font-black text-white group-hover:text-blue-300 transition-colors">
            + Báo Cáo Phiếu Mới
          </h3>
          <p className="text-xs text-blue-300/80 mt-1">Nhập lỗi sản phẩm trực tiếp</p>
        </Link>
      </div>

      {/* QUICK SHORTCUT CARDS */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Factory className="w-4 h-4 text-blue-400" />
          <span>Hệ Thống Quản Lý CLSK Skechers Kiên Giang 1</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/logs"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Nhật Ký Sửa Chữa</div>
              <div className="text-[11px] text-slate-500">Tra cứu lịch sử bảo trì</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </Link>

          <Link
            href="/dashboard/training"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Thư Viện & Đào Tạo</div>
              <div className="text-[11px] text-slate-500">Tài liệu tiêu chuẩn 4M+1E</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href="/dashboard/bi"
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">BI Analytics Sếp Tổng</div>
              <div className="text-[11px] text-slate-500">Báo cáo & Xuất Excel</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>
        </div>
      </div>

    </div>
  );
}
