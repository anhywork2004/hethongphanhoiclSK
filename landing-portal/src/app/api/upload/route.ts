import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const r2Key = `clsk_${timestamp}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

    let r2: R2Bucket | undefined;
    try {
      const ctx = await getCloudflareContext({ async: true });
      const env = ctx.env as unknown as { IMAGES_BUCKET?: R2Bucket; R2?: R2Bucket };
      r2 = env?.IMAGES_BUCKET || env?.R2;
    } catch {
      // fallback
    }

    if (r2) {
      const arrayBuffer = await file.arrayBuffer();
      await r2.put(r2Key, arrayBuffer, {
        httpMetadata: { contentType: file.type || "image/jpeg" },
      });
      const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "/api/files";
      const imageUrl = `${publicBaseUrl}/${r2Key}`;
      return NextResponse.json({ success: true, imageUrl, r2Key, name: file.name });
    }

    // Local / In-memory data URL fallback if R2 binding is not configured in local dev
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      r2Key,
      name: file.name,
    });
  } catch (err: any) {
    console.error("[Upload API Error]:", err);
    return NextResponse.json({ error: err.message || "Tải ảnh thất bại" }, { status: 500 });
  }
}
