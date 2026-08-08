import { getPrisma } from "@/lib/prisma";
import { ClipboardList, Wrench, ShieldCheck, Clock, CheckCircle2, Star, User } from "lucide-react";

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function RepairLogsPage() {
  let logs: any[] = [];
  let totalLogs = 0;
  let avgRating: number | null = null;

  try {
    const prisma = await getPrisma();

    totalLogs = await prisma.maintenanceLog.count();

    logs = await prisma.maintenanceLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        incident: {
          select: {
            id: true,
            description: true,
            images: true,
            createdAt: true,
            reporter: { select: { name: true, employeeCode: true } },
            category: { select: { name: true } },
          },
        },
        machine: { select: { name: true, code: true, location: true } },
        technician: { select: { name: true, employeeCode: true } },
      },
    });

    // Average rating
    const ratingResult = await prisma.maintenanceLog.aggregate({
      where: { skillRating: { not: null } },
      _avg: { skillRating: true },
    });
    if (ratingResult._avg.skillRating != null) {
      avgRating = Math.round(ratingResult._avg.skillRating * 10) / 10;
    }
  } catch {
    // fallback
  }

  function renderStars(rating: number | null) {
    if (rating == null) return <span className="text-slate-500 text-xs">Chưa đánh giá</span>;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
        />,
      );
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ClipboardList className="w-7 h-7 text-blue-400" />
            <span>Nhật Ký Sửa Chữa &amp; Khắc Phục Bảo Trì</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lịch sử sửa chữa từ Mobile App — thời gian, linh kiện, đánh giá tay nghề. Tổng: {totalLogs} bản ghi.
            {avgRating != null && ` · Đánh giá TB: ${avgRating}★`}
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Dữ liệu thực từ Prisma</span>
        </div>
      </div>

      {/* Logs Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sự Cố</th>
                <th className="px-5 py-3.5">Máy Móc</th>
                <th className="px-5 py-3.5">Kỹ Thuật Viên</th>
                <th className="px-5 py-3.5">Thời Gian</th>
                <th className="px-5 py-3.5">Chi Tiết Sửa Chữa</th>
                <th className="px-5 py-3.5">Linh Kiện</th>
                <th className="px-5 py-3.5">Đánh Giá</th>
                <th className="px-5 py-3.5">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    <div className="space-y-2">
                      <Wrench className="w-8 h-8 mx-auto text-slate-600" />
                      <p>Chưa có nhật ký sửa chữa nào. Khi bảo trì hoàn thành công việc trên Mobile App, dữ liệu sẽ xuất hiện tại đây.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="font-mono font-bold text-blue-400 text-[11px]">
                        #{log.incident?.id?.slice(-8).toUpperCase() || log.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {log.incident?.description || "--"}
                      </div>
                      {log.incident?.category && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 mt-1 inline-block">
                          {log.incident.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      <div>{log.machine?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.machine?.code}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium text-white">{log.technician?.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.technician?.employeeCode}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.durationMinutes} phút</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(log.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        {" → "}
                        {new Date(log.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="text-xs text-slate-300 line-clamp-2">{log.repairDetail}</div>
                      {log.proofImages && parseImages(log.proofImages).length > 0 && (
                        <span className="text-[10px] text-blue-400 mt-1 inline-block">
                          📷 {parseImages(log.proofImages).length} ảnh minh chứng
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-[150px]">
                      <div className="text-xs text-slate-300 truncate">{log.partsReplaced || "--"}</div>
                    </td>
                    <td className="px-5 py-4">
                      {renderStars(log.skillRating)}
                      {log.ratingSubmittedAt && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(log.ratingSubmittedAt).toLocaleDateString("vi-VN")}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
