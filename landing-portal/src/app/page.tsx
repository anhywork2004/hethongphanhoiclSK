import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import {
  Sparkles,
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
import { TBSMark } from "@/components/brand-logo";

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
        cmsSettings.bannerUrl = res[0].bannerImageUrl || cmsSettings.bannerUrl;
      }
    }
  } catch {
    // Offline fallback
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans antialiased selection:bg-[#004724] selection:text-white relative overflow-x-hidden">
      {/* TOP NAVIGATION BAR */}
      <header className="relative z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Corporate Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <TBSMark size={40} />
            <div>
              <div className="text-xs font-black tracking-widest text-[#004724] uppercase">
                SKECHERS KIÊN GIANG 1
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-xs font-bold uppercase tracking-widest text-slate-600">
            <a href="#about" className="hover:text-[#004724] transition-colors">GIỚI THIỆU</a>
            <a href="#phong-ban" className="hover:text-[#004724] transition-colors">PHÒNG BAN</a>
            <a href="#thuong-hieu" className="hover:text-[#004724] transition-colors">THƯƠNG HIỆU</a>
          </nav>

          {/* Login Button CTA */}
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-[#004724] hover:bg-[#07361e] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 group"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-white" />
            <span>ĐĂNG NHẬP HỆ THỐNG</span>
          </Link>
        </div>
      </header>

      {/* HERO MAIN SECTION */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT COLUMN: HERO TEXT & STATS (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Category Pill Tag */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#004724]" />
                <span className="text-xs font-bold text-[#004724] uppercase tracking-widest">
                  TBS GROUP KIÊN GIANG 1
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight font-serif-luxury tracking-tight">
                {cmsSettings.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl font-serif-luxury italic text-[#004724] tracking-wide font-bold">
                {cmsSettings.heroSubtitle}
              </p>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                {cmsSettings.heroDescription}
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="px-7 py-3.5 rounded-full bg-[#004724] hover:bg-[#07361e] text-white font-bold text-sm shadow-md shadow-emerald-950/20 border border-emerald-800 transition-all flex items-center gap-3 group"
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span>TRUY CẬP HỆ THỐNG PHẢN HỒI CLSK</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Bottom Key Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-[#004724] font-serif-luxury">30+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">NĂM KINH NGHIỆM</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#004724] font-serif-luxury">10,000+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">CÁN BỘ CÔNG NHÂN</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#004724] font-serif-luxury">100%</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">TIÊU CHUẨN ĐẦU RA</div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: COMPOSITE GRAPHIC CARDS (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md space-y-5">
                
                {/* Floating Card 1: Official Logo Badge */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center space-x-3">
                    <TBSMark size={44} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium italic">
                    &ldquo;Chung sức kiến tạo tương lai - Nâng tầm giá trị sản xuất giày xuất khẩu Skechers toàn cầu.&rdquo;
                  </p>
                </div>

                {/* Floating Card 2: 2-Hour Feedback Loop Info */}
                <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-md space-y-3">
                  <div className="flex items-center space-x-2 text-[#004724] font-bold text-xs">
                    <Zap className="w-4 h-4 text-[#004724]" />
                    <span>SÁNG KIẾN 2-HOUR FAST FEEDBACK LOOP</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
                    <div className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-100">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>15 phút cảnh báo</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2 giờ xử lý 4M+1E</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <TBSMark size={28} />
            <span className="font-bold text-[#004724]">© 2026 TBS Group Kiên Giang 1. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Tiêu chuẩn 4M+1E</span>
            <span>Hệ thống Phản hồi CLSK</span>
            <span>Skechers Factory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
