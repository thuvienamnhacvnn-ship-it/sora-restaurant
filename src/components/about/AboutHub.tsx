import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MON_BELIEBT, anhMon } from "@/components/menu/du-lieu";
import { displayPrice, itemName, itemDescription, type MenuItem } from "@/data/menu";
import { restaurantOffers, newDishes, offerTiming } from "@/data/restaurant-updates";
import { restaurant, telHref } from "@/data/restaurant";
import { href, type Locale } from "@/lib/i18n";
import s from "./about-hub.module.css";
export const aboutSections = [
  { id: "angebote", label: "Angebote", icon: "gift" },
  { id: "neuheiten", label: "Neuheiten", icon: "sparkles" },
  { id: "beliebte", label: "Lieblingsgerichte", icon: "heart" },
  { id: "erlebnis", label: "SoRa erleben", icon: "images" },
] as const;
export type AboutSection = typeof aboutSections[number]["id"];
export function AboutNavigation({locale,section}:{locale:Locale;section?:AboutSection}) {
  /* `navBack` (vòng 2, 11/10): ở trang mục, lối "Zur Übersicht" nằm trên banner cùng hàng nút —
     trước nó đứng trơ giữa banner và thẻ, đẩy thẻ đầu ra 54px thay vì 16px. Điện thoại vẫn dùng link
     trong thân trang (`backMobile`) vì hàng nút trên banner đã kín 3 hàng. */
  return <nav className={s.sectionNav} aria-label="SoRa entdecken">{section && <Link className={s.navBack} href={href('/ueber-uns',locale)}><Icon name="chevron-left" size={17}/>Zur Übersicht</Link>}{aboutSections.map(x=><Link key={x.id} aria-current={section===x.id ? 'page':undefined} href={href(`/ueber-uns/${x.id}`,locale)}><Icon name={x.icon} size={19}/>{x.label}</Link>)}<Link href={href('/master-chef',locale)}><Icon name="chef" size={19}/>Master Chef AI</Link></nav>;
}
export function AboutDishCards({ dishes, locale }: { dishes: MenuItem[]; locale: Locale }) {
  return <div className={s.dishGrid}>{dishes.map(item=>{
    const photo=anhMon(item); const price=displayPrice(item,locale);
    return <Link key={item.id} href={href(`/speisekarte?dish=${encodeURIComponent(item.id)}`,locale)} className={s.dishCard}>
      {photo && <div className={s.dishImage}><Image src={photo} alt={itemName(item,locale)} fill sizes="(max-width:767px) 100vw, (max-width:1199px) 45vw, 30vw" /></div>}
      <div className={s.dishCopy}><h3>{itemName(item,locale)}</h3><p>{itemDescription(item,locale)}</p><div className={s.dishBottom}><strong>{price.from ? "ab " : ""}{price.text}</strong><span>Gericht ansehen <Icon name="arrow-right" size={16} /></span></div></div>
    </Link>;
  })}</div>;
}
export function AboutHub({ locale, section, motMan = false }: { locale: Locale; section?: AboutSection; motMan?: boolean }) {
  const show=(id:AboutSection)=>!section||section===id;
  return <div className={motMan ? `${s.hub} ${s.hubMotMan}` : s.hub}>
    {section && <Link className={`${s.back} ${s.backMobile}`} href={href('/ueber-uns',locale)}><Icon name="chevron-left" size={16}/>Zur Übersicht</Link>}
    {show('angebote') && <section className={`${s.section} ${s.sectionPanel}`} aria-labelledby="offers-title">
      <div className={s.sectionHead}><div><h2 id="offers-title">Besondere Angebote</h2><p className={s.eyebrow}>Jeweils 30 Tage</p></div></div>
      <div className={s.offerGrid}>{restaurantOffers.map(offer=>{
        const timing=offerTiming(offer);
        return <article key={offer.id} className={`${s.offerCard} ${offer.kind==='opening'?s.opening:s.sushi}`} data-offer={offer.id}>
          <div className={s.offerPoster}>
            <div className={s.offerHeadline}><span className={s.posterLabel}>{offer.label}</span><div className={s.benefit}>{offer.kind==='opening'?<><strong>10<span>%</span></strong><h3>Eröffnungs-<br />rabatt</h3><p>Feiere mit uns!</p></>:<><strong>15<span>€</span></strong><h3>Ein Gericht<br />geschenkt</h3><p>bei Sushi über 100 €</p></>}</div><span className={s.posterRule} aria-hidden="true" /></div>
            <div className={s.offerPhoto}><Image src={offer.image} alt={offer.kind==='opening'?'Kirschblütendach im SoRa Restaurant':'Sushi-Auswahl'} fill sizes="(max-width:767px) 65vw, 30vw" /><span className={s.offerStamp}>30<small>Tage</small></span></div>
          </div>
          <div className={s.offerCopy}>
            <div className={s.offerTiming}><Icon name="calendar" size={16}/>{timing.label}{timing.daysLeft!==null&&<b>Noch {timing.daysLeft} Tage</b>}{timing.state==='ended'&&<b>Aktion beendet</b>}</div>
            <Link className={s.primary} href={href(`/ueber-uns/aktion/${offer.id}`,locale)}>Details ansehen<Icon name="arrow-right" size={17}/></Link>
          </div>
        </article>;
      })}</div>
    </section>}
    {show('neuheiten') && <section className={`${s.section} ${s.sectionPanel}`} aria-labelledby="new-title"><div className={s.sectionHead}><div><p className={s.eyebrow}>Immer etwas zu entdecken</p><h2 id="new-title">Neu auf unserer Karte</h2></div><Link className={s.textLink} href={href('/speisekarte',locale)}>Zur Speisekarte<Icon name="arrow-right" size={17}/></Link></div>
      {newDishes.length ? <AboutDishCards dishes={newDishes} locale={locale}/> : <div className={s.discovery}><div className={s.discoveryPhoto}><Image src="/anh/danh-muc/vietnamesische-klassiker.webp" alt="Vietnamesische Gerichte" fill sizes="(max-width:767px) 100vw, 35vw" /></div><div><p className={s.eyebrow}>Dein nächster Favorit wartet</p><h3>Lust auf etwas Neues?</h3><p>Neue Gerichte stellen wir hier vor. Entdecke inzwischen unsere Speisekarte oder lass dich vom Master Chef inspirieren.</p><div className={s.actions}><Link className={s.primary} href={href('/speisekarte',locale)}>Gerichte entdecken<Icon name="arrow-right" size={17}/></Link><Link className={s.secondary} href={href('/master-chef',locale)}>Master Chef fragen</Link></div></div></div>}
    </section>}
    {show('beliebte') && <section className={`${s.section} ${s.sectionPanel}`} aria-labelledby="popular-title"><div className={s.sectionHead}><div><p className={s.eyebrow}>Lieblingsgerichte bei SoRa</p><h2 id="popular-title">Zum Verlieben gut.</h2></div><Link className={s.textLink} href={href('/speisekarte',locale)}>Alle Gerichte<Icon name="arrow-right" size={17}/></Link></div><AboutDishCards dishes={MON_BELIEBT} locale={locale}/></section>}
    {show('erlebnis') && <section className={`${s.section} ${s.experience}`} aria-labelledby="experience-title"><div className={s.experiencePhoto}><Image src="/anh/restaurant-02.webp" alt="SoRa Restaurant" fill sizes="(max-width:767px) 100vw, 55vw" /></div><div className={s.experienceCopy}><p className={s.eyebrow}>Japan trifft Vietnam</p><h2 id="experience-title">Dein Platz<br />unter den Blüten.</h2><p>Sushi, vietnamesische Gerichte und ein Tisch im SoRa. Entdecke unser Restaurant und plane deinen Besuch.</p><div className={s.actions}><Link className={s.primary} href={href('/reservierung',locale)}>Tisch reservieren<Icon name="calendar" size={17}/></Link><Link className={s.secondary} href={href('/galerie',locale)}>Galerie ansehen</Link></div><a className={s.contact} href={telHref(restaurant.phones[0])}><Icon name="phone" size={16}/>{restaurant.phones[0].number}</a></div></section>}
  </div>;
}
