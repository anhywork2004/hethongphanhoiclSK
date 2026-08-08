"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Clock, AlertTriangle, CheckCircle2, Factory, Package, Layers, Image as ImageIcon } from "lucide-react";
import { Visual4M1EPicker } from "@/components/reports/visual-4m1e-picker";

interface SizeItem {
  id: string;
  sizeCode: string;
  sizeName: string;
}

interface WorkshopItem {
  id: string;
  workshopCode: string;
  workshopName: string;
}

interface UploadedImage {
  imageUrl: string;
  r2Key?: string;
  name: string;
}

export function IssueReportForm() {
  const router = useRouter();

  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState("");
  const [detectionStage, setDetectionStage] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"thap" | "trung_binh" | "cao" | "khan_cap">("trung_binh");
  const [selectedCause4M1E, setSelectedCause4M1E] = useState("Machine");

  const [sizesList, setSizesList] = useState<SizeItem[]>([]);
  const [workshopsList, setWorkshopsList] = useState<WorkshopItem[]>([]);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Realtime clock display (non-editable)
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    setCurrentTime(
      new Date().toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/sizes")
      .then((res) => res.json())
      .then((data) => {
        if (data.sizes) setSizesList(data.sizes);
      })
      .catch(() => {});

    fetch("/api/workshops")
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) {
          setWorkshopsList(data.workshops);
          if (data.workshops.length > 0) {
            setSelectedWorkshopId(data.workshops[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  function toggleSize(code: string) {
    if (selectedSizes.includes(code)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== code));
    } else {
      setSelectedSizes([...selectedSizes, code]);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          newImages.push({
            imageUrl: data.imageUrl,
            r2Key: data.r2Key,
            name: data.name,
          });
        }
      } catch {
        // continue
      }
    }

    setUploadedImages((prev) => [...prev, ...newImages]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!productCode.trim()) {
      setError("Vui lòng nhập Mã sản phẩm.");
      return;
    }
    if (!productName.trim()) {
      setError("Vui lòng nhập Tên sản phẩm.");
      return;
    }
    if (selectedSizes.length === 0) {
      setError("Vui lòng chọn ít nhất 1 size bị ảnh hưởng.");
      return;
    }
    if (!detectionStage.trim()) {
      setError("Vui lòng nhập Công đoạn phát hiện.");
      return;
    }
    if (!description.trim()) {
      setError("Vui lòng nhập Mô tả chi tiết hiện tượng lỗi.");
      return;
    }

    setSubmitting(true);

    const selectedWsObj = workshopsList.find((w) => w.id === selectedWorkshopId);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode,
          productName,
          affectedSizes: selectedSizes,
          workshopId: selectedWorkshopId,
          workshopName: selectedWsObj?.workshopName || "Phân xưởng Chặt & Chuẩn bị",
          detectionStage,
          description: `[Lỗi 4M+1E: ${selectedCause4M1E}] ${description}`,
          severity,
          images: uploadedImages,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setSuccessMsg(`Tạo thành công Phiếu CLSK mã: ${data.issue?.issueCode || "Mới"}! Trạng thái = Chờ xử lý (cho_xu_ly).`);
        setTimeout(() => {
          router.push("/dashboard/categories/cho_xu_ly");
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi phiếu.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setSubmitting(false);
      setError(`Không thể gửi phiếu: ${e.message}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#004724] tracking-tight font-serif-luxury">
            Tạo Báo Cáo Vấn Đề CLSK
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Phát hiện sự cố chất lượng sản phẩm & phát động quy trình 2 giờ vàng.
          </p>
        </div>

        {/* Realtime non-editable clock */}
        <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs font-mono text-[#004724] shadow-xs">
          <Clock className="w-4 h-4 text-[#004724] animate-pulse" />
          <span>{currentTime || "Loading clock..."}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center space-x-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 flex items-center space-x-3 text-[#004724] text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1-Touch 4M+1E Cause Picker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <Visual4M1EPicker
          selectedCause={selectedCause4M1E}
          onSelectCause={(cause) => setSelectedCause4M1E(cause)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        {/* 1. Mã sản phẩm */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-[#004724]" />
            <span>Mã Sản Phẩm *</span>
          </label>
          <input
            type="text"
            required
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="VD: SK-GO-WALK-6"
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] uppercase transition-all font-semibold"
          />
        </div>

        {/* 2. Tên sản phẩm */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-[#004724]" />
            <span>Tên Sản Phẩm *</span>
          </label>
          <input
            type="text"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="VD: Giày Thể Thao Skechers Go Walk Flex"
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] transition-all font-semibold"
          />
        </div>

        {/* 3. Phân xưởng */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2 flex items-center space-x-1.5">
            <Factory className="w-3.5 h-3.5 text-[#004724]" />
            <span>Phân Xưởng *</span>
          </label>
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#004724] transition-all font-semibold"
          >
            {workshopsList.length === 0 && <option value="">Đang tải phân xưởng...</option>}
            {workshopsList.map((ws) => (
              <option key={ws.id} value={ws.id}>
                [{ws.workshopCode}] {ws.workshopName}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Công đoạn phát hiện */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-[#004724]" />
            <span>Công Đoạn Phát Hiện *</span>
          </label>
          <input
            type="text"
            required
            value={detectionStage}
            onChange={(e) => setDetectionStage(e.target.value)}
            placeholder="VD: Công đoạn Gò mũi / Chuyền may 2"
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] transition-all font-semibold"
          />
        </div>
      </div>

      {/* 5. Size bị ảnh hưởng */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724]">
            Size Bị Ảnh Hưởng (Chọn Nhiều Size) *
          </label>
          <span className="text-xs text-[#004724] font-bold">
            Đã chọn {selectedSizes.length} size
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {sizesList.map((sz) => {
            const isSelected = selectedSizes.includes(sz.sizeCode);
            return (
              <button
                type="button"
                key={sz.id}
                onClick={() => toggleSize(sz.sizeCode)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-[#004724] text-white shadow-md ring-2 ring-emerald-400"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:border-emerald-300"
                }`}
              >
                {sz.sizeCode}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Mức độ nghiêm trọng & Mô tả */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2">
            Mức Độ Nghiêm Trọng *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "thap", label: "Thấp", color: "hover:border-slate-400 text-slate-700", active: "bg-slate-100 text-slate-900 border-slate-300 font-bold" },
              { id: "trung_binh", label: "Trung Bình", color: "hover:border-blue-400 text-blue-800", active: "bg-blue-50 text-blue-900 border-blue-300 font-bold" },
              { id: "cao", label: "Cao", color: "hover:border-amber-400 text-amber-800", active: "bg-amber-50 text-amber-900 border-amber-300 font-bold" },
              { id: "khan_cap", label: "Khẩn Cấp", color: "hover:border-rose-400 text-rose-800", active: "bg-rose-50 text-rose-900 border-rose-300 font-bold" },
            ].map((sev) => (
              <button
                type="button"
                key={sev.id}
                onClick={() => setSeverity(sev.id as any)}
                className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all text-center ${
                  severity === sev.id ? sev.active : `bg-slate-50 border-slate-200 ${sev.color}`
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] mb-2">
            Mô Tả Chi Tiết Hiện Tượng Lỗi *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả cụ thể dạng lỗi (VD: Quai may lệch chỉ 2mm, đường may nhăn quăn, hở keo gót đế...)"
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004724] transition-all font-medium"
          />
        </div>
      </div>

      {/* 7. Upload Hình ảnh */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-[#004724]" />
          <span>Hình Ảnh Minh Chứng (Upload Cloudflare R2 - Preview trực tiếp)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="Proof" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <label className="border-2 border-dashed border-slate-300 hover:border-[#004724] rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-all text-slate-500 hover:text-[#004724]">
            <Upload className="w-6 h-6 mb-2 text-[#004724]" />
            <span className="text-xs font-bold">{uploading ? "Đang tải R2..." : "Tải Ảnh Lên"}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Form Submit CTA */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>{submitting ? "Đang Gửi Phiếu Lỗi CLSK..." : "GỬI PHIẾU BÁO CÁO LỖI (TỰ ĐỘNG GỬI ZALO 3 NHÓM)"}</span>
        </button>
      </div>
    </form>
  );
}
