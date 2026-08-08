"use client";

import { User, Cpu, Package, Compass, Sun, Check } from "lucide-react";

interface Visual4M1EPickerProps {
  selectedCause: string;
  onSelectCause: (cause: string) => void;
}

export function Visual4M1EPicker({ selectedCause, onSelectCause }: Visual4M1EPickerProps) {
  const causes = [
    {
      id: "Man",
      label: "Man (Con người)",
      desc: "Tay nghề, thao tác sai, nhầm lẫn",
      icon: User,
      bgColor: "bg-blue-50 hover:bg-blue-100/80",
      activeBg: "bg-blue-600 text-white shadow-md ring-2 ring-blue-400",
      iconColor: "text-blue-600",
    },
    {
      id: "Machine",
      label: "Machine (Máy móc)",
      desc: "Lỗi thiết bị, đứt curoa, kẹt kim, hỏng dao",
      icon: Cpu,
      bgColor: "bg-amber-50 hover:bg-amber-100/80",
      activeBg: "bg-amber-600 text-white shadow-md ring-2 ring-amber-400",
      iconColor: "text-amber-600",
    },
    {
      id: "Material",
      label: "Material (Nguyên liệu)",
      desc: "Lỗi chất lượng da, keo dán, chỉ khâu, đế",
      icon: Package,
      bgColor: "bg-[#e8f5e0] hover:bg-emerald-100",
      activeBg: "bg-[#004724] text-white shadow-md ring-2 ring-emerald-400",
      iconColor: "text-[#004724]",
    },
    {
      id: "Method",
      label: "Method (Phương pháp)",
      desc: "Sai quy trình kỹ thuật, công nghệ gò đế",
      icon: Compass,
      bgColor: "bg-purple-50 hover:bg-purple-100/80",
      activeBg: "bg-purple-600 text-white shadow-md ring-2 ring-purple-400",
      iconColor: "text-purple-600",
    },
    {
      id: "Environment",
      label: "Environment (Môi trường)",
      desc: "Nhiệt độ lò sấy, độ ẩm, ánh sáng chuyền",
      icon: Sun,
      bgColor: "bg-teal-50 hover:bg-teal-100/80",
      activeBg: "bg-teal-600 text-white shadow-md ring-2 ring-teal-400",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black uppercase tracking-wider text-[#004724]">
          Xác Định Nguyên Nhân 4M+1E (Chọn 1-Touch)
        </label>
        <span className="text-[11px] text-slate-500 font-semibold">
          Tiêu chuẩn Fast Feedback Loop
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {causes.map((c) => {
          const isSelected = selectedCause === c.id;
          const IconComp = c.icon;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCause(c.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? c.activeBg + " border-transparent"
                  : c.bgColor + " border-slate-200/90 text-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-xs"
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isSelected ? "text-white" : c.iconColor}`} />
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-white text-[#004724] flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className={`text-xs font-black tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {c.label}
                </div>
                <div className={`text-[11px] mt-1 line-clamp-2 leading-tight ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                  {c.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
