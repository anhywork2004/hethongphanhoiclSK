import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { employees, userRoles } from "@/db/schema";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        mnv: { label: "Mã nhân viên", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize: async (credentials) => {
        let mnvRaw = credentials?.mnv as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!mnvRaw || !password) return null;

        // Clean & normalize typo (e.g., NVO01 -> NV001)
        const mnvClean = mnvRaw.trim().toUpperCase().replace(/O/g, "0");

        // Fallback users for offline/demo mode
        const fallbackUsers: Record<string, { id: string; mnv: string; fullName: string; position: string; department: string; role: string; roles: string[] }> = {
          NV001: { id: "emp-worker1", mnv: "NV001", fullName: "Nguyễn Văn An", position: "Công Nhân Xưởng May 1", department: "Xưởng may 1", role: "worker", roles: ["worker"] },
          TL001: { id: "emp-lineleader1", mnv: "TL001", fullName: "Trần Văn Bình", position: "Trưởng Line 1", department: "Xưởng may 1", role: "line_leader", roles: ["line_leader"] },
          TT001: { id: "emp-teamleader1", mnv: "TT001", fullName: "Lê Văn Cường", position: "Tổ Trưởng", department: "Xưởng may 1", role: "team_leader", roles: ["team_leader"] },
          QA001: { id: "emp-qa1", mnv: "QA001", fullName: "Lê Thị Cúc", position: "Chuyên Viên QA", department: "Phòng QA", role: "qa", roles: ["qa"] },
          CN001: { id: "emp-tech1", mnv: "CN001", fullName: "Phạm Văn Dũng", position: "Kỹ Sư Công Nghệ", department: "Phòng Công Nghệ", role: "technology", roles: ["technology"] },
          TP001: { id: "emp-depthead1", mnv: "TP001", fullName: "Hoàng Văn Giang", position: "Trưởng Phòng Bảo Trì", department: "Phòng Bảo Trì", role: "dept_head", roles: ["dept_head"] },
          KT001: { id: "emp-handler1", mnv: "KT001", fullName: "Đỗ Văn Hùng", position: "Kỹ Thuật Bảo Trì", department: "Phòng Bảo Trì", role: "handler", roles: ["handler"] },
          GD001: { id: "emp-director1", mnv: "GD001", fullName: "Vũ Thị Mai", position: "Giám Đốc Phân Xưởng", department: "Ban Giám Đốc", role: "director", roles: ["director"] },
          TGD001: { id: "emp-gdirector1", mnv: "TGD001", fullName: "Trịnh Xuân Hùng", position: "Tổng Giám Đốc", department: "Ban Tổng Giám Đốc", role: "general_director", roles: ["general_director"] },
          ADMIN01: { id: "emp-admin1", mnv: "ADMIN01", fullName: "Quản Trị Viên TBS", position: "Quản Trị Hệ Thống", department: "Công Nghệ Thông Tin", role: "admin", roles: ["admin"] },
        };

        let db;
        try {
          const ctx = await getCloudflareContext({ async: true });
          const env = ctx.env as unknown as CloudflareEnv;
          if (env?.DB) {
            db = drizzle(env.DB);
          }
        } catch {
          // fallback
        }

        if (db) {
          try {
            const foundEmps = await db.select().from(employees).where(eq(employees.mnv, mnvClean)).limit(1);
            const emp = foundEmps[0];
            if (emp) {
              const valid = await bcrypt.compare(password, emp.passwordHash);
              if (valid) {
                // Query user_roles table for multi-roles
                const rolesRes = await db.select().from(userRoles).where(eq(userRoles.employeeId, emp.id));
                const rolesList = rolesRes.map((r) => r.role);
                const primaryRole = rolesList[0] || "worker";

                return {
                  id: emp.id,
                  mnv: emp.mnv,
                  fullName: emp.fullName,
                  position: emp.position || "Cán Bộ CLSK",
                  department: emp.department || "TBS Kiên Giang 1",
                  role: primaryRole,
                  roles: rolesList.length > 0 ? rolesList : [primaryRole],
                };
              }
            }
          } catch {
            // DB error fallback
          }
        }

        // Fallback for demo users if password is "123456"
        if (password === "123456" && fallbackUsers[mnvClean]) {
          return fallbackUsers[mnvClean];
        }

        return null;
      },
    }),
  ],
});
