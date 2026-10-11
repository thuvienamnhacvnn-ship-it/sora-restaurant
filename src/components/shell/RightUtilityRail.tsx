"use client";

/*
 * Rail tiện ích nổi bên phải (desktop) + nút tròn Master Chef (điện thoại).
 *
 * Thứ tự KIT: Master Chef AI -> WhatsApp -> Instagram -> Customer Care.
 * WhatsApp và Instagram ĐANG ẨN: `restaurant-info.json` còn null cả hai,
 * Sếp chưa gửi. Khi có dữ liệu, bỏ comment khối ở dưới là nút tự hiện —
 * vỏ nút vẫn đen/gold, màu thương hiệu chỉ nằm trong icon (luật KIT).
 *
 * "Live Support" không phải chat bot: nó mở hai số điện thoại THẬT in trên
 * thực đơn. Không hứa cái mình không có.
 */

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { restaurant, telHref, phoneLabel } from "@/data/restaurant";
import { pick, type Locale } from "@/lib/i18n";

export type RailLabels = {
  masterChef: string;
  whatsapp: string;
  instagram: string;
  support: string;
  close: string;
  callUs: string;
};

const BTN =
  "grid size-11 place-items-center rounded-full border border-gold/45 bg-bg/90 backdrop-blur transition-colors hover:border-gold/80";

export function RightUtilityRail({
  locale,
  labels,
}: {
  locale: Locale;
  labels: RailLabels;
}) {
  const [support, setSupport] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!support) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSupport(false); triggerRef.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!railRef.current?.contains(event.target as Node)) setSupport(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", outside);
    };
  }, [support]);

  return (
    <>
      {/* Desktop */}
      <div ref={railRef} className="relative z-40 mb-4 flex items-start justify-center gap-2 max-xl:flex-col max-xl:items-center">
        <RailItem label={labels.masterChef}>
          <Link href={`/${locale}/master-chef`} className={`${BTN} text-gold-bright`} aria-label={labels.masterChef}>
            <Icon name="chef" size={22} />
          </Link>
        </RailItem>

        <RailItem label={labels.support}>
          <button
            type="button"
            aria-expanded={support}
            ref={triggerRef}
            aria-controls={support ? "sora-phone-support" : undefined}
            aria-label={labels.support}
            onClick={() => setSupport((s) => !s)}
            className={`${BTN} text-gold`}
          >
            <Icon name="headset" size={22} />
          </button>
        </RailItem>

        {support && (
          <div id="sora-phone-support" role="region" aria-label={labels.callUs} className="sora-card sora-dialog-enter absolute bottom-full left-0 mb-3 w-64 p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <p className="sora-eyebrow text-[11px]">{labels.callUs}</p>
              <button type="button" aria-label={labels.close} onClick={() => { setSupport(false); triggerRef.current?.focus(); }} className="grid size-8 place-items-center rounded border border-gold/30 text-gold"><Icon name="x" size={16} /></button>
            </div>
            <ul className="mt-2 space-y-2">
              {restaurant.phones.map((p) => (
                <li key={p.number}>
                  <a
                    href={telHref(p)}
                    className="flex items-center gap-2 text-[15px] text-text hover:text-gold-bright"
                  >
                    <Icon name="phone" size={16} className="text-gold" />
                    <span>{p.number}</span>
                  </a>
                  <span className="pl-6 text-[11px] text-muted">{phoneLabel(p, locale)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-gold/20 pt-2 text-[12px] text-muted">
              {pick(restaurant.openingHours.text, locale)}
            </p>
          </div>
        )}
      </div>


    </>
  );
}

function RailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[74px] flex-col items-center gap-1">
      {children}
      <span className="w-[74px] text-center text-[10px] leading-tight text-muted">{label}</span>
    </div>
  );
}
