"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { BrandMark } from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      employeeCode,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản không có quyền Admin.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-lighter px-4">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url(/login-bg.png)" }}
      />
      <div className="absolute inset-0 bg-white/50" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
      >
        <div className="mb-5 flex justify-center">
          <div className="overflow-hidden rounded-xl border border-slate-200 p-3">
            <BrandMark size={48} rounded />
          </div>
        </div>
        <h1 className="mb-1 text-center text-lg font-bold text-slate-800">
          Phần Mềm Quản Lý MMTB
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">Đăng nhập để tiếp tục</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Tên đăng nhập</label>
        <input
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
          placeholder="Nhập tên đăng nhập"
          required
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none"
            placeholder="Nhập mật khẩu"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
