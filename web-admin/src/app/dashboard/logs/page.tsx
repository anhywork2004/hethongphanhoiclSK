import { ClipboardList, Wrench, ShieldCheck } from "lucide-react";

export default function RepairLogsPage() {
  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <ClipboardList className="w-7 h-7 text-indigo-400" />
          <span>Nhật Ký Sửa Chữa & Khắc Phục Bảo Trì</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Khung danh sách lịch sử sửa chữa MMTB và khoanh vùng sự cố (Chờ triển khai chi tiết ở Giai đoạn 2).
        </p>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 mx-auto">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Khung Danh Sách Nhật Ký Sửa Chữa</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          Ở Giai đoạn 2, khi bộ phận bảo trì (`nguoi_xu_ly`) bấm nhận việc và cập nhật kết quả 4M+1E, toàn bộ lịch sử thao tác sửa chữa, thời gian hoàn thành và đánh giá sau khắc phục sẽ được hiển thị realtime tại đây.
        </p>

        <div className="pt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Trạng thái: Sẵn sàng kết nối Workflow Giai đoạn 2</span>
        </div>
      </div>
    </div>
  );
}
