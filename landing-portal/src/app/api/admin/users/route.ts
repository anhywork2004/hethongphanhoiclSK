import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { users, userRoles } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ users: [] });

    const db = drizzle(env.DB);
    const rows = await db.select().from(users);
    return NextResponse.json({ success: true, users: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mnv, fullName, password, role, departmentId, areaId, phone, position } = body;

    if (!mnv || !fullName || !role) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ Mã đăng nhập, Họ tên và Vai trò" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });

    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1000);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = password ? await bcrypt.hash(password, 10) : "$2a$10$w09ZJ/gT6qH.b1E0xU1M6uP5jUv5a9m/W0X8q7QZ.q6"; // '123456'

    const newUser = {
      id: userId,
      factoryId: "fac-tbs-kg1",
      departmentId: departmentId || null,
      areaId: areaId || null,
      mnv: mnv.trim().toUpperCase(),
      fullName: fullName.trim(),
      phone: phone || null,
      position: position || null,
      passwordHash,
      role: role as any,
      isActive: 1,
      createdAt: now,
    };

    await db.insert(users).values(newUser).execute();
    await db.insert(userRoles).values({
      id: `ur_${userId}`,
      userId,
      role: role as any,
    }).execute();

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
