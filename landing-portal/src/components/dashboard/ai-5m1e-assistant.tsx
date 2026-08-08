"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, User, Cpu, Package, Compass, Sun, HelpCircle, ArrowRight, ShieldAlert } from "lucide-react";

interface AI5M1EAssistantProps {
  productName: string;
  detectionStage: string;
  description: string;
  onCompleteAnalysis: (result: { diagnosis: string; rootCauseCategory: string }) => void;
}

export function AI5M1EAssistant({ productName, detectionStage, description, onCompleteAnalysis }: AI5M1EAssistantProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [diagnosisSummary, setDiagnosisSummary] = useState("");

  const steps = [
    {
      key: "Man",
      category: "Con Người (Man)",
      icon: User,
      iconColor: "text-blue-600",
      question: `Liên quan đến công đoạn "${detectionStage}", thao tác công nhân ca này có điểm gì nghi vấn?`,
      options: [
        "Công nhân mới chuyển sang ca, thao tác chưa đúng tiêu chuẩn kỹ thuật",
        "Công nhân làm việc lâu năm nhưng thiếu tập trung do ép sản lượng",
        "Thao tác đặt phom/gò đúng chuẩn, không có lỗi con người",
      ],
    },
    {
      key: "Machine",
      category: "Máy Móc & Thiết Bị (Machine)",
      icon: Cpu,
      iconColor: "text-amber-600",
      question: `Về thiết bị tại chuyền sản xuất "${productName}", tình trạng máy móc lúc xảy ra sự cố ra sao?`,
      options: [
        "Áp suất xi lanh bị sụt giảm bất thường, lực ép không đủ",
        "Kim may bị tù đầu / Dao cắt chỉ bị mòn làm xơ vải quai",
        "Băng chuyền chạy quá nhanh so với tốc độ sấy khô keo",
        "Máy móc vận hành bình thường, thông số cài đặt chuẩn",
      ],
    },
    {
      key: "Material",
      category: "Nguyên Vật Liệu (Material)",
      icon: Package,
      iconColor: "text-[#004724]",
      question: "Kiểm tra lô da, keo dán, chỉ khâu hoặc phụ liệu sử dụng trong ca:",
      options: [
        "Lô keo dán mới nhập bị nhạt độ dính / quá hạn sử dụng",
        "Lô da bị cứng bất thường, độ đàn hồi kém",
        "Nguyên liệu đầu vào đạt tiêu chuẩn QC 100%",
      ],
    },
    {
      key: "Method",
      category: "Phương Pháp & Kỹ Thuật (Method)",
      icon: Compass,
      iconColor: "text-purple-600",
      question: "Quy trình thao tác (SOP) và thông số kỹ thuật có bị thay đổi không?",
      options: [
        "Bỏ qua bước quét keo lót (Primer) để đẩy nhanh ca",
        "Thời gian sấy keo bị rút ngắn dưới 3 phút tiêu chuẩn",
        "Thực hiện đúng 100% tài liệu hướng dẫn kỹ thuật SOP",
      ],
    },
    {
      key: "Environment",
      category: "Môi Trường Phân Xưởng (Environment)",
      icon: Sun,
      iconColor: "text-teal-600",
      question: "Nhiệt độ, độ ẩm lò sấy và ánh sáng chuyền lúc xảy ra lỗi:",
      options: [
        "Nhiệt độ lò sấy thấp hơn 55°C do rơ-le nhiệt hỏng",
        "Độ ẩm phân xưởng quá cao làm ảnh hưởng độ bám dính keo",
        "Môi trường phân xưởng đạt chuẩn nhiệt độ & ánh sáng",
      ],
    },
  ];

  const currentStep = steps[currentStepIndex];

  function handleSelectOption(opt: string) {
    const newAnswers = { ...answers, [currentStep.key]: opt };
    setAnswers(newAnswers);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      generateDiagnosis(newAnswers);
    }
  }

  function generateDiagnosis(finalAnswers: Record<string, string>) {
    setIsCompleted(true);
    let rootCategory = "Machine";
    let text = `AI 5M+1E Chẩn đoán nguyên nhân gốc cho sản phẩm [${productName}]:\n`;

    if (finalAnswers.Machine && !finalAnswers.Machine.includes("bình thường")) {
      rootCategory = "Machine";
      text += `- NGUYÊN NHÂN CHÍNH (Machine): ${finalAnswers.Machine}.\n`;
    } else if (finalAnswers.Material && !finalAnswers.Material.includes("đạt tiêu chuẩn")) {
      rootCategory = "Material";
      text += `- NGUYÊN NHÂN CHÍNH (Material): ${finalAnswers.Material}.\n`;
    } else if (finalAnswers.Man && !finalAnswers.Man.includes("không có lỗi")) {
      rootCategory = "Man";
      text += `- NGUYÊN NHÂN CHÍNH (Man): ${finalAnswers.Man}.\n`;
    } else if (finalAnswers.Method && !finalAnswers.Method.includes("đúng 100%")) {
      rootCategory = "Method";
      text += `- NGUYÊN NHÂN CHÍNH (Method): ${finalAnswers.Method}.\n`;
    } else {
      rootCategory = "Environment";
      text += `- NGUYÊN NHÂN CHÍNH (Environment): ${finalAnswers.Environment || "Do yếu tố nhiệt độ môi trường"}.\n`;
    }

    text += `- ĐÁNH GIÁ NGUY CƠ: Nguy cơ tái diễn Cao nếu không hiệu chỉnh lại rơ-le nhiệt & áp suất máy.\n`;
    text += `- ĐỀ XUẤT XỬ LÝ: Kỹ thuật bảo trì hiệu chỉnh thông số máy trong 30 phút & chạy thử 3 giờ trước khi cho phép hoạt động lại toàn chuyền.`;

    setDiagnosisSummary(text);
    onCompleteAnalysis({ diagnosis: text, rootCauseCategory: rootCategory });
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#004724] to-[#07361e] text-white shadow-xl space-y-5 border border-emerald-500/40 relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 text-[#8dc63f] animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">
              TRỢ LÝ AI HỎI XOÁY 5M+1E
            </div>
            <h3 className="text-base font-extrabold text-white">
              Tự Động Sinh Câu Hỏi Xác Định Nguyên Nhân Gốc
            </h3>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-900/90 text-emerald-200 text-xs font-bold border border-emerald-600/60">
          Bước {Math.min(currentStepIndex + 1, steps.length)} / {steps.length}
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-4">
          {/* Question Box */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#8dc63f] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>{currentStep.category}</span>
            </div>
            <p className="text-sm font-extrabold text-white leading-relaxed">
              {currentStep.question}
            </p>
          </div>

          {/* Options list */}
          <div className="space-y-2">
            {currentStep.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left text-xs font-semibold text-white transition-all flex items-center justify-between group"
              >
                <span>{opt}</span>
                <ArrowRight className="w-4 h-4 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="pt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Hoặc nhập nguyên nhân chi tiết khác..."
              value={customInputs[currentStep.key] || ""}
              onChange={(e) => setCustomInputs({ ...customInputs, [currentStep.key]: e.target.value })}
              className="flex-1 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:border-[#8dc63f]"
            />
            <button
              type="button"
              disabled={!customInputs[currentStep.key]?.trim()}
              onClick={() => handleSelectOption(customInputs[currentStep.key])}
              className="px-4 py-2.5 rounded-2xl bg-[#8dc63f] text-[#061812] text-xs font-black uppercase tracking-wider disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      ) : (
        /* Diagnosis Result Summary */
        <div className="p-5 rounded-2xl bg-white/10 border border-white/20 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5 text-[#8dc63f]" />
            <span>AI ĐÃ TỔNG HỢP NGUYÊN NHÂN GỐC 5M+1E THÀNH CÔNG!</span>
          </div>

          <pre className="text-xs font-sans text-white leading-relaxed whitespace-pre-wrap bg-emerald-950/80 p-4 rounded-xl border border-emerald-700/60">
            {diagnosisSummary}
          </pre>

          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Đã sẵn sàng chuyển sang bước Đóng Lần 1 & Kích hoạt chạy thử.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCompleted(false);
                setCurrentStepIndex(0);
              }}
              className="text-xs text-[#8dc63f] underline font-bold"
            >
              Chẩn đoán lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
