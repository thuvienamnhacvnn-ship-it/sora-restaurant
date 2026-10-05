/*
 * Hạ tầng 2 ngôn ngữ DE / VI.
 *
 * Luật hiện tại (Sếp chưa duyệt bản dịch): VI **tự rơi về DE**.
 * `vi.json` để rỗng; chỉ khoá nào có trong vi.json mới hiện tiếng Việt.
 * Không ai được tự dịch nội dung marketing vào đây.
 */
import de from "@/i18n/de.json";
import vi from "@/i18n/vi.json";

export const LOCALES = ["de", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

type Dict = Record<string, unknown>;
const DICTS: Record<Locale, Dict> = { de, vi };

function lookup(dict: Dict, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Dict)[key];
    return undefined;
  }, dict);
}

export type Translate = {
  (key: string): string;
  /** Mảng chuỗi (đoạn văn nhiều dòng). Thiếu thì trả mảng rỗng. */
  list: (key: string) => string[];
  locale: Locale;
};

export function getT(locale: Locale): Translate {
  const t = ((key: string): string => {
    const hit = lookup(DICTS[locale], key) ?? lookup(DICTS[DEFAULT_LOCALE], key);
    if (typeof hit === "string") return hit;
    // Thiếu khoá là lỗi của người code, phải nhìn thấy ngay chứ không im lặng.
    return `⟨${key}⟩`;
  }) as Translate;

  t.list = (key: string): string[] => {
    const hit = lookup(DICTS[locale], key) ?? lookup(DICTS[DEFAULT_LOCALE], key);
    return Array.isArray(hit) ? (hit as string[]) : [];
  };
  t.locale = locale;
  return t;
}

/** Chọn bản dịch có sẵn trong dữ liệu thực đơn (name/description {de,vi}). */
export function pick(
  value: { de: string; vi?: string | null } | null | undefined,
  locale: Locale
): string {
  if (!value) return "";
  if (locale === "vi" && value.vi) return value.vi;
  return value.de;
}

/** Đường dẫn có tiền tố ngôn ngữ: href("/galerie", "vi") -> "/vi/galerie" */
export function href(path: string, locale: Locale): string {
  return `/${locale}${path === "/" ? "" : path}`;
}
