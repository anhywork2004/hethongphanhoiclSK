"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Lock,
  ArrowLeft,
  Image as ImageIcon,
  ShieldAlert,
  Sparkles,
  Building,
  Layers,
  Package,
  Check,
  RotateCcw,
  Wrench,
  FastForward,
  UserCheck,
  FileText,
} from "lucide-react";
import { AI5WhysDialogue, SynthesisOutput } from "@/components/dashboard/ai-5whys-dialogue";
import { LLSynthesisView } from "@/components/dashboard/ll-synthesis-view";
import { TPAssignmentView } from "@/components/dashboard/tp-assignment-view";
import { TechnicianRepairForm } from "@/components/dashboard/technician-repair-form";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";
import { BeforeAfterComparison } from "@/components/dashboard/before-after-comparison";

interface FormRecord {
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

interface IssueData {
  id: string;
  issueCode: string;
  poCode: string;
  productCode?: string | null;
  productName?: string | null;
  affectedSizes: string[];
  workshopId?: string | null;
  workshopName?: string | null;
  teamName?: string | null;
  lineName?: string | null;
  areaId?: string | null;
  detectionStage: string;
  description: string;
  severity: string;
  status: string;
  reportedByName?: string | null;
  reportedByMnv?: string | null;
  reportedAt: number;
  form15Deadline: number;
  form15Locked?: number | null;
  qaSubmitted?: number | null;
  llSubmitted?: number | null;
  cnSubmitted?: number | null;
  rootCauseSummary?: string | null;
  proposedSolution?: string | null;
  phase2Status?: string | null;
  phase2Notes?: string | null;
  images?: string[];
  forms?: FormRecord[];
  task?: any;
  monitoring?: any;
  userRole?: string;
}

export function IssueDetailWorkflow({ issue }: { issue: IssueData }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(issue.status || "reported");
  const [formsList, setFormsList] = useState<FormRecord[]>(issue.forms || []);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [activeRoleModal, setActiveRoleModal] = useState<string>("qa");
  const [msg, setMsg] = useState<string | null>(null);
  const [isTimeTraveling, setIsTimeTraveling] = useState<boolean>(false);

  // Status flags
  const isReported = currentStatus === "reported";
  const isInvestigating = currentStatus === "investigating";
  const isRootCauseFound = currentStatus === "root_cause_found";
  const isAssigned = currentStatus === "assigned";
  const isInProgress = currentStatus === "in_progress";
  const isMonitoring = currentStatus === "monitoring";
  const isCompleted = currentStatus === "completed";
  const isPhase2 = currentStatus === "phase2";

  // Check forms count
  const qaDone = formsList.some((f) => f.userRole === "qa") || Boolean(issue.qaSubmitted);
  const llDone = formsList.some((f) => f.userRole === "line_leader") || Boolean(issue.llSubmitted);
  const cnDone = formsList.some((f) => f.userRole === "technology") || Boolean(issue.cnSubmitted);
  const totalSubmitted = (qaDone ? 1 : 0) + (llDone ? 1 : 0) + (cnDone ? 1 : 0);

  // Handle opening AI 5 Whys dialogue modal
  function handleOpenAiForm(role: string) {
    setActiveRoleModal(role);
    setShowAiModal(true);
  }

  // Handle AI 5 Whys form submission (Step 2)
  async function handleConfirm5M1E(data: SynthesisOutput) {
    try {
      const res = await fetch(`/api/issues/${issue.id}/form15`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poCode: issue.poCode,
          images: issue.images || [],
          whysDialog: data.whysDialog,
          man: data.man,
          machine: data.machine,
          material: data.material,
          method: data.method,
          measurement: data.measurement,
          environment: data.environment,
          rootCauseCategory: data.rootCauseCategory,
          rootCauseConclusion: data.rootCauseConclusion,
          userRoleOverride: activeRoleModal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setShowAiModal(false);
        setMsg(`Đã nộp thành công bản điều tra 5M+1E cho vai trò ${activeRoleModal.toUpperCase()}!`);
        if (resData.isAll3Ready) {
          setCurrentStatus("investigating");
        }
        router.refresh();
      } else {
        setMsg(`Lỗi nộp form: ${resData.error}`);
      }
    } catch {
      setMsg("Không thể kết nối máy chủ");
    }
  }

  // Handle LL Verification Action (Step 7a: Xong / Chưa xong)
  async function handleLlVerify(decision: "approve" | "reject") {
    try {
      const res = await fetch(`/api/issues/${issue.id}/ll-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentStatus(data.status);
        setMsg(
          decision === "approve"
            ? "Trưởng Line đã xác nhận Xong! Cửa sổ theo dõi chất lượng 3h - 48h đã được kích hoạt."
            : "Trưởng Line yêu cầu làm lại! Phiếu đã quay về cho kỹ thuật viên sửa chữa."
        );
        router.refresh();
      } else {
        setMsg(`Lỗi xác nhận: ${data.error}`);
      }
    } catch {
      setMsg("Lỗi kết nối máy chủ");
    }
  }

  // Handle Monitoring Window Action (Step 7b: Đóng vấn đề / Kiểm tra lại)
  async function handleMonitoringAction(action: "close" | "reinvestigate") {
    try {
      const res = await fetch(`/api/issues/${issue.id}/monitoring-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, bypassTimeCheck: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentStatus(data.status);
        setMsg(
          action === "close"
            ? "Đã đóng hoàn tất phiếu sự cố đạt chuẩn CLSK và gửi thông báo tới Ban Giám Đốc!"
            : "Đã mở lại quy trình điều tra 5M+1E (Bước 2) do sự cố tái diễn trong ca theo dõi."
        );
        router.refresh();
      } else {
        setMsg(`Lỗi thao tác: ${data.error}`);
      }
    } catch {
      setMsg("Lỗi kết nối máy chủ");
    }
  }

  // Admin Fast-Forward / Time-Travel Test Tool
  async function handleTimeTravel(action: "expire_15m" | "reach_3h" | "expire_48h") {
    setIsTimeTraveling(true);
    try {
      const res = await fetch("/api/admin/time-travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: issue.id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`⚡ ${data.message}`);
        if (data.status) setCurrentStatus(data.status);
        router.refresh();
      } else {
        setMsg(`Lỗi Time-Travel: ${data.error}`);
      }
    } catch {
      setMsg("Không thể thực hiện Time-Travel");
    }
    setIsTimeTraveling(false);
  }

  return (
    <div className="space-y-6 text-slate-900 font-sans max-w-5xl mx-auto py-6 px-4">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/issues")}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Danh sách sự cố</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Mã Phiếu:</span>
          <span className="px-3.5 py-1 rounded-full bg-[#004724] text-white text-xs font-black tracking-wider">
            {issue.issueCode}
          </span>
        </div>
      </div>

      {/* Main Status Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              QUY TRÌNH FAST FEEDBACK LOOP
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                isReported
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : isInvestigating
                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                  : isRootCauseFound
                  ? "bg-emerald-100 text-[#004724] border border-emerald-300"
                  : isAssigned || isInProgress
                  ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                  : isMonitoring
                  ? "bg-purple-100 text-purple-900 border border-purple-300"
                  : isPhase2
                  ? "bg-rose-600 text-white border border-rose-700 animate-pulse"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {isReported && "Bước 1: Vừa báo cáo (Hạn 15p)"}
              {isInvestigating && "Bước 2: Đang điều tra 5M+1E (QA/LL/CN)"}
              {isRootCauseFound && "Bước 3: Đã có nguyên nhân (Chờ TP giao việc)"}
              {isAssigned && "Bước 4: Đã giao việc (Chờ nhân viên nhận)"}
              {isInProgress && "Bước 5: Đang xử lý sửa chữa"}
              {isMonitoring && "Bước 7b: Đang theo dõi (3h - 48h)"}
              {isPhase2 && "🚨 PHASE 2: Chuyển Ban Giám Đốc"}
              {isCompleted && "Bước 7b: Đã hoàn thành đạt chuẩn"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury mt-1">
            [{issue.productCode || issue.poCode}] {issue.productName || "Giày Skechers"}
          </h1>
        </div>

        {/* 15m Countdown Timer for Step 1 & 2 */}
        {(isReported || isInvestigating) && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <CountdownTimer targetMinutes={15} createdTimeStr={new Date(issue.reportedAt * 1000).toISOString()} label="Hạn 15p Điều Tra" />
          </div>
        )}

        {/* 3h-48h Monitoring Timer for Step 7b */}
        {isMonitoring && (
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
            <CountdownTimer targetMinutes={180} createdTimeStr={new Date((issue.monitoring?.confirmedAt || issue.reportedAt) * 1000).toISOString()} label="Theo dõi 3h-48h" />
          </div>
        )}
      </div>

      {/* Admin Fast-Forward / Time-Travel Test Toolbar */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold">
          <FastForward className="w-4 h-4 text-[#8dc63f]" />
          <span className="text-slate-300">Công cụ Test Nhanh (Time-Travel Fast-Forward):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isTimeTraveling}
            onClick={() => handleTimeTravel("expire_15m")}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all"
          >
            ⚡ Nhảy +15m (Khoá form)
          </button>
          <button
            type="button"
            disabled={isTimeTraveling}
            onClick={() => handleTimeTravel("reach_3h")}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-400/40 text-xs font-bold transition-all"
          >
            ⚡ Nhảy +3h (Mở nút Đóng)
          </button>
          <button
            type="button"
            disabled={isTimeTraveling}
            onClick={() => handleTimeTravel("expire_48h")}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all"
          >
            ⚡ Nhảy +48h (Tự động đóng)
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#004724] text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 1: THÔNG TIN PHÁT HIỆN SỰ CỐ BAN ĐẦU */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider border-b border-slate-200 pb-3">
          <Package className="w-4 h-4" />
          <span>1. Thông Tin Báo Cáo Sự Cố Ban Đầu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Building className="w-3 h-3 text-[#004724]" /> Phân xưởng & Tổ
            </span>
            <div className="font-bold text-slate-900">
              {issue.workshopName || "Xưởng May 1"} • {issue.teamName || "Tổ May 1"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#004724]" /> Công đoạn phát hiện
            </span>
            <div className="font-bold text-slate-900">{issue.detectionStage}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Mã PO / Đơn hàng</span>
            <div className="font-black text-[#004724]">{issue.poCode}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <span className="font-bold text-slate-700">Mô tả hiện tượng lỗi:</span>
          <p className="text-slate-800 leading-relaxed font-medium">{issue.description}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BƯỚC 2: QA + LL + CN ĐIỀU TRA 5M+1E ĐỘC LẬP (GROQ AI 5 WHYS) */}
      {/* ========================================================================= */}
      {(isReported || isInvestigating) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#004724] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#8dc63f]" />
              <span>2. QA • Line Leader • Công Nghệ Điều Tra 5M+1E Độc Lập ({totalSubmitted}/3 Form)</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#004724] text-xs font-black border border-emerald-300">
              Đã nộp {totalSubmitted} / 3 Form
            </span>
          </div>

          {/* 3 Role Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* QA Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${qaDone ? "bg-emerald-50 border-emerald-300" : "bg-blue-50/70 border-blue-200"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase">1. Nhân Viên QA</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qaDone ? "bg-emerald-600 text-white" : "bg-blue-200 text-blue-900"}`}>
                  {qaDone ? "✅ Đã nộp" : "Chờ nộp"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAiForm("qa")}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{qaDone ? "Xem lại 5M+1E QA" : "Bắt đầu 5 Whys (QA)"}</span>
              </button>
            </div>

            {/* Line Leader Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${llDone ? "bg-emerald-50 border-emerald-300" : "bg-amber-50/70 border-amber-200"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase">2. Line Leader (Tổ Trưởng)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${llDone ? "bg-emerald-600 text-white" : "bg-amber-200 text-amber-900"}`}>
                  {llDone ? "✅ Đã nộp" : "Chờ nộp"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAiForm("line_leader")}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{llDone ? "Xem lại 5M+1E LL" : "Bắt đầu 5 Whys (LL)"}</span>
              </button>
            </div>

            {/* Technology (CN) Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${cnDone ? "bg-emerald-50 border-emerald-300" : "bg-purple-50/70 border-purple-200"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 uppercase">3. Kỹ Sư Công Nghệ</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cnDone ? "bg-emerald-600 text-white" : "bg-purple-200 text-purple-900"}`}>
                  {cnDone ? "✅ Đã nộp" : "Chờ nộp"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAiForm("technology")}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{cnDone ? "Xem lại 5M+1E CN" : "Bắt đầu 5 Whys (CN)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 5 Whys Interactive Dialogue Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-8">
            <div className="text-right mb-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 rounded-full bg-white text-slate-700 text-xs font-bold shadow-md hover:bg-slate-100"
              >
                ✕ Đóng cửa sổ
              </button>
            </div>
            <AI5WhysDialogue
              productCode={issue.productCode || issue.poCode}
              productName={issue.productName || "Giày Skechers"}
              workshopName={issue.workshopName || "Xưởng May 1"}
              detectionStage={issue.detectionStage}
              description={issue.description}
              userRole={activeRoleModal}
              onConfirmSubmit={handleConfirm5M1E}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: LL TỔNG HỢP NGUYÊN NHÂN & ĐỀ XUẤT GIẢI PHÁP / PHASE 2 */}
      {/* ========================================================================= */}
      {isInvestigating && totalSubmitted >= 3 && (
        <LLSynthesisView
          issueId={issue.id}
          issueCode={issue.issueCode}
          forms={formsList}
          currentRootCause={issue.rootCauseSummary}
          currentSolution={issue.proposedSolution}
          onSuccess={(newStatus) => {
            setCurrentStatus(newStatus);
            router.refresh();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 2 DISPLAY (CHO BAN GIÁM ĐỐC) */}
      {/* ========================================================================= */}
      {isPhase2 && (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-md space-y-4 text-slate-900">
          <div className="flex items-center space-x-2 text-rose-700 font-black text-sm uppercase tracking-wider">
            <Siren className="w-5 h-5 animate-bounce" />
            <span>SỰ CỐ ĐANG TRONG GIAI ĐOẠN PHASE 2 (BAN GIÁM ĐỐC CHỈ ĐẠO)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Ghi chú từ phân xưởng: <strong>{issue.phase2Notes || "Chuyển Ban Giám Đốc xử lý cấp cao"}</strong>
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/phase2")}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md"
            >
              Mở Màn Hình Phase 2 Ban Giám Đốc
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 4: TRƯỞNG PHÒNG BAN (TP) GIAO VIỆC */}
      {/* ========================================================================= */}
      {isRootCauseFound && (
        <TPAssignmentView
          issueId={issue.id}
          issueCode={issue.issueCode}
          areaId={issue.areaId}
          rootCauseSummary={issue.rootCauseSummary}
          proposedSolution={issue.proposedSolution}
          onAssigned={() => {
            setCurrentStatus("assigned");
            router.refresh();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 5 & 6: KỸ THUẬT VIÊN NHẬN VIỆC & HOÀN THÀNH SỬA CHỮA */}
      {/* ========================================================================= */}
      {(isAssigned || isInProgress) && (
        <div className="space-y-4">
          <TechnicianRepairForm
            issueId={issue.id}
            issueCode={issue.issueCode}
            taskStatus={issue.task?.status || (isAssigned ? "pending" : "accepted")}
            acceptedAt={issue.task?.acceptedAt}
            onAccepted={() => {
              setCurrentStatus("in_progress");
              router.refresh();
            }}
            onCompleted={() => {
              setMsg("Kỹ thuật viên đã hoàn thành sửa chữa! Đã gửi thông báo cho Trưởng Line xác nhận.");
              router.refresh();
            }}
          />

          {/* Step 7a: Line Leader Verification Buttons */}
          {issue.task?.status === "done" && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-300 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Bước 7a: Line Leader Xác Nhận Hoàn Thành Sửa Chữa (Xong / Chưa Xong)</span>
              </div>
              <p className="text-xs text-slate-700 font-medium bg-white p-3 rounded-2xl border border-amber-200">
                Mô tả sửa chữa từ kỹ thuật: <strong>{issue.task?.repairDescription || "Đã sửa xong thiết bị"}</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleLlVerify("approve")}
                  className="py-3.5 px-4 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✅ XÁC NHẬN XONG (BẮT ĐẦU THEO DÕI 3H-48H)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLlVerify("reject")}
                  className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>❌ CHƯA XONG, LÀM LẠI (SỬA TIẾP)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 7b: CỬA SỔ THEO DÕI 3H - 48H (ĐÓNG VẤN ĐỀ / KIỂM TRA LẠI) */}
      {/* ========================================================================= */}
      {isMonitoring && (
        <div className="p-6 rounded-3xl bg-purple-50/80 border border-purple-200 shadow-sm space-y-5 text-slate-900">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-purple-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>Bước 7b: Giai Đoạn Theo Dõi Sau Sửa Chữa (3 Giờ – 48 Giờ)</span>
            </div>
            <span className="text-xs font-bold text-purple-800">Tự động đóng sau 48h</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Trong khung giờ từ 3h đến 48h sau khi sửa xong, Line Leader có thể chọn <strong>&ldquo;Đóng vấn đề&rdquo;</strong> (đạt chuẩn và báo Ban Giám Đốc)
            hoặc <strong>&ldquo;Kiểm tra lại&rdquo;</strong> (nếu sự cố tái diễn, hệ thống mở lại form 5M+1E nhưng bảo lưu lịch sử cũ).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={() => handleMonitoringAction("close")}
              className="py-4 px-6 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🎉 ĐÓNG VẤN ĐỀ (ĐẠT CHUẨN CLSK)</span>
            </button>

            <button
              type="button"
              onClick={() => handleMonitoringAction("reinvestigate")}
              className="py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 KIỂM TRA LẠI (SỰ CỐ TÁI DIỄN)</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Success Summary */}
      {isCompleted && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-black text-[#004724] uppercase">Phiếu Sự Cố Đã Hoàn Thành Đạt Chuẩn 100%</h3>
          <p className="text-xs text-slate-600">Báo cáo tổng kết đã được gửi tới Ban Giám Đốc toàn nhà máy.</p>
        </div>
      )}
    </div>
  );
}
