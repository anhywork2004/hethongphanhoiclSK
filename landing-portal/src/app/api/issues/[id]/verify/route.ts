import { NextResponse } from "next/server";
import { POST as llVerifyPost } from "../ll-verify/route";

export async function POST(req: Request, ctx: any) {
  return llVerifyPost(req, ctx);
}
