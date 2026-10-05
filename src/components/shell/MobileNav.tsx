"use client";

/*
 * Khổ điện thoại (<768px): bỏ sidebar, thay bằng
 *  - top app bar: logo 40px + nút "Tisch reservieren" + nút mở menu
 *  - bottom nav 5 mục: Home / Speisekarte / Reservierung / Galerie / Mehr
 *  - "Mehr" và nút menu mở CÙNG một tấm trượt: 6 mục + pháp lý + DE|VI
 *
 * Mẫu không có khổ điện thoại; bố cục này theo KIT §Responsive + spec §4.4.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SoRaLogo } from "./SoRaLogo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NAV, LEGAL_NAV, type NavKey } from "@/data/site";
import { href, LOCALES, type Locale } from "@/lib/i18n";

const NAV_ICON: Record<NavKey, IconName> = {
  home: "home",
  menu: "utensils",
  reservation: "calendar",
  gallery: "images",
  about: "sparkles",
  contact: "mail",
};

const BOTTOM: NavKey[] = ["home", "menu", "reservation", "gallery"];

export type MobileLabels = {
  nav: Record<NavKey, string>;
  legal: Record<string, string>;
  more: string;
  openMenu: string;
  closeMenu: string;
  reserve: string;
  language: string;
};

export function MobileNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: MobileLabels;
}) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState(false);

  // Đổi trang thì đóng tấm trượt. Chỉnh trong render chứ không trong effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSheet(false);
  }

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet]);

  const isActive = (path: string) => {
    const target = href(path, locale);
    return path === "/" ? pathname === target : pathname.startsWith(target);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gold/25 bg-elevated/95 px-4 backdrop-blur md:hidden">
        <Link href={href("/", locale)} aria-label="SoRa — Home">
          <SoRaLogo size={40} priority />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={href("/reservierung", locale)}
            className="sora-btn-primary h-9 px-3 text-[12px]"
          >
            {labels.reserve}
          </Link>
          <button
            type="button"
            aria-expanded={sheet}
            aria-label={sheet ? labels.closeMenu : labels.openMenu}
            onClick={() => setSheet((s) => !s)}
            className="grid size-9 place-items-center rounded-[6px] border border-gold/45 text-gold"
          >
            <Icon name={sheet ? "x" : "menu"} size={20} />
          </button>
        </div>
      </header>

      <nav
        aria-label={labels.openMenu}
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-gold/25 bg-elevated/95 backdrop-blur md:hidden"
      >
        {BOTTOM.map((key) => {
          const item = NAV.find((n) => n.key === key)!;
          const active = isActive(item.path);
          return (
            <Link
              key={key}
              href={href(item.path, locale)}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
                active ? "text-gold-bright" : "text-muted"
              }`}
            >
              <Icon name={NAV_ICON[key]} size={21} />
              <span className="max-w-full truncate px-1">{labels.nav[key]}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setSheet(true)}
          aria-expanded={sheet}
          className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted"
        >
          <Icon name="menu" size={21} />
          <span>{labels.more}</span>
        </button>
      </nav>

      {sheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={() => setSheet(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[12px] border-t border-gold/45 bg-elevated px-5 pt-5 pb-8">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={href(item.path, locale)}
                    aria-current={isActive(item.path) ? "page" : undefined}
                    className={`flex h-11 items-center gap-3 rounded-[6px] px-3 ${
                      isActive(item.path)
                        ? "bg-red/20 text-text"
                        : "text-muted"
                    }`}
                  >
                    <Icon name={NAV_ICON[item.key]} size={22} />
                    {labels.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-center gap-3 border-t border-gold/25 pt-4 text-[13px] tracking-[.1em]">
              {LOCALES.map((code, i) => (
                <span key={code} className="flex items-center gap-3">
                  {i > 0 && <span className="text-gold/40">|</span>}
                  <Link
                    href={`/${code}${pathname.replace(/^\/(de|vi)(?=\/|$)/, "")}`}
                    hrefLang={code}
                    className={code === locale ? "text-gold-bright" : "text-muted"}
                  >
                    {code.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-5 text-[12px] text-muted/70">
              {LEGAL_NAV.map((l) => (
                <Link key={l.key} href={href(l.path, locale)}>
                  {labels.legal[l.key]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
