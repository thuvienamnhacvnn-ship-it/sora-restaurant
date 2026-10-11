import raw from "../../data/restaurant-updates.json";
import { menuItems } from "./menu";
export type RestaurantOffer = {
  id: string; kind: "opening" | "sushi"; title: string; label: string;
  summary: string; durationDays: number; startsOn: string | null;
  discountPercent?: number; thresholdEuro?: number; giftValueEuro?: number; image: string;
};
export const restaurantOffers = raw.offers as RestaurantOffer[];
export const newDishes = raw.newDishIds.map(id => menuItems.find(m => m.id === id && m.available)).filter(m => m !== undefined);
export function offerTiming(offer: RestaurantOffer) {
  if (!offer.startsOn) return { label: `${offer.durationDays} Tage ab Aktionsbeginn`, state: "scheduled" as const, daysLeft: null };
  const start = Date.parse(`${offer.startsOn}T00:00:00Z`);
  const end = start + offer.durationDays * 86400000;
  const date = (time: number) => new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(time);
  const parts = new Intl.DateTimeFormat("en-CA", {year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Europe/Berlin"}).formatToParts(new Date());
  const part = (type:string) => parts.find(p=>p.type===type)?.value;
  const now = Date.parse(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  return { label: `${date(start)} – ${date(end - 1)}`, state: now < start ? "scheduled" as const : now < end ? "active" as const : "ended" as const, daysLeft: now >= start && now < end ? Math.ceil((end-now)/86400000) : null };
}
