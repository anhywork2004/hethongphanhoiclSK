"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wrench,
  Users,
  AlertTriangle,
  Megaphone,
  Tags,
  Menu,
  ExternalLink,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { BrandMark } from "@/components/brand-logo";

const categoryTypeItems = [
  { type: "AREA", label: "Khu vực / Xưởng" },
  { type: "PRODUCTION_LINE", label: "Chuyền" },
  { type: "TEAM", label: "Tổ" },
  { type: "FAILURE", label: "Danh mục hư" },
  { type: "MAINTENANCE_PERIOD", label: "Bảo trì định kỳ" },
  { type: "MACHINE_STATUS", label: "Trạng thái máy" },
  { type: "MACHINE_TYPE", label: "Phân loại máy" },
];

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/machines", label: "Máy móc", icon: Wrench },
  { href: "/admin/employees", label: "Nhân sự", icon: Users },
  { href: "/admin/incidents", label: "Sự cố", icon: AlertTriangle },
  { label: "Danh mục", icon: Tags, children: categoryTypeItems },
  { href: "/admin/announcements", label: "Thông báo", icon: Megaphone },
];

export default function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryType = searchParams.get("type");
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(pathname === "/admin/categories");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`flex flex-shrink-0 flex-col bg-brand-darkest text-slate-100 transition-all ${
          collapsed ? "w-0 overflow-hidden" : "w-64"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <BrandMark size={40} />
          <div>
            <div className="text-sm font-semibold text-white">Admin</div>
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />
              Online
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-white/40">
          MENU ADMIN
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const parentActive = pathname === "/admin/categories";
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setCategoriesOpen((o) => !o)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      parentActive
                        ? "bg-brand text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {categoriesOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  {categoriesOpen && (
                    <div className="mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-4">
                      {item.children.map((child) => {
                        const childActive = parentActive && activeCategoryType === child.type;
                        return (
                          <Link
                            key={child.type}
                            href={`/admin/categories?type=${child.type}`}
                            className={`rounded-md px-3 py-2 text-sm transition-colors ${
                              childActive
                                ? "bg-brand/80 text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
          © {new Date().getFullYear()} TBS Group
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng/mở menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand"
            >
              <ExternalLink size={16} />
              Xem website
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
              >
                <BrandMark size={28} />
                <span className="text-sm font-medium text-slate-700">{userName}</span>
                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-400">
          Copyright © 2020-{new Date().getFullYear()}{" "}
          <span className="font-medium text-brand">TBS Group</span> · Version 1.0
        </footer>
      </div>
    </div>
  );
}
