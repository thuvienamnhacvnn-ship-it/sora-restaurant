import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { Icon } from "@/components/ui/Icon";
import { restaurant, telHref } from "@/data/restaurant";
import { restaurantOffers, offerTiming } from "@/data/restaurant-updates";
import { getT, href, isLocale, type Locale } from "@/lib/i18n";
import { AboutHub, AboutNavigation, aboutSections, type AboutSection } from "./AboutHub";
import { OfferCalculator } from "./OfferCalculator";
import s from "./about-hub.module.css";
type Props = { params: Promise<{ lang: string; section?: string; slug?: string }> };
/* `motMan`: trang mục ÍT nội dung (Angebote / Neuheiten / SoRa erleben) vừa khít
   một màn ở màn cao, không thừa đáy, không cuộn — Sếp 11/10. Luật ở globals.css
   (`.sora-mot-man-cao`) + about-hub.module.css (`.hubMotMan`). */
function AboutFrame({ locale, children, section, offerTitle, motMan = false }: { locale: Locale; children: ReactNode; section?:AboutSection;offerTitle?:string;motMan?:boolean }) {
  const t=getT(locale);
  const title=offerTitle??aboutSections.find(x=>x.id===section)?.label??'Besondere Angebote. Besondere Momente.';
  return <div className={motMan ? "sora-mot-man-cao" : undefined}><div className={s.banner}><PageHero page="about" locale={locale} wordmark={t('nav.about')} chef={{eyebrow:t('chef.eyebrow'),question:t('chef.question'),cta:t('chef.cta.about')}}/><div className={s.bannerTitle}><span aria-hidden="true"/> <h2>{title}</h2> <span aria-hidden="true"/></div><div className={s.bannerNav}><AboutNavigation locale={locale} section={section}/></div><span className={`${s.redRibbon} ${s.ribbonLeft}`} aria-hidden="true"/><span className={`${s.redRibbon} ${s.ribbonRight}`} aria-hidden="true"/></div>{children}<MobileFooter locale={locale}/></div>;
}
export async function aboutMetadata({params}:Props):Promise<Metadata> {
 const {lang,section,slug}=await params;if(!isLocale(lang))return {};
 const offer=restaurantOffers.find(x=>x.id===slug);
 const category=aboutSections.find(x=>x.id===section);
 return {title:offer?.title??category?.label??'Über uns · Angebote & Lieblingsgerichte'};
}
export async function AboutOverview({params}:Props) {
 const {lang}=await params;if(!isLocale(lang))notFound();
 return <AboutFrame locale={lang}><AboutHub locale={lang}/></AboutFrame>;
}
export async function AboutSectionPage({params}:Props) {
 const {lang,section}=await params;if(!isLocale(lang))notFound();
 const category=aboutSections.find(x=>x.id===section);if(!category)notFound();
 // "Lieblingsgerichte" là lưới món dài -> vẫn cuộn; ba mục còn lại vừa một màn.
 const motMan=category.id!=="beliebte";
 return <AboutFrame locale={lang} section={category.id} motMan={motMan}><AboutHub locale={lang} section={category.id} motMan={motMan}/></AboutFrame>;
}
export async function AboutOfferPage({params}:Props) {
 const {lang,slug}=await params;if(!isLocale(lang))notFound();
 const offer=restaurantOffers.find(x=>x.id===slug);if(!offer)notFound();
 const timing=offerTiming(offer);
 return <AboutFrame locale={lang} section="angebote" offerTitle={offer.title}><div className={s.hub}>
  <Link className={`${s.back} ${s.backMobile}`} href={href('/ueber-uns/angebote',lang)}><Icon name="chevron-left" size={16}/>Alle Angebote</Link>
  <div className={s.detail} data-offer-detail={offer.id}>
   <article className={s.detailMain}><div className={s.detailPhoto}><Image src={offer.image} alt={offer.label} fill sizes="(max-width:1199px) 100vw, 55vw" priority/></div>
    <div className={s.detailCopy}><p className={s.eyebrow}>{offer.label}</p><h2>{offer.title}</h2><p>{offer.summary}</p>
     <div className={s.offerTiming}><Icon name="calendar" size={18}/>{timing.label}{timing.daysLeft!==null&&<b>Noch {timing.daysLeft} Tage</b>}{timing.state==='ended'&&<b>Aktion beendet</b>}</div>
     <div className={s.terms}><h3>So funktioniert’s</h3><ul>
       <li>{offer.kind==='opening'?'10 % Eröffnungsrabatt.':'Bei einem Sushi-Bestellwert über 100 € gibt es ein Gericht im Wert von 15 € gratis dazu.'}</li>
       <li>Die Aktion läuft {offer.durationDays} Tage ab Aktionsbeginn.</li>
       {offer.kind==='sushi'&&<li>Welche Gerichte als Geschenk zur Auswahl stehen, erfährst du im Restaurant.</li>}
       {!offer.startsOn&&<li>Den genauen Aktionsbeginn bitte beim Restaurant erfragen.</li>}
     </ul></div>
     <div className={s.actions}><Link className={s.primary} href={href('/reservierung',lang)}>Tisch reservieren<Icon name="calendar" size={17}/></Link><Link className={s.secondary} href={href(offer.kind==='sushi'?'/speisekarte?kategorie=sushi':'/speisekarte',lang)}>Speisekarte ansehen</Link></div>
     <a className={s.contact} href={telHref(restaurant.phones[0])}><Icon name="phone" size={16}/>Fragen zur Aktion: {restaurant.phones[0].number}</a>
    </div>
   </article>
   <OfferCalculator offer={offer}/>
  </div>
 </div></AboutFrame>;
}
