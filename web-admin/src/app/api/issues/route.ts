import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueImages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { sendZaloIssueNotifications } from "@/lib/zalo-oa";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ issues: [] });
    }

    const db = drizzle(env.DB);
    const issueRows = await db.select().from(issues).orderBy(desc(issues.createdAt)).limit(100);

    const result = [];
    for (const r of issueRows) {
      const imgs = await db.select().from(issueImages).where(eq(issueImages.issueId, r.id));
      result.push({
        ...r,
        affectedSizes: JSON.parse(r.affectedSizes || "[]"),
        images: imgs,
      });
    }

    return NextResponse.json({ success: true, issues: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as unknown as CustomUserSession | undefined;

    const body = await req.json();
    const {
      productCode,
      productName,
      affectedSizes,
      workshopId,
      workshopName,
      detectionStage,
      description,
      severity,
      images,
    } = body;

    if (!productCode || !productName || !affectedSizes || !detectionStage || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env.DB) {
      return NextResponse.json({ error: "D1 database binding is unavailable" }, { status: 500 });
    }

    const db = drizzle(env.DB);
    const now = new Date();
    const timestampStr = now.toISOString();

    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const issueCode = `CLSK-${datePrefix}-${randomSuffix}`;
    const issueId = `iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newIssue = {
      id: issueId,
      issueCode,
      productCode: productCode.trim().toUpperCase(),
      productName: productName.trim(),
      affectedSizes: JSON.stringify(affectedSizes),
      workshopId: workshopId || null,
      workshopName: workshopName || "Phân xưởng Chặt & Chuẩn bị",
      detectionStage: detectionStage.trim(),
      description: description.trim(),
      severity: severity || "trung_binh",
      status: "cho_xu_ly" as const,
      createdByMnv: user?.mnv || "NV001",
      createdByName: user?.fullName || "Người dùng",
      createdAt: timestampStr,
    };

    await db.insert(issues).values(newIssue).execute();

    // Save image records
    const savedImages: { imageUrl: string }[] = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.imageUrl) {
          const imgId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await db
            .insert(issueImages)
            .values({
              id: imgId,
              issueId,
              imageUrl: img.imageUrl,
              r2Key: img.r2Key || null,
              createdAt: timestampStr,
            })
            .execute();
          savedImages.push({ imageUrl: img.imageUrl });
        }
      }
    }

    // Trigger Zalo OA Notification asynchronously (non-blocking)
    sendZaloIssueNotifications(
      {
        id: issueId,
        issueCode,
        productCode: newIssue.productCode,
        productName: newIssue.productName,
        affectedSizes: Array.isArray(affectedSizes) ? affectedSizes : [],
        workshopId: newIssue.workshopId,
        workshopName: newIssue.workshopName,
        detectionStage: newIssue.detectionStage,
        description: newIssue.description,
        severity: newIssue.severity,
        createdByName: newIssue.createdByName,
        createdByMnv: newIssue.createdByMnv,
        createdAt: timestampStr,
      },
      savedImages
    ).catch((err) => console.error("[Zalo Async Error]:", err));

    return NextResponse.json({
      success: true,
      issue: newIssue,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create issue" }, { status: 500 });
  }
}
