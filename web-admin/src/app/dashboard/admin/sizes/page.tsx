"use client";

import { useState, useEffect } from "react";
import { Ruler, Plus, CheckCircle2 } from "lucide-react";

interface SizeItem {
  id: string;
  sizeCode: string;
  sizeName: string;
  isActive: boolean;
}

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [sizeCode, setSizeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function loadSizes() {
    fetch("/api/sizes")
      .then((res) => res.json())
      .then((data) => {
        if (data.sizes) setSizes(data.sizes);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadSizes();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!sizeCode.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sizeCode: sizeCode,
          sizeName: `Size ${sizeCode}`,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMsg(`Thêm thành công size: ${sizeCode}`);
        setSizeCode("");
        loadSizes();
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Ruler className="w-7 h-7 text-indigo-400" />
          <span>Quản Lý Bảng Size Sản Phẩm</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          UI Admin bổ sung và cấu hình danh sách kích thước (Size) cho giày Skechers.
        </p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Thêm Size Mới</h2>
        {msg && <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-semibold">{msg}</div>}

        <div className="flex items-center space-x-4 max-w-md">
          <input
            type="text"
            required
            value={sizeCode}
            onChange={(e) => setSizeCode(e.target.value)}
            placeholder="VD: 45, 34..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? "Đang thêm..." : "Thêm Size"}</span>
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Danh Sách Sizes Đang Hoạt Động ({sizes.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {sizes.map((sz) => (
            <div
              key={sz.id}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm flex items-center space-x-2"
            >
              <span>{sz.sizeCode}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
