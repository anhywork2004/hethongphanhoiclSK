import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { partCategories } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { Package } from "lucide-react";

export default async function AdminPartsPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let parts: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      parts = await db.select().from(partCategories);
    }
  } catch {
    parts = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Danh Mục Linh Kiện Thay Thế (Part Categories)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý kho phụ tùng linh kiện máy móc phục vụ sửa chữa nhiều dòng tại Bước 6.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2 group hover:border-emerald-500 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 text-[10px] font-black border border-teal-200">
                  {p.code || p.id}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Tồn kho: <strong className="text-[#004724]">{p.inStock || 100}</strong> {p.unit || "Cái"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">{p.name}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
