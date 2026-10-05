/*
 * Dải CTA WhatsApp.
 *
 * ĐANG ẨN: `restaurant-info.json: whatsapp = null`. Trả về null chứ không
 * dựng nút trỏ vào số đoán.
 *
 * Khi Sếp gửi số, khối tự hiện và PHẢI giữ đúng dạng dưới đây:
 * mockup vẽ một panel XANH ĐẶC — KIT cấm thẳng ("Never use full green/pink
 * panels for social buttons. Keep the brand color only inside the icon; the
 * button shell stays SoRa black/gold"). Nên vỏ dải và vỏ nút đều đen/gold,
 * chỉ glyph WhatsApp giữ màu #25D366.
 */
import { Icon } from "@/components/ui/Icon";
import { hasWhatsapp, restaurant } from "@/data/restaurant";
import { getT, type Locale } from "@/lib/i18n";

export function WhatsAppCta({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}) {
  if (!hasWhatsapp()) return null;

  return (
    <section className="sora-card flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/45 bg-bg text-[#25D366]">
          <Icon name="whatsapp" size={28} />
        </span>
        <h2 className="font-serif text-[18px] tracking-[.06em] text-gold-bright uppercase">
          {title}
        </h2>
      </div>

      <a
        href={`https://wa.me/${restaurant.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="sora-btn-ghost shrink-0 self-start sm:self-auto"
      >
        <Icon name="whatsapp" size={17} className="text-[#25D366]" />
        {getT(locale)("contact.whatsappCta")}
        <Icon name="arrow-right" size={16} />
      </a>
    </section>
  );
}
