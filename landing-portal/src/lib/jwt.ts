import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY RISK: JWT_SECRET environment secret is required in production mode.");
    }
    return "dev-secret-change-me";
  }
  return secret;
}

export type MobileTokenPayload = {
  userId: string;
  employeeCode: string;
  role: "OPERATOR" | "MAINTENANCE" | "ADMIN";
  name: string;
};

export function signMobileToken(payload: MobileTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as MobileTokenPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}
