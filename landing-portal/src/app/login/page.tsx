"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Factory, Lock, UserCheck, AlertCircle, Sparkles } from "lucide-react";

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
        setError("Mã nhân viên hoặc mật khẩu không chính xác. Bạn có thể bấm 'Khởi tạo Dữ liệu Mẫu' ở dưới để nạp tài khoản demo.");
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
        setSeedMessage("Đã nạp thành công 10 tài khoản demo & dữ liệu phân xưởng, size vào D1!");
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
    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl rounded-2xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mã Nhân Viên (MNV)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={mnv}
              onChange={(e) => setMnv(e.target.value)}
              placeholder="Nhập MNV (VD: NV001, QA001...)"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-all"
            />
            <UserCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/70 border border-red-800/80 p-3.5 flex items-start space-x-2.5 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? "Đang xác thực MNV..." : "Đăng Nhập"}
        </button>
      </form>

      {/* Quick Demo Credentials selector */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tài khoản demo mẫu:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo("NV001")}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="font-bold text-white">NV001</div>
            <div className="text-[10px] text-blue-400 font-semibold">Cán bộ Báo lỗi</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("QA001")}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="font-bold text-white">QA001</div>
            <div className="text-[10px] text-blue-400 font-semibold">Chuyên viên QA</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("KT001")}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="font-bold text-white">KT001</div>
            <div className="text-[10px] text-blue-400 font-semibold">Kỹ thuật / Bảo trì</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo("ADMIN001")}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
          >
            <div className="font-bold text-white">ADMIN001</div>
            <div className="text-[10px] text-blue-400 font-semibold">Quản trị hệ thống</div>
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSeedDB}
            disabled={seeding}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{seeding ? "Đang nạp database D1..." : "Khởi tạo Dữ liệu Mẫu D1 (Seed DB)"}</span>
          </button>
          {seedMessage && (
            <div className="mt-2 text-[11px] text-emerald-400 text-center font-medium">
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Factory className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          TBS Skechers Kiên Giang 1
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          Đăng nhập Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Đang tải form đăng nhập...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
