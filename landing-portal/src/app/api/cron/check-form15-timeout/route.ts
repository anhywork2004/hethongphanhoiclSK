import { NextResponse } from "next/server";
import { GET as checkTimeoutsGet } from "../check-timeouts/route";

export async function GET() {
  return checkTimeoutsGet();
}
