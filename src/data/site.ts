/*
 * Cấu hình site — chép từ KIT 07_DEV_STARTER/site-config.example.ts.
 * Cờ tính năng là LUẬT, không phải gợi ý:
 *  - onlineOrdering=false  -> ẩn mọi nút giỏ hàng / dấu "+" trên thẻ món.
 *  - liveTableInventory=false -> sơ đồ bàn CHỈ chọn khu vực, cấm hiện bàn trống.
 */
import type { Locale } from "@/lib/i18n";

export type NavKey =
  | "home"
  | "menu"
  | "reservation"
  | "gallery"
  | "about"
  | "contact";

export const NAV: { key: NavKey; path: string }[] = [
  { key: "home", path: "/" },
  { key: "menu", path: "/speisekarte" },
  { key: "reservation", path: "/reservierung" },
  { key: "gallery", path: "/galerie" },
  { key: "about", path: "/ueber-uns" },
  { key: "contact", path: "/kontakt" },
];

export const LEGAL_NAV = [
  { key: "imprint", path: "/impressum" },
  { key: "privacy", path: "/datenschutz" },
] as const;

export const FEATURES = {
  masterChefAI: true,
  whatsapp: true,
  instagram: true,
  customerCare: true,
  transparent360Hero: true,
  onlineOrdering: false,
  liveTableInventory: false,
} as const;

/** Banner hero từng trang (KIT 05_ASSETS/banners, đã xuất sang webp 3 cỡ). */
export const HERO_BANNER: Record<NavKey, string> = {
  home: "home_hero",
  menu: "speisekarte_hero",
  reservation: "reservierung_hero",
  gallery: "galerie_hero",
  about: "ueber_uns_hero",
  contact: "kontakt_hero",
};

export const SITE_URL = "https://sora-restaurant.example";

export function localeName(locale: Locale): string {
  return locale === "de" ? "DE" : "VI";
}
