"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  Play,
} from "lucide-react";

interface PartRow {
  partId: string;
  partName: string;
  quantity: number;
  note: string;
}

interface PartCategoryOption {
  id: string;
  name: string;
  code?: string | null;
  unit?: string | null;
}

interface TechnicianRepairFormProps {
  issueId: string;
  issueCode: string;
  taskStatus?: string; // 'pending' | 'accepted' | 'done'
  acceptedAt?: number | null;
  onAccepted: () => void;
  onCompleted: () => void;
}

export function TechnicianRepairForm({
  issueId,
  issueCode,
  taskStatus = "pending",
  acceptedAt,
  onAccepted,
  onCompleted,
}: TechnicianRepairFormProps) {
  const [status, setStatus] = useState<string>(taskStatus);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [repairDescription, setRepairDescription] = useState("");
  const [partCategories, setPartCategories] = useState<PartCategoryOption[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartRow[]>([
    { partId: "part-van-smc", partName: "Van xả khí nén SMC 6 bar", quantity: 1, note: "Thay mới van xả khí" },
  ]);

  const [imagesBefore, setImagesBefore] = useState<string[]>([]);
  const [imagesAfter, setImagesAfter] = useState<string[]>([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load spare parts categories
  useEffect(() => {
    async function loadParts() {
      try {
        const res = await fetch("/api/admin/part-categories");
        const data = await res.json();
        if (data.success && data.parts?.length > 0) {
          setPartCategories(data.parts);
        } else {
          setPartCategories([
            { id: "part-van-smc", name: "Van xả khí nén SMC 6 bar", unit: "Cái" },
            { id: "part-dien-tro", name: "Điện trở sấy nhiệt ép 600W", unit: "Thanh" },
            { id: "part-kim-may", name: "Kim may công nghiệp Groz-Beckert #14", unit: "Hộp" },
            { id: "part-curoa", name: "Dây curoa chuyền băng tải Optibelt", unit: "Sợi" },
            { id: "part-cam-bien", name: "Cảm biến quang Omron E3Z", unit: "Cái" },
          ]);
        }
      } catch {
        // fallback
      }
    }
    loadParts();
  }, []);

  // Real-time stopwatch timer from acceptedAt
  useEffect(() => {
    if (status !== "accepted") return;

    const startTimestamp = acceptedAt ? acceptedAt * 1000 : Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(diffSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, acceptedAt]);

  // Format timer as HH:MM:SS
  function formatStopwatch(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Handle Accepting Work (Step 5)
  async function handleAcceptWork() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/accept-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setStatus("accepted");
        onAccepted();
      } else {
        setError(data.error || "Nhận việc thất bại");
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    }
    setIsSubmitting(false);
  }

  // Handle Multi-row Part Add/Remove
  function addPartRow() {
    const defaultPart = partCategories[0] || { id: "part-van-smc", name: "Linh kiện thay thế" };
    setPartsUsed([
      ...partsUsed,
      { partId: defaultPart.id, partName: defaultPart.name, quantity: 1, note: "" },
    ]);
  }

  function removePartRow(index: number) {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  }

  function updatePartRow(index: number, field: keyof PartRow, val: any) {
    const updated = [...partsUsed];
    if (field === "partId") {
      const found = partCategories.find((p) => p.id === val);
      updated[index].partId = val;
      updated[index].partName = found ? found.name : "Linh kiện";
    } else {
      (updated[index] as any)[field] = val;
    }
    setPartsUsed(updated);
  }

  // Handle R2 Image Uploads
  async function handleUploadImages(e: React.ChangeEvent<HTMLInputElement>, isBefore: boolean) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isBefore) setUploadingBefore(true);
    else setUploadingAfter(true);

    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      } catch {
        // ignore
      }
    }

    if (isBefore) {
      setImagesBefore([...imagesBefore, ...uploadedUrls]);
      setUploadingBefore(false);
    } else {
      setImagesAfter([...imagesAfter, ...uploadedUrls]);
      setUploadingAfter(false);
    }
  }

  // Handle Completing Repair (Step 6)
  async function handleCompleteRepair() {
    if (!repairDescription.trim()) {
      setError("Vui lòng nhập mô tả chi tiết các bước sửa chữa đã thực hiện!");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/issues/${issueId}/complete-repair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairDescription: repairDescription.trim(),
          partsUsed,
          imagesBefore,
          imagesAfter,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("done");
        onCompleted();
      } else {
        setError(data.error || "Hoàn thành sửa chữa thất bại");
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 5: Card "Cần Trợ Giúp / Nhận Việc" (if task is pending) */}
      {status === "pending" && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-300 shadow-sm space-y-4 text-slate-900">
          <div className="flex items-center space-x-2 text-amber-900 font-black text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-amber-700" />
            <span>Bước 5: Thẻ Nhận Việc - Sửa Chữa Khắc Phục Sự Cố</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Bạn đã được Trưởng phòng ban giao xử lý phiếu <strong>{issueCode}</strong>.
            Bấm nút <strong>&ldquo;Nhận Việc&rdquo;</strong> bên dưới để bắt đầu đồng hồ đếm giờ làm việc real-time.
            (Ràng buộc: 1 người chỉ nhận 1 việc tại 1 thời điểm).
          </p>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAcceptWork}
            className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isSubmitting ? "Đang nhận việc..." : "BẮT ĐẦU NHẬN VIỆC & KÍCH HOẠT ĐỒNG HỒ"}</span>
          </button>
        </div>
      )}

      {/* Step 6: Active Stopwatch & Repair Form (when task is accepted) */}
      {status === "accepted" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 text-slate-900">
          {/* Real-time Stopwatch Bar */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-black text-blue-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Đang Xử Lý Sửa Chữa (Đồng Hồ Real-Time)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono tracking-widest">
              ⏱️ {formatStopwatch(elapsedSeconds)}
            </div>
          </div>

          {/* Description of Repair */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-[#004724]">
              1. Mô Tả Chi Tiết Quá Trình & Biện Pháp Sửa Chữa *
            </label>
            <textarea
              rows={3}
              value={repairDescription}
              onChange={(e) => setRepairDescription(e.target.value)}
              placeholder="VD: Đã tháo van xả khí SMC cũ bị rò rỉ, thay van SMC mới chính hãng và hiệu chỉnh rơ-le nhiệt độ ở 60°C..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#004724]"
            />
          </div>

          {/* Multi-row Spare Parts Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#004724] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#004724]" />
                <span>2. Danh Sách Linh Kiện Thay Thế Sử Dụng (Nhiều Dòng)</span>
              </label>
              <button
                type="button"
                onClick={addPartRow}
                className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#004724] text-xs font-bold border border-emerald-300 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm linh kiện</span>
              </button>
            </div>

            <div className="space-y-2">
              {partsUsed.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 items-center text-xs">
                  <div className="sm:col-span-6">
                    <select
                      value={row.partId}
                      onChange={(e) => updatePartRow(idx, "partId", e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-bold"
                    >
                      {partCategories.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit || "Cái"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updatePartRow(idx, "quantity", Number(e.target.value))}
                      placeholder="SL"
                      className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-black text-center"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e) => updatePartRow(idx, "note", e.target.value)}
                      placeholder="Ghi chú (VD: Thay mới)"
                      className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removePartRow(idx)}
                      className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Xoá dòng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Before and After Image Upload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Before Repair Images */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Ảnh Minh Chứng Trước Khi Sửa</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {imagesBefore.map((url, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Before" className="w-full h-full object-cover" />
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer bg-white text-slate-400">
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-1">{uploadingBefore ? "..." : "+ Tải"}</span>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleUploadImages(e, true)} className="hidden" />
                </label>
              </div>
            </div>

            {/* After Repair Images */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-black uppercase text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ảnh Minh Chứng Sau Khi Sửa</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {imagesAfter.map((url, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="After" className="w-full h-full object-cover" />
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer bg-white text-slate-400">
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-1">{uploadingAfter ? "..." : "+ Tải"}</span>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleUploadImages(e, false)} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Repair Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCompleteRepair}
            className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? "Đang gửi báo cáo..." : "HOÀN THÀNH SỬA CHỮA & GỬI TRƯỞNG LINE XÁC NHẬN"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
