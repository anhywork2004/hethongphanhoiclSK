import type { NextAuthConfig } from "next-auth";

export interface CustomUserSession {
  id: string;
  mnv: string;
  fullName: string;
  position: string;
  department: string;
  departmentId?: string;
  factoryId?: string;
  areaId?: string;
  role: string;
  roles: string[];
}

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production-tbs-clsk",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as unknown as CustomUserSession;
        token.id = u.id;
        token.mnv = u.mnv;
        token.fullName = u.fullName;
        token.position = u.position;
        token.department = u.department;
        token.departmentId = u.departmentId;
        token.factoryId = u.factoryId;
        token.areaId = u.areaId;
        token.role = u.role;
        token.roles = u.roles || [u.role];
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as unknown as CustomUserSession;
        u.id = token.id as string;
        u.mnv = token.mnv as string;
        u.fullName = token.fullName as string;
        u.position = token.position as string;
        u.department = token.department as string;
        u.departmentId = token.departmentId as string;
        u.factoryId = token.factoryId as string;
        u.areaId = token.areaId as string;
        u.role = token.role as string;
        u.roles = (token.roles as string[]) || [token.role as string];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
