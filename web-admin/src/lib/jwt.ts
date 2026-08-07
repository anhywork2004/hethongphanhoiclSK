import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type MobileTokenPayload = {
  userId: string;
  employeeCode: string;
  role: "OPERATOR" | "MAINTENANCE" | "ADMIN";
  name: string;
};

export function signMobileToken(payload: MobileTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as MobileTokenPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}
