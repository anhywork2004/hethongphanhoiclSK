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
  ShieldCheck,
  MessageSquare,
  Sliders,
  Ruler,
  Wrench,
  Factory,
  Tag,
  ChevronDown,
  KeyRound,
} from "lucide-react";
import { useState } from "react";
import { TBSMark } from "@/components/brand-logo";

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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(true);

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
    <aside
      className={`bg-[#091f16] text-emerald-100 border-r border-emerald-900/60 flex flex-col h-screen sticky top-0 font-sans z-40 select-none transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* BRANDING HEADER WITH OFFICIAL TBS LOGO */}
      <div className="p-4 border-b border-emerald-900/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3 min-w-0">
          <TBSMark size={36} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-white tracking-wider truncate">
                TBS GROUP
              </div>
              <div className="text-[10px] font-extrabold text-[#8dc63f] tracking-widest truncate uppercase">
                SKECHERS KG1
              </div>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors border border-emerald-800/40"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* MỤC 1: THÔNG TIN CÁ NHÂN (HIỂN THỊ TRÊN CÙNG theo spec yêu cầu) */}
      <div className="p-3.5 m-3 rounded-2xl bg-[#0e2c20] border border-emerald-500/30 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-emerald-700/40 border border-emerald-400/50 flex items-center justify-center text-emerald-200 font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white truncate">
                {user.fullName || user.mnv || "Cán Bộ CLSK"}
              </div>
              <div className="text-[11px] text-emerald-300/80 truncate mt-0.5">
                {user.position || "Cán bộ sản xuất"}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-[#8dc63f]" />
                  <span>{roleLabelMap[user.role || ""] || user.role || "reporter"}</span>
                </div>
                <Link
                  href="/dashboard/change-password"
                  className="text-[10px] font-extrabold text-[#8dc63f] hover:text-white flex items-center space-x-1 underline decoration-emerald-500/40"
                  title="Đổi mật khẩu tài khoản"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Đổi MK</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION CONTENT */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin scrollbar-thumb-emerald-900">
        
        {/* MỤC 4 TRONG SPEC: NÚT CTA NỔI BẬT BÁO CÁO VẤN ĐỀ (TBS Accent Green) */}
        <div>
          <Link
            href="/dashboard/report"
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
              pathname === "/dashboard/report"
                ? "bg-gradient-to-r from-[#8dc63f] to-[#5b9627] text-[#061812] shadow-emerald-950/80 ring-2 ring-white"
                : "bg-gradient-to-r from-[#8dc63f] to-[#5b9627] hover:from-[#7ab332] hover:to-[#4d8220] text-[#061812] shadow-emerald-950/60 hover:scale-[1.02]"
            }`}
          >
            <PlusCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            {!collapsed && <span>BÁO CÁO VẤN ĐỀ</span>}
          </Link>
        </div>

        {/* MỤC 2 TRONG SPEC: BI TỔNG QUAN (Chỉ role có liên quan mới thấy) */}
        {canViewBI && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                PHÂN TÍCH & BÁO CÁO
              </div>
            )}
            <Link
              href="/dashboard/bi"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                pathname === "/dashboard/bi"
                  ? "bg-emerald-800/80 text-white border border-emerald-600/60 shadow-md"
                  : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
              }`}
            >
              <PieChart className="h-4 w-4 text-[#8dc63f] shrink-0" />
              {!collapsed && <span>BI Tổng quan</span>}
            </Link>
          </div>
        )}

        {/* MỤC 3 TRONG SPEC: PHÂN LOẠI TRẠNG THÁI (GÔM THÀNH DROPDOWN TAG) */}
        <div>
          {/* Dropdown Toggle Header */}
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-emerald-200/90 hover:bg-emerald-900/60 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Tag className="h-4 w-4 text-[#8dc63f] shrink-0" />
              {!collapsed && <span className="truncate">Phân loại trạng thái</span>}
            </div>
            {!collapsed && (
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {counts.cho_xu_ly + counts.dang_xu_ly + counts.da_xu_ly + counts.khong_the_xu_ly}
                </span>
                {statusDropdownOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
            )}
          </button>

          {/* Collapsible Dropdown Sub-Items */}
          {statusDropdownOpen && (
            <div className="mt-1 pl-3 space-y-1 border-l-2 border-emerald-800/80 ml-4">
              {/* 1. Chưa xử lý */}
              <Link
                href="/dashboard/categories/cho_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("cho_xu_ly")
                    ? "bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-md"
                    : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  {!collapsed && <span className="truncate">Chưa xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950 shadow">
                    {counts.cho_xu_ly}
                  </span>
                )}
              </Link>

              {/* 2. Đang xử lý */}
              <Link
                href="/dashboard/categories/dang_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("dang_xu_ly")
                    ? "bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-md"
                    : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertTriangle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  {!collapsed && <span className="truncate">Đang xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white shadow">
                    {counts.dang_xu_ly}
                  </span>
                )}
              </Link>

              {/* 3. Đã xử lý */}
              <Link
                href="/dashboard/categories/da_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("da_xu_ly")
                    ? "bg-emerald-900/90 text-emerald-200 border border-emerald-600/60 shadow-md"
                    : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {!collapsed && <span className="truncate">Đã xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-600 text-white shadow">
                    {counts.da_xu_ly}
                  </span>
                )}
              </Link>

              {/* 4. Không thể xử lý */}
              <Link
                href="/dashboard/categories/khong_the_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("khong_the_xu_ly")
                    ? "bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-md"
                    : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  {!collapsed && <span className="truncate">Không thể xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    {counts.khong_the_xu_ly}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* MỤC 5 TRONG SPEC: NHẬT KÝ SỬA CHỮA */}
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              LỊCH SỬ HỆ THỐNG
            </div>
          )}
          <Link
            href="/dashboard/logs"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/logs"
                ? "bg-emerald-900/80 text-white border border-emerald-700/60"
                : "text-emerald-200/90 hover:bg-emerald-900/60 hover:text-white"
            }`}
          >
            <ClipboardList className="h-4 w-4 text-emerald-400 shrink-0" />
            {!collapsed && <span>Nhật ký sửa chữa</span>}
          </Link>
        </div>

        {/* MỤC QUẢN TRỊ DÀNH CHO ADMIN */}
        {user.role === "admin" && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                QUẢN TRỊ CẤU HÌNH
              </div>
            )}
            <div className="space-y-1">
              <Link
                href="/dashboard/admin/zalo"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/zalo")
                    ? "bg-emerald-900/80 text-[#8dc63f] border border-emerald-700/60"
                    : "text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {!collapsed && <span>Zalo OA & Nhóm</span>}
              </Link>
              <Link
                href="/dashboard/admin/workshops"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/workshops")
                    ? "bg-emerald-900/80 text-[#8dc63f] border border-emerald-700/60"
                    : "text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                <Factory className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {!collapsed && <span>Quản lý Phân xưởng</span>}
              </Link>
              <Link
                href="/dashboard/admin/sizes"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/sizes")
                    ? "bg-emerald-900/80 text-[#8dc63f] border border-emerald-700/60"
                    : "text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                <Ruler className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {!collapsed && <span>Quản lý Bảng Size</span>}
              </Link>
              <Link
                href="/dashboard/admin/cms-settings"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/cms-settings")
                    ? "bg-emerald-900/80 text-[#8dc63f] border border-emerald-700/60"
                    : "text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white"
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {!collapsed && <span>Cấu hình Trang chủ</span>}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER ĐĂNG XUẤT */}
      <div className="p-3 border-t border-emerald-900/60 bg-[#061810]">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-red-950/80 hover:text-red-300 text-emerald-300 text-xs font-bold transition-all border border-emerald-900 hover:border-red-800/60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>ĐĂNG XUẤT</span>}
        </button>
      </div>
    </aside>
  );
}
