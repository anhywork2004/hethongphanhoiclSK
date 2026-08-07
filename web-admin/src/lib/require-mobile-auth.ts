import { getBearerToken, verifyMobileToken, MobileTokenPayload } from "@/lib/jwt";
import { NextResponse } from "next/server";

export function requireMobileAuth(
  req: Request,
): { payload: MobileTokenPayload; response: null } | { payload: null; response: NextResponse } {
  const token = getBearerToken(req);
  const payload = token ? verifyMobileToken(token) : null;

  if (!payload) {
    return {
      payload: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { payload, response: null };
}
