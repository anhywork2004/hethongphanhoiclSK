"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, AlertTriangle, Siren, Lock, LockKeyholeOpen, Upload, X, ArrowLeft, Image as ImageIcon, ShieldAlert, Sparkles, Building, Layers, Package, Check, RotateCcw, Wrench } from "lucide-react";
import { AI5M1EAssistant } from "@/components/dashboard/ai-5m1e-assistant";
import { BeforeAfterComparison } from "@/components/dashboard/before-after-comparison";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";
import { TechnicianRepairForm } from "@/components/dashboard/technician-repair-form";

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
  workshopName?: string | null;
  detectionStage: string;
  description: string;
  severity: string;
  status: string;
  createdByName?: string | null;
  createdByMnv?: string | null;
  createdAt: string;
  initialDefectQty?: number | null;
  repairedDefectQty?: number | null;
  closedOnceAt?: string | null;
  closedTwiceAt?: string | null;
  repairedImages?: string[];
  initialImages?: string[];
  aiCauseDiagnosis?: string | null;
  testRunHours?: number | null;
}

export function IssueDetailWorkflow({ issue }: { issue: IssueData }) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<string>(issue.status || "cho_xu_ly");
  const [initialQty, setInitialQty] = useState<number>(issue.initialDefectQty || 10);
  const [repairedQty, setRepairedQty] = useState<number>(issue.repairedDefectQty || 0);
  const [testRunHours, setTestRunHours] = useState<number>(issue.testRunHours || 3);
  const [aiDiagnosis, setAiDiagnosis] = useState<string>(issue.aiCauseDiagnosis || "");
  const [technicianNotes, setTechnicianNotes] = useState<string>("");
  const [technicianSubmitted, setTechnicianSubmitted] = useState<boolean>(false);
  const [lineLeaderApproved, setLineLeaderApproved] = useState<boolean>(false);

  const [repairedImages, setRepairedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Status flags
  const isChoXuLy = currentStatus === "cho_xu_ly" || currentStatus === "pending";
  const isDangXuLy = currentStatus === "dang_xu_ly" || currentStatus === "processing";
  const isDangChayThu = currentStatus === "dang_chay_thu" || currentStatus === "monitoring" || currentStatus === "theo_doi";
  const isDaXuLy = currentStatus === "da_xu_ly" || currentStatus === "resolved";
  const isKhongTheXuLy = currentStatus === "khong_the_xu_ly" || currentStatus === "cannot_resolve";

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

  // Handle Technician Submission
  function handleTechnicianSubmit(data: { notes: string; proofImages: string[] }) {
    setTechnicianNotes(data.notes);
    setTechnicianSubmitted(true);
    setMsg("Kỹ thuật đã hoàn thành sửa chữa! Đã gửi thông báo cho Trưởng Line phê duyệt.");
  }

  // Handle Line Leader Rejection -> Reverts back to AI 5M+1E
  function handleLineLeaderReject() {
    setTechnicianSubmitted(false);
    setLineLeaderApproved(false);
    setCurrentStatus("dang_xu_ly");
    setMsg("Trưởng line không xác nhận. Đã chuyển phiếu về bước AI 5M+1E để chẩn đoán lại.");
  }

  // Handle Line Leader Approval -> Unlocks Form 3 (Đóng Lần 1 & Chạy thử)
  function handleLineLeaderApprove() {
    setLineLeaderApproved(true);
    setMsg("Trưởng line đã xác nhận sửa thành công! Form 3 Đóng Lần 1 & Kích hoạt đếm giờ chạy thử đã được mở khóa.");
  }

  // Action: Confirm Step 3 (Đóng Lần 1 & Kích hoạt chạy thử)
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
        setMsg(`Đã Đóng Lần 1 thành công! Kích hoạt đếm giờ chạy thử nghiệm ${testRunHours} giờ.`);
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
                  : isKhongTheXuLy
                  ? "bg-rose-600 text-white border border-rose-700 animate-pulse shadow-xs"
                  : "bg-emerald-100 text-[#004724] border border-emerald-300"
              }`}
            >
              {isChoXuLy && "Bước 1: Chờ tiếp nhận (15p SLA)"}
              {isDangXuLy && "Bước 2: Trưởng line & Kỹ thuật xử lý"}
              {isDangChayThu && "Bước 3: Đang chạy thử nghiệm"}
              {isKhongTheXuLy && "🚨 SOS KHẨN CẤP: Không thể xử lý"}
              {isDaXuLy && "Bước 4: Đã xử lý xong (Hoàn tất)"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury mt-1">
            [{issue.productCode}] {issue.productName}
          </h1>
        </div>

        {/* Dynamic 15m SLA Countdown Timer calculated per-issue from createdAt */}
        {isChoXuLy && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <CountdownTimer targetMinutes={15} createdTimeStr={issue.createdAt} label="Hạn 15p Trưởng Line" />
          </div>
        )}

        {/* 2h 4M+1E SLA Timer */}
        {isDangXuLy && (
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
            <CountdownTimer targetMinutes={120} createdTimeStr={issue.createdAt} label="Hạn 2h 4M+1E" />
          </div>
        )}

        {/* Test Run Timer */}
        {isDangChayThu && (
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
            <CountdownTimer targetMinutes={testRunHours * 60} createdTimeStr={issue.closedOnceAt || issue.createdAt} label="Đang Chạy Thử" />
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
      {/* BƯỚC 2: TRƯỞNG LINE NHẬP SỐ LƯỢNG HÀNG HƯ & TRỢ LÝ AI 5M+1E */}
      {/* ========================================================================= */}
      {(isChoXuLy || isDangXuLy || isDangChayThu || isDaXuLy) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>2. Trưởng Line Tiếp Nhận & Nhập Số Lượng Hàng Hư (15p SLA)</span>
            </div>
            {isChoXuLy && (
              <button
                type="button"
                onClick={() => setCurrentStatus("dang_xu_ly")}
                className="px-4 py-2 rounded-2xl bg-[#004724] text-white text-xs font-bold shadow-xs hover:bg-[#07361e] transition-all"
              >
                Tiếp nhận phiếu (Đáp ứng SLA 15p)
              </button>
            )}
          </div>

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

          {(isDangXuLy || isChoXuLy) && !lineLeaderApproved && (
            <AI5M1EAssistant
              productName={issue.productName}
              detectionStage={issue.detectionStage}
              description={issue.description}
              onCompleteAnalysis={(res) => setAiDiagnosis(res.diagnosis)}
            />
          )}

          {/* Form Technician Repair Submission */}
          {isDangXuLy && !technicianSubmitted && (
            <TechnicianRepairForm issueId={issue.id} onSubmitRepair={handleTechnicianSubmit} />
          )}

          {/* Line Leader Verification Box */}
          {isDangXuLy && technicianSubmitted && !lineLeaderApproved && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
                <Wrench className="w-5 h-5 text-amber-700" />
                <span>KỸ THUẬT ĐÃ HOÀN THÀNH SỬA CHỮA - TRƯỞNG LINE XÁC NHẬN</span>
              </div>
              <p className="text-xs text-slate-700 font-medium bg-white p-3 rounded-2xl border border-amber-200">
                Ghi chú sửa chữa: <strong>{technicianNotes || "Đã hiệu chỉnh máy móc & thay thế linh kiện lỗi"}</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleLineLeaderApprove}
                  className="py-3.5 px-4 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✅ XÁC NHẬN SỬA THÀNH CÔNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleLineLeaderReject}
                  className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>❌ KHÔNG XÁC NHẬN (QUAY LẠI 5M+1E)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: FORM 3. ĐÓNG LẦN 1 & KÍCH HOẠT GIỜ CHẠY THỬ (MIN 3H – MAX 48H) */}
      {/* (CHỈ MỞ KHÓA KHI TRƯỞNG LINE ĐÃ BẤM XÁC NHẬN SỬA THÀNH CÔNG) */}
      {/* ========================================================================= */}
      {(lineLeaderApproved || isDangChayThu || isDaXuLy) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <Lock className="w-4 h-4 text-[#004724]" />
              <span>3. ĐÓNG LẦN 1 & KÍCH HOẠT GIỜ CHẠY THỬ (MIN 3H – MAX 48H)</span>
            </div>
          </div>

          {!isDangChayThu && !isDaXuLy && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  CHỌN THỜI GIAN CHẠY THỬ NGHIỆM TỐI THIỂU (3 GIỜ – 48 GIỜ) *
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
                <span>{submitting ? "Đang ghi nhận..." : "🔒 ĐÓNG LẦN 1 – KÍCH HOẠT ĐẾM GIỜ CHẠY THỬ"}</span>
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
      {/* BƯỚC 5: BẢNG SO SÁNH ĐỐI CHỨNG TRƯỚC VS SAU SỬA CHỮA */}
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
