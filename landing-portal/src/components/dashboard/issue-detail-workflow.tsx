"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertTriangle, Lock, LockKeyholeOpen, Upload, X, ArrowLeft, Image as ImageIcon, ShieldAlert, Sparkles, Building, Layers, Package } from "lucide-react";
import { AI5M1EAssistant } from "@/components/dashboard/ai-5m1e-assistant";
import { BeforeAfterComparison } from "@/components/dashboard/before-after-comparison";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";

interface UploadedImage {
  imageUrl: string;
  r2Key?: string;
  name: string;
}

interface IssueData {
  id: string;
  issueCode: string;
  productCode: string;
  productName: string;
  affectedSizes: string[];
  workshopName?: string;
  detectionStage: string;
  description: string;
  severity: string;
  status: string;
  createdByName: string;
  createdByMnv: string;
  createdAt: string;
  initialDefectQty?: number;
  repairedDefectQty?: number;
  closedOnceAt?: string;
  closedTwiceAt?: string;
  repairedImages?: string[];
  initialImages?: string[];
  aiCauseDiagnosis?: string;
  testRunHours?: number;
}

export function IssueDetailWorkflow({ issue }: { issue: IssueData }) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<string>(issue.status || "cho_xu_ly");
  const [initialQty, setInitialQty] = useState<number>(issue.initialDefectQty || 10);
  const [repairedQty, setRepairedQty] = useState<number>(issue.repairedDefectQty || 0);
  const [testRunHours, setTestRunHours] = useState<number>(issue.testRunHours || 3);
  const [solutionDetail, setSolutionDetail] = useState("");
  const [aiDiagnosis, setAiDiagnosis] = useState<string>(issue.aiCauseDiagnosis || "");
  const [repairedImages, setRepairedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Determine stage flags
  const isChoXuLy = currentStatus === "cho_xu_ly";
  const isDangXuLy = currentStatus === "dang_xu_ly";
  const isDangChayThu = currentStatus === "dang_chay_thu" || currentStatus === "theo_doi";
  const isDaXuLy = currentStatus === "da_xu_ly";

  async function handleUploadRepairedImage(e: React.ChangeEvent<HTMLInputElement>) {
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
    setRepairedImages((prev) => [...prev, ...newImgs]);
    setUploading(false);
    e.target.value = "";
  }

  // Action: Confirm Step 2 & Start Step 3 (Đóng Lần 1)
  async function handleCloseOnce() {
    setSubmitting(true);
    setMsg(null);

    const closedOnceTime = new Date().toLocaleString("vi-VN");
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "dang_chay_thu",
          initialDefectQty: initialQty,
          aiCauseDiagnosis: aiDiagnosis,
          closedOnceAt: closedOnceTime,
          testRunHours,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setCurrentStatus("dang_chay_thu");
        setMsg("Đã Đóng Lần 1 thành công! Kích hoạt đếm giờ chạy thử nghiệm 3h - 48h.");
        router.refresh();
      } else {
        setMsg(`Lỗi cập nhật: ${data.error}`);
      }
    } catch {
      setSubmitting(false);
      setMsg("Không thể đóng lần 1. Vui lòng thử lại.");
    }
  }

  // Action: Confirm Step 4 (Đóng Lần 2 Hoàn Tất Phiếu)
  async function handleCloseTwice() {
    setSubmitting(true);
    setMsg(null);

    const closedTwiceTime = new Date().toLocaleString("vi-VN");
    const imgUrls = repairedImages.map((img) => img.imageUrl);

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "da_xu_ly",
          repairedDefectQty: repairedQty,
          repairedImages: imgUrls,
          closedTwiceAt: closedTwiceTime,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setCurrentStatus("da_xu_ly");
        setMsg("Đã Đóng Lần 2 thành công! Phiếu đã hoàn tất và xuất bảng báo cáo đối chứng.");
        router.refresh();
      } else {
        setMsg(`Lỗi cập nhật: ${data.error}`);
      }
    } catch {
      setSubmitting(false);
      setMsg("Không thể đóng lần 2. Vui lòng thử lại.");
    }
  }

  return (
    <div className="space-y-6 text-slate-900 font-sans max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Mã Phiếu:</span>
          <span className="px-3 py-1 rounded-full bg-[#004724] text-white text-xs font-black">
            {issue.issueCode}
          </span>
        </div>
      </div>

      {/* Main Status Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              QUY TRÌNH FAST FEEDBACK LOOP
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isChoXuLy
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : isDangXuLy
                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                  : isDangChayThu
                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                  : "bg-emerald-100 text-[#004724] border border-emerald-300"
              }`}
            >
              {isChoXuLy && "Bước 1: Chờ tiếp nhận"}
              {isDangXuLy && "Bước 2: Trưởng line xử lý AI 5M+1E"}
              {isDangChayThu && "Bước 3: Đang chạy thử nghiệm"}
              {isDaXuLy && "Bước 4: Đã xử lý xong (Hoàn tất)"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury mt-1">
            [{issue.productCode}] {issue.productName}
          </h1>
        </div>

        {/* Status Timers Badge */}
        {isDangChayThu && (
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
            <CountdownTimer targetMinutes={testRunHours * 60} label="Đang Chạy Thử" />
          </div>
        )}
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#004724] text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 1: CÁC TRƯỜNG THÔNG TIN PHÁT HIỆN BAN ĐẦU (LUÔN HIỂN THỊ) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider border-b border-slate-200 pb-3">
          <Package className="w-4 h-4" />
          <span>1. Thông Tin Phát Hiện Sự Cố Ban Đầu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Building className="w-3 h-3 text-[#004724]" /> Phân xưởng
            </span>
            <div className="font-bold text-slate-900">{issue.workshopName || "Phân xưởng Chặt & Chuẩn bị"}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#004724]" /> Công đoạn phát hiện
            </span>
            <div className="font-bold text-slate-900">{issue.detectionStage}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Mức độ nghiêm trọng</span>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase border border-amber-300">
                {issue.severity}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <span className="font-bold text-slate-700">Size bị ảnh hưởng:</span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {issue.affectedSizes.map((sz, i) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-bold text-[#004724]">
                Size {sz}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700">Mô tả hiện tượng lỗi:</span>
          <p className="text-slate-800 leading-relaxed font-medium">{issue.description}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BƯỚC 2: TRƯỞNG LINE NHẬP SỐ LƯỢNG HÀNG HƯ & TRỢ LÝ AI 5M+1E (HIỂN THỊ TỪ BƯỚC 2 TRỞ ĐI) */}
      {/* ========================================================================= */}
      {(isChoXuLy || isDangXuLy || isDangChayThu || isDaXuLy) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>2. Trưởng Line Tiếp Nhận & Nhập Số Lượng Hàng Hư</span>
            </div>
            {isChoXuLy && (
              <button
                type="button"
                onClick={() => setCurrentStatus("dang_xu_ly")}
                className="px-4 py-2 rounded-2xl bg-[#004724] text-white text-xs font-bold shadow-xs hover:bg-[#07361e] transition-all"
              >
                Tiếp nhận & Mở Trợ lý AI 5M+1E
              </button>
            )}
          </div>

          {/* Input initial defect quantity */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              Số Lượng Hàng Hư Ban Đầu (Cái / Đôi) *
            </label>
            <input
              type="number"
              min={1}
              value={initialQty}
              disabled={isDangChayThu || isDaXuLy}
              onChange={(e) => setInitialQty(Number(e.target.value))}
              placeholder="Nhập số lượng sản phẩm bị lỗi (VD: 50)"
              className="w-full max-w-xs rounded-2xl bg-white border border-amber-300 px-4 py-2.5 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#004724]"
            />
          </div>

          {/* Interactive AI 5M+1E Assistant Component */}
          {(isDangXuLy || isChoXuLy) && (
            <AI5M1EAssistant
              productName={issue.productName}
              detectionStage={issue.detectionStage}
              description={issue.description}
              onCompleteAnalysis={(res) => setAiDiagnosis(res.diagnosis)}
            />
          )}

          {aiDiagnosis && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
              <div className="font-bold text-[#004724] flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#8dc63f]" />
                <span>Kết quả AI 5M+1E Chẩn đoán:</span>
              </div>
              <pre className="font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">{aiDiagnosis}</pre>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: ĐÓNG LẦN 1 & KÍCH HOẠT CHẠY THỬ (HIỂN THỊ TỪ BƯỚC DANG_XU_LY TRỞ ĐI) */}
      {/* ========================================================================= */}
      {(isDangXuLy || isDangChayThu || isDaXuLy) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <Lock className="w-4 h-4 text-[#004724]" />
              <span>3. Đóng Lần 1 & Kích Hoạt Giờ Chạy Thử (Min 3h - Max 48h)</span>
            </div>
          </div>

          {isDangXuLy && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Chọn Thời Gian Chạy Thử Nghiệm Tối Thiểu (3 Giờ - 48 Giờ) *
                </label>
                <div className="flex items-center space-x-3">
                  {[3, 6, 12, 24, 48].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setTestRunHours(hrs)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        testRunHours === hrs
                          ? "bg-[#004724] text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {hrs} Giờ
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleCloseOnce}
                className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? "Đang ghi nhận..." : "🔒 ĐÓNG LẦN 1 - KÍCH HOẠT ĐẾM GIỜ CHẠY THỬ"}</span>
              </button>
            </div>
          )}

          {issue.closedOnceAt && (
            <div className="text-xs text-slate-600 font-semibold">
              🔒 Đã đóng lần 1 lúc: <strong className="text-[#004724]">{issue.closedOnceAt}</strong>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 4: ĐÓNG LẦN 2 (NHẬP SỐ LƯỢNG LỖI SAU SỬA & ẢNH SAU SỬA) */}
      {/* ========================================================================= */}
      {(isDangChayThu || isDaXuLy) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <LockKeyholeOpen className="w-4 h-4 text-emerald-600" />
              <span>4. Đóng Lần 2 - Nhập Số Lượng Lỗi Sau Sửa & Ảnh Sản Phẩm Hoàn Thành</span>
            </div>
          </div>

          {isDangChayThu && (
            <div className="space-y-6">
              {/* Input Repaired Defect Quantity */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#004724]">
                  Số Lượng Hàng Lỗi Phát Sinh Sau Khi Sửa (Cái / Đôi) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={repairedQty}
                  onChange={(e) => setRepairedQty(Number(e.target.value))}
                  placeholder="Nhập số lượng lỗi phát sinh sau ca chạy thử (VD: 0)"
                  className="w-full max-w-xs rounded-2xl bg-white border border-emerald-300 px-4 py-2.5 text-sm text-[#004724] font-extrabold focus:outline-none focus:border-[#004724]"
                />
              </div>

              {/* Upload Repaired Images */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-[#004724]" />
                  <span>Cập Nhật Hình Ảnh Minh Chứng Sản Phẩm Sau Khi Sửa (R2 Preview) *</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {repairedImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-emerald-200 aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt="Repaired" className="w-full h-full object-cover" />
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-emerald-300 hover:border-[#004724] rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer bg-emerald-50/40 hover:bg-emerald-50 transition-all text-[#004724]">
                    <Upload className="w-6 h-6 mb-2 text-[#004724]" />
                    <span className="text-xs font-bold">{uploading ? "Đang tải..." : "Tải Ảnh Sản Phẩm Sau Sửa"}</span>
                    <input type="file" multiple accept="image/*" onChange={handleUploadRepairedImage} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleCloseTwice}
                className="w-full py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "Đang lưu..." : "✅ ĐÓNG LẦN 2 - HOÀN TẤT PHIẾU LỖI CLSK"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 5: BẢNG SO SÁNH ĐỐI CHỨNG TRƯỚC VS SAU SỬA CHỮA (HIỂN THỊ KHI ĐÃ ĐÓNG LẦN 2) */}
      {/* ========================================================================= */}
      {isDaXuLy && (
        <BeforeAfterComparison
          initialQty={issue.initialDefectQty || initialQty}
          repairedQty={issue.repairedDefectQty || repairedQty}
          initialImages={issue.initialImages || []}
          repairedImages={issue.repairedImages || repairedImages.map((img) => img.imageUrl)}
          closedOnceAt={issue.closedOnceAt}
          closedTwiceAt={issue.closedTwiceAt}
        />
      )}
    </div>
  );
}
