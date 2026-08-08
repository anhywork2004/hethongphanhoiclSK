import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const machine = await prisma.machine.findUnique({ where: { id } });
  if (!machine) {
    return NextResponse.json({ error: "Không tìm thấy máy" }, { status: 404 });
  }

  const qrPayload = JSON.stringify({ type: "machine", code: machine.code });
  const buffer = await QRCode.toBuffer(qrPayload, { width: 400, margin: 2 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
