import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TBS Skechers Kiên Giang 1 • Hệ thống Phản hồi CLSK (2-Hour Fast Feedback Loop)",
  description: "Hệ thống số hóa phản hồi chất lượng sản phẩm & khắc phục sự cố 2 giờ cho Nhà máy TBS Skechers Kiên Giang 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
