import { type MenuItem } from "@/data/menu";
import { pick, type Locale } from "@/lib/i18n";
export function purchaseOptions(item: MenuItem, locale: Locale) {
  const options = item.variants?.length
    ? item.variants.map(v => ({ key: `variant:${v.code}`, label: `${v.code} · ${pick(v.name, locale)}`, price: v.price }))
    : item.sizes?.length ? item.sizes.map(v => ({ key: `size:${v.label}`, label: v.label, price: v.price }))
    : [{ key: "base", label: "", price: item.price }];
  return options.filter((v): v is typeof v & { price: number } => typeof v.price === "number" && Number.isFinite(v.price) && v.price >= 0).map(v => ({ ...v, cents: Math.round(v.price * 100) }));
}
