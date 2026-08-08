import Link from "next/link";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Siren,
  Wrench,
  Check,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { notifications } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";

export default async function NotificationsPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let list: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      if (user?.id) {
        list = await db
          .select()
          .from(notifications)
          .where(
            or(
              eq(notifications.userId, user.id),
              eq(notifications.roleTarget, user.role),
              eq(notifications.roleTarget, "all")
            )
          )
          .orderBy(desc(notifications.createdAt))
          .limit(50);
      } else {
        list = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(50);
      }
    }
  } catch {
    list = [];
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724]">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#004724] font-serif-luxury tracking-tight">
                Trung Tâm Thông Báo Đa Kênh
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                TBS Skechers Kiên Giang 1 • Nhắc nhở tiến độ 15 phút, giao việc và theo dõi 3h-48h.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {list.length > 0 ? (
            list.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-3xl border transition-all flex items-start space-x-3.5 ${
                  n.isRead === 0
                    ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                    : "bg-white border-slate-200/90"
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shrink-0 text-[#004724]">
                  {n.type.includes("phase2") || n.type.includes("timeout") ? (
                    <Siren className="w-5 h-5 text-rose-600 animate-bounce" />
                  ) : n.type.includes("success") || n.type.includes("completed") ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : n.type.includes("task") ? (
                    <Wrench className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Info className="w-5 h-5 text-[#004724]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">{n.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {n.createdAt ? new Date(n.createdAt * 1000).toLocaleTimeString("vi-VN") : "Bây giờ"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{n.message}</p>

                  {n.issueId && (
                    <Link
                      href={`/dashboard/issues/${n.issueId}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#004724] hover:underline mt-2.5"
                    >
                      <span>Vào xem chi tiết phiếu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-500">Chưa có thông báo nào mới.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
