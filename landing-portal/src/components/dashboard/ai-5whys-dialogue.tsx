"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  HelpCircle,
  Cpu,
  User,
  Package,
  Compass,
  Sun,
  Ruler,
  AlertTriangle,
  RotateCcw,
  StopCircle,
} from "lucide-react";
import { FiveMOneEGroup } from "@/db/schema";

export interface DialogTurn {
  questionNumber: number;
  question: string;
  answer: string;
}

export interface SynthesisOutput {
  rootCauseConclusion: string;
  rootCauseCategory: FiveMOneEGroup;
  man: string;
  machine: string;
  material: string;
  method: string;
  measurement: string;
  environment: string;
  whysDialog: DialogTurn[];
}

interface AI5WhysDialogueProps {
  productCode?: string;
  productName?: string;
  workshopName?: string;
  detectionStage: string;
  description: string;
  userRole?: string;
  onConfirmSubmit: (data: SynthesisOutput) => void;
}

export function AI5WhysDialogue({
  productCode,
  productName,
  workshopName,
  detectionStage,
  description,
  userRole,
  onConfirmSubmit,
}: AI5WhysDialogueProps) {
  const [dialogHistory, setDialogHistory] = useState<DialogTurn[]>([]);
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  // Review & Edit state after synthesis
  const [isSynthesized, setIsSynthesized] = useState(false);
  const [rootCauseConclusion, setRootCauseConclusion] = useState("");
  const [rootCauseCategory, setRootCauseCategory] = useState<FiveMOneEGroup>("Machine");
  const [man, setMan] = useState("");
  const [machine, setMachine] = useState("");
  const [material, setMaterial] = useState("");
  const [method, setMethod] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [environment, setEnvironment] = useState("");

  // Load first "Tại sao 1" question on mount
  useEffect(() => {
    async function initFirstQuestion() {
      setLoadingQuestion(true);
      try {
        const res = await fetch("/api/ai/five-whys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "next_why",
            productCode,
            productName,
            workshopName,
            detectionStage,
            description,
            dialogHistory: [],
          }),
        });
        const data = await res.json();
        if (data.success && data.question) {
          setCurrentQuestion(data.question);
          setCurrentTurnNumber(data.questionNumber || 1);
        } else {
          setCurrentQuestion(`Tại sao sự cố "${description.slice(0, 35)}..." lại xuất hiện tại công đoạn ${detectionStage}?`);
        }
      } catch {
        setCurrentQuestion(`Tại sao sự cố "${description.slice(0, 35)}..." lại xuất hiện tại công đoạn ${detectionStage}?`);
      }
      setLoadingQuestion(false);
    }
    initFirstQuestion();
  }, [productCode, productName, workshopName, detectionStage, description]);

  // Handle answering current question and asking next
  async function handleSendAnswer() {
    if (!currentAnswer.trim() || loadingQuestion) return;

    const newTurn: DialogTurn = {
      questionNumber: currentTurnNumber,
      question: currentQuestion,
      answer: currentAnswer.trim(),
    };

    const updatedHistory = [...dialogHistory, newTurn];
    setDialogHistory(updatedHistory);
    setCurrentAnswer("");

    // If 5 turns reached -> automatically trigger synthesis
    if (updatedHistory.length >= 5) {
      await triggerSynthesis(updatedHistory);
      return;
    }

    // Ask next "Tại sao..."
    setLoadingQuestion(true);
    try {
      const res = await fetch("/api/ai/five-whys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "next_why",
          productCode,
          productName,
          workshopName,
          detectionStage,
          description,
          dialogHistory: updatedHistory,
        }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setCurrentQuestion(data.question);
        setCurrentTurnNumber(data.questionNumber || updatedHistory.length + 1);
      } else {
        setCurrentQuestion(`Tại sao hiện tượng này lại không được phát hiện sớm hơn ở đầu ca?`);
        setCurrentTurnNumber(updatedHistory.length + 1);
      }
    } catch {
      setCurrentQuestion(`Tại sao hiện tượng này lại không được phát hiện sớm hơn ở đầu ca?`);
      setCurrentTurnNumber(updatedHistory.length + 1);
    }
    setLoadingQuestion(false);
  }

  // Trigger AI root cause synthesis
  async function triggerSynthesis(historyToUse: DialogTurn[]) {
    setSynthesizing(true);
    try {
      const res = await fetch("/api/ai/five-whys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize",
          productCode,
          productName,
          workshopName,
          detectionStage,
          description,
          dialogHistory: historyToUse,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRootCauseConclusion(data.rootCauseConclusion || `Nguyên nhân gốc do sự cố thiết bị tại công đoạn ${detectionStage}`);
        setRootCauseCategory(data.rootCauseCategory || "Machine");
        setMan(data.man || "Công nhân chưa kiểm tra kỹ thông số đầu ca.");
        setMachine(data.machine || "Áp suất máy ép / nhiệt độ sấy bị sụt giảm.");
        setMaterial(data.material || "Nguyên phụ liệu da dệt và keo đạt chuẩn QC.");
        setMethod(data.method || "Cần tuân thủ nghiêm ngặt quy trình chuẩn SOP.");
        setMeasurement(data.measurement || "Cần hiệu chuẩn lại thiết bị đo định kỳ.");
        setEnvironment(data.environment || "Môi trường phân xưởng đạt tiêu chuẩn.");
        setIsSynthesized(true);
      }
    } catch (err) {
      console.error("[Synthesis error]:", err);
      setIsSynthesized(true);
    }
    setSynthesizing(false);
  }

  function handleFinalSubmit() {
    onConfirmSubmit({
      rootCauseConclusion: rootCauseConclusion.trim() || "Đã xác định nguyên nhân gốc 5M+1E",
      rootCauseCategory,
      man,
      machine,
      material,
      method,
      measurement,
      environment,
      whysDialog: dialogHistory,
    });
  }

  const roleLabel =
    userRole === "qa" ? "Chuyên Viên QA" : userRole === "line_leader" ? "Line Leader / Trưởng Line" : "Kỹ Sư Công Nghệ";

  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-[#004724] to-[#0a3520] text-white p-6 shadow-xl border border-emerald-500/40 space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#8dc63f]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest flex items-center gap-1.5">
              <span>GROQ AI 5 WHYS • ĐIỀU TRA ĐỘC LẬP</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-600/50">
                {roleLabel}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-serif-luxury mt-0.5">
              Hỏi Xoáy 5 Câu & Tự Động Phân Loại 5M+1E
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isSynthesized && (
            <div className="px-3 py-1 rounded-full bg-emerald-900/90 text-emerald-200 text-xs font-black border border-emerald-600/60">
              Vòng {Math.min(dialogHistory.length + 1, 5)} / 5
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Interactive 5 Whys Dialogue Turns */}
      {!isSynthesized && (
        <div className="space-y-5">
          {/* Completed Dialogue History */}
          {dialogHistory.length > 0 && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {dialogHistory.map((d) => (
                <div key={d.questionNumber} className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-1.5 text-[#8dc63f] font-black uppercase">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Tại sao {d.questionNumber}: {d.question}</span>
                  </div>
                  <div className="pl-5 text-emerald-100 font-medium bg-black/20 p-2 rounded-xl border border-white/10">
                    👉 <strong>Trả lời:</strong> {d.answer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Question Box */}
          <div className="p-5 rounded-2xl bg-white/10 border border-emerald-400/40 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-[#8dc63f] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Câu hỏi số {currentTurnNumber} (AI Groq Llama-3.3):</span>
              </span>
              {loadingQuestion && <span className="animate-pulse text-emerald-300">AI đang đặt câu hỏi...</span>}
            </div>

            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {loadingQuestion ? "..." : currentQuestion}
            </p>

            {/* Answer Input */}
            <div className="pt-2 space-y-2">
              <textarea
                rows={3}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Nhập câu trả lời theo góc nhìn chuyên môn của bạn..."
                className="w-full rounded-2xl bg-white/10 border border-white/20 p-3.5 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:border-[#8dc63f] font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {dialogHistory.length > 0 && (
                  <button
                    type="button"
                    disabled={synthesizing}
                    onClick={() => triggerSynthesis(dialogHistory)}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>{synthesizing ? "Đang tổng hợp..." : "Dừng hỏi sớm & Chốt nguyên nhân"}</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!currentAnswer.trim() || loadingQuestion || synthesizing}
                  onClick={handleSendAnswer}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#8dc63f] hover:bg-[#7db62f] text-[#061812] text-xs font-black uppercase tracking-wider disabled:opacity-40 flex items-center space-x-2 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {dialogHistory.length >= 4 ? "Hoàn thành 5 Whys & Tổng hợp" : "Gửi câu trả lời & Hỏi tiếp"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Synthesis Results Review & Edit */}
      {isSynthesized && (
        <div className="space-y-6 bg-white/10 p-6 rounded-3xl border border-white/20">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center space-x-2 text-xs font-black text-[#8dc63f] uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-[#8dc63f]" />
              <span>AI ĐÃ TỔNG HỢP & PHÂN LOẠI 5M+1E (BẠN CÓ THỂ CHỈNH SỬA)</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSynthesized(false)}
              className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hỏi lại 5 Whys</span>
            </button>
          </div>

          {/* Root cause conclusion */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-300">
              KẾT LUẬN NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE) *
            </label>
            <textarea
              rows={3}
              value={rootCauseConclusion}
              onChange={(e) => setRootCauseConclusion(e.target.value)}
              className="w-full rounded-2xl bg-white/15 border border-white/30 p-3.5 text-xs text-white font-bold focus:outline-none focus:border-[#8dc63f]"
            />
          </div>

          {/* Classification Pill selector (6 buckets) */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-300">
              NHÓM NGUYÊN NHÂN 5M+1E (AI TỰ ĐỘNG CHỌN 1 NHÓM CHÍNH) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(["Man", "Machine", "Material", "Method", "Measurement", "Environment"] as FiveMOneEGroup[]).map((group) => {
                const isSelected = rootCauseCategory === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setRootCauseCategory(group)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? "bg-[#8dc63f] text-[#061812] shadow-md scale-105"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    <span>{group}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Elements 5M+1E Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Con người (Man)
              </label>
              <textarea
                rows={2}
                value={man}
                onChange={(e) => setMan(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> 2. Máy móc / Thiết bị (Machine)
              </label>
              <textarea
                rows={2}
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> 3. Nguyên vật liệu (Material)
              </label>
              <textarea
                rows={2}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> 4. Phương pháp (Method)
              </label>
              <textarea
                rows={2}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> 5. Đo lường (Measurement)
              </label>
              <textarea
                rows={2}
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-1.5">
              <label className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" /> 6. Môi trường (Environment)
              </label>
              <textarea
                rows={2}
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Confirm & Submit Button */}
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="w-full py-4 px-6 rounded-2xl bg-[#8dc63f] hover:bg-[#7db62f] text-[#061812] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>XÁC NHẬN & NỘP BẢN ĐIỀU TRA 5M+1E</span>
          </button>
        </div>
      )}
    </div>
  );
}
