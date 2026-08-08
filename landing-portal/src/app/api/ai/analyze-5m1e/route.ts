import { NextResponse } from "next/server";
import { synthesize5M1E } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await synthesize5M1E({
      productCode: body.productCode || "SK-DEMO",
      productName: body.productName || "Giày Skechers",
      workshopName: body.workshopName || "Xưởng May 1",
      detectionStage: body.detectionStage || "Chuyền May 1",
      description: body.description || "Lỗi chất lượng sản phẩm",
      dialogHistory: body.dialogHistory || [],
    });
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
