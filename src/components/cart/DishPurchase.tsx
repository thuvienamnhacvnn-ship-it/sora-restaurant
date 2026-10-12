"use client";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, itemName, type MenuItem } from "@/data/menu";
import { restaurant, telHref } from "@/data/restaurant";
import type { Locale } from "@/lib/i18n";
import { captureDishSource, useCart } from "./CartProvider";
import { purchaseOptions } from "./pricing";
import s from "./cart.module.css";
export function AddDishButton({ item, locale, onOpen }: { item: MenuItem; locale: Locale; onOpen: (item: MenuItem) => void }) {
  const { add } = useCart();
  const options = purchaseOptions(item, locale), choice = item.variants?.length || item.sizes?.length;
  return <button type="button" data-add-dish={item.id} className={s.add} disabled={!item.available} aria-label={`${itemName(item, locale)} zum Warenkorb hinzufügen`} onClick={e => { if (choice || !options.length) onOpen(item); else add(item, options[0].key, captureDishSource(e.currentTarget)); }}><Icon name="plus" size={21} /></button>;
}
export function DishPurchase({ item, locale, close }: { item: MenuItem; locale: Locale; close: () => void }) {
  const { add } = useCart();
  const id = useId(), options = purchaseOptions(item, locale), hasChoice = Boolean(item.variants?.length || item.sizes?.length);
  /* Chọn sẵn phương án đầu: trước đây để trống + ô xổ xuống, nút thêm bị khoá mờ
     nên khách (và Sếp, 12/10) tưởng món Suppe không cho vào giỏ được. */
  const [key, setKey] = useState(hasChoice ? options[0]?.key ?? "" : "base");
  const selected = options.find(o => o.key === key), phone = restaurant.phones[0];
  if (!options.length) return phone ? <a className={s.checkout} href={telHref(phone)}><Icon name="phone" size={18} />Preis telefonisch anfragen</a> : <p>Preis auf Anfrage</p>;
  return <div className={s.purchase}>{hasChoice && <><p id={id}>{locale === "vi" ? "Chọn loại / cỡ" : "Variante / Größe wählen"}</p><div role="radiogroup" aria-labelledby={id} className={s.options}>{options.map(o => <button type="button" role="radio" aria-checked={o.key === key} data-purchase-option={o.key} key={o.key} onClick={() => setKey(o.key)}><span>{o.label}</span><strong>{formatPrice(o.price, locale)}</strong></button>)}</div></>}<button type="button" data-purchase-add className={s.checkout} disabled={!selected || !item.available} onClick={e => { if (!selected) return; const source = captureDishSource(e.currentTarget); close(); add(item, selected.key, source); }}><Icon name="shopping-cart" size={19} />In den Warenkorb{selected && <span>{formatPrice(selected.price, locale)}</span>}</button></div>;
}
