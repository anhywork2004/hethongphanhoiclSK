import { requireMobileAuth } from "@/lib/require-mobile-auth";
import { saveBase64Image } from "@/lib/save-upload";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { response } = requireMobileAuth(req);
  if (response) return response;

  const { base64, mimeType } = await req.json();
  if (!base64) {
    return NextResponse.json({ error: "Thiếu dữ liệu ảnh" }, { status: 400 });
  }

  const url = await saveBase64Image(base64, mimeType);
  return NextResponse.json({ url });
}
