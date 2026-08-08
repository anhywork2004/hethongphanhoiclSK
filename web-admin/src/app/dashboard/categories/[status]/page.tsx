import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { Clock, AlertTriangle, CheckCircle2, XCircle, User, Image as ImageIcon, PlusCircle, Wrench, MapPin } from "lucide-react";

// Map URL status → Prisma IncidentStatus
function toPrismaStatus(urlStatus: string): "PENDING" | "ACCEPTED" | "DONE" | null {
  switch (urlStatus) {
    case "cho_xu_ly": return "PENDING";
    case "dang_xu_ly": return "ACCEPTED";
    case "da_xu_ly": return "DONE";
    default: return null;
  }
}

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  ACCEPTED: "Đang xử lý",
  DONE: "Đã hoàn thành",
};

const statusBadgeStyle: Record<string, string> = {
  PENDING: "bg-amber-950/80 text-amber-300 border-amber-800",
  ACCEPTED: "bg-blue-950/80 text-blue-300 border-blue-800",
  DONE: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
};

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function CategoryStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;

  const prismaStatus = toPrismaStatus(status);
  const validStatuses = ["cho_xu_ly", "dang_xu_ly", "da_xu_ly", "khong_the_xu_ly"];
  const currentStatus = validStatuses.includes(status) ? status : "cho_xu_ly";

  const statusConfig: Record<string, { title: string; badgeBg: string; textCol: string; icon: any }> = {
    cho_xu_ly: { title: "Sự Cố Chưa Xử Lý (Chờ Bảo Trì Nhận Việc)", badgeBg: "bg-amber-950 border-amber-800", textCol: "text-amber-400", icon: Clock },
    dang_xu_ly: { title: "Sự Cố Đang Xử Lý (Bảo Trì Đang Khắc Phục)", badgeBg: "bg-blue-950 border-blue-800", textCol: "text-blue-400", icon: AlertTriangle },
    da_xu_ly: { title: "Sự Cố Đã Hoàn Thành", badgeBg: "bg-emerald-950 border-emerald-800", textCol: "text-emerald-400", icon: CheckCircle2 },
    khong_the_xu_ly: { title: "Sự Cố Không Thể Xử Lý (Chờ Điều Chuyển)", badgeBg: "bg-rose-950 border-rose-800", textCol: "text-rose-400", icon: XCircle },
  };

  const currentCfg = statusConfig[currentStatus];
  const IconComp = currentCfg.icon;

  // Query Prisma incidents (mobile app data source)
  let incidentList: any[] = [];
  if (prismaStatus) {
    try {
      const prisma = await getPrisma();
      const rows = await prisma.incident.findMany({
        where: { status: prismaStatus },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          machine: { include: { area: true, team: true, productionLine: true } },
          reporter: { select: { id: true, employeeCode: true, name: true, phone: true, avatarUrl: true, role: true } },
          assignedTo: { select: { id: true, employeeCode: true, name: true, phone: true, avatarUrl: true, role: true } },
          category: true,
        },
      });
      incidentList = rows.map((r) => ({
        ...r,
        images: parseImages(r.images),
      }));
    } catch {
      // fallback
    }
  }

  // For "khong_the_xu_ly" — no Prisma equivalent, show empty
  if (currentStatus === "khong_the_xu_ly") {
    incidentList = [];
  }

  function formatDuration(acceptedAt: string | null, completedAt: string | null): string {
    if (!acceptedAt) return "--";
    const end = completedAt ? new Date(completedAt) : new Date();
    const start = new Date(acceptedAt);
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}p` : ""}`;
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
            Dữ liệu thực từ hệ thống — cập nhật realtime từ D1 qua Prisma.
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

      {/* List of Incident Cards */}
      {incidentList.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <IconComp className={`w-12 h-12 mx-auto ${currentCfg.textCol} opacity-40`} />
          <h3 className="text-lg font-bold text-slate-300">
            {currentStatus === "khong_the_xu_ly"
              ? "Không Có Sự Cố Nào Ở Trạng Thái Này"
              : "Không Có Sự Cố Nào Trong Danh Mục Này"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {currentStatus === "khong_the_xu_ly"
              ? "Danh mục này dành cho các sự cố cần điều chuyển hoặc không thể khắc phục tại chỗ."
              : "Dữ liệu hiển thị các sự cố máy móc được báo cáo từ Mobile App. Hãy dùng app để quét QR và báo lỗi."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {incidentList.map((item) => {
            const badge = statusBadgeStyle[item.status] || "bg-slate-800 text-slate-300 border-slate-700";
            return (
              <div key={item.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-blue-400">
                      #{item.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${badge}`}>
                      {statusLabel[item.status] || item.status}
                    </span>
                    {item.resendCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-semibold">
                        🔁 Đã gửi lại {item.resendCount} lần
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Báo lúc: {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" />
                      <span>Máy móc:</span>
                    </div>
                    <div className="font-bold text-white text-sm">{item.machine?.name}</div>
                    <div className="text-slate-400 font-mono">Mã: {item.machine?.code}</div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Vị trí & Khu vực:</span>
                    </div>
                    <div className="font-bold text-white">{item.machine?.location}</div>
                    <div className="text-slate-400">
                      {item.machine?.area?.name || "Chưa phân khu vực"}
                      {item.machine?.productionLine?.name ? ` · ${item.machine.productionLine.name}` : ""}
                      {item.machine?.team?.name ? ` · ${item.machine.team.name}` : ""}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 font-bold uppercase mb-1 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Người Báo & Bảo Trì:</span>
                    </div>
                    <div className="font-bold text-white">
                      {item.reporter?.name} ({item.reporter?.employeeCode})
                    </div>
                    <div className="text-slate-400">
                      {item.assignedTo
                        ? `🔧 ${item.assignedTo.name} (${item.assignedTo.employeeCode})`
                        : "⏳ Chưa có ai nhận việc"}
                    </div>
                  </div>
                </div>

                {/* Timeline row */}
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
                  {item.acceptedAt && (
                    <span>🟢 Nhận việc: {new Date(item.acceptedAt).toLocaleString("vi-VN")}</span>
                  )}
                  {item.completedAt && (
                    <span>✅ Hoàn thành: {new Date(item.completedAt).toLocaleString("vi-VN")}</span>
                  )}
                  {item.acceptedAt && (
                    <span className="text-emerald-400 font-semibold">
                      ⏱ {formatDuration(item.acceptedAt, item.completedAt)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">
                    Mô tả sự cố
                    {item.category ? ` [${item.category.name}]` : ""}:
                  </span>
                  {item.description}
                </div>

                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Minh chứng hình ảnh ({item.images.length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {item.images.map((img: string, idx: number) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 block hover:scale-105 transition-transform"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
