import { NextResponse } from "next/server";
import { POST as monActionPost } from "../monitoring-action/route";

export async function POST(req: Request, ctx: any) {
  return monActionPost(req, ctx);
}
