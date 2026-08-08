import Link from "next/link";
import { ShieldAlert, Clock, ArrowRight, Activity, CheckCircle2, Factory, Layers, MessageSquare, Zap, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-white uppercase block leading-none">
                  TBS Group
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/80 uppercase">
                  Skechers KG1
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 tracking-wider block mt-1">
                Hệ Thống Phản Hồi CLSK • Fast Feedback Loop
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all duration-200"
            >
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold mb-6 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Sáng kiến "2-Hour Fast Feedback Loop" — Nhà máy Skechers Kiên Giang 1</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            Phản hồi chất lượng sản phẩm & Khắc phục sự cố trong{" "}
            <span className="text-blue-400 underline decoration-blue-500/40 underline-offset-8">
              2 Giờ Vàng
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl font-normal leading-relaxed">
            Nền tảng số hóa quy trình báo lỗi trực tiếp từ chuyền sản xuất đến đội ngũ Kỹ thuật, QA/QC, Công nghệ và Trưởng phòng ban. Tích hợp thông báo tự động qua Zalo Official Account (OA) giúp xử lý nhanh trong 15 phút.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center space-x-2.5"
            >
              <span>Báo cáo sự cố ngay</span>
              <ShieldAlert className="w-4 h-4" />
            </Link>
            <a
              href="#about"
              className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all duration-200"
            >
              Quy trình 4M+1E
            </a>
          </div>

          {/* Core Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-3xl font-black text-amber-400">15 Phút</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Xác minh 4M+1E ban đầu
              </div>
            </div>
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-3xl font-black text-blue-400">2 Giờ</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Khoanh vùng & Khắc phục
              </div>
            </div>
            <div className="p-4 border-r border-slate-800/80 last:border-0">
              <div className="text-3xl font-black text-emerald-400">3 Nhóm</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Thông báo Zalo OA tự động
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-black text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Số hóa minh chứng R2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Workflow Section */}
      <section id="about" className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Mô Hình Phản Hồi Chất Lượng Nhanh
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Kết nối realtime từ công đoạn phát hiện sự cố đến các cấp quản lý và kỹ thuật viên nhà máy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-5">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Báo Lỗi & Khoanh Vùng Tức Thì</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cán bộ sản xuất (CBSX/QA/QC) gửi phiếu sự cố trực tiếp từ chuyền kèm mã sản phẩm, size bị ảnh hưởng và hình ảnh chụp thực tế.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Thông Báo Zalo OA 3 Nhóm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống tự động kích hoạt thông báo Zalo OA đến đúng nhóm Trực tiếp xử lý (15 phút), nhóm Đưa giải pháp và Ban Giám Đốc.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Khắc Phục & Đóng Lỗi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kỹ thuật bảo trì và công nghệ xử lý sự cố, theo dõi lô sản xuất tiếp theo và cập nhật kết quả nguyên nhân gốc rễ (5M+1E).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} TBS Skechers Kiên Giang 1. Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop).</p>
        </div>
      </footer>
    </div>
  );
}
