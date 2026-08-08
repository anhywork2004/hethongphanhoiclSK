import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const u = session.user as unknown as CustomUserSession;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: u.id,
      mnv: u.mnv,
      fullName: u.fullName,
      position: u.position,
      department: u.department,
      role: u.role,
      roles: u.roles || [u.role],
    },
  });
}
