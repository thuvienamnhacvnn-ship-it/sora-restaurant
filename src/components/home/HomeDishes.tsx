"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import dishesData from "../../../data/hero-dishes.json";
import type { Locale } from "@/lib/i18n";
import styles from "./home-dishes.module.css";

const dishes = dishesData.dishes;
const groups = [...new Set(dishes.map(dish => dish.category))];
const DishContext = createContext<{
  category: string | null; select: (category: string) => void;
  activeCategory: string | null; step: number; paused: boolean; pause: () => void; next: () => void;
}>({ category: null, select: () => {}, activeCategory: null, step: 0, paused: false, pause: () => {}, next: () => {} });

export function HomeDishes({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = category ? dishes.filter((dish) => dish.category === category).length : dishes.length;
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches || count < 2) return;
    const timer = window.setInterval(() => setStep((value) => value + 1), 6000);
    return () => window.clearInterval(timer);
  }, [category, count, paused]);
  const select = (next: string) => {
    // No drink cutouts yet: leave both the plate and its running group intact.
    if (!dishes.some((dish) => dish.category === next)) return;
    setCategory((current) => current === next ? null : next);
    setStep(0);
  };
  return <DishContext.Provider value={{ category, select, activeCategory: category ?? groups[step % groups.length], step, paused, pause: () => setPaused((value) => !value), next: () => setStep((value) => value + 1) }}><div className={styles.home}>{children}</div></DishContext.Provider>;
}

export function CategorySelect({ category, title }: { category: string; title: string }) {
  const state = useContext(DishContext);
  return <button type="button" className={styles.select} aria-label={title} aria-pressed={state.activeCategory === category} onClick={() => state.select(category)} />;
}

export function HeroDishes({ locale, mobile = false }: { locale: Locale; mobile?: boolean }) {
  const { category, step, paused, pause, next } = useContext(DishContext);
  const activeGroup = category ?? groups[step % groups.length];
  const pool = dishes.filter(dish => dish.category === activeGroup);
  const offset = category ? step : Math.floor(step / groups.length);
  const dish = pool[offset % pool.length];
  const second = pool[(offset + 1) % pool.length];
  return (
    <div className={`${styles.platter} ${mobile ? styles.mobile : styles.desktop}`} data-hero-dish={dish.id} data-dish-category={dish.category}>
      <div className={styles.pair}>
      {[dish, second].map((plate, index) => <div key={`${category}-${step}-${index}`} className={styles.appear} data-paused={paused} data-plate={plate.id}>
        <span aria-hidden="true" className={styles.warmth} />
        <span aria-hidden="true" className={styles.magicRing} />
        <span aria-hidden="true" className={styles.magicBeam} />
        <Image src={`/dishes/${plate.id}.webp`} alt={String()} aria-hidden={true} width={plate.width} height={plate.height} sizes="(max-width: 767px) 45vw, 28vw" unoptimized priority={step === 0} className={styles.plateShadow} style={{ "--plate-foot": `${plate.foot}%` } as React.CSSProperties} />
        <Image src={`/dishes/${plate.id}.webp`} alt={plate[locale]} width={plate.width} height={plate.height} sizes="(max-width: 767px) 45vw, 28vw" unoptimized priority={step === 0} className={styles.dish} style={{ "--plate-foot": `${plate.foot}%` } as React.CSSProperties} />
        <span aria-hidden="true" className={styles.sparks}>{[0, 1, 2, 3, 4, 5, 6].map((n) => <i key={n} style={{ "--spark": n } as React.CSSProperties} />)}</span>
      </div>)}
      </div>
      <div className={styles.controls}>
        <span>{dish[locale]} · {second[locale]}</span>
        <button type="button" onClick={pause} aria-pressed={paused} aria-label={locale === "vi" ? "Tạm dừng / tiếp tục đổi món" : "Gerichte pausieren / abspielen"}>{paused ? "▶" : "Ⅱ"}</button>
        <button type="button" onClick={next} aria-label={locale === "vi" ? "Món tiếp theo" : "Nächstes Gericht"}>→</button>
      </div>
    </div>
  );
}
