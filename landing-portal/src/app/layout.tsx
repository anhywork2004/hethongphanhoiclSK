import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "TBS Group • Văn Phòng Túi Xách TBS & Hệ Thống Phản Hồi CLSK",
  description: "Không gian điều hành & Hệ thống phản hồi chất lượng sản phẩm 2-Hour Fast Feedback Loop - Nhà máy TBS Skechers Kiên Giang 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable} h-full antialiased font-sans dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
