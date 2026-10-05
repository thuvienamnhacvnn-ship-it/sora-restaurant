/*
 * Footer chỉ hiện ở khổ điện thoại.
 * 6 ảnh mẫu không có footer trên desktop (social + DE|VI nằm trong sidebar),
 * nhưng điện thoại không có sidebar nên pháp lý phải có chỗ bám — spec §14-11.
 * Chỉ dữ liệu ĐÃ XÁC MINH: địa chỉ, giờ mở cửa, điện thoại.
 */
import Link from "next/link";
import { LEGAL_NAV } from "@/data/site";
import { addressLines, restaurant, telHref } from "@/data/restaurant";
import { getT, href, pick, type Locale } from "@/lib/i18n";

export function MobileFooter({ locale }: { locale: Locale }) {
  const t = getT(locale);
  return (
    <footer className="mt-[var(--section-gap)] border-t border-gold/25 px-[var(--page-pad)] py-7 md:hidden">
      <address className="space-y-0.5 text-[14px] not-italic text-muted">
        {addressLines().map((line) => (
          <p key={line}>{line}</p>
        ))}
      </address>
      <p className="mt-3 text-[14px] text-muted">
        {pick(restaurant.openingHours.text, locale)}
      </p>
      {/*
       * Vùng bấm cao 24px là YÊU CẦU, không phải cho đẹp: WCAG 2.2 mục 2.5.8
       * (Target Size Minimum, mức AA) đòi tối thiểu 24×24px. Trước đây hai
       * liên kết này cao 17px và 19px — bài kiểm 390 bắt được. Đây là số điện
       * thoại của nhà hàng trên khổ điện thoại, tức đúng chỗ người ta bấm
       * bằng ngón tay, nên không được để hụt.
       * `inline-flex` + `min-h` nâng vùng bấm mà KHÔNG đổi cỡ chữ.
       */}
      <ul className="mt-3">
        {restaurant.phones.map((p) => (
          <li key={p.number} className="flex items-center">
            <a
              href={telHref(p)}
              className="inline-flex min-h-6 items-center text-[14px] text-gold-bright"
            >
              {p.number}
            </a>
            <span className="ml-2 text-[12px] text-muted/70">{p.label}</span>
          </li>
        ))}
      </ul>
      <nav className="mt-4 flex gap-5 text-[12px] text-muted/70">
        {LEGAL_NAV.map((l) => (
          <Link
            key={l.key}
            href={href(l.path, locale)}
            className="inline-flex min-h-6 items-center"
          >
            {t(`nav.${l.key}`)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
