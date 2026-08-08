import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import {
  Sparkles,
  ArrowDown,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  Award,
  Factory,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { homepageSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function LandingPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  // If user is already logged in, redirect directly to the workspace dashboard
  if (user) {
    redirect("/dashboard");
  }

  let cmsSettings = {
    heroTitle: "TBS Group Kiên Giang 1",
    heroSubtitle: "Excellence in Manufacturing. Excellence in Leadership.",
    heroDescription:
      "Không gian điều hành đại diện cho năng lực quản trị, văn hóa doanh nghiệp và tiêu chuẩn vận hành của nhà máy TBS Kiên Giang 1. Thiết kế hướng đến sự tinh gọn, hiện đại và chuyên nghiệp, phản ánh vị thế của một doanh nghiệp sản xuất trong chuỗi cung ứng toàn cầu.",
    bannerUrl: "/login-bg.png",
  };

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      const db = getDb(d1);
      const res = await db.select().from(homepageSettings).where(eq(homepageSettings.id, "main"));
      if (res.length > 0) {
        cmsSettings.heroTitle = res[0].heroTitle || cmsSettings.heroTitle;
        cmsSettings.heroSubtitle = res[0].heroSubtitle || cmsSettings.heroSubtitle;
        cmsSettings.heroDescription = res[0].heroDescription || cmsSettings.heroDescription;
        cmsSettings.bannerUrl = res[0].bannerUrl || cmsSettings.bannerUrl;
      }
    }
  } catch {
    // Offline fallback
  }

  return (
    <div className="min-h-screen bg-[#071711] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Background Image Overlay with Rich Emerald & Teal Tint */}
      <div className="fixed inset-0 z-0 opacity-40 mix-blend-luminosity bg-cover bg-center pointer-events-none transition-opacity duration-1000"
           style={{ backgroundImage: `url('${cmsSettings.bannerUrl}')` }}>
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#061812]/95 via-[#0a231b]/90 to-[#07130e]/98 pointer-events-none" />

      {/* TOP NAVIGATION BAR (Matching Image 1) */}
      <header className="relative z-50 border-b border-emerald-900/30 bg-[#061812]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Corporate Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-11 w-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-100/20 group-hover:scale-105 transition-transform">
              {/* TBS Green Leaf Logo */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1b5238]">
                <path d="M20,50 Q40,20 80,30 Q60,80 20,50 Z" />
                <path d="M30,65 Q50,35 85,45" stroke="#8dc63f" strokeWidth="6" fill="none" />
              </svg>
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                TBS GROUP
              </div>
              <div className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                KIÊN GIANG 1
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-xs font-bold uppercase tracking-widest text-emerald-200/80">
            <a href="#about" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">GIỚI THIỆU</a>
            <a href="#phong-ban" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">PHÒNG BAN</a>
            <a href="#thuong-hieu" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">THƯƠNG HIỆU</a>
          </nav>

          {/* Login Button CTA */}
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/20 border border-emerald-400/30 transition-all flex items-center gap-2 group"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>ĐĂNG NHẬP HỆ THỐNG</span>
          </Link>
        </div>
      </header>

      {/* HERO MAIN SECTION (Matching Image 1 Design Layout) */}
      <section className="relative z-10 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT COLUMN: HERO TEXT & STATS (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Category Pill Tag */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  TBS GROUP KIÊN GIANG 1
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight font-serif-luxury tracking-tight drop-shadow-md">
                {cmsSettings.heroTitle}
              </h1>

              {/* Gold Italic Subtitle */}
              <p className="text-xl sm:text-2xl font-serif-luxury italic text-[#d4af37] tracking-wide font-light">
                {cmsSettings.heroSubtitle}
              </p>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal max-w-xl">
                {cmsSettings.heroDescription}
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 border border-emerald-400/40 transition-all flex items-center gap-3 group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                  <span>TRUY CẬP HỆ THỐNG PHẢN HỒI CLSK</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Bottom Key Stats Row (Matching Image 1) */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-emerald-900/40 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-serif-luxury">
                    30+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                    NĂM KINH NGHIỆM
                  </div>
                </div>
                <div className="border-l border-emerald-900/40 pl-6">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-serif-luxury">
                    10+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                    THƯƠNG HIỆU QUỐC TẾ
                  </div>
                </div>
                <div className="border-l border-emerald-900/40 pl-6">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-serif-luxury">
                    40K+
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">
                    NHÂN SỰ TOÀN HỆ THỐNG
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: VISUAL BANNER & COMPOSITE CARDS (5 cols) (Matching Image 1) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Floating Card 1: Hands & TBS Logo */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-emerald-800/90 to-teal-900/90 p-1 backdrop-blur-xl transform transition-transform hover:scale-[1.02] duration-500">
                  <div className="relative rounded-[22px] bg-gradient-to-br from-[#a3d959] via-[#8dc63f] to-[#5b9627] p-8 text-center text-[#0f2a20] shadow-inner overflow-hidden">
                    {/* Background Graphic Patterns */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
                    
                    {/* Hands Graphic Art Icon */}
                    <div className="relative z-10 mx-auto w-24 h-24 mb-4 rounded-full bg-white/90 p-3 shadow-lg flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-[#1b5238]">
                        <path d="M20,50 Q40,20 80,30 Q60,80 20,50 Z" />
                        <path d="M30,65 Q50,35 85,45" stroke="#8dc63f" strokeWidth="6" fill="none" />
                      </svg>
                    </div>

                    <div className="relative z-10 font-black text-2xl tracking-tight text-[#0b241b]">
                      TBS <span className="text-emerald-950 font-normal">GROUP</span>
                    </div>
                    <div className="relative z-10 mt-2 font-extrabold text-sm uppercase tracking-widest text-[#0e3023]">
                      CHUNG SỨC KIẾN TẠO TƯƠNG LAI
                    </div>
                  </div>
                </div>

                {/* Floating Overlay Card 2: City Hall Celebration Badge (Bottom Left) */}
                <div className="absolute -bottom-8 -left-6 sm:-left-10 w-72 sm:w-80 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200/80 text-slate-900 z-20 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <span className="text-xs font-black">50 NĂM</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        MỪNG KỶ NIỆM 50 NĂM THÀNH PHỐ MANG TÊN BÁC
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        02.07.1976 - 02.07.2026
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Overlay Card 3: Dark Green Quote Box (Bottom Right) */}
                <div className="absolute -bottom-14 -right-4 sm:-right-6 w-60 rounded-2xl bg-[#0d2a20]/95 backdrop-blur-md p-4 shadow-2xl border border-emerald-500/40 text-emerald-100 z-30">
                  <div className="w-8 h-1 bg-emerald-400 mb-2 rounded-full" />
                  <p className="text-xs font-serif-luxury italic text-emerald-200 leading-relaxed">
                    &quot;Chung sức kiến tạo tương lai&quot;
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS & FAST FEEDBACK LOOP EXPLANATION */}
      <section id="vptx" className="relative z-10 py-16 bg-[#04110c]/80 border-t border-emerald-900/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-luxury">
              Hệ Thống 2-Hour Fast Feedback Loop
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Quy trình tự động hóa phát hiện sự cố, gửi cảnh báo nhóm Zalo OA và xử lý nguyên nhân 4M+1E tức thì
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Phát Hiện Lỗi", desc: "Cán bộ sản xuất nhập phiếu lỗi trực tiếp từ xưởng chặt, may, gò đế", icon: Clock },
              { step: "02", title: "Cảnh Báo Zalo OA", desc: "Tự động kích hoạt thông báo tức thì tới 3 nhóm Zalo chuyên trách", icon: Zap },
              { step: "03", title: "Xác Minh 4M+1E", desc: "Phân tích nguyên nhân gốc: Nhân sự, Máy móc, Vật liệu, Môi trường, Phương pháp", icon: ShieldCheck },
              { step: "04", title: "Khắc Phục & Đóng Lỗi", desc: "Đồng hồ đếm ngược 2 giờ vàng đảm bảo sự cố được giải quyết dứt điểm", icon: CheckCircle2 },
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 hover:border-emerald-500/50 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-emerald-400 tracking-widest">{item.step}</span>
                  <item.icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300/80 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 bg-[#030c08] border-t border-emerald-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">TBS GROUP</span>
            <span>•</span>
            <span>TBS Skechers Kiên Giang 1</span>
          </div>
          <div>
            © {new Date().getFullYear()} TBS Group. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Floating Scroll Down Arrow Button (Matching Image 1) */}
      <a
        href="#vptx"
        aria-label="Scroll Down"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-white text-[#0f2a20] shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-emerald-400 transition-all border border-emerald-200"
      >
        <ArrowDown className="w-5 h-5 stroke-[2.5]" />
      </a>
    </div>
  );
}
