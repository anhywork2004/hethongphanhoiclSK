"use client";

import { useState, useEffect } from "react";
import { Factory, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface WorkshopItem {
  id: string;
  workshopCode: string;
  workshopName: string;
  description?: string;
  isActive: boolean;
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function loadWorkshops() {
    fetch("/api/workshops")
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) setWorkshops(data.workshops);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadWorkshops();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!code.trim() || !name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopCode: code,
          workshopName: name,
          description: desc,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMsg(`Thêm thành công phân xưởng: ${name}`);
        setCode("");
        setName("");
        setDesc("");
        loadWorkshops();
      } else {
        setErr(data.error || "Không thể thêm phân xưởng");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setLoading(false);
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <Factory className="w-7 h-7 text-cyan-400" />
          <span>Quản Lý Phân Xưởng Nhà Máy</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          UI Admin quản lý danh sách phân xưởng sản xuất phục vụ Form Báo cáo Vấn đề CLSK.
        </p>
      </div>

      {/* Add Workshop Form */}
      <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Thêm Phân Xưởng Mới</h2>
        {msg && <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-semibold">{msg}</div>}
        {err && <div className="p-3 rounded-xl bg-rose-950 text-rose-300 text-xs font-semibold">{err}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Mã Phân Xưởng *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: PX06"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Tên Phân Xưởng *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phân xưởng Đột dập"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Mô Tả Chức Năng</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="VD: Gia công khoen xỏ dây"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "Đang thêm..." : "Thêm Phân Xưởng"}</span>
        </button>
      </form>

      {/* Workshop List Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
          Danh Sách Phân Xưởng Hiện Có ({workshops.length})
        </div>
        <div className="divide-y divide-slate-800">
          {workshops.map((ws) => (
            <div key={ws.id} className="p-4 flex items-center justify-between hover:bg-slate-850 transition-colors">
              <div>
                <div className="font-bold text-white text-sm">
                  [{ws.workshopCode}] {ws.workshopName}
                </div>
                <div className="text-xs text-slate-400">{ws.description || "Chưa có mô tả"}</div>
              </div>
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đang hoạt động</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
