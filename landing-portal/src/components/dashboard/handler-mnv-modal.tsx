"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle, KeyRound, Check } from "lucide-react";

interface HandlerMnvModalProps {
  issueId: string;
  isOpen: boolean;
  onSuccessConfirmed: () => void;
  onClose: () => void;
}

export function HandlerMnvModal({ issueId, isOpen, onSuccessConfirmed, onClose }: HandlerMnvModalProps) {
  const [mnvInput, setMnvInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!mnvInput.trim()) {
      setError("Vui lòng nhập Mã Nhân Viên.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/confirm-mnv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mnvInput }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        onSuccessConfirmed();
      } else {
        setError(data.error || "Mã Nhân Viên nhập vào không đúng.");
      }
    } catch {
      setSubmitting(false);
      setError("Không thể kết nối máy chủ.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-slate-900 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-[#004724] tracking-widest">
              XÁC NHẬN CHÍNH CHỦ
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Nhập Mã Nhân Viên Để Nhận Nhiệm Vụ
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Bạn được phân công xử lý sự cố. Để đảm bảo đúng quy trình an toàn, vui lòng nhập chính xác **Mã Nhân Viên (MNV)** của bạn để xác thực chính chủ.
        </p>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-1.5">
              Mã Nhân Viên (MNV) Của Bạn *
            </label>
            <input
              type="text"
              required
              value={mnvInput}
              onChange={(e) => setMnvInput(e.target.value)}
              placeholder="VD: KT001"
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 uppercase focus:outline-none focus:border-[#004724]"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !mnvInput.trim()}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Đang xác thực..." : "XÁC NHẬN MNV"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
