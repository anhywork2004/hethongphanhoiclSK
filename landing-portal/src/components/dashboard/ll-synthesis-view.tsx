"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Siren,
  ShieldCheck,
  User,
  Cpu,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";

interface FormItem {
  id: string;
  userName?: string | null;
  userMnv?: string | null;
  userRole: string;
  rootCauseCategory?: string | null;
  rootCauseConclusion: string;
  man?: string | null;
  machine?: string | null;
  material?: string | null;
  method?: string | null;
  measurement?: string | null;
  environment?: string | null;
  submittedAt: number;
}

interface LLSynthesisViewProps {
  issueId: string;
  issueCode: string;
  forms: FormItem[];
  currentRootCause?: string | null;
  currentSolution?: string | null;
  onSuccess: (status: string) => void;
}

export function LLSynthesisView({
  issueId,
  issueCode,
  forms,
  currentRootCause,
  currentSolution,
  onSuccess,
}: LLSynthesisViewProps) {
  const [rootCauseSummary, setRootCauseSummary] = useState(currentRootCause || "");
  const [proposedSolution, setProposedSolution] = useState(currentSolution || "");
  const [phase2Notes, setPhase2Notes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhase2Modal, setShowPhase2Modal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group forms by role
  const qaForm = forms.find((f) => f.userRole === "qa");
  const llForm = forms.find((f) => f.userRole === "line_leader");
  const cnForm = forms.find((f) => f.userRole === "technology");

  async function handleConfirmSolution() {
    if (!rootCauseSummary.trim()) {
      setError("Vui lòng nhập Nguyên nhân gốc rễ chính thức sau khi tổng hợp!");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/synthesize-root-cause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          rootCauseSummary: rootCauseSummary.trim(),
          proposedSolution: proposedSolution.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess("root_cause_found");
      } else {
        setError(data.error || "Chốt nguyên nhân thất bại");
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    }
    setIsSubmitting(false);
  }

  async function handleEscalatePhase2() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/synthesize-root-cause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "phase2",
          notes: phase2Notes.trim() || "Line Leader xác nhận sự cố vượt thẩm quyền xử lý tại phân xưởng.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPhase2Modal(false);
        onSuccess("phase2");
      } else {
        setError(data.error || "Chuyển Phase 2 thất bại");
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {/* 3 Forms Side-by-Side Comparison */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider border-b border-slate-200 pb-3">
          <FileSpreadsheet className="w-4 h-4 text-[#004724]" />
          <span>So Sánh 3 Bản Phân Tích 5M+1E (QA • Line Leader • Công Nghệ)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* QA Form Column */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                1. Chuyên Viên QA
              </span>
              <span className="text-[10px] font-mono text-blue-700">
                {qaForm ? "Đã nộp" : "Chưa nộp"}
              </span>
            </div>
            {qaForm ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-blue-950">
                  {qaForm.userName} ({qaForm.userMnv})
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-slate-800 font-medium">
                  <strong>Kết luận:</strong> {qaForm.rootCauseConclusion}
                </div>
                <div className="text-[11px] text-blue-800">
                  Nhóm 5M+1E: <strong>{qaForm.rootCauseCategory || "Machine"}</strong>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                Chờ QA nộp form...
              </div>
            )}
          </div>

          {/* Line Leader Form Column */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase">
                2. Line Leader (Tổ Trưởng)
              </span>
              <span className="text-[10px] font-mono text-amber-700">
                {llForm ? "Đã nộp" : "Chưa nộp"}
              </span>
            </div>
            {llForm ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-amber-950">
                  {llForm.userName} ({llForm.userMnv})
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-slate-800 font-medium">
                  <strong>Kết luận:</strong> {llForm.rootCauseConclusion}
                </div>
                <div className="text-[11px] text-amber-800">
                  Nhóm 5M+1E: <strong>{llForm.rootCauseCategory || "Machine"}</strong>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                Chờ Line Leader nộp form...
              </div>
            )}
          </div>

          {/* Technology (CN) Form Column */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase">
                3. Kỹ Sư Công Nghệ (CN)
              </span>
              <span className="text-[10px] font-mono text-purple-700">
                {cnForm ? "Đã nộp" : "Chưa nộp"}
              </span>
            </div>
            {cnForm ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-purple-950">
                  {cnForm.userName} ({cnForm.userMnv})
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-slate-800 font-medium">
                  <strong>Kết luận:</strong> {cnForm.rootCauseConclusion}
                </div>
                <div className="text-[11px] text-purple-800">
                  Nhóm 5M+1E: <strong>{cnForm.rootCauseCategory || "Machine"}</strong>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                Chờ Kỹ sư Công nghệ nộp form...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synthesis Action Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider border-b border-slate-200 pb-3">
          <ShieldCheck className="w-4 h-4 text-[#004724]" />
          <span>Bước 3: Line Leader Tổng Hợp Nguyên Nhân Gốc & Đề Xuất Giải Pháp</span>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#004724] mb-1.5">
              NGUYÊN NHÂN GỐC RỄ CHÍNH THỨC (ROOT CAUSE) *
            </label>
            <textarea
              rows={3}
              value={rootCauseSummary}
              onChange={(e) => setRootCauseSummary(e.target.value)}
              placeholder="VD: Áp suất máy gò đinh bị sụt giảm từ 6 bar xuống 4 bar do mòn van xả khí nén SMC..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#004724] mb-1.5">
              ĐỀ XUẤT PHƯƠNG ÁN GIẢI PHÁP KHẮC PHỤC (TUỲ CHỌN)
            </label>
            <textarea
              rows={3}
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="VD: Kỹ thuật viên Bảo trì thay thế van xả khí nén mới và hiệu chỉnh lại rơ-le nhiệt độ trong 30 phút..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#004724]"
            />
          </div>
        </div>

        {/* Action Buttons: Confirm vs Phase 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmSolution}
            className="py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? "Đang ghi nhận..." : "CHỐT NGUYÊN NHÂN & GIẢI PHÁP"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowPhase2Modal(true)}
            className="py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>KHÔNG THỂ XỬ LÝ ➔ CHUYỂN PHASE 2 (GĐ)</span>
          </button>
        </div>
      </div>

      {/* Modal Confirm Phase 2 Escalation */}
      {showPhase2Modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center space-x-2 text-rose-600 font-black text-base">
              <Siren className="w-5 h-5" />
              <span>XÁC NHẬN CHUYỂN SỰ CỐ SANG PHASE 2 (BAN GIÁM ĐỐC)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sự cố sẽ được chuyển trực tiếp tới Ban Giám Đốc (GĐ Phân xưởng / Tổng Giám Đốc) để chỉ đạo xử lý cấp cao.
              Phiếu sẽ không qua bước giao việc phòng ban thông thường.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lý do / Ghi chú gửi Ban Giám Đốc:</label>
              <textarea
                rows={3}
                value={phase2Notes}
                onChange={(e) => setPhase2Notes(e.target.value)}
                placeholder="Nhập lý do tại sao không thể giải quyết ở cấp phân xưởng..."
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPhase2Modal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleEscalatePhase2}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                {isSubmitting ? "Đang chuyển..." : "Xác nhận chuyển Phase 2"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
