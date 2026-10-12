/*
 * Root layout. Nằm trong `[lang]` để `<html lang>` đổi theo ngôn ngữ
 * (xem node_modules/next/dist/docs/01-app/02-guides/internationalization.md).
 * `/` được next.config chuyển sang `/de`.
 *
 * FONT — luật của Sếp: phải có dấu tiếng Việt.
 *   Lora      serif biên tập   latin + latin-ext + vietnamese ✔
 *   Playfair  serif trang chủ  latin + latin-ext + vietnamese ✔
 *   Inter     sans giao diện   latin + latin-ext + vietnamese ✔
 *   Wordmark  KHÔNG dùng webfont — là ảnh nét cọ public/brand/wordmark-sora.webp
 * Libre Baskerville BỊ LOẠI — không có subset vietnamese.
 * `latin-ext` là bắt buộc cho ä ö ü ß tiếng Đức.
 *
 * PLAYFAIR DISPLAY thêm 07/10 cho trang chủ v2: đo nét trên ảnh mẫu ra
 * stem/cap = 0,20 và tương phản ≈5:1 — đúng Playfair Medium, còn Lora (đang
 * dùng) chỉ 0,13 nên tiêu đề thẻ nhìn mảnh hơn mẫu rõ rệt
 * (`_w-agent/trang-chu-v2/01_spec.md` §3.2). Lora GIỮ NGUYÊN cho 5 trang con;
 * chỉ trang chủ đổi, nên không có trang nào trộn hai serif trong một màn.
 *
 * KHÔNG nạp webfont CJK cho 寿司 主菜 越南 甘味 飲物: bộ Noto Serif JP tải về
 * cả trăm tệp con, nặng cho máy Sếp mà chỉ dùng 10 ký tự. Năm chữ đó đi qua
 * `--font-cjk` (globals.css) = stack serif CJK có sẵn trong Windows/macOS.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Lora, Playfair_Display } from "next/font/google";
import "../globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { ChuyenTrangHoaDao } from "@/components/decor/ChuyenTrangHoaDao";
import { VeDauTrang } from "@/components/shell/VeDauTrang";
import { DEFAULT_LOCALE, LOCALES, getT, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/data/site";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});


export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = getT(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t("brand.name")} — ${t("brand.tagline")}`,
      template: `%s · ${t("brand.name")}`,
    },
    description: t("meta.homeDescription"),
    icons: { icon: "/icon.png", apple: "/logo/logo-512.png" },
    openGraph: {
      type: "website",
      siteName: t("brand.name"),
      locale: locale === "de" ? "de_DE" : "vi_VN",
      images: [{ url: "/logo/logo-512.png", width: 512, height: 512 }],
    },
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${lora.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-[6px] focus:bg-elevated focus:px-4 focus:py-2 focus:text-gold-bright"
        >
          {/* Chuỗi này từng viết cứng tiếng Đức nên `/vi` cũng hiện
              "Zum Inhalt springen" — chỉ lộ khi bấm Tab, nên không ai thấy.
              Đây là nhãn điều hướng của giao diện, không phải lời quảng cáo,
              nên dịch được mà không phạm luật "không tự dịch nội dung". */}
          {t("nav.skipToContent")}
        </a>
        <AppShell locale={lang}>{children}</AppShell>
        <ChuyenTrangHoaDao />
        <VeDauTrang />

        {/*
          Công cụ "Chỉnh tay" — Sếp kéo thả trực tiếp trên trang rồi bấm LƯU,
          số đo ghi ra `_w-agent/chinh-tay.json` cho Claude sửa mã.
          CHỈ nhúng ở máy dev; bản chạy thật không có dòng script này, và
          route `/api/chinh-tay` cũng trả 404 ngoài dev.
          Mã nằm ở `public/chinh-tay.js` (JS thuần, sửa là thấy ngay).
        */}
        {process.env.NODE_ENV === "development" && (
          <script src="/chinh-tay.js" defer />
        )}
      </body>
    </html>
  );
}
