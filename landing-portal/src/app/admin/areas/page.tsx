import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { areas } from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { Building, Layers } from "lucide-react";

export default async function AdminAreasPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let areaRows: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      areaRows = await db.select().from(areas);
    }
  } catch {
    areaRows = [];
  }

  const workshops = areaRows.filter((a) => a.type === "workshop");
  const teams = areaRows.filter((a) => a.type === "team");
  const lines = areaRows.filter((a) => a.type === "line");

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Cơ Cấu Khu Vực Sản Xuất (Xưởng • Tổ • Chuyền)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cây phân cấp khu vực sản xuất phục vụ gán phiếu và phân quyền giao việc cùng khu vực.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workshops */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-[#004724] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>1. Danh Sách Phân Xưởng ({workshops.length})</span>
            </h3>
            <div className="space-y-2">
              {workshops.map((w) => (
                <div key={w.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{w.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">{w.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-[#004724] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>2. Danh Sách Tổ Sản Xuất ({teams.length})</span>
            </h3>
            <div className="space-y-2">
              {teams.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{t.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">{t.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-[#004724] tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>3. Danh Sách Chuyền May/Gò ({lines.length})</span>
            </h3>
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{l.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">{l.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
