import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { productSizes } from "@/db/schema";

export async function GET() {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (!env?.DB) {
      const defaultSizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44"].map((sz) => ({
        id: `sz_${sz}`,
        sizeCode: sz,
        sizeName: `Size ${sz}`,
      }));
      return NextResponse.json({ sizes: defaultSizes });
    }

    const db = drizzle(env.DB);
    const list = await db.select().from(productSizes);
    const formatted = list.map((item) => ({
      id: item.id,
      sizeCode: item.name,
      sizeName: `Size ${item.name}`,
    }));

    return NextResponse.json({ sizes: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
