import { BookOpen, FileText, Video, Download, ShieldCheck, Search } from "lucide-react";

export default function TrainingPage() {
  const documents = [
    {
      id: "DOC-001",
      title: "Quy trình Phản hồi Nhanh 2 Giờ (2-Hour Fast Feedback Loop)",
      category: "Sáng kiến & Quy trình CLSK",
      type: "PDF Document",
      size: "2.4 MB",
      updatedAt: "2026-08-01",
    },
    {
      id: "DOC-002",
      title: "Hướng dẫn vận hành & an toàn Máy Chặt Tự Động Atom",
      category: "Sách Hướng Dẫn Vận Hành",
      type: "PDF Document",
      size: "4.1 MB",
      updatedAt: "2026-07-25",
    },
    {
      id: "DOC-003",
      title: "Sơ đồ mạch điện & tra lỗi Máy May Lập Trình Brother",
      category: "Tài liệu Kỹ thuật MMTB",
      type: "PDF Document",
      size: "5.8 MB",
      updatedAt: "2026-07-20",
    },
    {
      id: "DOC-004",
      title: "Checklist xác minh 4M+1E cho Chuyên viên QA & Trưởng Line",
      category: "Biểu mẫu Kiểm tra",
      type: "PDF Document",
      size: "1.2 MB",
      updatedAt: "2026-08-05",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <span>Trung Tâm Đào Tạo & Tài Liệu Kỹ Thuật Nhà Máy</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu hướng dẫn vận hành máy móc, video đào tạo 4M+1E và tài liệu kỹ thuật TBS Skechers Kiên Giang 1.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Thư Viện Tài Liệu</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu kỹ thuật, hướng dẫn máy..."
          className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-blue-400">
                {doc.category}
              </span>
              <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{doc.type} • {doc.size}</span>
                <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
