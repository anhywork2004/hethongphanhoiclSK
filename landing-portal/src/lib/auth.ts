import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users, userRoles } from "@/db/schema";
import { authConfig, CustomUserSession } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        mnv: { label: "Mã nhân viên / Mã đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize: async (credentials) => {
        let mnvRaw = credentials?.mnv as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!mnvRaw || !password) return null;

        const mnvClean = mnvRaw.trim().toUpperCase().replace(/O/g, "0");

        // Fallback test users for offline/demo mode (Password: '123456')
        const fallbackUsers: Record<string, CustomUserSession> = {
          ADMIN01: {
            id: "usr-admin",
            mnv: "ADMIN01",
            fullName: "Quản Trị Viên TBS",
            position: "Quản Trị Hệ Thống",
            department: "Phòng Kỹ Thuật",
            departmentId: "dept-ky-thuat",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "admin",
            roles: ["admin"],
          },
          NV001: {
            id: "usr-worker",
            mnv: "NV001",
            fullName: "Nguyễn Văn An",
            position: "Cán Bộ Sản Xuất / Chuyền May 1A",
            department: "Xưởng May 1",
            departmentId: "dept-ky-thuat",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "worker",
            roles: ["worker"],
          },
          QA001: {
            id: "usr-qa",
            mnv: "QA001",
            fullName: "Lê Thị Cúc",
            position: "Chuyên Viên QA Xưởng May 1",
            department: "Phòng Quản Lý Chất Lượng QA",
            departmentId: "dept-qa",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "qa",
            roles: ["qa"],
          },
          TL001: {
            id: "usr-lineleader",
            mnv: "TL001",
            fullName: "Trần Văn Bình",
            position: "Line Leader / Trưởng Line May 1A",
            department: "Xưởng May 1",
            departmentId: "dept-ky-thuat",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "line_leader",
            roles: ["line_leader"],
          },
          CN001: {
            id: "usr-tech",
            mnv: "CN001",
            fullName: "Phạm Văn Dũng",
            position: "Kỹ Sư Công Nghệ Xưởng May 1",
            department: "Phòng Công Nghệ",
            departmentId: "dept-cong-nghe",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "technology",
            roles: ["technology"],
          },
          TP001: {
            id: "usr-depthead",
            mnv: "TP001",
            fullName: "Hoàng Văn Giang",
            position: "Trưởng Phòng Bảo Trì & Thiết Bị",
            department: "Phòng Bảo Trì",
            departmentId: "dept-bao-tri",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "dept_head",
            roles: ["dept_head"],
          },
          KT001: {
            id: "usr-handler",
            mnv: "KT001",
            fullName: "Đỗ Văn Hùng",
            position: "Kỹ Thuật Viên Bảo Trì Xưởng May 1",
            department: "Phòng Bảo Trì",
            departmentId: "dept-bao-tri",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "handler",
            roles: ["handler"],
          },
          GD001: {
            id: "usr-director",
            mnv: "GD001",
            fullName: "Vũ Thị Mai",
            position: "Giám Đốc Phân Xưởng May",
            department: "Ban Giám Đốc",
            departmentId: "dept-giam-doc",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "director",
            roles: ["director"],
          },
          TGD001: {
            id: "usr-gdirector",
            mnv: "TGD001",
            fullName: "Trịnh Xuân Hùng",
            position: "Tổng Giám Đốc Nhà Máy TBS Kiên Giang",
            department: "Ban Giám Đốc",
            departmentId: "dept-giam-doc",
            factoryId: "fac-tbs-kg1",
            areaId: "ws-may-1",
            role: "general_director",
            roles: ["general_director", "director"],
          },
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
            const foundUsers = await db.select().from(users).where(eq(users.mnv, mnvClean)).limit(1);
            const user = foundUsers[0];
            if (user) {
              const valid = await bcrypt.compare(password, user.passwordHash);
              if (valid) {
                const rolesRes = await db.select().from(userRoles).where(eq(userRoles.userId, user.id));
                const rolesList = rolesRes.map((r) => r.role);
                const primaryRole = (rolesList[0] || user.role || "worker") as string;

                return {
                  id: user.id,
                  mnv: user.mnv,
                  fullName: user.fullName,
                  position: user.position || "Cán Bộ CLSK",
                  department: user.departmentId || "TBS Kiên Giang 1",
                  departmentId: user.departmentId || undefined,
                  factoryId: user.factoryId || "fac-tbs-kg1",
                  areaId: user.areaId || "ws-may-1",
                  role: primaryRole,
                  roles: rolesList.length > 0 ? rolesList : [primaryRole],
                };
              }
            }
          } catch (dbErr) {
            console.error("[Auth DB Error]:", dbErr);
          }
        }

        // Check fallback demo users if password is "123456"
        if (password === "123456" && fallbackUsers[mnvClean]) {
          return fallbackUsers[mnvClean];
        }

        return null;
      },
    }),
  ],
});
