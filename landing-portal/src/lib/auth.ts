import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
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

        // Fallback user map for dev/demo mode
        const fallbackUsers: Record<string, { id: string; mnv: string; fullName: string; position: string; department: string; role: string }> = {
          NV001: { id: "u_1", mnv: "NV001", fullName: "Nguyễn Văn An", position: "Cán bộ sản xuất", department: "Chuyền Chặt 1", role: "reporter" },
          TL001: { id: "u_2", mnv: "TL001", fullName: "Trần Thị Bình", position: "Trưởng Line May", department: "Chuyền May 2", role: "truong_line" },
          TT001: { id: "u_3", mnv: "TT001", fullName: "Lê Văn Cường", position: "Tổ trưởng Tổ Đồ", department: "Chuyền Đế 1", role: "to_truong" },
          QA001: { id: "u_4", mnv: "QA001", fullName: "Phạm Minh Dung", position: "Chuyên viên QA", department: "Phòng QA/QC", role: "qa" },
          CN001: { id: "u_5", mnv: "CN001", fullName: "Hoàng Văn Em", position: "Kỹ sư Công nghệ", department: "Phòng Kỹ thuật - Công nghệ", role: "cong_nghe" },
          TP001: { id: "u_6", mnv: "TP001", fullName: "Đỗ Thị Phương", position: "Trưởng phòng Sản xuất", department: "Phòng Quản lý Sản xuất", role: "truong_phong_ban" },
          KT001: { id: "u_7", mnv: "KT001", fullName: "Ngô Văn Giang", position: "Kỹ thuật viên Bảo trì", department: "Bộ phận Bảo trì MMTB", role: "nguoi_xu_ly" },
          GD001: { id: "u_8", mnv: "GD001", fullName: "Vũ Đình Hải", position: "Giám đốc Phân xưởng", department: "Ban Giám đốc Kiên Giang 1", role: "giam_doc" },
          TGD001: { id: "u_9", mnv: "TGD001", fullName: "Trịnh Xuân Hùng", position: "Tổng Giám Đốc", department: "Ban Tổng Giám Đốc", role: "tong_giam_doc" },
          ADMIN001: { id: "u_10", mnv: "ADMIN001", fullName: "Quản Trị Viên", position: "Quản trị Hệ thống", department: "Phòng IT", role: "admin" },
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
                return {
                  id: user.id,
                  mnv: user.mnv,
                  fullName: user.fullName,
                  position: user.position,
                  department: user.department,
                  role: user.role,
                };
              }
            }
          } catch {
            // DB select error fallback
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
