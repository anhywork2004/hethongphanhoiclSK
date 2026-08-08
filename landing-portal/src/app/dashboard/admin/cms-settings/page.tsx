import { auth } from "@/lib/auth";
import { CustomUserSession } from "@/lib/auth.config";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { homepageSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sliders, Save, Image as ImageIcon, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function CMSAdminPage() {
  const session = await auth();
  const user = session?.user as unknown as CustomUserSession;

  if (user?.role !== "admin" && user?.role !== "giam_doc" && user?.role !== "tong_giam_doc") {
    redirect("/dashboard");
  }

  let cmsData = {
    heroTitle: "Hệ thống phản hồi chất lượng & Khắc phục sự cố trong 2 Giờ Vàng",
    heroSubtitle: "Số hóa quy trình báo lỗi chất lượng sản phẩm trực tiếp từ chuyền sản xuất đến đội ngũ Kỹ thuật, QA/QC, Công nghệ và Ban Giám Đốc. Tích hợp Zalo Official Account (OA) cảnh báo tức thì trong 15 phút.",
    bannerImageUrl: "",
    announcementTicker: "Sáng kiến '2-Hour Fast Feedback Loop' — Nhà máy Skechers Kiên Giang 1",
  };

  try {
    const ctx = await getCloudflareContext({ async: true });
    const d1 = (ctx.env as unknown as CloudflareEnv).DB;
    if (d1) {
      const db = getDb(d1);
      const res = await db.select().from(homepageSettings).where(eq(homepageSettings.id, "main"));
      if (res.length > 0) {
        cmsData = {
          heroTitle: res[0].heroTitle || cmsData.heroTitle,
          heroSubtitle: res[0].heroSubtitle || cmsData.heroSubtitle,
          bannerImageUrl: res[0].bannerImageUrl || "",
          announcementTicker: res[0].announcementTicker || cmsData.announcementTicker,
        };
      }
    }
  } catch {
    // Fallback if D1 is unassigned
  }

  async function updateCMS(formData: FormData) {
    "use server";
    const heroTitle = formData.get("heroTitle") as string;
    const heroSubtitle = formData.get("heroSubtitle") as string;
    const bannerImageUrl = formData.get("bannerImageUrl") as string;
    const announcementTicker = formData.get("announcementTicker") as string;

    try {
      const ctx = await getCloudflareContext({ async: true });
      const d1 = (ctx.env as unknown as CloudflareEnv).DB;
      if (d1) {
        const db = getDb(d1);
        const existing = await db.select().from(homepageSettings).where(eq(homepageSettings.id, "main"));

        if (existing.length > 0) {
          await db
            .update(homepageSettings)
            .set({
              heroTitle,
              heroSubtitle,
              bannerImageUrl,
              announcementTicker,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(homepageSettings.id, "main"));
        } else {
          await db.insert(homepageSettings).values({
            id: "main",
            heroTitle,
            heroSubtitle,
            bannerImageUrl,
            announcementTicker,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error("CMS update error:", e);
    }

    revalidatePath("/");
    revalidatePath("/dashboard/admin/cms-settings");
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Sliders className="w-7 h-7 text-blue-400" />
            <span>Quản Trị CMS Nội Dung Động Trang Chủ (Landing Page)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Thay đổi văn bản tiêu đề, mô tả, thông báo và hình ảnh trang chủ tức thì theo yêu cầu khách hàng mà KHÔNG CẦN sửa code.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Dynamic CMS</span>
        </div>
      </div>

      <form action={updateCMS} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Thông Báo Ticker (Chữ Chạy Header)
          </label>
          <input
            type="text"
            name="announcementTicker"
            defaultValue={cmsData.announcementTicker}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Tiêu Đề Chính (Hero Title)
          </label>
          <textarea
            name="heroTitle"
            rows={2}
            defaultValue={cmsData.heroTitle}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Mô Tả Chi Tiết (Hero Subtitle / Mission Statement)
          </label>
          <textarea
            name="heroSubtitle"
            rows={4}
            defaultValue={cmsData.heroSubtitle}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            URL Hình Ảnh Banner Chính (Tùy chọn R2 Image Link)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              name="bannerImageUrl"
              defaultValue={cmsData.bannerImageUrl}
              placeholder="https://r2.tbskg1.vn/banner-factory.jpg"
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>LƯU CẬP NHẬT TRANG CHỦ</span>
          </button>
        </div>
      </form>
    </div>
  );
}
