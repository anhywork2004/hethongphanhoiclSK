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
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  UploadCloud,
  LayoutDashboard,
  Filter,
  Trophy,
  Archive,
  Building,
  Tag,
  Users,
  Sliders,
  MessageSquare,
  Ruler,
  Wrench,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);

  // Role check
  const biRoles = ["truong_phong_ban", "giam_doc", "tong_giam_doc", "admin"];
  const canViewBI = user.role ? biRoles.includes(user.role) : false;

  return (
    <aside
      className={`bg-[#0b162c] text-slate-200 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 font-sans z-40 select-none transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* BRANDING HEADER (Matching Image 2) */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1b5238]">
              <path d="M20,50 Q40,20 80,30 Q60,80 20,50 Z" />
              <path d="M30,65 Q50,35 85,45" stroke="#8dc63f" strokeWidth="6" fill="none" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-white tracking-wider truncate">
                TBS GROUP
              </div>
              <div className="text-[10px] font-bold text-blue-400 tracking-wider truncate uppercase">
                SKECHERS KG1
              </div>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* NAVIGATION CONTENT */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* MAIN MENU SECTION (Matching Image 2) */}
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              MENU
            </div>
          )}
          <div className="space-y-1">
            {/* Thư viện (Active Warm Gold Pill as in Image 2) */}
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === "/dashboard"
                  ? "bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white shadow-lg shadow-amber-900/30"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <FolderKanban className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Thư viện</span>}
            </Link>

            {/* Đăng tải / Báo cáo */}
            <Link
              href="/dashboard/report"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === "/dashboard/report"
                  ? "bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white shadow-lg shadow-amber-900/30"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Đăng tải</span>}
            </Link>

            {/* Dashboard BI */}
            {canViewBI && (
              <Link
                href="/dashboard/bi"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/dashboard/bi"
                    ? "bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white shadow-lg shadow-amber-900/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            )}
          </div>
        </div>

        {/* LỌC NHANH SECTION (Matching Image 2) */}
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              LỌC NHANH
            </div>
          )}
          <div className="space-y-1">
            
            {/* Loại đăng ký */}
            <div className="px-3 py-2 text-xs font-medium text-slate-400 flex items-center justify-between hover:text-slate-200 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <Filter className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>Loại đăng ký</span>}
              </div>
              {!collapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>

            {/* Thi đua */}
            <Link
              href="/dashboard/categories/thi_dua"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/40"
            >
              <div className="flex items-center space-x-2.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {!collapsed && <span>Thi đua</span>}
              </div>
              {!collapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  0
                </span>
              )}
            </Link>

            {/* Đã đánh giá */}
            <Link
              href="/dashboard/categories/da_xu_ly"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/40"
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {!collapsed && <span>Đã đánh giá</span>}
              </div>
              {!collapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  {counts.da_xu_ly}
                </span>
              )}
            </Link>

            {/* Chờ đánh giá */}
            <Link
              href="/dashboard/categories/cho_xu_ly"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/40"
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {!collapsed && <span>Chờ đánh giá</span>}
              </div>
              {!collapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {counts.cho_xu_ly}
                </span>
              )}
            </Link>

            {/* Lưu trữ */}
            <Link
              href="/dashboard/categories/khong_the_xu_ly"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/40"
            >
              <div className="flex items-center space-x-2.5">
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                {!collapsed && <span>Lưu trữ</span>}
              </div>
              {!collapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400">
                  {counts.khong_the_xu_ly}
                </span>
              )}
            </Link>

            {/* Khu vực */}
            <div className="px-3 py-2 text-xs font-medium text-slate-400 flex items-center justify-between hover:text-slate-200 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <Building className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>Khu vực</span>}
              </div>
              {!collapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>

            {/* Phân loại */}
            <div className="px-3 py-2 text-xs font-medium text-slate-400 flex items-center justify-between hover:text-slate-200 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <Tag className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>Phân loại</span>}
              </div>
              {!collapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </div>
          </div>
        </div>

        {/* QUẢN TRỊ SECTION (For Admin / Managers) */}
        {user.role === "admin" && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                QUẢN TRỊ
              </div>
            )}
            <div className="space-y-1">
              <Link
                href="/dashboard/admin/cms-settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                {!collapsed && <span>Cấu hình CMS</span>}
              </Link>
              <Link
                href="/dashboard/admin/zalo"
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                {!collapsed && <span>Zalo OA & Group</span>}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* USER PROFILE FOOTER (Matching Image 2) */}
      <div className="p-3 border-t border-slate-800/80 bg-[#081022]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <User className="w-4 h-4 text-blue-300" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {user.fullName || user.mnv || "Capybara Admin"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user.position || "Quản trị hệ thống"}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
