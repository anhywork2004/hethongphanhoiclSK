import { NextResponse } from "next/server";
import { POST as completeRepairPost } from "../complete-repair/route";

export async function POST(req: Request, ctx: any) {
  return completeRepairPost(req, ctx);
}
