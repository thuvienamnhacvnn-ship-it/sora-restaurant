/*
 * Khung chung cho 2 trang pháp lý. Không hero ảnh — trang chữ.
 * Địa chỉ + điện thoại bên dưới là dữ liệu ĐÃ XÁC MINH, hiện được;
 * phần còn lại chờ Sếp gửi.
 */
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { Icon } from "@/components/ui/Icon";
import { BrushUnderline } from "@/components/decor/Decor";
import { addressLines, restaurant, telHref } from "@/data/restaurant";
import type { Locale } from "@/lib/i18n";

export function LegalPage({
  locale,
  title,
  pending,
  note,
}: {
  locale: Locale;
  title: string;
  pending: string;
  note: string;
}) {
  return (
    <>
      <SectionFrame className="!mt-10">
        {/* Trang chữ thuần: chỉ một nét cọ đỏ gạch chân tiêu đề, không hoa
            (_w-agent/05_decor.md). Nằm sau chữ, `-z-10`. */}
        <h1 className="sora-wordmark relative isolate w-fit text-[clamp(40px,4.5vw,72px)]">
          <BrushUnderline />
          {title}
        </h1>

        <div className="sora-card mt-6 max-w-[760px] p-5">
          <p className="flex items-center gap-2 font-serif text-[16px] text-gold-bright">
            <Icon name="info" size={18} />
            {pending}
          </p>
          <ChoSep note={note} lines={6} className="mt-3" />

          <div className="mt-6 border-t border-gold/20 pt-4">
            <address className="space-y-0.5 text-[15px] not-italic text-text">
              {addressLines().map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <ul className="mt-2 space-y-0.5">
              {restaurant.phones.map((p) => (
                <li key={p.number} className="text-[15px]">
                  <a href={telHref(p)} className="text-gold-bright">
                    {p.number}
                  </a>
                  <span className="ml-2 text-[12px] text-muted">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionFrame>

      <MobileFooter locale={locale} />
    </>
  );
}
