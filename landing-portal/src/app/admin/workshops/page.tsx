import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { workshops } from "@/db/schema";
import { Factory, Plus, Check, ShieldAlert } from "lucide-react";

export default async function AdminWorkshopsPage() {
  let list = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      list = await db.select().from(workshops);
    }
  } catch {
    list = [];
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Quản Lý Phân Xưởng (Admin)</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Danh mục phân xưởng sản xuất</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length > 0 ? (
          list.map((ws) => (
            <div key={ws.id} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                  {ws.code || ws.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-700">Đang hoạt động</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{ws.name}</h3>
            </div>
          ))
        ) : (
          <div className="p-8 col-span-full text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 font-bold">
            Chưa có phân xưởng nào. (Chạy API seed để khởi tạo mặc định).
          </div>
        )}
      </div>
    </div>
  );
}
