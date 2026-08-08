import { NextResponse } from "next/server";
import { POST as assignPost } from "../assign/route";

export async function POST(req: Request, ctx: any) {
  return assignPost(req, ctx);
}
