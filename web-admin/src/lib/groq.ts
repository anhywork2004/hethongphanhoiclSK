import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface FiveMOneEResult {
  man: string;
  machine: string;
  material: string;
  method: string;
  measurement: string;
  environment: string;
  fiveWhyQuestions: string[];
  summary: string;
  isAiGenerated: boolean;
}

export async function analyze5M1EWithGroq(params: {
  productCode: string;
  productName: string;
  workshopName: string;
  detectionStage: string;
  description: string;
  severity: string;
}): Promise<FiveMOneEResult> {
  let apiKey: string | undefined;

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as Record<string, string>;
    apiKey = env?.GROQ_API_KEY || process.env.GROQ_API_KEY;
  } catch {
    apiKey = process.env.GROQ_API_KEY;
  }

  // Fallback Rule-Based Factory Analyzer if Groq API Key is not set
  if (!apiKey || apiKey.trim() === "") {
    return generateFallback5M1E(params);
  }

  try {
    const promptText = `Bạn là chuyên gia quản lý chất lượng QA/QC tại nhà máy may mặc & giày thể thao TBS Skechers Kiên Giang 1.
Hãy phân tích sự cố chất lượng sản phẩm sau theo phương pháp 5M+1E và gợi ý 5 câu hỏi 5-Why (Tại sao) để truy vết nguyên nhân gốc rễ:

- Mã SP: ${params.productCode} (${params.productName})
- Phân xưởng: ${params.workshopName || "Chưa xác định"} | Công đoạn: ${params.detectionStage}
- Mô tả sự cố: ${params.description}
- Mức độ nghiêm trọng: ${params.severity}

Yêu cầu trả về DUY NHẤT một chuỗi JSON chuẩn (JSON object, không kèm markdown fence):
{
  "man": "Gợi ý nguyên nhân yếu tố Con người...",
  "machine": "Gợi ý nguyên nhân yếu tố Thiết bị/Máy móc...",
  "material": "Gợi ý nguyên nhân yếu tố Nguyên vật liệu...",
  "method": "Gợi ý nguyên nhân yếu tố Phương pháp thao tác...",
  "measurement": "Gợi ý nguyên nhân yếu tố Đo lường...",
  "environment": "Gợi ý nguyên nhân yếu tố Môi trường xưởng...",
  "fiveWhyQuestions": [
    "Tại sao 1...",
    "Tại sao 2...",
    "Tại sao 3...",
    "Tại sao 4...",
    "Tại sao 5 (Root Cause)..."
  ],
  "summary": "Tóm tắt khuyến nghị khắc phục trong 2 giờ"
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
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.warn("[Groq AI Error] HTTP error:", response.status);
      return generateFallback5M1E(params);
    }

    const data: any = await response.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      return generateFallback5M1E(params);
    }

    const parsed = JSON.parse(contentText);
    return {
      man: parsed.man || "Cần kiểm tra kỹ năng thao tác của công nhân đứng chuyền.",
      machine: parsed.machine || "Cần kiểm tra thông số áp suất, nhiệt độ máy ép/máy may.",
      material: parsed.material || "Cần kiểm tra chất lượng keo, chỉ, da dệt đầu vào.",
      method: parsed.method || "Cần rà soát lại quy trình chuẩn SOP tại công đoạn.",
      measurement: parsed.measurement || "Cần hiệu chuẩn thiết bị đo nhiệt/lực kéo.",
      environment: parsed.environment || "Cần kiểm tra độ ẩm & nhiệt độ môi trường xưởng.",
      fiveWhyQuestions: Array.isArray(parsed.fiveWhyQuestions) ? parsed.fiveWhyQuestions : default5Why(params.description),
      summary: parsed.summary || "Cần lập biên bản khoanh vùng & khắc phục trong 2 giờ.",
      isAiGenerated: true,
    };
  } catch (err) {
    console.error("[Groq AI Exception]:", err);
    return generateFallback5M1E(params);
  }
}

function generateFallback5M1E(params: { description: string; detectionStage: string }): FiveMOneEResult {
  return {
    man: "Tay nghề công nhân đứng chuyền chưa đồng đều hoặc thiếu tập trung khi thao tác.",
    machine: "Đầu máy/điện trở nhiệt ép bị tụt áp suất hoặc cảm biến nhiệt bị lệch chuẩn.",
    material: "Độ bám dính của phụ liệu (keo/chỉ/vải) bị ảnh hưởng bởi độ ẩm hoặc hạn sử dụng.",
    method: "Thời gian ép nhiệt/may chưa đủ quy chuẩn SOP ban hành.",
    measurement: "Dụng cụ đo nhiệt độ hoặc thước kẹp kiểm tra chưa được hiệu chuẩn định kỳ.",
    environment: "Độ ẩm xưởng sản xuất cao hơn tiêu chuẩn cho phép (trên 75%).",
    fiveWhyQuestions: default5Why(params.description),
    summary: "Xác minh 4M+1E trực tiếp tại chuyền, tạm dừng lô hàng ảnh hưởng và căn chỉnh thiết bị.",
    isAiGenerated: false,
  };
}

function default5Why(description: string): string[] {
  return [
    `Tại sao lỗi "${description.slice(0, 30)}..." lại phát sinh trên chuyền?`,
    "Tại sao thông số vận hành máy không duy trì ổn định?",
    "Tại sao công nhân không phát hiện biến động nhiệt độ/áp suất sớm hơn?",
    "Tại sao tần suất kiểm tra đầu ca chưa ghi nhận sai lệch?",
    "Root Cause: Quy trình kiểm soát thông số thiết bị trước ca chưa được tuân thủ nghiêm ngặt.",
  ];
}
