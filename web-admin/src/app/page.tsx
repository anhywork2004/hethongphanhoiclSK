import Link from "next/link";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import {
  ShieldAlert,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
  Factory,
  Layers,
  MessageSquare,
  Zap,
  ShieldCheck,
  User,
  LogOut,
  BarChart3,
  ClipboardList,
  Wrench,
  BookOpen,
  Sliders,
  Ruler,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { issues } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export default async function LandingPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let totalIssues = 0;
  let resolvedIssues = 0;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      const db = getDb(d1);
      const t = await db.select({ value: count() }).from(issues);
      totalIssues = t[0]?.value || 0;

      const r = await db.select({ value: count() }).from(issues).where(eq(issues.status, "da_xu_ly"));
      resolvedIssues = r[0]?.value || 0;
    }
  } catch {
    // Fallback if D1 context is not bound during static build
  }

  const slaRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation (Thanh Bar Điều Hướng Chuẩn) */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold tracking-tight text-white uppercase leading-none">
                  TBS Group
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                  Skechers KG1
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                Fast Feedback 2H
              </span>
            </div>
          </Link>

          {/* Navigation Items on Bar */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold tracking-wider uppercase">
            {user ? (
              // Navigation Bar Items AFTER LOGIN (Đã Đăng Nhập)
              <>
                <Link href="/dashboard/report" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Báo Cáo Vấn Đề</span>
                </Link>
                <Link href="/dashboard/logs" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nhật Ký Sửa Chữa</span>
                </Link>
                {["truong_phong_ban", "giam_doc", "tong_giam_doc", "admin"].includes(user.role || "") && (
                  <Link href="/dashboard/bi" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>BI Sếp Tổng</span>
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/dashboard/admin/preventive-maintenance" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bảo Trì MMTB</span>
                  </Link>
                )}
                <Link href="/dashboard/training" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thư Viện Đào Tạo</span>
                </Link>
              </>
            ) : (
              // Navigation Bar Items BEFORE LOGIN (Chưa Đăng Nhập)
              <>
                <a href="#sang-kien" className="text-slate-300 hover:text-white transition-colors">
                  Sáng Kiến 2H
                </a>
                <a href="#quy-trinh" className="text-slate-300 hover:text-white transition-colors">
                  Quy Trình 4M+1E
                </a>
                <a href="#phan-xuong" className="text-slate-300 hover:text-white transition-colors">
                  Phân Xưởng Sản Xuất
                </a>
                <a href="#ung-dung" className="text-slate-300 hover:text-white transition-colors">
                  Hệ Thống Ứng Dụng
                </a>
              </>
            )}
          </nav>

          {/* Action Bar Right Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              // Profile Badge & Dashboard Button after Login
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-xs">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-white">{user.mnv || user.fullName}</span>
                  <span className="text-[10px] text-blue-400 uppercase font-semibold">({user.role})</span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              // Login Button Before Login
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Đăng Nhập MNV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold mb-6">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Sáng kiến &quot;2-Hour Fast Feedback Loop&quot; — TBS Skechers Kiên Giang 1</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Hệ thống phản hồi chất lượng & Khắc phục sự cố trong{" "}
            <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-8">
              2 Giờ Vàng
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-3xl font-normal leading-relaxed">
            Số hóa quy trình báo lỗi chất lượng sản phẩm trực tiếp từ chuyền sản xuất đến đội ngũ Kỹ thuật, QA/QC, Công nghệ và Ban Giám Đốc. Tích hợp Zalo Official Account (OA) cảnh báo tức thì trong 15 phút.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={user ? "/dashboard/report" : "/login"}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2"
            >
              <span>{user ? "TẠO PHIẾU BÁO SỰ CỐ CLSK" : "BÁO CÁO SỰ CỐ NGAY (ĐĂNG NHẬP)"}</span>
              <ShieldAlert className="w-4 h-4" />
            </Link>
            <a
              href="#quy-trinh"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-all"
            >
              Xem Quy Trình 4M+1E
            </a>
          </div>

          {/* Real-time KPI Counter Cards */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">15 Phút</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Phản hồi ban đầu
              </div>
            </div>
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">2 Giờ</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Khoanh vùng & Khắc phục
              </div>
            </div>
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">3 Nhóm</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Gửi Zalo OA Tự Động
              </div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">{slaRate}%</div>
              <div className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Tỷ lệ đạt SLA 2 Giờ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications & Features Tiles Section (Hệ Thống Ứng Dụng) */}
      <section id="ung-dung" className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
              Danh Mục Hệ Thống Ứng Dụng TBS Skechers KG1
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {user ? "Truy cập nhanh các phân hệ làm việc theo quyền hạn của bạn." : "Đăng nhập MNV để sử dụng các phân hệ làm việc của nhà máy."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Link
              href={user ? "/dashboard/report" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Form Báo Cáo Phiếu CLSK</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tạo mới phiếu báo lỗi sản phẩm, chọn nhiều size, phân xưởng và tự động gửi ảnh Cloudflare R2.
              </p>
              <div className="mt-4 text-[11px] font-bold text-blue-400 flex items-center space-x-1">
                <span>{user ? "Truy cập Form Báo Lỗi" : "Yêu cầu đăng nhập MNV"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href={user ? "/dashboard/logs" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Nhật Ký Sửa Chữa & Khắc Phục</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lịch sử xử lý sự cố, kết quả khoanh vùng 4M+1E và thời gian đáp ứng thực tế của bộ phận kỹ thuật.
              </p>
              <div className="mt-4 text-[11px] font-bold text-blue-400 flex items-center space-x-1">
                <span>{user ? "Xem Nhật Ký Sửa Chữa" : "Yêu cầu đăng nhập MNV"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href={user ? "/dashboard/bi" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">BI Analytics (Sếp Tổng)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Báo cáo tổng quan nhà máy, biểu đồ phân loại lỗi xưởng, chỉ số MTTR và xuất báo cáo Excel/CSV.
              </p>
              <div className="mt-4 text-[11px] font-bold text-indigo-400 flex items-center space-x-1">
                <span>{user ? "Xem BI Dashboard" : "Dành cho Quản lý / Sếp tổng"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href={user ? "/dashboard/admin/preventive-maintenance" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Bảo Trì Định Kỳ MMTB</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lập kế hoạch bảo trì phòng ngừa sự cố máy móc, tra dầu định kỳ và kiểm tra cảm biến thiết bị.
              </p>
              <div className="mt-4 text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                <span>{user ? "Lập Lịch Bảo Trì" : "Yêu cầu đăng nhập Admin"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href={user ? "/dashboard/admin/zalo" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Quản Trị Zalo OA & Group</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cấu hình danh sách Zalo User ID cho 3 nhóm nhận thông báo tự động (Trực tiếp, Giải pháp, Ban Giám Đốc).
              </p>
              <div className="mt-4 text-[11px] font-bold text-blue-400 flex items-center space-x-1">
                <span>{user ? "Quản Lý Nhóm Zalo" : "Yêu cầu đăng nhập Admin"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link
              href={user ? "/dashboard/training" : "/login"}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Thư Viện & Đào Tạo Kỹ Thuật</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sách hướng dẫn vận hành máy, sơ đồ kỹ thuật và tài liệu đào tạo 4M+1E cho nhân sự nhà máy.
              </p>
              <div className="mt-4 text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                <span>Tra Cứu Tài Liệu</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Workshop Showcase Section (Phân Xưởng Sản Xuất) */}
      <section id="phan-xuong" className="py-16 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
              Các Phân Xưởng Sản Xuất TBS Skechers Kiên Giang 1
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Phản hồi & khoanh vùng sự cố trực tiếp tại 4 phân xưởng chính nhà máy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                Phân Xưởng 1
              </span>
              <h3 className="text-base font-bold text-white mt-2">Phân Xưởng Chặt (Cutting)</h3>
              <p className="text-xs text-slate-400 mt-1">Cắt da, vải dệt & định hình chi tiết mũ giày Skechers.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                Phân Xưởng 2 & 3
              </span>
              <h3 className="text-base font-bold text-white mt-2">Phân Xưởng May 1 & May 2</h3>
              <p className="text-xs text-slate-400 mt-1">Chuyền may mũ giày lập trình tự động Brother & Juki.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                Phân Xưởng 4
              </span>
              <h3 className="text-base font-bold text-white mt-2">Phân Xưởng Gò & Đế (Lasting)</h3>
              <p className="text-xs text-slate-400 mt-1">Gò mũi, gò gót, ép gầm & dán đế thể thao Skechers.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                Phân Xưởng 5
              </span>
              <h3 className="text-base font-bold text-white mt-2">Phân Xưởng Hoàn Thiện</h3>
              <p className="text-xs text-slate-400 mt-1">Kiểm hàng QC final, đóng hộp & đóng container xuất khẩu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Factory className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-300">TBS Group • Skechers Kiên Giang 1</span>
          </div>
          <p>© {new Date().getFullYear()} Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop).</p>
        </div>
      </footer>
    </div>
  );
}
