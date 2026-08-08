import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LeftBar } from "@/components/dashboard/left-bar";
import { CustomUserSession } from "@/lib/auth.config";
import { getPrisma } from "@/lib/prisma";

async function getIssueCounts() {
  const counts = { cho_xu_ly: 0, dang_xu_ly: 0, da_xu_ly: 0, khong_the_xu_ly: 0 };
  try {
    const prisma = await getPrisma();
    const [pending, accepted, done] = await Promise.all([
      prisma.incident.count({ where: { status: "PENDING" } }),
      prisma.incident.count({ where: { status: "ACCEPTED" } }),
      prisma.incident.count({ where: { status: "DONE" } }),
    ]);
    counts.cho_xu_ly = pending;
    counts.dang_xu_ly = accepted;
    counts.da_xu_ly = done;
    // "khong_the_xu_ly" — không có equivalent trong Prisma, giữ 0
  } catch {
    // fallback counts if Prisma is unavailable during static build
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      <LeftBar user={user} counts={issueCounts} />
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
