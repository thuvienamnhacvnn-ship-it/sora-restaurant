"use client";

/*
 * Form liên hệ. KHÔNG CÓ chỗ nhận: `restaurant-info.json.email` còn null.
 * Nút gửi vì thế bị vô hiệu hoá và nói thẳng lý do + đưa hai số điện thoại
 * THẬT. Không giả vờ gửi thành công, không bịa địa chỉ email.
 *
 * Khi Sếp gửi email: điền vào `restaurant-info.json`, `canSend` tự bật,
 * rồi nối action thật (xem `_w-agent/02_dev-giao-dien.md`).
 */

import { Icon } from "@/components/ui/Icon";
import { hasEmail, restaurant, telHref } from "@/data/restaurant";
import { CornerSakura, GoldWaveCorner } from "@/components/decor/Decor";

export type ContactFormStrings = {
  title: string;
  name: string;
  mail: string;
  tel: string;
  subject: string;
  message: string;
  send: string;
  noFormTitle: string;
  noForm: string;
};

export function ContactForm({ s }: { s: ContactFormStrings }) {
  const canSend = hasEmail();

  return (
    <section className="sora-card relative isolate overflow-hidden p-5">
      {/*
       * decor — đo 1:1 trên `_w-agent/mau/06_kontakt.png`:
       *  - hoa rải dọc MÉP TRÊN thẻ form rồi chạy xuống mép phải;
       *  - GÓC DƯỚI-TRÁI thẻ có hoa văn SÓNG VÀNG (x 1140→1247, y 787→883
       *    trên khung 1672). Mẫu trộn hai họ hoạ tiết trong một thẻ — Sếp
       *    chốt theo mẫu, nên luật "mỗi mục một họ" của KIT không áp ở đây.
       * Cột hoa chạy dọc mép phải nằm NGOÀI thẻ (thẻ `overflow-hidden`), đặt
       * ở `app/[lang]/kontakt/page.tsx`.
       */}
      <CornerSakura corner="tr" width={186} offsetX={-1} offsetY={-1} opacity={1} className="-z-10" />
      <CornerSakura corner="tl" width={102} offsetX={18} offsetY={-1} opacity={1} className="-z-10" />
      <GoldWaveCorner corner="bl" size={108} opacity={0.42} className="-z-10" />
      <span className="grid size-[38px] place-items-center rounded-full border border-gold/45 text-gold">
        <Icon name="mail" size={20} />
      </span>
      <h2 className="mt-3 font-serif text-[26px] tracking-[.04em] text-ivory uppercase">
        {s.title}
      </h2>

      <form
        className="mt-5"
        onSubmit={(e) => e.preventDefault()}
        aria-describedby={canSend ? undefined : "kontakt-hinweis"}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label={s.name} icon="user" required />
          <Field label={s.mail} icon="mail" type="email" required />
          <Field label={s.tel} icon="phone" type="tel" />
          <Field label={s.subject} icon="pen-line" required />
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[13px] text-muted">{s.message}</span>
          <textarea rows={5} required className="sora-field" />
        </label>

        <button
          type="submit"
          disabled={!canSend}
          className="sora-btn-gold mt-4 h-11 w-full justify-center text-[15px] tracking-[.08em] uppercase disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Icon name="send" size={17} />
          {s.send}
        </button>
      </form>

      {!canSend && (
        <div
          id="kontakt-hinweis"
          className="mt-4 rounded-[var(--radius-btn)] border border-gold/35 bg-surface p-4"
        >
          <p className="flex items-center gap-2 font-serif text-[15px] text-gold-bright">
            <Icon name="info" size={17} />
            {s.noFormTitle}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-text">{s.noForm}</p>
          <ul className="mt-3 space-y-1">
            {restaurant.phones.map((p) => (
              <li key={p.number}>
                <a
                  href={telHref(p)}
                  className="inline-flex items-center gap-2 text-[16px] text-gold-bright"
                >
                  <Icon name="phone" size={16} />
                  {p.number}
                </a>
                <span className="ml-2 text-[12px] text-muted">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  icon,
  type = "text",
  required = false,
}: {
  label: string;
  icon: "user" | "mail" | "phone" | "pen-line";
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[13px] text-muted">{label}</span>
      <span className="relative block">
        <Icon
          name={icon}
          size={17}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gold"
        />
        <input type={type} required={required} className="sora-field pl-10" />
      </span>
    </label>
  );
}
