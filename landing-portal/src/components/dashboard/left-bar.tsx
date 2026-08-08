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
  Siren,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Sliders,
  Ruler,
  Factory,
  Tag,
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  Boxes,
  FlaskConical,
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
    dang_chay_thu?: number;
    da_xu_ly: number;
    khong_the_xu_ly: number;
  };
}

export function LeftBar({ user, counts = { cho_xu_ly: 0, dang_xu_ly: 0, dang_chay_thu: 0, da_xu_ly: 0, khong_the_xu_ly: 0 } }: LeftBarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(true);

  // Roles allowed to view BI Overview (Hidden for worker & handler)
  const biRoles = [
    "line_leader",
    "team_leader",
    "qa",
    "technology",
    "dept_head",
    "director",
    "general_director",
    "admin",
    "truong_line",
    "to_truong",
    "cong_nghe",
    "truong_phong_ban",
    "giam_doc",
    "tong_giam_doc",
  ];
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
      className={`bg-white text-slate-800 border-r border-slate-200/90 flex flex-col h-screen sticky top-0 font-sans z-40 select-none transition-all duration-300 shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* BRANDING HEADER WITH OFFICIAL TBS LOGO */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
        <Link href="/dashboard" className="flex items-center space-x-3 min-w-0">
          <TBSMark size={38} />
          {!collapsed && (
            <div className="min-w-0 flex-1 pl-1">
              <div className="text-[10px] font-black text-emerald-800 tracking-widest truncate uppercase">
                SKECHERS KG1
              </div>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-800 transition-colors border border-slate-200"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* MỤC 1: THÔNG TIN CÁ NHÂN (HIỂN THỊ TRÊN CÙNG) */}
      <div className="p-3.5 m-3 rounded-2xl bg-[#f0f8f3] border border-emerald-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-[#004724] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-[#004724] truncate">
                {user.fullName || user.mnv || "Cán Bộ CLSK"}
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                {user.position || "Cán bộ sản xuất"}
              </div>
              <div className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-[#004724] border border-emerald-300/80 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-[#004724]" />
                <span>{roleLabelMap[user.role || ""] || user.role || "reporter"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION CONTENT */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin scrollbar-thumb-emerald-200">
        
        {/* MỤC 4 TRONG SPEC: NÚT CTA NỔI BẬT BÁO CÁO VẤN ĐỀ (TBS Corporate Green) */}
        <div>
          <Link
            href="/dashboard/report"
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all ${
              pathname === "/dashboard/report"
                ? "bg-[#004724] text-white ring-2 ring-emerald-400 shadow-emerald-900/20"
                : "bg-[#004724] hover:bg-[#07361e] text-white shadow-emerald-950/20 hover:scale-[1.02]"
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
              <div className="px-3 mb-2 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                PHÂN TÍCH & BÁO CÁO
              </div>
            )}
            <Link
              href="/dashboard/bi"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                pathname === "/dashboard/bi"
                  ? "bg-[#e8f5e0] text-[#004724] border-l-4 border-[#004724] shadow-xs"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-[#004724]"
              }`}
            >
              <PieChart className="h-4 w-4 text-[#004724] shrink-0" />
              {!collapsed && <span>BI Tổng quan</span>}
            </Link>
          </div>
        )}

        {/* NÚT TỔNG QUAN DASHBOARD TRẢ VỀ TRANG CHỦ DASHBOARD */}
        <div>
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-[#e8f5e0] text-[#004724] border-l-4 border-[#004724] shadow-xs"
                : "text-slate-700 hover:bg-emerald-50 hover:text-[#004724]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-[#004724] shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </div>

        {/* MỤC 3 TRONG SPEC: PHÂN LOẠI TRẠNG THÁI (GÔM THÀNH DROPDOWN TAG) */}
        <div>
          {/* Dropdown Toggle Header */}
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#004724] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Tag className="h-4 w-4 text-[#004724] shrink-0" />
              {!collapsed && <span className="truncate">Phân loại trạng thái</span>}
            </div>
            {!collapsed && (
              <div className="flex items-center space-x-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-[#004724] border border-emerald-300">
                  {counts.cho_xu_ly + counts.dang_xu_ly + counts.da_xu_ly + counts.khong_the_xu_ly}
                </span>
                {statusDropdownOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
            )}
          </button>

          {/* Collapsible Dropdown Sub-Items */}
          {statusDropdownOpen && (
            <div className="mt-1 pl-3 space-y-1 border-l-2 border-emerald-200 ml-4">
              {/* 1. Chưa xử lý */}
              <Link
                href="/dashboard/categories/cho_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("cho_xu_ly")
                    ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  {!collapsed && <span className="truncate">Chưa xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                    {counts.cho_xu_ly}
                  </span>
                )}
              </Link>

              {/* 2. Đang xử lý */}
              <Link
                href="/dashboard/categories/dang_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("dang_xu_ly")
                    ? "bg-blue-50 text-blue-900 border border-blue-300 font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertTriangle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  {!collapsed && <span className="truncate">Đang xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white shadow-xs">
                    {counts.dang_xu_ly}
                  </span>
                )}
              </Link>

              {/* 3. Chạy thử (TAG MỚI VỊ TRÍ Ở GIỮA) */}
              <Link
                href="/dashboard/categories/dang_chay_thu"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("dang_chay_thu")
                    ? "bg-purple-50 text-purple-900 border border-purple-300 font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <FlaskConical className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  {!collapsed && <span className="truncate">Chạy thử</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-purple-600 text-white shadow-xs">
                    {counts.dang_chay_thu || 0}
                  </span>
                )}
              </Link>

              {/* 4. Đã xử lý */}
              <Link
                href="/dashboard/categories/da_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("da_xu_ly")
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {!collapsed && <span className="truncate">Đã xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-600 text-white shadow-xs">
                    {counts.da_xu_ly}
                  </span>
                )}
              </Link>

              {/* 5. 🚨 SOS Không thể xử lý */}
              <Link
                href="/dashboard/categories/khong_the_xu_ly"
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pathname.includes("khong_the_xu_ly")
                    ? "bg-rose-100 text-rose-900 border border-rose-400 font-black shadow-xs"
                    : "text-rose-700 hover:bg-rose-50 hover:text-rose-900"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <Siren className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  {!collapsed && <span className="truncate font-black text-rose-700">🚨 SOS Không thể xử lý</span>}
                </div>
                {!collapsed && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-white shadow-xs animate-pulse">
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
            <div className="px-3 mb-2 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              LỊCH SỬ HỆ THỐNG
            </div>
          )}
          <div className="space-y-1">
            <Link
              href="/dashboard/logs"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/dashboard/logs"
                  ? "bg-[#e8f5e0] text-[#004724] border-l-4 border-[#004724] shadow-xs font-bold"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-[#004724]"
              }`}
            >
              <ClipboardList className="h-4 w-4 text-[#004724] shrink-0" />
              {!collapsed && <span>Nhật ký sửa chữa</span>}
            </Link>

            <Link
              href="/dashboard/inventory"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/dashboard/inventory"
                  ? "bg-[#e8f5e0] text-[#004724] border-l-4 border-[#004724] shadow-xs font-bold"
                  : "text-slate-700 hover:bg-emerald-50 hover:text-[#004724]"
              }`}
            >
              <Boxes className="h-4 w-4 text-[#004724] shrink-0" />
              {!collapsed && <span>Kho phụ tùng linh kiện</span>}
            </Link>
          </div>
        </div>

        {/* MỤC QUẢN TRỊ DÀNH CHO ADMIN */}
        {user.role === "admin" && (
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                QUẢN TRỊ CẤU HÌNH
              </div>
            )}
            <div className="space-y-1">
              <Link
                href="/dashboard/admin/zalo"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/zalo")
                    ? "bg-[#e8f5e0] text-[#004724] font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#004724] shrink-0" />
                {!collapsed && <span>Zalo OA & Nhóm</span>}
              </Link>
              <Link
                href="/dashboard/admin/workshops"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/workshops")
                    ? "bg-[#e8f5e0] text-[#004724] font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <Factory className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                {!collapsed && <span>Quản lý Phân xưởng</span>}
              </Link>
              <Link
                href="/dashboard/admin/sizes"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/sizes")
                    ? "bg-[#e8f5e0] text-[#004724] font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <Ruler className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                {!collapsed && <span>Quản lý Bảng Size</span>}
              </Link>
              <Link
                href="/dashboard/admin/cms-settings"
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes("/admin/cms-settings")
                    ? "bg-[#e8f5e0] text-[#004724] font-bold"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#004724]"
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                {!collapsed && <span>Cấu hình Trang chủ</span>}
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER: NÚT ĐỔI MẬT KHẨU NẰM TRỰC TIẾP TRÊN NÚT ĐĂNG XUẤT (Nền trắng, tone xanh) */}
      <div className="p-3 border-t border-slate-200 bg-[#f9fbf9] space-y-2">
        {/* NÚT 1: ĐỔI MẬT KHẨU (NẰM TRÊN ĐĂNG XUẤT theo yêu cầu của bạn) */}
        <Link
          href="/dashboard/change-password"
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#004724] text-xs font-extrabold transition-all border border-emerald-200"
        >
          <KeyRound className="h-4 w-4 shrink-0 text-[#004724]" />
          {!collapsed && <span>ĐỔI MẬT KHẨU</span>}
        </Link>

        {/* NÚT 2: ĐĂNG XUẤT */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 hover:border-red-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>ĐĂNG XUẤT</span>}
        </button>
      </div>
    </aside>
  );
}
