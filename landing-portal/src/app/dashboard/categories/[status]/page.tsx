import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { issues, issueImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Clock, AlertTriangle, CheckCircle2, XCircle, Package, Factory, User, Image as ImageIcon, PlusCircle } from "lucide-react";

export default async function CategoryStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;

  const validStatuses = ["cho_xu_ly", "dang_xu_ly", "da_xu_ly", "khong_the_xu_ly"];
  const currentStatus = validStatuses.includes(status) ? status : "cho_xu_ly";

  const statusConfig: Record<string, { title: string; badgeBg: string; textCol: string; icon: any }> = {
    cho_xu_ly: { title: "Phiếu Chưa Xử Lý (Chờ Tiếp Nhận 15 Phút)", badgeBg: "bg-amber-950 border-amber-800", textCol: "text-amber-400", icon: Clock },
    dang_xu_ly: { title: "Phiếu Đang Xử Lý (Khắc Phục 4M+1E)", badgeBg: "bg-blue-950 border-blue-800", textCol: "text-blue-400", icon: AlertTriangle },
    da_xu_ly: { title: "Phiếu Đã Xử Lý Thành Công", badgeBg: "bg-emerald-950 border-emerald-800", textCol: "text-emerald-400", icon: CheckCircle2 },
    khong_the_xu_ly: { title: "Phiếu Không Thể Xử Lý", badgeBg: "bg-rose-950 border-rose-800", textCol: "text-rose-400", icon: XCircle },
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
    <div className="space-y-8 font-sans">
      {/* Header with status title */}
      <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${currentCfg.badgeBg} ${currentCfg.textCol}`}>
              <IconComp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {currentCfg.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hiển thị danh sách các phiếu CLSK theo trạng thái thực tế từ D1 Database.
          </p>
        </div>

        <Link
          href="/dashboard/report"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Báo Cáo Lỗi Mới</span>
        </Link>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { key: "cho_xu_ly", label: "Chưa Xử Lý", color: "hover:border-amber-500" },
          { key: "dang_xu_ly", label: "Đang Xử Lý", color: "hover:border-blue-500" },
          { key: "da_xu_ly", label: "Đã Xử Lý", color: "hover:border-emerald-500" },
          { key: "khong_the_xu_ly", label: "Không Thể Xử Lý", color: "hover:border-rose-500" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/categories/${t.key}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              currentStatus === t.key
                ? "bg-slate-800 text-white border-slate-600 shadow"
                : `bg-slate-900/60 text-slate-400 border-slate-800 ${t.color}`
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List of Issue Cards */}
      {issueList.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <IconComp className={`w-12 h-12 mx-auto ${currentCfg.textCol} opacity-40`} />
          <h3 className="text-lg font-bold text-slate-300">Không Có Phiếu Lỗi Nào Nằm Ở Trạng Thái Này</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hiện tại chưa có phiếu báo cáo nào ở danh mục này. Bạn có thể bấm nút 'Tạo Báo Cáo Lỗi Mới' để gửi phiếu đầu tiên!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {issueList.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-blue-400">{item.issueCode}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold uppercase">
                    Mức độ: {item.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Thời gian: {new Date(item.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sản Phẩm:</span>
                  </div>
                  <div className="font-bold text-white text-sm">{item.productName}</div>
                  <div className="text-slate-400 font-mono">Mã: {item.productCode}</div>
                </div>

                <div>
                  <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                    <Factory className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Phân Xưởng & Công Đoạn:</span>
                  </div>
                  <div className="font-bold text-white">{item.workshopName}</div>
                  <div className="text-slate-400">Công đoạn: {item.detectionStage}</div>
                </div>

                <div>
                  <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Người Báo Cáo & Size:</span>
                  </div>
                  <div className="font-bold text-white">{item.createdByName} ({item.createdByMnv})</div>
                  <div className="text-blue-400 font-semibold mt-0.5">
                    Sizes: {Array.isArray(item.affectedSizes) ? item.affectedSizes.join(", ") : item.affectedSizes}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-slate-400 block mb-1">Mô tả hiện tượng lỗi:</span>
                {item.description}
              </div>

              {item.images && item.images.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Minh chứng hình ảnh ({item.images.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {item.images.map((img: any) => (
                      <a
                        key={img.id}
                        href={img.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 block hover:scale-105 transition-transform"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.imageUrl} alt="Proof" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
