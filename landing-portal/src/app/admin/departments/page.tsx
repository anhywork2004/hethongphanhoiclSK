import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { departments } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { Sliders, Building, Plus } from "lucide-react";

export default async function AdminDepartmentsPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let depts: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      depts = await db.select().from(departments);
    }
  } catch {
    depts = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Cấu Hình Phòng Ban Linh Hoạt (Departments)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin có thể thêm/sửa/xoá phòng ban để Trưởng phòng ban (TP) giao việc phù hợp theo nguyên nhân sự cố.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map((d) => (
            <div key={d.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2 group hover:border-emerald-500 transition-all">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#004724] text-[10px] font-black border border-emerald-200">
                {d.code || d.id}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#004724] transition-colors">{d.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{d.description || "Phòng ban chức năng tiếp nhận xử lý sự cố chất lượng."}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
