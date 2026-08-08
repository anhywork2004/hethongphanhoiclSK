import { NextResponse } from "next/server";
import { askNextWhyQuestion, synthesize5M1E } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, productCode, productName, workshopName, detectionStage, description, dialogHistory } = body;

    if (!description || !detectionStage) {
      return NextResponse.json(
        { error: "Mô tả sự cố và công đoạn phát hiện không được để trống" },
        { status: 400 }
      );
    }

    if (action === "next_why") {
      const nextQ = await askNextWhyQuestion({
        productCode,
        productName,
        workshopName,
        detectionStage,
        description,
        dialogHistory: Array.isArray(dialogHistory) ? dialogHistory : [],
      });
      return NextResponse.json({ success: true, ...nextQ });
    }

    if (action === "synthesize") {
      const synthesis = await synthesize5M1E({
        productCode,
        productName,
        workshopName,
        detectionStage,
        description,
        dialogHistory: Array.isArray(dialogHistory) ? dialogHistory : [],
      });
      return NextResponse.json({ success: true, ...synthesis });
    }

    return NextResponse.json({ error: "Hành động (action) không hợp lệ" }, { status: 400 });
  } catch (err: any) {
    console.error("[API AI Five Whys Error]:", err);
    return NextResponse.json({ error: err.message || "Lỗi xử lý AI" }, { status: 500 });
  }
}
