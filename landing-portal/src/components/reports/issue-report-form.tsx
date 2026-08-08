"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Clock, AlertTriangle, CheckCircle2, Factory, Package, Layers, Image as ImageIcon } from "lucide-react";

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
          description,
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Form Báo Cáo Vấn Đề (Phiếu CLSK)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phát hiện sự cố chất lượng sản phẩm & phát động quy trình phản hồi 2 giờ vàng.
          </p>
        </div>

        {/* Realtime non-editable clock */}
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs font-mono text-blue-400 shadow-inner">
          <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{currentTime || "Loading realtime clock..."}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-950/80 border border-red-800 p-4 flex items-center space-x-3 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 flex items-center space-x-3 text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
        {/* 1. Mã sản phẩm */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span>Mã Sản Phẩm *</span>
          </label>
          <input
            type="text"
            required
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="VD: SK-GO-WALK-6"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-all"
          />
        </div>

        {/* 2. Tên sản phẩm */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tên Sản Phẩm *</span>
          </label>
          <input
            type="text"
            required
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="VD: Giày Thể Thao Skechers Go Walk Flex"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* 3. Phân xưởng */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
            <Factory className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phân Xưởng *</span>
          </label>
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Công Đoạn Phát Hiện *</span>
          </label>
          <input
            type="text"
            required
            value={detectionStage}
            onChange={(e) => setDetectionStage(e.target.value)}
            placeholder="VD: Công đoạn Gò mũi / Chuyền may 2"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 5. Size bị ảnh hưởng (multi-select) */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Size Bị Ảnh Hưởng (Chọn Nhiều Size) *
          </label>
          <span className="text-xs text-blue-400 font-semibold">
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
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400"
                    : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600"
                }`}
              >
                {sz.sizeCode}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Mức độ nghiêm trọng & Mô tả */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mức Độ Nghiêm Trọng *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "thap", label: "Thấp", color: "hover:border-slate-500 text-slate-300", active: "bg-slate-800 text-slate-100 border-slate-600" },
              { id: "trung_binh", label: "Trung Bình", color: "hover:border-blue-500 text-blue-300", active: "bg-blue-950 text-blue-300 border-blue-700" },
              { id: "cao", label: "Cao", color: "hover:border-amber-500 text-amber-300", active: "bg-amber-950 text-amber-300 border-amber-700" },
              { id: "khan_cap", label: "Khẩn Cấp", color: "hover:border-rose-500 text-rose-300", active: "bg-rose-950 text-rose-300 border-rose-700" },
            ].map((sev) => (
              <button
                type="button"
                key={sev.id}
                onClick={() => setSeverity(sev.id as any)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                  severity === sev.id ? sev.active : `bg-slate-950 border-slate-800 ${sev.color}`
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mô Tả Chi Tiết Hiện Tượng Lỗi *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả cụ thể dạng lỗi (VD: Quai may lệch chỉ 2mm, đường may nhăn quăn, hở keo gót đế...)"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 7. Upload Hình ảnh minh chứng lên Cloudflare R2 */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          <span>Hình Ảnh Minh Chứng (Upload Cloudflare R2 - Preview trước khi gửi)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
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

          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all text-slate-400 hover:text-blue-400">
            <Upload className="w-6 h-6 mb-2" />
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
          className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>{submitting ? "Đang Gửi Phiếu Lỗi CLSK..." : "GỬI PHIẾU BÁO CÁO LỖI (TỰ ĐỘNG GỬI ZALO 3 NHÓM)"}</span>
        </button>
      </div>
    </form>
  );
}
