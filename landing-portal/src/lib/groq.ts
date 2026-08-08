import { getCloudflareContext } from "@opennextjs/cloudflare";
import { FiveMOneEGroup } from "@/db/schema";

export interface DialogTurn {
  questionNumber: number;
  question: string;
  answer: string;
}

export interface NextWhyResponse {
  questionNumber: number;
  question: string;
  isLastTurn: boolean;
}

export interface Synthesis5M1EResult {
  rootCauseConclusion: string;
  rootCauseCategory: FiveMOneEGroup;
  man: string;
  machine: string;
  material: string;
  method: string;
  measurement: string;
  environment: string;
  isAiGenerated: boolean;
}

async function getGroqApiKey(): Promise<string | undefined> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as Record<string, string>;
    if (env?.GROQ_API_KEY) return env.GROQ_API_KEY;
  } catch {
    // fallback to process.env
  }
  return process.env.GROQ_API_KEY;
}

/**
 * 1. AI sinh câu hỏi "Tại sao..." tiếp theo dựa trên mô tả và các câu trả lời trước
 */
export async function askNextWhyQuestion(params: {
  productCode?: string;
  productName?: string;
  workshopName?: string;
  detectionStage: string;
  description: string;
  dialogHistory: DialogTurn[];
}): Promise<NextWhyResponse> {
  const apiKey = await getGroqApiKey();
  const currentTurn = params.dialogHistory.length + 1;

  if (!apiKey || apiKey.trim() === "") {
    return generateFallbackNextWhy(params, currentTurn);
  }

  try {
    const historyText = params.dialogHistory
      .map((d) => `Q${d.questionNumber}: ${d.question}\nA${d.questionNumber}: ${d.answer}`)
      .join("\n");

    const promptText = `Bạn là chuyên gia QA/QC hàng đầu tại nhà máy sản xuất giày Skechers TBS Kiên Giang 1.
Chúng ta đang truy vết nguyên nhân gốc rễ theo phương pháp 5 Whys (5 Câu hỏi Tại sao liên tiếp).

Thông tin sự cố ban đầu:
- Sản phẩm: ${params.productName || "Giày Skechers"} (${params.productCode || "SK-DEMO"})
- Phân xưởng: ${params.workshopName || "Xưởng May 1"}
- Công đoạn phát hiện: ${params.detectionStage}
- Hiện tượng lỗi: ${params.description}

Lịch sử hỏi đáp 5 Whys trước đó:
${historyText || "(Chưa có câu hỏi nào, đây là vòng hỏi đầu tiên)"}

YÊU CẦU:
- Đặt câu hỏi số ${currentTurn} bắt đầu bằng từ "Tại sao..." đào sâu trực tiếp vào câu trả lời gần nhất A${params.dialogHistory.length || 1}.
- Câu hỏi cần ngắn gọn, sắc bén, chuyên môn kỹ thuật may/gò/đế.
- Trả về DUY NHẤT một chuỗi JSON hợp lệ dạng:
{
  "questionNumber": ${currentTurn},
  "question": "Tại sao...",
  "isLastTurn": ${currentTurn >= 5}
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("[Groq AI Error] HTTP status:", response.status);
      return generateFallbackNextWhy(params, currentTurn);
    }

    const data: any = await response.json();
    const contentText = data.choices?.[0]?.message?.content;
    if (!contentText) return generateFallbackNextWhy(params, currentTurn);

    const parsed = JSON.parse(contentText);
    return {
      questionNumber: currentTurn,
      question: parsed.question || `Tại sao lỗi ${params.description.slice(0, 30)}... lại phát sinh tại công đoạn này?`,
      isLastTurn: currentTurn >= 5 || Boolean(parsed.isLastTurn),
    };
  } catch (err) {
    console.error("[Groq AI Exception]:", err);
    return generateFallbackNextWhy(params, currentTurn);
  }
}

/**
 * 2. AI tự động chốt nguyên nhân gốc rễ và phân loại vào đúng 1 trong 6 nhóm 5M+1E
 */
export async function synthesize5M1E(params: {
  productCode?: string;
  productName?: string;
  workshopName?: string;
  detectionStage: string;
  description: string;
  dialogHistory: DialogTurn[];
}): Promise<Synthesis5M1EResult> {
  const apiKey = await getGroqApiKey();

  if (!apiKey || apiKey.trim() === "") {
    return generateFallbackSynthesis(params);
  }

  try {
    const historyText = params.dialogHistory
      .map((d) => `Q${d.questionNumber}: ${d.question}\nA${d.questionNumber}: ${d.answer}`)
      .join("\n");

    const promptText = `Bạn là chuyên gia Quản lý chất lượng cao cấp tại nhà máy TBS Kiên Giang 1.
Dựa trên chuỗi hỏi đáp 5 Whys dưới đây, hãy:
1. Tóm tắt thành 1 câu kết luận "Nguyên nhân gốc rễ (Root Cause)" rõ ràng, súc tích.
2. Tự phân loại nguyên nhân này vào đúng 1 trong 6 nhóm 5M+1E: "Man", "Machine", "Material", "Method", "Measurement", "Environment".
3. Gợi ý nội dung phân tích chi tiết cho cả 6 yếu tố 5M+1E.

Thông tin sự cố:
- Sản phẩm: ${params.productName || "Giày Skechers"} (${params.productCode || "SK-DEMO"})
- Phân xưởng: ${params.workshopName || "Xưởng May 1"} | Công đoạn: ${params.detectionStage}
- Mô tả: ${params.description}

Lịch sử điều tra 5 Whys:
${historyText || "(Người dùng chốt sớm dựa trên mô tả ban đầu)"}

YÊU CẦU: Trả về DUY NHẤT một chuỗi JSON hợp lệ dạng:
{
  "rootCauseConclusion": "Kết luận nguyên nhân gốc...",
  "rootCauseCategory": "Machine", // CHỌN ĐÚNG 1 TRONG 6 TỪ: Man, Machine, Material, Method, Measurement, Environment
  "man": "Yếu tố Con người (thao tác, tay nghề)...",
  "machine": "Yếu tố Máy móc (áp suất, nhiệt độ, linh kiện mòn)...",
  "material": "Yếu tố Nguyên liệu (keo dán, da, chỉ)...",
  "method": "Yếu tố Phương pháp (SOP, quy trình)...",
  "measurement": "Yếu tố Đo lường (hiệu chuẩn, sai số)...",
  "environment": "Yếu tố Môi trường (nhiệt độ, độ ẩm xưởng)..."
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("[Groq AI Synthesis Error]:", response.status);
      return generateFallbackSynthesis(params);
    }

    const data: any = await response.json();
    const contentText = data.choices?.[0]?.message?.content;
    if (!contentText) return generateFallbackSynthesis(params);

    const parsed = JSON.parse(contentText);
    const validCategories: FiveMOneEGroup[] = ["Man", "Machine", "Material", "Method", "Measurement", "Environment"];
    const category: FiveMOneEGroup = validCategories.includes(parsed.rootCauseCategory)
      ? parsed.rootCauseCategory
      : "Machine";

    return {
      rootCauseConclusion: parsed.rootCauseConclusion || `Nguyên nhân do sự cố thiết bị tại công đoạn ${params.detectionStage}.`,
      rootCauseCategory: category,
      man: parsed.man || "Công nhân chưa kiểm tra kỹ thông số đầu ca.",
      machine: parsed.machine || "Áp suất máy ép / nhiệt độ sấy bị lệch khỏi tiêu chuẩn.",
      material: parsed.material || "Nguyên phụ liệu da dệt hoặc keo đạt chuẩn kiểm tra.",
      method: parsed.method || "Cần tuân thủ nghiêm ngặt quy trình chuẩn SOP.",
      measurement: parsed.measurement || "Cần định kỳ hiệu chuẩn đồng hồ áp suất & nhiệt độ.",
      environment: parsed.environment || "Nhiệt độ và độ ẩm xưởng trong ngưỡng kiểm soát.",
      isAiGenerated: true,
    };
  } catch (err) {
    console.error("[Groq AI Synthesis Exception]:", err);
    return generateFallbackSynthesis(params);
  }
}

