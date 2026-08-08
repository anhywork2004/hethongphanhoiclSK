"use client";

import { useState } from "react";
import { Wrench, Upload, X, CheckCircle2, Image as ImageIcon, Send } from "lucide-react";

interface UploadedImage {
  imageUrl: string;
  r2Key?: string;
  name: string;
}

interface TechnicianRepairFormProps {
  issueId: string;
  onSubmitRepair: (data: { notes: string; proofImages: string[] }) => void;
}

export function TechnicianRepairForm({ issueId, onSubmitRepair }: TechnicianRepairFormProps) {
  const [repairNotes, setRepairNotes] = useState("");
  const [proofImages, setProofImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleUploadProof(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImgs: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          newImgs.push({ imageUrl: data.imageUrl, r2Key: data.r2Key, name: data.name });
        }
      } catch {
        // ignore
      }
    }
    setProofImages((prev) => [...prev, ...newImgs]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setProofImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repairNotes.trim()) return;

    setSubmitting(true);
    const imgUrls = proofImages.map((img) => img.imageUrl);
    onSubmitRepair({ notes: repairNotes, proofImages: imgUrls });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 text-slate-900 space-y-5 shadow-xs">
      <div className="flex items-center space-x-2 border-b border-blue-200 pb-3">
        <div className="p-2 rounded-xl bg-blue-600 text-white">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
            KHU VỰC DÀNH CHO KỸ THUẬT BẢO TRÌ / NGƯỜI SỬA CHỮA
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">
            Form Báo Cáo Hoàn Thành Nhiệm Vụ Sửa Chữa
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Chi Tiết Phương Án Đã Xử Lý / Linh Kiện Thay Thế *
        </label>
        <textarea
          required
          rows={3}
          value={repairNotes}
          onChange={(e) => setRepairNotes(e.target.value)}
          placeholder="VD: Đã hiệu chỉnh lại rơ-le nhiệt độ lò sấy lên 60°C, thay curoa truyền động máy gò đinh Skechers..."
          className="w-full rounded-2xl bg-white border border-blue-300 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
        />
      </div>

      {/* Proof Images Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Hình Ảnh Minh Chứng Kết Quả Sửa Chữa (Preview trực tiếp)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {proofImages.map((img, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden border border-blue-300 aspect-square group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="Proof" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-90 hover:scale-110 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <label className="border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-blue-100/50 transition-all text-blue-700">
            <Upload className="w-5 h-5 mb-1 text-blue-600" />
            <span className="text-[11px] font-bold">{uploading ? "Đang tải R2..." : "Tải Ảnh Lên"}</span>
            <input type="file" multiple accept="image/*" onChange={handleUploadProof} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !repairNotes.trim()}
        className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? "Đang gửi..." : "🔧 HOÀN THÀNH SỬA CHỮA & GỬI THÔNG BÁO CHO TRƯỞNG LINE"}</span>
      </button>
    </form>
  );
}
