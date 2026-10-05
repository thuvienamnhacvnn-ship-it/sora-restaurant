/*
 * Lớp dữ liệu thực đơn. Nguồn duy nhất: data/menu-items.json + data/categories.json
 * (agent sora-menu-data rút từ 41 trang thực đơn in — 207 món, 8 nhóm).
 *
 * KHÔNG hardcode món, giá, dị ứng ở bất kỳ component nào.
 * `image` hiện toàn bộ là null — đúng chủ ý, chưa có ảnh món thật.
 */
import itemsRaw from "../../data/menu-items.json";
import categoriesRaw from "../../data/categories.json";
import { pick, type Locale } from "@/lib/i18n";

export type Localized = { de: string; vi?: string | null };

export type Variant = {
  code: string;
  name: Localized;
  allergens?: string[];
  price: number | null;
};

export type Size = { label: string; price: number };

export type MenuItem = {
  id: string;
  nr: string;
  category: string;
  subcategory: string;
  name: Localized;
  description: Localized | null;
  price: number | null;
  priceFrom?: boolean;
  currency: string;
  image: string | null;
  allergens: string[];
  variants?: Variant[];
  sizes?: Size[];
  dietary: string[];
  spice: "none" | "mild" | "medium" | "hot" | string;
  proteins: string[];
  pieces?: number;
  note?: string;
  featured: boolean;
  available: boolean;
};

export type Subcategory = {
  id: string;
  name: Localized;
  order: number;
  itemCount: number;
  pieces?: number;
};

export type Category = {
  id: string;
  order: number;
  name: Localized;
  subtitle: Localized;
  itemCount: number;
  subcategories: Subcategory[];
};

export const menuItems = itemsRaw as unknown as MenuItem[];
export const categories = (categoriesRaw as unknown as Category[])
  .slice()
  .sort((a, b) => a.order - b.order);

/** Có dữ liệu thực đơn chưa — Speisekarte dựng được cả khi rỗng. */
export const hasMenuData = () => menuItems.length > 0;

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/**
 * 5 nhóm cho strip trang chủ. KIT chỉ định 5 nhóm; nhóm nào không có trong
 * thực đơn thật thì bỏ qua chứ không bịa ra.
 */
export const STRIP_CATEGORY_IDS = [
  "sushi",
  "vietnamese-classics",
  "suppen",
  "hauptgerichte",
  "getraenke",
];

export function stripCategories(): Category[] {
  return STRIP_CATEGORY_IDS.map(categoryById).filter(
    (c): c is Category => Boolean(c)
  );
}

export function formatPrice(value: number | null, locale: Locale): string {
  if (value == null) return "";
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Giá hiển thị trên thẻ.
 *  - món có biến thể/cỡ -> lấy mức THẤP NHẤT và bật cờ "from" ("ab 14,90 €").
 *    34 món có priceFrom; hiện giá trần trụi là làm khách hiểu nhầm giá.
 *  - món KHÔNG có giá nào (nr 22 Bun Nem Hai San, bản in thiếu thật)
 *    -> onRequest, chỗ hiển thị in "Preis auf Anfrage".
 *    KHÔNG BAO GIỜ in "0 €" hay "null €".
 */
export function displayPrice(
  item: MenuItem,
  locale: Locale
): { text: string; from: boolean; onRequest: boolean } {
  const min = minPrice(item);
  if (min == null) return { text: "", from: false, onRequest: true };
  const count = priceCandidates(item).length;
  const from = Boolean(item.priceFrom) || count > 1;
  return { text: formatPrice(min, locale), from, onRequest: false };
}

function priceCandidates(item: MenuItem): number[] {
  const out: number[] = [];
  if (typeof item.price === "number") out.push(item.price);
  for (const v of item.variants ?? []) if (typeof v.price === "number") out.push(v.price);
  for (const s of item.sizes ?? []) out.push(s.price);
  return out;
}

/**
 * Giá thấp nhất của món, null nếu món không có giá nào.
 * Dùng cho sắp xếp — món không giá phải xếp CUỐI chứ không rơi khỏi danh sách.
 */
export function minPrice(item: MenuItem): number | null {
  const c = priceCandidates(item);
  return c.length === 0 ? null : Math.min(...c);
}

export function itemName(item: MenuItem, locale: Locale): string {
  return pick(item.name, locale);
}

export function itemDescription(item: MenuItem, locale: Locale): string {
  return item.description ? pick(item.description, locale) : "";
}

export type DietaryKey = "vegetarian" | "vegan" | "glutenfree" | "spicy";

export function matchesDietary(item: MenuItem, key: DietaryKey): boolean {
  if (key === "spicy") return item.spice !== "none";
  if (key === "vegetarian") return item.dietary.includes("vegetarian") || item.dietary.includes("vegan");
  return item.dietary.includes(key === "glutenfree" ? "glutenfree" : key);
}

/** Lọc món — dùng chung cho trang Speisekarte và Master Chef. */
export function filterItems(opts: {
  category?: string | null;
  subcategory?: string | null;
  dietary?: DietaryKey[];
  query?: string;
  locale: Locale;
}): MenuItem[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return menuItems.filter((item) => {
    if (!item.available) return false;
    if (opts.category && item.category !== opts.category) return false;
    if (opts.subcategory && item.subcategory !== opts.subcategory) return false;
    for (const d of opts.dietary ?? []) if (!matchesDietary(item, d)) return false;
    if (q) {
      const hay = [
        item.name.de,
        item.name.vi ?? "",
        item.description?.de ?? "",
        item.description?.vi ?? "",
        item.nr,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
