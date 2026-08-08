import { NextResponse } from "next/server";
import { GET as statsGet } from "../stats/route";

export async function GET(req: Request) {
  return statsGet(req);
}
