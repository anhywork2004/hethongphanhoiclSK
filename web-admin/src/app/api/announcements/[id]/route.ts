import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  const { title, content, image } = await req.json();
  const announcement = await prisma.announcement.update({
    where: { id },
    data: { title, content, image: image ?? null },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const prisma = await getPrisma();
  const { id } = await params;

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
