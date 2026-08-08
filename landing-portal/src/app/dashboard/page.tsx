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
    <div className="space-y-6 text-slate-900 font-sans antialiased">
      
      {/* MAIN WORKSPACE TOP HEADER & TOOLBAR (Clean White Background & Green Tone) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          {/* Workspace Title & Official TBS Logo */}
          <div className="flex items-center space-x-3.5">
            <TBSMark size={44} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight flex items-center gap-2 font-serif-luxury">
                Thư Viện Cải Tiến & Báo Cáo CLSK
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sáng kiến 2-Hour Fast Feedback Loop • Nhà máy TBS Group Kiên Giang 1
              </p>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
              <button className="px-3.5 py-1.5 rounded-xl bg-[#004724] text-white font-bold flex items-center gap-1.5 shadow-xs">
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
              <span>+ Đăng ký báo cáo</span>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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

        {/* COUNTER SUMMARY BAR */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center space-x-6 text-xs text-slate-600 font-bold relative z-10">
          <div className="flex items-center space-x-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-600" />
            <span>Tổng: <strong className="text-slate-900">{stats.total}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã lọc: <strong className="text-slate-900">{stats.total}</strong></span>
          </div>
        </div>

      </div>

      {/* QUICK STATS CARDS (Clean White & Green Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/categories/cho_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-amber-600">{stats.cho_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
            Chờ Xử Lý (15 Phút)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Cảnh báo Zalo OA đã khởi tạo</p>
        </Link>

        <Link
          href="/dashboard/categories/dang_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-blue-600">{stats.dang_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Đang Xử Lý (2 Giờ)
          </h3>
          <p className="text-xs text-slate-500 mt-1">Đang phân tích nguyên nhân 4M+1E</p>
        </Link>

        <Link
          href="/dashboard/categories/da_xu_ly"
          className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-emerald-700">{stats.da_xu_ly}</span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Đã Xử Lý Xong
          </h3>
          <p className="text-xs text-slate-500 mt-1">Đã phê duyệt QA & khôi phục chuyền</p>
        </Link>

        <Link
          href="/dashboard/report"
          className="p-5 rounded-3xl bg-gradient-to-br from-[#004724] to-[#07361e] border border-emerald-800 text-white transition-all group shadow-md hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#004724] shadow-xs">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-3 text-sm font-black text-white transition-colors">
            + Báo Cáo Phiếu Mới
          </h3>
          <p className="text-xs text-emerald-200/80 mt-1">Nhập lỗi sản phẩm trực tiếp</p>
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
            href="/dashboard/training"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex items-center justify-between group transition-all"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#004724] transition-colors">Thư Viện & Đào Tạo</div>
              <div className="text-[11px] text-slate-500">Tài liệu tiêu chuẩn 4M+1E</div>
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
