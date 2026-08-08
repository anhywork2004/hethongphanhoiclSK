"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  LogOut,
  User,
  Shield,
  Briefcase,
  AlertTriangle,
  LayoutDashboard,
  PlusCircle,
  Siren,
  Sliders,
  Sparkles,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { TBSMark } from "@/components/brand-logo";

interface AppHeaderNavProps {
  user?: {
    id: string;
    mnv: string;
    fullName: string;
    role: string;
    roles?: string[];
    position?: string;
    department?: string;
  } | null;
}

export function AppHeaderNav({ user }: AppHeaderNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Poll notifications count every 15s
  useEffect(() => {
    async function checkNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // ignore
      }
    }
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const role = user?.role || "worker";
  const isDirector = role === "director" || role === "general_director" || role === "admin";
  const isDeptHeadOrHandler = role === "dept_head" || role === "handler" || role === "admin";
  const isAdmin = role === "admin";

  const navLinks = [
    { href: "/dashboard", label: "Trang Chủ", icon: LayoutDashboard },
    { href: "/issues", label: "Hoạt Động Sự Cố", icon: AlertTriangle },
    ...(isDeptHeadOrHandler ? [{ href: "/tasks", label: "Công Việc", icon: Briefcase }] : []),
    ...(isDirector ? [{ href: "/phase2", label: "Phase 2 (GĐ)", icon: Siren }] : []),
    { href: "/dashboard/bi", label: "Thống Kê BI", icon: TrendingUp },
    ...(isAdmin ? [{ href: "/admin", label: "Quản Trị", icon: Sliders }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#004724] text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Factory Title */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-white p-1 rounded-xl shadow-xs">
              <TBSMark size={32} />
            </div>
            <div>
              <div className="text-xs font-black tracking-widest text-[#8dc63f] uppercase">
                TBS SKECHERS KG1
              </div>
              <div className="text-[11px] font-bold text-emerald-100/90 leading-none">
                Phản Hồi CLSK (2-Hour Fast Loop)
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold uppercase tracking-wider">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? "bg-emerald-900/90 text-[#8dc63f] border border-emerald-600/60 shadow-xs"
                      : "text-emerald-100 hover:bg-emerald-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#8dc63f]" : "text-emerald-300"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Report Button */}
            <Link
              href="/issues/new"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#8dc63f] hover:bg-[#7db62f] text-[#061812] text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Báo Sự Cố</span>
            </Link>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-white border border-emerald-700/60 transition-colors"
              title="Trung tâm thông báo"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Badge */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-emerald-800">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-black text-white">{user.fullName || user.mnv}</div>
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">
                    {user.position || user.role}
                  </div>
                </div>
                <Link
                  href="/login"
                  className="p-2 rounded-xl bg-emerald-900/80 hover:bg-rose-900/80 text-emerald-100 hover:text-white border border-emerald-700/60 transition-colors"
                  title="Đăng xuất / Đổi tài khoản"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-white text-[#004724] text-xs font-black uppercase tracking-wider shadow-xs"
              >
                Đăng Nhập
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-emerald-900/80 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-2 pb-4 space-y-1 text-xs font-bold uppercase">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl flex items-center space-x-2.5 ${
                  isActive ? "bg-emerald-900 text-[#8dc63f]" : "text-emerald-200 hover:bg-emerald-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/issues/new"
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 rounded-xl flex items-center space-x-2.5 bg-[#8dc63f] text-[#061812] font-black mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Báo Cáo Sự Cố Mới</span>
          </Link>
        </div>
      )}
    </header>
  );
}
