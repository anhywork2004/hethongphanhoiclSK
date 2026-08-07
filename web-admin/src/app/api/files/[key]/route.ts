import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    if (!context.env.UPLOADS) {
      return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
    }

    const object = await context.env.UPLOADS.get(key);
    if (!object) {
      return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
    }

    return new NextResponse(object.body as unknown as BodyInit, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
  }
}
