"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, User, Cpu, Package, Compass, Sun, Ruler } from "lucide-react";

export default function Form15Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [poNumber, setPoNumber] = useState("");
  const [defectQuantity, setDefectQuantity] = useState<number | "">("");
  const [man, setMan] = useState("");
  const [machine, setMachine] = useState("");
  const [material, setMaterial] = useState("");
  const [method, setMethod] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [environment, setEnvironment] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!defectQuantity || Number(defectQuantity) <= 0) {
      setError("Vui lòng nhập số lượng hàng hư bị ảnh hưởng.");
      return;
    }
    if (!rootCause.trim()) {
      setError("Vui lòng nhập kết luận Nguyên nhân gốc sau khi phân tích.");
      return;
    }
    if (!proposedSolution.trim()) {
      setError("Vui lòng nhập Đề xuất giải pháp khắc phục.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${id}/form15`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poNumber,
          defectQuantity: Number(defectQuantity),
          man,
          machine,
          material,
          method,
          measurement,
          environment,
          rootCause,
          proposedSolution,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setSuccess("Đã hoàn tất phân tích 5M+1E! Chuyển trạng thái phiếu sang Đang xử lý.");
        setTimeout(() => {
          router.push(`/dashboard/issues/${id}`);
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Có lỗi xảy ra khi lưu Form 15m.");
      }
    } catch {
      setSubmitting(false);
      setError("Không thể kết nối máy chủ.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
            FORM 15 PHÚT VÀNG
          </span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#004724] font-serif-luxury">
            Phân Tích Nguyên Nhân Lỗi 5M+1E (Nhập Tay Phase 1)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Thời hạn hoàn thành: 15 phút từ lúc phát hiện sự cố • Phân xưởng sản xuất TBS Skechers Kiên Giang 1
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#004724] text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General defect specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-1.5">
                Mã Đơn Hàng / PO Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="VD: PO-2026-8809"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#004724]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-1.5">
                Số Lượng Hàng Hư (Cái / Đôi) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={defectQuantity}
                onChange={(e) => setDefectQuantity(e.target.value ? Number(e.target.value) : "")}
                placeholder="VD: 35"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 font-black focus:outline-none focus:border-[#004724]"
              />
            </div>
          </div>

          {/* 6 Elements 5M+1E Grid */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-black uppercase text-[#004724] tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
              <FileText className="w-4 h-4 text-[#004724]" />
              <span>Phân Tích 6 Yếu Tố 5M+1E (Nhập Tay)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Man */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>1. Man (Con người)</span>
                </label>
                <textarea
                  rows={2}
                  value={man}
                  onChange={(e) => setMan(e.target.value)}
                  placeholder="Thao tác công nhân, tay nghề, sơ suất..."
                  className="w-full rounded-xl bg-white border border-blue-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Machine */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-amber-600" />
                  <span>2. Machine (Máy móc)</span>
                </label>
                <textarea
                  rows={2}
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  placeholder="Lỗi thiết bị, đứt curoa, kẹt kim, lực ép xi lanh..."
                  className="w-full rounded-xl bg-white border border-amber-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Material */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-[#004724]" />
                  <span>3. Material (Nguyên liệu)</span>
                </label>
                <textarea
                  rows={2}
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Chất lượng da, keo dán, chỉ khâu, đế cao su..."
                  className="w-full rounded-xl bg-white border border-emerald-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-[#004724] font-medium"
                />
              </div>

              {/* Method */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <span>4. Method (Phương pháp)</span>
                </label>
                <textarea
                  rows={2}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Sai quy trình SOP, công nghệ gò đế, tốc độ chuyền..."
                  className="w-full rounded-xl bg-white border border-purple-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              {/* Measurement */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
                  <Ruler className="w-4 h-4 text-indigo-600" />
                  <span>5. Measurement (Đo lường)</span>
                </label>
                <textarea
                  rows={2}
                  value={measurement}
                  onChange={(e) => setMeasurement(e.target.value)}
                  placeholder="Dụng cụ đo kích thước, sai số thước kẹp, rơ-le nhiệt..."
                  className="w-full rounded-xl bg-white border border-indigo-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Environment */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center space-x-1.5">
                  <Sun className="w-4 h-4 text-teal-600" />
                  <span>6. Environment (Môi trường)</span>
                </label>
                <textarea
                  rows={2}
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  placeholder="Nhiệt độ lò sấy, độ ẩm chuyền, ánh sáng..."
                  className="w-full rounded-xl bg-white border border-teal-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Root cause conclusion & solution */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-1.5">
                KẾT LUẬN NGUYÊN NHÂN GỐC (ROOT CAUSE) *
              </label>
              <textarea
                required
                rows={3}
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="VD: Áp suất máy gò đinh bị sụt giảm từ 6 bar xuống 4 bar do mòn van xả khí nén..."
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-1.5">
                ĐỀ XUẤT GIẢI PHÁP KHẮC PHỤC TRIỆT ĐỂ *
              </label>
              <textarea
                required
                rows={3}
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                placeholder="VD: Kỹ thuật thay van xả khí SMC mới trong 30 phút và cài lại rơ-le nhiệt độ 60°C..."
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{submitting ? "Đang lưu Form 15m..." : "HOÀN THÀNH FORM 15 PHÚT 5M+1E"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
