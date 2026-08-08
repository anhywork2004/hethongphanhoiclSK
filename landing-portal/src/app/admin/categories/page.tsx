import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issueCategories } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { Layers } from "lucide-react";

export default async function AdminCategoriesPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let cats: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      cats = await db.select().from(issueCategories);
    }
  } catch {
    cats = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Danh Mục Lỗi Sự Cố Chất Lượng (Issue Categories)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin quản lý danh mục lỗi phục vụ chọn nhanh khi báo cáo sự cố và thống kê top lỗi.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <div key={c.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2 group hover:border-emerald-500 transition-all">
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-black border border-amber-200">
                {c.code || c.id}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">{c.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{c.description || "Danh mục lỗi kỹ thuật sản xuất giày."}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
