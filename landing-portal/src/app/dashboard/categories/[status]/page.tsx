import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Clock, AlertTriangle, CheckCircle2, XCircle, FlaskConical, Package, Factory, User, Image as ImageIcon, PlusCircle, ArrowRight } from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/countdown-timer";

export default async function CategoryStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;

  const validStatuses = ["cho_xu_ly", "dang_xu_ly", "dang_chay_thu", "da_xu_ly", "khong_the_xu_ly"];
  const currentStatus = validStatuses.includes(status) ? status : "cho_xu_ly";

  const statusConfig: Record<string, { title: string; badgeBg: string; textCol: string; icon: any; timerMinutes?: number }> = {
    cho_xu_ly: { title: "Phiếu Chưa Xử Lý (Chờ Tiếp Nhận 15 Phút SLA)", badgeBg: "bg-amber-50 border-amber-200", textCol: "text-amber-700", icon: Clock, timerMinutes: 15 },
    dang_xu_ly: { title: "Phiếu Đang Xử Lý (Chẩn Đoán 5M+1E & Kỹ Thuật Sửa Chữa)", badgeBg: "bg-blue-50 border-blue-200", textCol: "text-blue-700", icon: AlertTriangle, timerMinutes: 120 },
    dang_chay_thu: { title: "Phiếu Đang Chạy Thử Nghiệm (Min 3h – Max 48h)", badgeBg: "bg-purple-50 border-purple-200", textCol: "text-purple-700", icon: FlaskConical, timerMinutes: 180 },
    da_xu_ly: { title: "Phiếu Đã Xử Lý Thành Công (Đạt Chuẩn CLSK)", badgeBg: "bg-emerald-50 border-emerald-200", textCol: "text-emerald-700", icon: CheckCircle2 },
    khong_the_xu_ly: { title: "Phiếu Không Thể Xử Lý (Chuyển Khu Vực / Tạm Dừng)", badgeBg: "bg-rose-50 border-rose-200", textCol: "text-rose-700", icon: XCircle },
  };

  const currentCfg = statusConfig[currentStatus];
  const IconComp = currentCfg.icon;

  let issueList: any[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as CloudflareEnv;
    if (env.DB) {
      const db = drizzle(env.DB);
      const rows = await db
        .select()
        .from(issues)
        .where(eq(issues.status, currentStatus as any))
        .orderBy(desc(issues.createdAt));

      for (const r of rows) {
        const imgs = await db.select().from(issueImages).where(eq(issueImages.issueId, r.id));
        issueList.push({
          ...r,
          affectedSizes: JSON.parse(r.affectedSizes || "[]"),
          images: imgs,
        });
      }
    }
  } catch {
    // fallback if context is offline
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 ${currentCfg.badgeBg} ${currentCfg.textCol}`}>
            <IconComp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${currentCfg.badgeBg} ${currentCfg.textCol}`}>
                Trạng thái: {currentStatus}
              </span>
              <span className="text-xs text-slate-500 font-bold">Tổng: {issueList.length} phiếu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury mt-1">
              {currentCfg.title}
            </h1>
          </div>
        </div>

        <Link
          href="/dashboard/report"
          className="px-5 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-950/20 flex items-center space-x-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>+ BÁO CÁO VẤN ĐỀ</span>
        </Link>
      </div>

      {/* 5 Status Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { key: "cho_xu_ly", label: "🕒 Chưa Xử Lý", color: "hover:border-amber-400" },
          { key: "dang_xu_ly", label: "⚠️ Đang Xử Lý", color: "hover:border-blue-400" },
          { key: "dang_chay_thu", label: "🧪 Chạy Thử", color: "hover:border-purple-400" },
          { key: "da_xu_ly", label: "✅ Đã Xử Lý", color: "hover:border-emerald-400" },
          { key: "khong_the_xu_ly", label: "❌ Không Thể Xử Lý", color: "hover:border-rose-400" },
        ].map((t) => (
          <Link
            key={t.key}
            href={t.key === "dang_chay_thu" ? "/dashboard/categories/dang_chay_thu" : `/dashboard/categories/${t.key}`}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              currentStatus === t.key
                ? "bg-[#004724] text-white border-[#004724] shadow-xs"
                : `bg-slate-50 text-slate-700 border-slate-200 ${t.color}`
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List of Issue Cards */}
      {issueList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-4 shadow-sm">
          <IconComp className={`w-12 h-12 mx-auto ${currentCfg.textCol} opacity-40`} />
          <h3 className="text-base font-bold text-slate-700">Chưa Có Phiếu Lỗi Nào Nằm Ở Trạng Thái Này</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống đang hoạt động ổn định. Bấm nút &ldquo;+ Báo Cáo Vấn Đề&rdquo; để khởi tạo phiếu sự cố mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issueList.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/issues/${item.id}`}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 hover:border-emerald-500 transition-all shadow-xs group block"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black text-[#004724] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {item.issueCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                    Mức độ: {item.severity}
                  </span>
                </div>
                {currentCfg.timerMinutes && (
                  <CountdownTimer targetMinutes={currentCfg.timerMinutes} createdTimeStr={item.createdAt} label="SLA" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 group-hover:text-[#004724] transition-colors line-clamp-1">
                  [{item.productCode}] {item.productName}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                <div className="flex items-center space-x-1 truncate">
                  <Factory className="w-3.5 h-3.5 text-[#004724] shrink-0" />
                  <span className="truncate">{item.workshopName || "Xưởng Chặt & May"}</span>
                </div>
                <div className="flex items-center justify-end space-x-1 font-bold text-[#004724]">
                  <span>Chi tiết phiếu</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

