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
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { TBSMark } from "@/components/brand-logo";

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
    <div className="space-y-6 text-emerald-950 font-sans antialiased">
      
      {/* MAIN WORKSPACE TOP HEADER & TOOLBAR (TBS Green Theme) */}
      <div className="bg-[#0b2419] border border-emerald-800/60 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          {/* Workspace Title & Logo */}
          <div className="flex items-center space-x-3.5">
            <TBSMark size={44} className="ring-2 ring-emerald-500/30" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-serif-luxury">
                Thư Viện Cải Tiến & Báo Cáo CLSK
              </h1>
              <p className="text-xs text-emerald-300/80 mt-0.5 font-medium">
                Sáng kiến 2-Hour Fast Feedback Loop • Nhà máy TBS Group Kiên Giang 1
              </p>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#05160f] p-1 rounded-2xl border border-emerald-900 text-xs">
              <button className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lưới</span>
              </button>
              <button className="px-3.5 py-1.5 rounded-xl text-emerald-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors">
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Refresh Button */}
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-2xl bg-[#0e3323] hover:bg-[#154530] text-emerald-200 text-xs font-semibold border border-emerald-700/60 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Làm mới</span>
            </Link>

            {/* Primary Action Button (+ Đăng ký báo cáo - Bright TBS Green) */}
            <Link
              href="/dashboard/report"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8dc63f] to-[#5b9627] hover:from-[#7ab332] hover:to-[#4d8220] text-[#061812] text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Đăng ký báo cáo</span>
            </Link>

            {/* Export Excel Button */}
            <a
              href="/api/admin/export"
              className="px-3.5 py-2 rounded-2xl bg-[#061810] hover:bg-emerald-950 text-[#8dc63f] text-xs font-bold border border-emerald-800/80 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#8dc63f]" />
              <span>Excel</span>
            </a>
          </div>
        </div>

        {/* QUICK FILTER PILLS BAR */}
        <div className="mt-5 pt-4 border-t border-emerald-900/60 flex flex-wrap items-center gap-2.5 text-xs font-semibold relative z-10">
          
          {/* Tất cả loại Pill */}
          <button className="px-4 py-2 rounded-full bg-[#8dc63f]/20 text-[#8dc63f] border border-[#8dc63f]/40 font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#8dc63f]" />
            <span>Tất cả loại</span>
          </button>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-[#061810] border border-emerald-800/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Danh mục Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-colors">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Danh mục</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Khu vực Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-colors">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>Khu vực</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Nhóm SP Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-colors">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>Nhóm SP</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Tháng/Năm Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tháng/Năm</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Mới nhất Dropdown Pill */}
          <button className="px-3.5 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:border-emerald-700 text-emerald-200 flex items-center gap-1.5 transition-colors">
            <Clock className="w-3.5 h-3.5 text-[#8dc63f]" />
            <span>Mới nhất</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Reset Pill */}
          <button className="px-3 py-2 rounded-full bg-[#061810] border border-emerald-800/80 hover:bg-emerald-950 text-emerald-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

        </div>

        {/* COUNTER SUMMARY BAR */}
        <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center space-x-6 text-xs text-emerald-300 font-bold relative z-10">
          <div className="flex items-center space-x-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Tổng: <strong className="text-white">{stats.total}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8dc63f]" />
            <span>Đã lọc: <strong className="text-white">{stats.total}</strong></span>
          </div>
        </div>

      </div>

      {/* QUICK STATS CARDS (Clean TBS Green Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/categories/cho_xu_ly"
          className="p-5 rounded-3xl bg-[#0b2419] border border-emerald-800/60 hover:border-amber-500/60 transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-amber-400">{stats.cho_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
            Chờ Xử Lý (15 Phút)
          </h3>
          <p className="text-xs text-emerald-300/70 mt-1">Cảnh báo Zalo OA đã khởi tạo</p>
        </Link>

        <Link
          href="/dashboard/categories/dang_xu_ly"
          className="p-5 rounded-3xl bg-[#0b2419] border border-emerald-800/60 hover:border-blue-500/60 transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-blue-400">{stats.dang_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
            Đang Xử Lý (2 Giờ)
          </h3>
          <p className="text-xs text-emerald-300/70 mt-1">Đang phân tích nguyên nhân 4M+1E</p>
        </Link>

        <Link
          href="/dashboard/categories/da_xu_ly"
          className="p-5 rounded-3xl bg-[#0b2419] border border-emerald-800/60 hover:border-[#8dc63f]/60 transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-[#8dc63f]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[#8dc63f]">{stats.da_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-white group-hover:text-[#8dc63f] transition-colors">
            Đã Xử Lý Xong
          </h3>
          <p className="text-xs text-emerald-300/70 mt-1">Đã phê duyệt QA & khôi phục chuyền</p>
        </Link>

        <Link
          href="/dashboard/report"
          className="p-5 rounded-3xl bg-gradient-to-br from-[#16422f] to-[#0e2c1f] border border-emerald-500/40 hover:border-[#8dc63f] transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#8dc63f] flex items-center justify-center text-[#061812] shadow-md">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <ArrowRight className="w-5 h-5 text-[#8dc63f] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-3 text-sm font-black text-white group-hover:text-[#8dc63f] transition-colors">
            + Báo Cáo Phiếu Mới
          </h3>
          <p className="text-xs text-emerald-200/80 mt-1">Nhập lỗi sản phẩm trực tiếp</p>
        </Link>
      </div>

      {/* QUICK SHORTCUT CARDS */}
      <div className="p-6 rounded-3xl bg-[#0b2419] border border-emerald-800/60 text-white shadow-xl">
        <h3 className="text-sm font-extrabold text-white mb-4 flex items-center space-x-2">
          <Factory className="w-4 h-4 text-[#8dc63f]" />
          <span>Hệ Thống Quản Lý CLSK TBS Group Kiên Giang 1</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/logs"
            className="p-4 rounded-2xl bg-[#061810] border border-emerald-800/60 hover:border-emerald-500 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#8dc63f] transition-colors">Nhật Ký Sửa Chữa</div>
              <div className="text-[11px] text-emerald-400/80">Tra cứu lịch sử bảo trì</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-[#8dc63f] transition-colors" />
          </Link>

          <Link
            href="/dashboard/training"
            className="p-4 rounded-2xl bg-[#061810] border border-emerald-800/60 hover:border-emerald-500 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#8dc63f] transition-colors">Thư Viện & Đào Tạo</div>
              <div className="text-[11px] text-emerald-400/80">Tài liệu tiêu chuẩn 4M+1E</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-[#8dc63f] transition-colors" />
          </Link>

          <Link
            href="/dashboard/bi"
            className="p-4 rounded-2xl bg-[#061810] border border-emerald-800/60 hover:border-emerald-500 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#8dc63f] transition-colors">BI Analytics Sếp Tổng</div>
              <div className="text-[11px] text-emerald-400/80">Báo cáo & Xuất Excel</div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-[#8dc63f] transition-colors" />
          </Link>
        </div>
      </div>

    </div>
  );
}
