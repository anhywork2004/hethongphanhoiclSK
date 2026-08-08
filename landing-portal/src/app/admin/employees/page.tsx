import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { employees, userRoles } from "@/db/schema";
import { User, ShieldCheck } from "lucide-react";

export default async function AdminEmployeesPage() {
  let list: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      list = await db.select().from(employees);
    }
  } catch {
    list = [];
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Quản Lý Nhân Viên & Phân Quyền (Admin)</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Quản lý MNV & Vai Trò (Multi-Role)</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        {list.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {list.map((emp) => (
              <div key={emp.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-[#004724] text-white flex items-center justify-center font-black text-xs">
                    {emp.fullName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{emp.fullName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#004724] font-mono text-[10px] font-bold">
                        MNV: {emp.mnv}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {emp.position || "Cán bộ sản xuất"} • {emp.department || "TBS Kiên Giang 1"}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#004724]" />
                  <span>Kích hoạt</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-bold">
            Chưa có tài khoản nhân viên nào.
          </div>
        )}
      </div>
    </div>
  );
}
