import Link from "next/link";
import { Bell, Clock, AlertTriangle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function NotificationsPage() {
  let list: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      list = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
    }
  } catch {
    list = [];
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 font-sans text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#004724] font-serif-luxury">Trung Tâm Thông Báo In-App</h1>
            <p className="text-xs text-slate-500 mt-0.5">TBS Skechers Kiên Giang 1 • Nhắc nhở tiến độ SLA real-time</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {list.length > 0 ? (
          list.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 ${
                n.isRead === 0 ? "bg-emerald-50/50 border-emerald-300" : "bg-white border-slate-200/80"
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 text-[#004724]">
                {n.type.includes("escalated") || n.type.includes("overdue") ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                ) : n.type.includes("resolved") ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Info className="w-5 h-5 text-[#004724]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {n.createdAt ? new Date(n.createdAt * 1000).toLocaleTimeString("vi-VN") : "Bây giờ"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{n.message}</p>

                {n.issueId && (
                  <Link
                    href={`/dashboard/issues/${n.issueId}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#004724] hover:underline mt-2"
                  >
                    <span>Xem chi tiết phiếu #{n.issueId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-500">Chưa có thông báo nào mới.</p>
          </div>
        )}
      </div>
    </div>
  );
}
