"use client";
import { createContext, useContext, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { menuItems, itemName, formatPrice, type MenuItem } from "@/data/menu";
import { restaurant, telHref } from "@/data/restaurant";
import { href, type Locale } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { purchaseOptions } from "./pricing";
import s from "./cart.module.css";

type Line = { itemId: string; optionKey: string; quantity: number };
const STORAGE = "sora-cart-v1";
const EMPTY: Line[] = [];
let snapshot = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
function validLines(value: unknown): Line[] {
  if (!Array.isArray(value)) return [];
  const result: Line[] = [];
  for (const line of value.slice(0, 300)) {
    if (!line || typeof line !== "object") continue;
    const item = menuItems.find(m => m.id === line.itemId && m.available);
    if (!item || !purchaseOptions(item, "de").some(o => o.key === line.optionKey) || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
    const old = result.find(l => l.itemId === item.id && l.optionKey === line.optionKey);
    if (old) old.quantity = Math.min(99, old.quantity + line.quantity);
    else result.push({ itemId: item.id, optionKey: line.optionKey, quantity: Math.min(99, line.quantity) });
  }
  return result;
}
function readStorage() { try { return validLines(JSON.parse(localStorage.getItem(STORAGE) || "[]")); } catch { return []; } }
function getSnapshot() { if (!loaded) { snapshot = readStorage(); loaded = true; } return snapshot; }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (e: StorageEvent) => { if (e.key === STORAGE || e.key === null) { snapshot = readStorage(); listeners.forEach(fn => fn()); } };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}
function save(lines: Line[]) {
  snapshot = lines;
  try { localStorage.setItem(STORAGE, JSON.stringify(lines)); } catch { /* Basket remains usable without storage. */ }
  listeners.forEach(fn => fn());
}
type Source = { rect: DOMRect; src?: string };
export function captureDishSource(el: HTMLElement): Source {
  const img = el.closest("dialog, li")?.querySelector("img");
  return { rect: (img || el).getBoundingClientRect(), src: img?.currentSrc };
}
const Context = createContext<{ add: (item: MenuItem, key: string, source?: Source) => void; count: number; open: () => void } | null>(null);
export function useCart() { const cart = useContext(Context); if (!cart) throw new Error("CartProvider missing"); return cart; }

export function CartProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const pathname = usePathname();
  const target = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState("");
  const details = lines.flatMap(line => {
    const item = menuItems.find(m => m.id === line.itemId);
    const option = item && purchaseOptions(item, locale).find(o => o.key === line.optionKey);
    return item && option ? [{ ...line, item, option }] : [];
  });
  const count = details.reduce((n, l) => n + l.quantity, 0);
  const total = details.reduce((n, l) => n + l.quantity * l.option.cents, 0);
  const money = (cents: number) => formatPrice(cents / 100, locale);
  const fly = (source?: Source) => {
    if (!source || !target.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const destination = window.innerWidth < 768 ? document.querySelector<HTMLElement>('[data-mobile-top-cart]') ?? target.current : target.current;
    const end = destination.getBoundingClientRect();
    const node = document.createElement(source.src ? "img" : "span");
    if (node instanceof HTMLImageElement) { node.src = source.src!; node.alt = ""; } else node.textContent = "+";
    node.className = s.flying;
    node.setAttribute("aria-hidden", "true");
    const size = Math.min(100, source.rect.width);
    const left = source.rect.left + source.rect.width / 2 - size / 2;
    const top = source.rect.top + source.rect.height / 2 - size / 2;
    Object.assign(node.style, { left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px` });
    document.body.append(node);
    const dx = end.left + end.width / 2 - left - size / 2, dy = end.top + end.height / 2 - top - size / 2;
    node.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 70}px) scale(.8)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.18)`, opacity: .15 }], { duration: 780, easing: "cubic-bezier(.25,.7,.35,1)" }).finished.then(() => node.remove(), () => node.remove());
    destination.animate([{ transform: "scale(1)" }, { transform: "scale(1.14)" }, { transform: "scale(1)" }], { duration: 300, delay: 650 });
  };
  const add = (item: MenuItem, key: string, source?: Source) => {
    if (!item.available || !purchaseOptions(item, locale).some(o => o.key === key)) return;
    const current = getSnapshot(), existing = current.find(l => l.itemId === item.id && l.optionKey === key);
    save(existing ? current.map(l => l === existing ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l) : [...current, { itemId: item.id, optionKey: key, quantity: 1 }]);
    setNotice(`${itemName(item, locale)} · im Warenkorb`);
    requestAnimationFrame(() => fly(source));
  };
  const change = (line: Line, quantity: number) => save(getSnapshot().flatMap(l => l.itemId === line.itemId && l.optionKey === line.optionKey ? quantity > 0 ? [{ ...l, quantity: Math.min(99, quantity) }] : [] : [l]));
  const phone = restaurant.phones[0];
  const openCart=()=>{setNotice("");dialog.current?.showModal();};
  return <Context.Provider value={{ add, count, open: openCart }}>
    {children}
    {(pathname.includes("/speisekarte") || count > 0) && <button ref={target} data-cart-toggle className={s.toggle} aria-label={`Warenkorb · ${count} Artikel`} onClick={() => { setNotice(""); dialog.current?.showModal(); }}><Icon name="shopping-cart" size={24} /><span className={s.badge} data-cart-count>{count}</span></button>}
    <span className={s.srOnly} role="status">{notice}</span>
    <dialog ref={dialog} data-cart-dialog className={s.dialog} aria-labelledby="sora-cart-title" {...{ closedby: "any" }} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <header className={s.header}><div><p>DEINE AUSWAHL</p><h2 id="sora-cart-title">Warenkorb</h2></div><button aria-label="Warenkorb schließen" onClick={() => dialog.current?.close()}><Icon name="x" /></button></header>
      {details.length ? <><ul className={s.lines}>{details.map(l => <li key={`${l.itemId}:${l.optionKey}`} data-cart-line><div className={s.lineTitle}><strong>{itemName(l.item, locale)}</strong>{l.option.label && <small>{l.option.label}</small>}<small>{money(l.option.cents)} / Stück</small></div><div className={s.quantity}><button aria-label={`Weniger ${itemName(l.item, locale)}`} onClick={() => change(l, l.quantity - 1)}><Icon name="minus" size={16} /></button><span data-cart-quantity>{l.quantity}</span><button disabled={l.quantity >= 99} aria-label={`Mehr ${itemName(l.item, locale)}`} onClick={() => change(l, l.quantity + 1)}><Icon name="plus" size={16} /></button></div><strong>{money(l.quantity * l.option.cents)}</strong><button className={s.remove} aria-label={`${itemName(l.item, locale)} entfernen`} onClick={() => change(l, 0)}><Icon name="x" size={16} /></button></li>)}</ul><footer className={s.footer}><div className={s.total}><span>Gesamt</span><strong data-cart-total>{money(total)}</strong></div><p>Bitte Bestellung, Abholung und mögliche Aktionsrabatte telefonisch mit uns bestätigen.</p>{phone && <a className={s.checkout} href={telHref(phone)}><Icon name="phone" size={19} />Telefonisch bestellen<span>{phone.number}</span></a>}<button className={s.copy} onClick={async () => { try { await navigator.clipboard.writeText(details.map(l => `${l.quantity} × ${itemName(l.item, locale)}${l.option.label ? ` (${l.option.label})` : ""}: ${money(l.quantity * l.option.cents)}`).join("\n") + `\nGesamt: ${money(total)}`); setNotice("Bestellung kopiert"); } catch { setNotice("Kopieren nicht möglich. Bitte Auswahl telefonisch durchgeben."); } }}>Bestellung kopieren</button><p role="status">{notice}</p></footer></> : <div className={s.empty}><Icon name="shopping-cart" size={42} /><p>Dein Warenkorb ist noch leer.</p><Link href={href("/speisekarte", locale)} onClick={() => dialog.current?.close()}>Gerichte entdecken</Link></div>}
    </dialog>
  </Context.Provider>;
}
