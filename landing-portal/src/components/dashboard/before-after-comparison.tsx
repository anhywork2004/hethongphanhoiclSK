"use client";

import { CheckCircle2, ShieldAlert, ArrowRight, Image as ImageIcon, TrendingDown } from "lucide-react";

interface BeforeAfterComparisonProps {
  initialQty: number;
  repairedQty: number;
  initialImages?: string[];
  repairedImages?: string[];
  closedOnceAt?: string;
  closedTwiceAt?: string;
}

export function BeforeAfterComparison({
  initialQty,
  repairedQty,
  initialImages = [],
  repairedImages = [],
  closedOnceAt,
  closedTwiceAt,
}: BeforeAfterComparisonProps) {
  const diffQty = Math.max(0, initialQty - repairedQty);
  const improvementRate = initialQty > 0 ? Math.round((diffQty / initialQty) * 100) : 100;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      {/* Table Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] font-black uppercase text-[#004724] tracking-widest">
            BÁO CÁO ĐỐI CHỨNG HIỆU QUẢ SỬA CHỮA
          </div>
          <h3 className="text-lg font-black text-slate-900 font-serif-luxury">
            So Sánh Đối Chứng Kết Quả Trước vs Sau Sửa Chữa
          </h3>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Tỷ Lệ Giảm Lỗi</div>
            <div className="text-sm font-black text-[#004724]">Giảm {improvementRate}%</div>
          </div>
        </div>
      </div>

      {/* Metrics Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Before Repair Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>TRƯỚC SỬA CHỮA (BÁN THÀNH PHẨM LỖI)</span>
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700">
            {initialQty} <span className="text-xs font-bold text-amber-900">cái / đôi</span>
          </div>
          <p className="text-[11px] text-slate-500">Số lượng hàng hư ghi nhận lúc phát hiện sự cố ban đầu</p>
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#004724]">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* After Repair Card */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#004724]">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>SAU SỬA CHỮA & CHẠY THỬ</span>
            </span>
          </div>
          <div className="text-3xl font-black text-[#004724]">
            {repairedQty} <span className="text-xs font-bold text-slate-700">cái phát sinh</span>
          </div>
          <p className="text-[11px] text-slate-500">Số lượng hàng lỗi còn lại sau ca chạy thử nghiệm</p>
        </div>
      </div>

      {/* Side-by-Side Images Proof Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Initial Images */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Ảnh Minh Chứng Ban Đầu (Lỗi Sự Cố)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {initialImages.length > 0 ? (
              initialImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Initial Defect" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-2 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Chưa có ảnh sự cố ban đầu
              </div>
            )}
          </div>
        </div>

        {/* Repaired Images */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#004724] flex items-center space-x-1.5">
            <ImageIcon className="w-4 h-4 text-[#004724]" />
            <span>Ảnh Minh Chứng Sản Phẩm Sau Khi Sửa</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {repairedImages.length > 0 ? (
              repairedImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Repaired Product" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="col-span-2 p-6 rounded-2xl bg-emerald-50/30 border border-dashed border-emerald-200 text-center text-xs text-emerald-800 font-medium">
                Chưa cập nhật ảnh minh chứng sản phẩm sau sửa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps audit */}
      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <div>🔒 Thời điểm Đóng Lần 1 (Bắt đầu chạy thử): <strong>{closedOnceAt || "Chưa đóng lần 1"}</strong></div>
        <div>✅ Thời điểm Đóng Lần 2 (Hoàn tất phiếu): <strong>{closedTwiceAt || "Chưa đóng lần 2"}</strong></div>
      </div>
    </div>
  );
}
