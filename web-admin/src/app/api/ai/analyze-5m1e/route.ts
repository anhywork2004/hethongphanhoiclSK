import { NextResponse } from "next/server";
import { analyze5M1EWithGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productCode, productName, workshopName, detectionStage, description, severity } = body;

    if (!description) {
      return NextResponse.json({ error: "Mô tả sự cố không được để trống" }, { status: 400 });
    }

    const result = await analyze5M1EWithGroq({
      productCode: productCode || "SP-DEMO",
      productName: productName || "Skechers Demo",
      workshopName: workshopName || "Xưởng May",
      detectionStage: detectionStage || "Chuyền May",
      description,
      severity: severity || "trung_binh",
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json({ error: `Lỗi phân tích AI: ${e.message}` }, { status: 500 });
  }
}
