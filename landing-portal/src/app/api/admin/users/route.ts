import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ users: [] });
    }

    const db = drizzle(env.DB);
    const userList = await db
      .select({
        id: users.id,
        mnv: users.mnv,
        fullName: users.fullName,
        position: users.position,
        department: users.department,
        role: users.role,
        zaloId: users.zaloId,
        createdAt: users.createdAt,
      })
      .from(users);

    return NextResponse.json({ success: true, users: userList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, zaloId, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);

    const updateFields: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (zaloId !== undefined) updateFields.zaloId = zaloId.trim();
    if (role !== undefined) updateFields.role = role;

    await db.update(users).set(updateFields).where(eq(users.id, userId)).execute();

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
