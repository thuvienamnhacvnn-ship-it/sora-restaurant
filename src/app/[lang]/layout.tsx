/*
 * Root layout. Nằm trong `[lang]` để `<html lang>` đổi theo ngôn ngữ
 * (xem node_modules/next/dist/docs/01-app/02-guides/internationalization.md).
 * `/` được next.config chuyển sang `/de`.
 *
 * FONT — luật của Sếp: phải có dấu tiếng Việt.
 *   Lora      serif biên tập   latin + latin-ext + vietnamese ✔
 *   Inter     sans giao diện   latin + latin-ext + vietnamese ✔
 *   Wordmark  KHÔNG dùng webfont — là ảnh nét cọ public/brand/wordmark-sora.webp
 * Libre Baskerville BỊ LOẠI — không có subset vietnamese.
 * `latin-ext` là bắt buộc cho ä ö ü ß tiếng Đức.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Lora } from "next/font/google";
import "../globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { DEFAULT_LOCALE, LOCALES, getT, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/data/site";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
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

  return (
    <html
      lang={lang}
      className={`${lora.variable} ${inter.variable}`}
    >
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-[6px] focus:bg-elevated focus:px-4 focus:py-2 focus:text-gold-bright"
        >
          Zum Inhalt springen
        </a>
        <AppShell locale={lang}>{children}</AppShell>
      </body>
    </html>
  );
}
