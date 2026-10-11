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
  const [key, setKey] = useState(hasChoice ? "" : "base");
  const selected = options.find(o => o.key === key), phone = restaurant.phones[0];
  if (!options.length) return phone ? <a className={s.checkout} href={telHref(phone)}><Icon name="phone" size={18} />Preis telefonisch anfragen</a> : <p>Preis auf Anfrage</p>;
  return <div className={s.purchase}>{hasChoice && <><label htmlFor={id}>Variante / Größe wählen</label><select id={id} data-purchase-option value={key} onChange={e => setKey(e.target.value)}><option value="">Bitte auswählen</option>{options.map(o => <option key={o.key} value={o.key}>{o.label} · {formatPrice(o.price, locale)}</option>)}</select></>}<button type="button" data-purchase-add className={s.checkout} disabled={!selected || !item.available} onClick={e => { if (!selected) return; const source = captureDishSource(e.currentTarget); close(); add(item, selected.key, source); }}><Icon name="shopping-cart" size={19} />In den Warenkorb{selected && <span>{formatPrice(selected.price, locale)}</span>}</button></div>;
}
