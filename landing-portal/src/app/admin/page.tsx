import Link from "next/link";
import {
  Users,
  Building,
  Sliders,
  Package,
  Layers,
  Wrench,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import {
  users,
  departments,
  areas,
  issueCategories,
  partCategories,
  qualityIssues,
} from "@/db/schema";
import { AppHeaderNav } from "@/components/app-header-nav";
import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { count, desc } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession | undefined;

  let totalUsers = 8;
  let totalDepts = 5;
  let totalAreas = 7;
  let totalIssueCats = 5;
  let totalPartCats = 6;
  let totalIssues = 0;
  let issuesList: any[] = [];

  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env?.DB) {
      const db = drizzle(env.DB);
      const [uC, dC, aC, icC, pcC, issRows] = await Promise.all([
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(departments),
        db.select({ value: count() }).from(areas),
        db.select({ value: count() }).from(issueCategories),
        db.select({ value: count() }).from(partCategories),
        db.select().from(qualityIssues).orderBy(desc(qualityIssues.createdAt)).limit(10),
      ]);

      totalUsers = uC[0]?.value || totalUsers;
      totalDepts = dC[0]?.value || totalDepts;
      totalAreas = aC[0]?.value || totalAreas;
      totalIssueCats = icC[0]?.value || totalIssueCats;
      totalPartCats = pcC[0]?.value || totalPartCats;
      issuesList = issRows;
      totalIssues = issRows.length;
    }
  } catch {
    // fallback
  }

  const masterLinks = [
    { title: "Quản Lý Người Dùng & Phân Quyền", href: "/admin/users", count: `${totalUsers} Nhân Viên`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Cấu Hình Phòng Ban Linh Hoạt", href: "/admin/departments", count: `${totalDepts} Phòng Ban`, icon: Sliders, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Cơ Cấu Khu Vực (Xưởng/Tổ/Chuyền)", href: "/admin/areas", count: `${totalAreas} Khu Vực`, icon: Building, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Danh Mục Lỗi Sự Cố (Issue Categories)", href: "/admin/categories", count: `${totalIssueCats} Danh Mục`, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Danh Mục Linh Kiện Thay Thế (Part Categories)", href: "/admin/parts", count: `${totalPartCats} Linh Kiện`, icon: Package, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
      <AppHeaderNav user={user} />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Admin Header */}
        <div className="bg-[#004724] text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#8dc63f]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">
                TRUNG TÂM QUẢN TRỊ TBS SKECHERS KG1
              </div>
              <h1 className="text-3xl font-black font-serif-luxury tracking-tight mt-0.5">
                Bảng Điều Khiển Hệ Thống Admin
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                Quản lý phân quyền 8 vai trò, danh mục phòng ban, cơ cấu khu vực và công cụ test thời gian.
              </p>
            </div>
          </div>
        </div>

        {/* Master Data Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-[#004724] tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Quản Trị Dữ Liệu Nền Tảng (Master Data CRUD)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {masterLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#004724] shadow-xs space-y-3 group transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#004724] transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#004724] font-bold">
                    <span>Quản lý chi tiết</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 8 Test Accounts Quick Reference Table */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black uppercase text-[#004724] tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Danh Sách 8 Tài Khoản Test Chuẩn (Mật khẩu: 123456)</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Seed D1 Database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-black uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã Đăng Nhập</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-4 py-3">Vai Trò Hệ Thống</th>
                  <th className="px-4 py-3">Phân Xưởng / Phòng Ban</th>
                  <th className="px-4 py-3">Mật Khẩu Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { mnv: "ADMIN01", name: "Quản Trị Viên TBS", role: "Quản trị hệ thống (Admin)", dept: "Công Nghệ Thông Tin" },
                  { mnv: "NV001", name: "Nguyễn Văn An", role: "Cán bộ sản xuất / Công nhân (Worker)", dept: "Xưởng May 1 / Chuyền 1A" },
                  { mnv: "QA001", name: "Lê Thị Cúc", role: "Nhân viên QA (QA)", dept: "Phòng Quản Lý Chất Lượng" },
                  { mnv: "TL001", name: "Trần Văn Bình", role: "Line Leader / Trưởng Line (LL)", dept: "Xưởng May 1 / Tổ May 1" },
                  { mnv: "CN001", name: "Phạm Văn Dũng", role: "Kỹ sư Công nghệ (CN)", dept: "Phòng Công Nghệ" },
                  { mnv: "TP001", name: "Hoàng Văn Giang", role: "Trưởng phòng ban (TP)", dept: "Phòng Bảo Trì & Thiết Bị" },
                  { mnv: "KT001", name: "Đỗ Văn Hùng", role: "Kỹ thuật sửa chữa (Handler)", dept: "Phòng Bảo Trì Xưởng May 1" },
                  { mnv: "GD001", name: "Vũ Thị Mai", role: "Giám đốc xưởng (Director)", dept: "Ban Giám Đốc Phân Xưởng" },
                  { mnv: "TGD001", name: "Trịnh Xuân Hùng", role: "Tổng Giám Đốc (General Director)", dept: "Ban Tổng Giám Đốc Nhà Máy" },
                ].map((acc) => (
                  <tr key={acc.mnv} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-black text-[#004724]">{acc.mnv}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{acc.name}</td>
                    <td className="px-4 py-2.5 text-slate-700">{acc.role}</td>
                    <td className="px-4 py-2.5 text-slate-600">{acc.dept}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-700 font-bold">123456</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
