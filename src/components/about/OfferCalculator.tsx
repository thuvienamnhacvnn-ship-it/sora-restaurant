"use client";
import { useState } from "react";
import type { RestaurantOffer } from "@/data/restaurant-updates";
import s from "./about-hub.module.css";
export function OfferCalculator({ offer }: { offer: RestaurantOffer }) {
  const [value, setValue] = useState("");
  const amount = Number(value.replace(",", "."));
  const valid = value.trim() !== "" && Number.isFinite(amount) && amount >= 0;
  const currency = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
  const sushi = offer.kind === "sushi";
  return <div className={s.calculator}>
    <h3>{sushi ? "Ist dein Sushi-Geschenk dabei?" : "Deinen Eröffnungsrabatt berechnen"}</h3>
    <label htmlFor={`amount-${offer.id}`}>{sushi ? "Wert deiner Sushi-Bestellung" : "Betrag vor Rabatt"}</label>
    <div className={s.amount}><input id={`amount-${offer.id}`} inputMode="decimal" type="text" autoComplete="off" placeholder="0,00" value={value} onChange={e=>setValue(e.target.value)} /><span>€</span></div>
    <div aria-live="polite" className={s.calculation}>
      {!valid ? <p>Betrag eingeben und Vorteil ansehen.</p> : sushi ?
        amount > (offer.thresholdEuro ?? 100) ? <p><strong>Dein Geschenk: ein Gericht im Wert von {currency(offer.giftValueEuro ?? 15)}.</strong></p> : <p>Das Geschenk gilt bei einem Sushi-Bestellwert <strong>über {currency(offer.thresholdEuro ?? 100)}</strong>.</p>
        : <p><strong>{currency(amount*(offer.discountPercent ?? 10)/100)} Rabatt</strong><br />Betrag nach Rabatt: {currency(amount*(1-(offer.discountPercent ?? 10)/100))}</p>}
    </div>
    <small>Rechenbeispiel für die Aktion. Die Abrechnung erfolgt im Restaurant während des Aktionszeitraums.</small>
  </div>;
}
