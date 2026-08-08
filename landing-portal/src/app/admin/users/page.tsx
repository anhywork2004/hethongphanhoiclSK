import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { users, departments, areas } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { Users as UsersIcon, Plus, ShieldCheck } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let usersList: any[] = [];
  let deptsList: any[] = [];
  let areasList: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      const [uRows, dRows, aRows] = await Promise.all([
        db.select().from(users),
        db.select().from(departments),
        db.select().from(areas),
      ]);
      usersList = uRows;
      deptsList = dRows;
      areasList = aRows;
    }
  } catch {
    // fallback
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Quản Lý Người Dùng & Phân Quyền (Users)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách cán bộ công nhân viên, 8 vai trò hệ thống và khu vực làm việc.
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#004724] tracking-wider">
              Tổng số người dùng ({usersList.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-black uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Mã NV</th>
                  <th className="px-5 py-3">Họ và Tên</th>
                  <th className="px-5 py-3">Vai Trò Chính</th>
                  <th className="px-5 py-3">Chức Vụ</th>
                  <th className="px-5 py-3">Phòng Ban / Khu Vực</th>
                  <th className="px-5 py-3">Điện Thoại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-black text-[#004724]">{u.mnv}</td>
                    <td className="px-5 py-3 font-bold text-slate-900">{u.fullName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#004724] text-[10px] font-black uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{u.position || "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{u.departmentId || u.areaId || "Xưởng May 1"}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{u.phone || "0901000000"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
