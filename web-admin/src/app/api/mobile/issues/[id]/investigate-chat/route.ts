import { getPrisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { NextResponse } from "next/server";

const INVESTIGATOR_ROLES = ["QA", "LINE_LEADER", "TECHNOLOGY"];
const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_QUESTIONS = 5;

type ChatTurn = { role: "user" | "model"; text: string };

type Conclusion = {
  type: "conclusion";
  rootCause: string;
  man: string;
  machine: string;
  material: string;
  method: string;
  measurement: string;
  environment: string;
};
type Question = { type: "question"; text: string };

function buildSystemInstruction(description: string, failureCategory: string | null) {
  return `Bạn là chuyên gia phân tích nguyên nhân gốc rễ (root cause analysis) theo phương pháp
"5 Whys", hỗ trợ điều tra sự cố chất lượng trong nhà máy sản xuất.

Vấn đề đang điều tra: "${description}"${failureCategory ? ` (danh mục lỗi: ${failureCategory})` : ""}.

Nhiệm vụ của bạn:
- Mỗi lượt, hỏi ĐÚNG 1 câu hỏi duy nhất, ngắn gọn, rõ ràng, bằng tiếng Việt, đào sâu kiểu "Tại sao"
  dựa trên câu trả lời gần nhất của người dùng, để lần theo chuỗi nhân quả tới nguyên nhân gốc rễ
  thực sự — không dừng lại ở nguyên nhân bề mặt.
- Tối đa ${MAX_QUESTIONS} câu hỏi. Nếu đã đủ rõ nguyên nhân gốc rễ trước khi hỏi hết ${MAX_QUESTIONS}
  câu, hãy chốt luôn, không cần hỏi cho đủ số lượng.
- Khi đã chốt được nguyên nhân gốc rễ, hãy tổng hợp lại toàn bộ cuộc hội thoại và điền vào đúng
  mô hình 5M+1E (Man - con người, Machine - máy móc, Material - nguyên liệu, Method - phương pháp,
  Measurement - đo lường, Environment - môi trường): với mục nào liên quan trực tiếp tới nguyên nhân
  gốc thì viết rõ kết luận; với mục không liên quan thì ghi ngắn gọn "Không phải nguyên nhân chính"
  — KHÔNG được để trống bất kỳ mục nào trong 6 mục.

Luôn trả lời CHỈ bằng JSON hợp lệ theo đúng 1 trong 2 dạng sau, không kèm markdown, không thêm chữ nào khác:
- Còn cần hỏi thêm: {"type":"question","text":"<câu hỏi tiếp theo>"}
- Đã chốt nguyên nhân gốc: {"type":"conclusion","rootCause":"<mô tả đầy đủ nguyên nhân gốc rễ>","man":"...","machine":"...","material":"...","method":"...","measurement":"...","environment":"..."}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, response } = requireMobileAuth(req);
  if (response) return response;
  const { id } = await params;
  const prisma = await getPrisma();

  if (!INVESTIGATOR_ROLES.includes(payload.role)) {
    return NextResponse.json(
      { error: "Chỉ QA/Trưởng line/Công nghệ mới được điều tra" },
      { status: 403 },
    );
  }

  const issue = await prisma.qualityIssue.findUnique({
    where: { id },
    include: { failureCategory: true },
  });
  if (!issue) return NextResponse.json({ error: "Không tìm thấy sự cố" }, { status: 404 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình GEMINI_API_KEY trên server. Vui lòng liên hệ Admin." },
      { status: 503 },
    );
  }

  const { history } = (await req.json()) as { history?: ChatTurn[] };
  const contents = (history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.text }] }));
  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Bắt đầu điều tra nguyên nhân." }] });
  }

  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction(issue.description, issue.failureCategory?.name ?? null) }],
          },
          contents,
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      },
    );
  } catch {
    return NextResponse.json({ error: "Không thể kết nối tới dịch vụ AI, thử lại sau" }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    return NextResponse.json({ error: `Lỗi gọi AI: ${errText.slice(0, 300)}` }, { status: 502 });
  }

  const data = (await geminiRes.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return NextResponse.json({ error: "AI không phản hồi được, thử lại" }, { status: 502 });
  }

  let parsed: Question | Conclusion;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "AI trả lời sai định dạng, thử lại" }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
