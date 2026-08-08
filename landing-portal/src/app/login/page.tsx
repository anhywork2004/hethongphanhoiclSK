"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, UserCheck, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { TBSMark } from "@/components/brand-logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mnv, setMnv] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedMnv = mnv.trim().toUpperCase().replace(/O/g, "0");
      const res = await signIn("credentials", {
        mnv: normalizedMnv,
        password,
        redirect: false,
      });

      setLoading(false);

      if (res?.error) {
        setError("Mã nhân viên hoặc mật khẩu chưa đúng. Bạn có thể chọn tài khoản mẫu bên dưới.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Đã xảy ra lỗi đăng nhập. Vui lòng thử lại.");
    }
  }

  async function handleSeedDB() {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedMessage("Đã nạp thành công tài khoản demo & dữ liệu phân xưởng vào D1!");
        setMnv("NV001");
        setPassword("123456");
      } else {
        setSeedMessage(`Lỗi khởi tạo: ${data.error || "Không thể kết nối D1"}`);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setSeedMessage(`Không thể khởi tạo: ${e.message}`);
    } finally {
      setSeeding(false);
    }
  }

  function fillDemo(demoMnv: string) {
    setMnv(demoMnv);
    setPassword("123456");
  }

  return (
    <div className="bg-[#0b2218]/90 backdrop-blur-xl border border-emerald-500/30 p-6 sm:p-8 shadow-2xl rounded-3xl text-emerald-50">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
            Mã Nhân Viên (MNV)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={mnv}
              onChange={(e) => setMnv(e.target.value)}
              placeholder="Nhập MNV (VD: NV001, QA001...)"
              className="w-full rounded-2xl bg-[#061811] border border-emerald-800/80 px-4 py-3.5 text-sm text-white placeholder-emerald-600/70 focus:outline-none focus:border-emerald-400 uppercase transition-all"
            />
            <UserCheck className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
            Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-2xl bg-[#061811] border border-emerald-800/80 px-4 py-3.5 pr-10 text-sm text-white placeholder-emerald-600/70 focus:outline-none focus:border-emerald-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-950/80 border border-red-800/80 p-4 flex items-start space-x-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#1b5238] via-[#246b4a] to-[#8dc63f] hover:from-[#163c2e] hover:to-[#7ab332] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/80 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>{loading ? "Đang xác thực MNV..." : "Đăng Nhập System"}</span>
        </button>
      </form>

      {/* Quick Demo Credentials Selector */}
      <div className="mt-8 border-t border-emerald-900/60 pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Tài khoản demo sẵn có:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo("NV001")}
            className="px-3.5 py-2.5 rounded-2xl bg-[#061811] hover:bg-emerald-950 border border-emerald-800/80 text-left transition-colors group"
          >
            <div className="font-bold text-white group-hover:text-emerald-300">NV001</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Cán bộ Báo lỗi</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("QA001")}
            className="px-3.5 py-2.5 rounded-2xl bg-[#061811] hover:bg-emerald-950 border border-emerald-800/80 text-left transition-colors group"
          >
            <div className="font-bold text-white group-hover:text-emerald-300">QA001</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Chuyên viên QA</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("KT001")}
            className="px-3.5 py-2.5 rounded-2xl bg-[#061811] hover:bg-emerald-950 border border-emerald-800/80 text-left transition-colors group"
          >
            <div className="font-bold text-white group-hover:text-emerald-300">KT001</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Kỹ thuật / Bảo trì</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("ADMIN001")}
            className="px-3.5 py-2.5 rounded-2xl bg-[#061811] hover:bg-emerald-950 border border-emerald-800/80 text-left transition-colors group"
          >
            <div className="font-bold text-white group-hover:text-emerald-300">ADMIN001</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Quản trị hệ thống</div>
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSeedDB}
            disabled={seeding}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{seeding ? "Đang nạp database D1..." : "Khởi tạo Dữ liệu Mẫu D1 (Seed DB)"}</span>
          </button>
          {seedMessage && (
            <div className="mt-2 text-[11px] text-emerald-300 text-center font-semibold">
              {seedMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05140e] via-[#092218] to-[#040f0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden">
      {/* Background Green Accent Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-5">
          <TBSMark size={56} className="shadow-2xl shadow-emerald-950 ring-4 ring-emerald-500/20" />
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-white tracking-tight">
          TBS Group Kiên Giang 1
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-emerald-300/80 font-medium">
          Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-emerald-400 text-xs">Đang tải form đăng nhập...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
