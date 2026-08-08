import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { departments } from "@/db/schema";
import { Sliders } from "lucide-react";

export default async function AdminDepartmentsPage() {
  let list = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      list = await db.select().from(departments);
    }
  } catch {
    list = [];
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Quản Lý Phòng Ban (Admin)</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Danh sách phòng ban tiếp nhận giải pháp</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length > 0 ? (
          list.map((dept) => (
            <div key={dept.id} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                {dept.code || dept.id}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
            </div>
          ))
        ) : (
          <div className="p-8 col-span-full text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 font-bold">
            Chưa có phòng ban nào.
          </div>
        )}
      </div>
    </div>
  );
}
