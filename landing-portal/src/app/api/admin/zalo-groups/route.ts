import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { zaloGroupMembers, users, workshops, ZaloGroupType } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ members: [] });
    }

    const db = drizzle(env.DB);

    const members = await db
      .select({
        id: zaloGroupMembers.id,
        userId: zaloGroupMembers.userId,
        groupType: zaloGroupMembers.groupType,
        workshopId: zaloGroupMembers.workshopId,
        createdAt: zaloGroupMembers.createdAt,
        userMnv: users.mnv,
        userName: users.fullName,
        userRole: users.role,
        userZaloId: users.zaloId,
        workshopName: workshops.workshopName,
      })
      .from(zaloGroupMembers)
      .leftJoin(users, eq(zaloGroupMembers.userId, users.id))
      .leftJoin(workshops, eq(zaloGroupMembers.workshopId, workshops.id));

    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Zalo group members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, groupType, workshopId } = body;

    if (!userId || !groupType) {
      return NextResponse.json({ error: "userId and groupType are required" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 database unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const newMemberId = `zgm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db
      .insert(zaloGroupMembers)
      .values({
        id: newMemberId,
        userId,
        groupType: groupType as ZaloGroupType,
        workshopId: workshopId || null,
        createdAt: new Date().toISOString(),
      })
      .execute();

    return NextResponse.json({ success: true, message: "Added to Zalo group successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add member to group" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Member id is required" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 database unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    await db.delete(zaloGroupMembers).where(eq(zaloGroupMembers.id, memberId)).execute();

    return NextResponse.json({ success: true, message: "Member removed from Zalo group" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove member" }, { status: 500 });
  }
}
