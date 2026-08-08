import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const contentType = file.type || "image/jpeg";

    let imageUrl = "";
    let r2Key = filename;

    try {
      const ctx = await getCloudflareContext({ async: true });
      const env = ctx.env as unknown as CloudflareEnv;
      const bucket = env.UPLOADS;

      if (bucket) {
        await bucket.put(filename, arrayBuffer, {
          httpMetadata: { contentType },
        });
        imageUrl = `/api/upload/${filename}`;
      }
    } catch {
      // Fallback data URI for local dev if R2 binding isn't active
    }

    if (!imageUrl) {
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      imageUrl = `data:${contentType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      r2Key,
      name: file.name,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
