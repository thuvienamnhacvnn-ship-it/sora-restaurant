import type { CSSProperties } from "react";
import { CHU_NHAN, ChuCo, type ChuNhan } from "@/components/chu/ChuCo";
import { CHU_KHO } from "@/components/chu/chu-kho";
import type { Locale } from "@/lib/i18n";
import s from "./magic-banner-title.module.css";

export function MagicBannerTitle({ nhan, locale, desktop = 2, mobile = 1.24, fit = 100 }: {
  nhan: ChuNhan;
  locale: Locale;
  desktop?: number;
  mobile?: number;
  fit?: number;
}) {
  const label = CHU_NHAN[nhan];
  const selected = locale === "vi" && label.vi ? label.vi : label.de;
  const dimensions = CHU_KHO[selected.tep];
  return (
    <div className={s.title} data-magic-title="" style={{
      "--magic-mobile-width": `${dimensions.w * mobile}px`,
      "--magic-desktop-width": `${dimensions.w * desktop}px`,
      "--magic-max-width": `${fit}%`,
      "--magic-ratio": String(dimensions.w / dimensions.h),
    } as CSSProperties}>
      <ChuCo nhan={nhan} locale={locale} the="h1" chuThat nganGon
        tiLe={{ dienThoai: mobile, mayTinh: desktop }} className={s.letters} />
    </div>
  );
}
