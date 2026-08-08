import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TBS Group • Văn Phòng Túi Xách TBS & Hệ Thống Phản Hồi CLSK",
  description: "Không gian điều hành & Hệ thống phản hồi chất lượng sản phẩm 2-Hour Fast Feedback Loop - Nhà máy TBS Skechers Kiên Giang 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#f4f7f5] text-slate-900 selection:bg-[#004724] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
