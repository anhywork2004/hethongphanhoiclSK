import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LeftBar } from "@/components/dashboard/left-bar";
import { CustomUserSession } from "@/lib/auth.config";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues } from "@/db/schema";
import { eq, count } from "drizzle-orm";

async function getIssueCounts() {
  const counts = { cho_xu_ly: 0, dang_xu_ly: 0, dang_chay_thu: 0, da_xu_ly: 0, khong_the_xu_ly: 0 };
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      const resCho = await db.select({ value: count() }).from(issues).where(eq(issues.status, "cho_xu_ly"));
      const resDang = await db.select({ value: count() }).from(issues).where(eq(issues.status, "dang_xu_ly"));
      const resChayThu = await db.select({ value: count() }).from(issues).where(eq(issues.status, "dang_chay_thu"));
      const resDa = await db.select({ value: count() }).from(issues).where(eq(issues.status, "da_xu_ly"));
      const resKhong = await db.select({ value: count() }).from(issues).where(eq(issues.status, "khong_the_xu_ly"));

      counts.cho_xu_ly = resCho[0]?.value || 0;
      counts.dang_xu_ly = resDang[0]?.value || 0;
      counts.dang_chay_thu = resChayThu[0]?.value || 0;
      counts.da_xu_ly = resDa[0]?.value || 0;
      counts.khong_the_xu_ly = resKhong[0]?.value || 0;
    }
  } catch {
    // fallback counts if D1 context is offline during static build
  }
  return counts;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as unknown as CustomUserSession;
  const issueCounts = await getIssueCounts();

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex font-sans antialiased">
      {/* Fixed Leftbar Navigation */}
      <LeftBar user={user} counts={issueCounts} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#f4f7f5] overflow-y-auto min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
