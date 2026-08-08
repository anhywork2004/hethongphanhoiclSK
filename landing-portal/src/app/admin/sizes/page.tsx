import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { productSizes } from "@/db/schema";
import { Ruler } from "lucide-react";

export default async function AdminSizesPage() {
  let list: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      list = await db.select().from(productSizes);
    }
  } catch {
    list = [];
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Quản Lý Danh Mục Size (Admin)</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Danh mục kích thước sản phẩm giày Skechers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {list.length > 0 ? (
          list.map((sz) => (
            <div key={sz.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
              <span className="text-xs font-black text-[#004724]">{sz.name}</span>
            </div>
          ))
        ) : (
          <div className="p-8 col-span-full text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 font-bold">
            Chưa có danh mục size nào.
          </div>
        )}
      </div>
    </div>
  );
}
