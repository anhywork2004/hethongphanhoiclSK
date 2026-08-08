"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  PieChart,
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LogOut,
  Factory,
  Sliders,
  Ruler,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  Wrench,
} from "lucide-react";

interface LeftBarProps {
  user: {
    mnv?: string;
    fullName?: string;
    position?: string;
    department?: string;
    role?: string;
  };
  counts?: {
    cho_xu_ly: number;
    dang_xu_ly: number;
    da_xu_ly: number;
    khong_the_xu_ly: number;
  };
}

export function LeftBar({ user, counts = { cho_xu_ly: 0, dang_xu_ly: 0, da_xu_ly: 0, khong_the_xu_ly: 0 } }: LeftBarProps) {
  const pathname = usePathname();

  // Roles allowed to view BI Overview
  const biRoles = ["truong_phong_ban", "giam_doc", "tong_giam_doc", "admin"];
  const canViewBI = user.role ? biRoles.includes(user.role) : false;

  const roleLabelMap: Record<string, string> = {
    reporter: "Cán Bộ Báo Lỗi",
    truong_line: "Trưởng Line",
    to_truong: "Tổ Trưởng",
    qa: "Chuyên Viên QA",
    cong_nghe: "Kỹ Sư Công Nghệ",
    truong_phong_ban: "Trưởng Phòng Ban",
    nguoi_xu_ly: "Kỹ Thuật / Bảo Trì",
    giam_doc: "Giám Đốc Phân Xưởng",
    tong_giam_doc: "Tổng Giám Đốc",
    admin: "Quản Trị Viên",
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 font-sans z-40 select-none">
      {/* Factory Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Factory className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-tight uppercase leading-none">
            TBS Skechers KG1
          </h1>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block mt-1">
            2-Hour Fast Feedback
          </span>
        </div>
      </div>

      {/* User Info Header Section (Mục 1) */}
      <div className="p-4 m-3 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">
              {user.fullName || user.mnv || "Người Dùng"}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {user.position || "Cán bộ sản xuất"}
            </div>
            <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>{roleLabelMap[user.role || ""] || user.role || "reporter"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Prominent Issue Report CTA (Mục 4) */}
        <div>
          <Link
            href="/dashboard/report"
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all ${
              pathname === "/dashboard/report"
                ? "bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-400"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>BÁO CÁO VẤN ĐỀ</span>
          </Link>
        </div>

        {/* BI Overview (Mục 2 - Role gated) */}
        {canViewBI && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Phân Tích & Báo Cáo
            </div>
            <Link
              href="/dashboard/bi"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === "/dashboard/bi"
                  ? "bg-slate-800 text-blue-400 border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <PieChart className="h-4 w-4 text-indigo-400" />
              <span>BI Tổng quan</span>
            </Link>
          </div>
        )}

        {/* Categories / Phân loại 4 tab đếm số lượng (Mục 3) */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Phân Loại Phiếu Lỗi</span>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard/categories/cho_xu_ly"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.includes("cho_xu_ly")
                  ? "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Chưa xử lý</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-900/80 text-amber-200">
                {counts.cho_xu_ly}
              </span>
            </Link>

            <Link
              href="/dashboard/categories/dang_xu_ly"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.includes("dang_xu_ly")
                  ? "bg-blue-950/60 text-blue-300 border border-blue-800/60"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
                <span>Đang xử lý</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-900/80 text-blue-200">
                {counts.dang_xu_ly}
              </span>
            </Link>

            <Link
              href="/dashboard/categories/da_xu_ly"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.includes("da_xu_ly")
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Đã xử lý</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-900/80 text-emerald-200">
                {counts.da_xu_ly}
              </span>
            </Link>

            <Link
              href="/dashboard/categories/khong_the_xu_ly"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname.includes("khong_the_xu_ly")
                  ? "bg-rose-950/60 text-rose-300 border border-rose-800/60"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Không thể xử lý</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-900/80 text-rose-200">
                {counts.khong_the_xu_ly}
              </span>
            </Link>
          </div>
        </div>

        {/* Repair Logs (Mục 5) */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Nhật Ký & Lịch Sử
          </div>
          <Link
            href="/dashboard/logs"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/dashboard/logs"
                ? "bg-slate-800 text-blue-400 border border-slate-700"
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <span>Nhật ký sửa chữa</span>
          </Link>
          <Link
            href="/dashboard/training"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 ${
              pathname === "/dashboard/training"
                ? "bg-slate-800 text-blue-400 border border-slate-700"
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Thư viện & Đào tạo</span>
          </Link>
        </div>

        {/* Admin Management Tools (If Admin) */}
        {user.role === "admin" && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quản Trị Hệ Thống
            </div>
            <div className="space-y-1">
              <Link
                href="/dashboard/admin/cms-settings"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname.includes("/admin/cms-settings")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-blue-400" />
                <span>CMS Quản Lý Trang Chủ</span>
              </Link>
              <Link
                href="/dashboard/admin/zalo"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname.includes("/admin/zalo")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                <span>Quản lý Zalo OA & Group</span>
              </Link>
              <Link
                href="/dashboard/admin/workshops"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname.includes("/admin/workshops")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                <span>Quản lý Phân xưởng</span>
              </Link>
              <Link
                href="/dashboard/admin/sizes"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname.includes("/admin/sizes")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Ruler className="h-3.5 w-3.5 text-slate-400" />
                <span>Quản lý Bảng Size</span>
              </Link>
              <Link
                href="/dashboard/admin/preventive-maintenance"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname.includes("/admin/preventive-maintenance")
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Wrench className="h-3.5 w-3.5 text-blue-400" />
                <span>Bảo Trì Định Kỳ (Preventive)</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-xs font-semibold transition-all border border-slate-800 hover:border-red-800/50"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
}
