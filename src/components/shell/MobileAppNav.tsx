"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SoRaLogo } from "./SoRaLogo";
import { SidebarSocial } from "./SidebarSocial";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NAV, LEGAL_NAV, type NavKey } from "@/data/site";
import { restaurant, telHref } from "@/data/restaurant";
import { href, LOCALES, type Locale } from "@/lib/i18n";
import type { MobileLabels } from "./MobileNav";
import s from "./mobile-app.module.css";
import { useCart } from "@/components/cart/CartProvider";
const icons:Record<NavKey,IconName>={home:"home",menu:"utensils",reservation:"calendar",gallery:"images",about:"users",contact:"phone"};
export function MobileNav({locale,labels}:{locale:Locale;labels:MobileLabels}) {
  const pathname=usePathname(),ref=useRef<HTMLDialogElement>(null),id=useId();
  const [open,setOpen]=useState(false);
  const cart=useCart();
  useEffect(()=>{
    const wide=window.matchMedia("(min-width:768px)");
    const onResize=()=>{if(wide.matches)ref.current?.close();};
    wide.addEventListener("change",onResize);
    return()=>wide.removeEventListener("change",onResize);
  },[]);
  const active=(path:string)=>path==="/"?pathname===href(path,locale):pathname.startsWith(href(path,locale));
  const close=()=>ref.current?.close();
  const show=()=>{ref.current?.showModal();setOpen(true);};
  const phone=restaurant.phones[0];
  const moreActive=["/galerie","/ueber-uns","/kontakt","/impressum","/datenschutz","/master-chef"].some(active)&&!active("/ueber-uns/angebote");
  const tabs=[{path:"/",icon:"home",label:labels.nav.home},{path:"/reservierung",icon:"calendar",label:locale==="vi"?"Đặt bàn":"Tisch"},{path:"/speisekarte",icon:"utensils",label:locale==="vi"?"Đặt món":"Menü",featured:true},{path:"/ueber-uns/angebote",icon:"gift",label:locale==="vi"?"Ưu đãi":"Angebot"}];
  return <>
    <header className={s.header} data-mobile-header><Link href={href("/",locale)} className={s.brand} aria-label="SoRa — Home"><SoRaLogo size={42} priority/><span><strong>SoRa</strong><small>JAPANESE & VIETNAMESE</small></span></Link><div className={s.headerActions}>{phone&&<a href={telHref(phone)} className={s.iconButton} aria-label={locale==="vi"?"Gọi nhà hàng":"Restaurant anrufen"}><Icon name="phone" size={20}/></a>}<button type="button" className={s.iconButton} data-mobile-menu aria-label={labels.openMenu} aria-expanded={open} aria-controls={id} onClick={show}><Icon name="menu" size={22}/></button></div></header>
    <button type="button" data-mobile-top-cart className={s.topCart} aria-label={locale==="vi"?`Giỏ hàng, ${cart.count} món`:`Warenkorb, ${cart.count} Artikel`} onClick={cart.open}><Icon name="shopping-cart" size={22}/>{cart.count>0&&<span className={s.mobileBadge}>{cart.count}</span>}</button>
    <nav className={s.dock} data-mobile-dock aria-label={locale==="vi"?"Điều hướng chính":"Hauptnavigation"}>{tabs.map(tab=><Link key={tab.path} href={href(tab.path,locale)} className={`${s.tab} ${tab.featured?s.chefTab:""}`} aria-current={active(tab.path)?"page":undefined}><span className={s.tabIcon}><Icon name={tab.icon} size={tab.featured?25:22}/></span><span className={s.tabLabel}>{tab.label}</span><span className={s.activeDot} aria-hidden="true"/></Link>)}<button type="button" data-mobile-more className={s.tab} aria-current={moreActive?"page":undefined} aria-expanded={open} aria-controls={id} aria-label={labels.openMenu} onClick={show}><span className={s.tabIcon}><Icon name="menu" size={22}/></span><span className={s.tabLabel}>{labels.more}</span><span className={s.activeDot} aria-hidden="true"/></button></nav>
    <dialog ref={ref} id={id} className={s.sheet} data-mobile-sheet aria-labelledby={`${id}-title`} {...{closedby:"any"}} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)close();}}><div className={s.sheetBody}><div className={s.handle} aria-hidden="true"/><header className={s.sheetHeader}><div><span>SORA · ENTDECKEN</span><h2 id={`${id}-title`}>{locale==="vi"?"Khám phá SoRa":"Mehr erleben"}</h2></div><button type="button" className={s.iconButton} aria-label={labels.closeMenu} onClick={close}><Icon name="x" size={22}/></button></header>
      <div className={s.menuGrid}>{NAV.map(item=><Link key={item.key} href={href(item.path,locale)} onClick={close} aria-current={active(item.path)?"page":undefined}><Icon name={icons[item.key]} size={23}/><span>{labels.nav[item.key]}</span><Icon name="chevron-right" size={16}/></Link>)}</div>
      <Link href={href("/master-chef",locale)} onClick={close} className={s.chefCard}><span className={s.chefCardIcon}><Icon name="chef" size={28}/></span><span><strong>Master Chef AI</strong><small>{locale==="vi"?"Tìm món hợp khẩu vị của bạn":"Finde dein Lieblingsgericht"}</small></span><Icon name="arrow-right" size={19}/></Link>
      <button type="button" data-mobile-cart className={s.cartLink} onClick={()=>{close();requestAnimationFrame(cart.open);}}><Icon name="shopping-cart" size={22}/>{locale==="vi"?"Giỏ hàng":"Warenkorb"}<strong>{cart.count}</strong></button>
      <div className={s.phoneRow}>{restaurant.phones.map(p=><a key={p.e164} href={telHref(p)}><Icon name="phone" size={16}/>{p.number}</a>)}</div>
      <div className={s.language} aria-label={labels.language}>{LOCALES.map(code=><Link key={code} href={`/${code}${pathname.replace(/^\/(de|vi)(?=\/|$)/,"")}`} hrefLang={code} aria-current={code===locale?"true":undefined} onClick={close}>{code==="de"?"Deutsch":"Tiếng Việt"}<span>{code.toUpperCase()}</span></Link>)}</div><div className={s.sheetBottom}><SidebarSocial/><div className={s.legal}>{LEGAL_NAV.map(l=><Link key={l.key} href={href(l.path,locale)} onClick={close}>{labels.legal[l.key]}</Link>)}</div></div>
    </div></dialog>
  </>;
}
