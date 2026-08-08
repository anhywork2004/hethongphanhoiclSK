"use client";

import { useState } from "react";
import { Boxes, Search, Plus, Filter, Download, Wrench, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const sampleInventory = [
    { id: "SK-PT-001", name: "Động cơ máy may tự động Juki", code: "MOT-JK-900", qty: 15, unit: "Cái", location: "Khu vực B - Kệ 02", status: "Sẵn sàng" },
    { id: "SK-PT-002", name: "Bộ dao cắt chỉ tự động", code: "CUT-SK-402", qty: 4, unit: "Bộ", location: "Khu vực A - Kệ 05", status: "Cảnh báo thiếu (Cần nhập)" },
    { id: "SK-PT-003", name: "Xi lanh khí nén SMC 25mm", code: "CYL-SMC-25", qty: 32, unit: "Cái", location: "Khu vực C - Kệ 01", status: "Sẵn sàng" },
    { id: "SK-PT-004", name: "Cảm biến quang học Banner", code: "SEN-BN-100", qty: 28, unit: "Cái", location: "Khu vực A - Kệ 03", status: "Sẵn sàng" },
    { id: "SK-PT-005", name: "Dây curoa chuyền gò đinh", code: "BELT-SKE-85", qty: 2, unit: "Sợi", location: "Khu vực B - Kệ 04", status: "Cảnh báo thiếu (Cần nhập)" },
    { id: "SK-PT-006", name: "Kim máy khâu đế Skechers", code: "NDL-SK-110", qty: 450, unit: "Cây", location: "Khu vực A - Kệ 01", status: "Sẵn sàng" },
  ];

  const filteredItems = sampleInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 font-sans antialiased">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#004724] shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#004724] tracking-tight font-serif-luxury">
              Kho Phụ Tùng Linh Kiện Sửa Chữa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Quản lý vật tư linh kiện thay thế 2-Hour Fast Feedback Loop • Nhà máy TBS Group Kiên Giang 1
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-4 py-2.5 rounded-2xl bg-[#004724] hover:bg-[#07361e] text-white text-xs font-extrabold uppercase tracking-wider shadow-md flex items-center space-x-1.5 transition-all">
            <Plus className="w-4 h-4" />
            <span>+ Nhập Phụ Tùng Mới</span>
          </button>
          <button className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên linh kiện, mã phụ tùng..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
          <div className="flex items-center space-x-1 bg-emerald-50 text-[#004724] px-3 py-1.5 rounded-full border border-emerald-200">
            <Wrench className="w-3.5 h-3.5" />
            <span>Tổng loại: {sampleInventory.length}</span>
          </div>
          <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-full border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Cần nhập bổ sung: 2</span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-slate-700">
            <thead className="bg-slate-50 text-[#004724] uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Mã Phụ Tùng</th>
                <th className="px-6 py-4">Tên Linh Kiện / Vật Tư</th>
                <th className="px-6 py-4">Mã Model</th>
                <th className="px-6 py-4 text-center">Số Lượng Tồn Kho</th>
                <th className="px-6 py-4">Vị Trí Lưu Kho</th>
                <th className="px-6 py-4">Trạng Thái Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#004724]">{item.id}</td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{item.code}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-slate-100 font-black text-slate-900 border border-slate-200">
                      {item.qty} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-semibold">{item.location}</td>
                  <td className="px-6 py-4">
                    {item.status.includes("Cảnh báo") ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>{item.status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-[#004724] text-[10px] font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.status}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
