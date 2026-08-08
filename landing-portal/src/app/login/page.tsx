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
    <div className="bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl rounded-3xl text-slate-900">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2">
            Mã Nhân Viên (MNV)
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={mnv}
              onChange={(e) => setMnv(e.target.value)}
              placeholder="Nhập MNV (VD: NV001, QA001...)"
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] uppercase transition-all font-semibold"
            />
            <UserCheck className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2">
            Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] transition-all font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start space-x-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>{loading ? "Đang xác thực MNV..." : "Đăng Nhập System"}</span>
        </button>
      </form>

      {/* Quick Demo Credentials Selector */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#004724]">
            Tài khoản demo sẵn có:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemo("NV001")}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-[#004724]">NV001</div>
            <div className="text-[10px] text-slate-500 font-semibold">Cán bộ Báo lỗi</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("QA001")}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-[#004724]">QA001</div>
            <div className="text-[10px] text-slate-500 font-semibold">Chuyên viên QA</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("KT001")}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-[#004724]">KT001</div>
            <div className="text-[10px] text-slate-500 font-semibold">Kỹ thuật / Bảo trì</div>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("ADMIN001")}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors group"
          >
            <div className="font-bold text-slate-900 group-hover:text-[#004724]">ADMIN001</div>
            <div className="text-[10px] text-slate-500 font-semibold">Quản trị hệ thống</div>
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSeedDB}
            disabled={seeding}
            className="text-xs text-[#004724] hover:text-emerald-700 font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#004724]" />
            <span>{seeding ? "Đang nạp database D1..." : "Khởi tạo Dữ liệu Mẫu D1 (Seed DB)"}</span>
          </button>
          {seedMessage && (
            <div className="mt-2 text-[11px] text-emerald-800 text-center font-semibold">
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
    <div className="min-h-screen bg-[#f4f7f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-5">
          <TBSMark size={56} />
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          TBS Group Kiên Giang 1
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-600 font-medium">
          Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-[#004724] text-xs">Đang tải form đăng nhập...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