// Fallback logic when Groq API key is not configured
function generateFallbackNextWhy(
  params: { description: string; detectionStage: string },
  turn: number
): NextWhyResponse {
  const fallbackQuestions = [
    `Tại sao lỗi "${params.description.slice(0, 35)}..." lại xuất hiện tại công đoạn ${params.detectionStage}?`,
    "Tại sao thông số vận hành thiết bị hoặc thao tác lại phát sinh sai lệch trong ca này?",
    "Tại sao công nhân đứng chuyền không phát hiện sự cố ở những sản phẩm đầu tiên?",
    "Tại sao tần suất kiểm tra đầu ca chưa ghi nhận biến động áp suất hoặc nhiệt độ?",
    "Tại sao quy trình kiểm soát bảo dưỡng định kỳ chưa phát hiện kịp thời chi tiết hao mòn?",
  ];

  const qIndex = Math.min(turn - 1, fallbackQuestions.length - 1);
  return {
    questionNumber: turn,
    question: fallbackQuestions[qIndex],
    isLastTurn: turn >= 5,
  };
}

function generateFallbackSynthesis(params: { description: string; detectionStage: string }): Synthesis5M1EResult {
  return {
    rootCauseConclusion: `Áp suất xi lanh và nhiệt độ ép nhiệt tại công đoạn ${params.detectionStage} bị sụt giảm, dẫn đến hiện tượng "${params.description.slice(0, 50)}...".`,
    rootCauseCategory: "Machine",
    man: "Công nhân thao tác đúng chuẩn nhưng chưa chú ý cảnh báo đèn áp suất.",
    machine: "Van xả khí nén và rơ-le nhiệt độ bị mòn sau thời gian dài vận hành.",
    material: "Keo dán và phụ liệu da đạt chuẩn QC đầu vào.",
    method: "Cần hiệu chỉnh lại quy trình kiểm tra áp lực máy ép đầu mỗi ca làm việc.",
    measurement: "Đồng hồ đo áp suất có sai số 0.5 bar, cần hiệu chuẩn lại.",
    environment: "Độ ẩm và nhiệt độ phân xưởng đạt tiêu chuẩn nhà máy TBS.",
    isAiGenerated: false,
  };
}

export const analyze5M1EWithGroq = synthesize5M1E;

