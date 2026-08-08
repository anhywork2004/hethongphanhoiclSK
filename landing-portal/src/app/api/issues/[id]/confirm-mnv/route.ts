import { NextResponse } from "next/server";
import { POST as acceptTaskPost } from "../accept-task/route";

export async function POST(req: Request, ctx: any) {
  return acceptTaskPost(req, ctx);
}
