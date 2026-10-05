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

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MasterChefTrigger } from "@/components/chef/MasterChef";
import { restaurant, telHref, hasWhatsapp, hasInstagram } from "@/data/restaurant";
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

  return (
    <>
      {/* Desktop */}
      <div className="fixed top-1/2 right-[18px] z-40 hidden w-[84px] -translate-y-1/2 flex-col items-center gap-[22px] md:flex">
        <RailItem label={labels.masterChef}>
          <MasterChefTrigger className={`${BTN} text-gold-bright`} aria-label={labels.masterChef}>
            <Icon name="chef" size={22} />
          </MasterChefTrigger>
        </RailItem>

        {hasWhatsapp() && (
          <RailItem label={labels.whatsapp}>
            <a
              href={`https://wa.me/${restaurant.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label={labels.whatsapp}
              className={`${BTN} text-[#25D366]`}
            >
              <Icon name="whatsapp" size={22} />
            </a>
          </RailItem>
        )}

        {hasInstagram() && (
          <RailItem label={labels.instagram}>
            <a
              href={`https://instagram.com/${restaurant.instagram}`}
              target="_blank"
              rel="noreferrer"
              aria-label={labels.instagram}
              className={`${BTN} text-[#E1306C]`}
            >
              <Icon name="instagram" size={22} />
            </a>
          </RailItem>
        )}

        <RailItem label={labels.support}>
          <button
            type="button"
            aria-expanded={support}
            aria-label={labels.support}
            onClick={() => setSupport((s) => !s)}
            className={`${BTN} text-gold`}
          >
            <Icon name="headset" size={22} />
          </button>
        </RailItem>

        {support && (
          <div className="sora-card absolute top-0 right-[90px] w-64 p-4 shadow-card">
            <p className="sora-eyebrow text-[11px]">{labels.callUs}</p>
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
                  <span className="pl-6 text-[11px] text-muted">{p.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-gold/20 pt-2 text-[12px] text-muted">
              {pick(restaurant.openingHours.text, locale)}
            </p>
          </div>
        )}
      </div>

      {/* Điện thoại: nút tròn Ø56 góc phải dưới, nằm trên bottom nav */}
      <MasterChefTrigger
        className="fixed right-4 bottom-[72px] z-40 grid size-14 place-items-center rounded-full border border-gold/60 bg-bg text-gold-bright shadow-card md:hidden"
        aria-label={labels.masterChef}
      >
        <Icon name="chef" size={26} />
      </MasterChefTrigger>
    </>
  );
}

function RailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-[84px] flex-col items-center gap-1">
      {children}
      <span className="w-[84px] text-center text-[10px] leading-tight text-muted">{label}</span>
    </div>
  );
}
