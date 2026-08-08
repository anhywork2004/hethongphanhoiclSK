import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    const bucket = env.UPLOADS;

    if (!bucket) {
      return new NextResponse("R2 bucket binding not found", { status: 500 });
    }

    const object = await bucket.get(key);
    if (!object) {
      return new NextResponse("File not found", { status: 404 });
    }

    const headers = new Headers();
    if (object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }
    if (object.httpEtag) {
      headers.set("etag", object.httpEtag);
    }
    headers.set("cache-control", "public, max-age=31536000");

    return new NextResponse(object.body as unknown as ReadableStream, {
      headers: headers as unknown as HeadersInit,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new NextResponse(error.message || "Failed to fetch image", { status: 500 });
  }
}
