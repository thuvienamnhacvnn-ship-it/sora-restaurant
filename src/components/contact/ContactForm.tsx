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
import type { Locale } from "@/lib/i18n";
import { hasEmail, phoneLabel, restaurant, telHref } from "@/data/restaurant";
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

export function ContactForm({
  locale,
  s,
}: {
  /* Cần `locale` chỉ để gọi `phoneLabel()`: nhãn loại số lưu trong JSON là
     tiếng Đức ("Mobil"/"Festnetz"), in thẳng ra thì trang `/vi` còn sót hai
     chữ Đức ở ngay dưới nút gửi. */
  locale: Locale;
  s: ContactFormStrings;
}) {
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

        {/*
         * CHƯA GỬI ĐƯỢC THÌ KHÔNG ĐƯỢC LÀ NÚT CHÍNH (07/10).
         *
         * Trước đây nút này luôn `sora-btn-gold` — vàng đặc, nổi nhất thẻ —
         * trong khi ngay dưới nó là ô báo "chưa mở form, hãy gọi điện". Một
         * nút mời bấm mà bấm không được là lời hứa suông; người dùng thử rồi
         * mới đọc ra là không dùng được.
         *
         * Có e-mail (`canSend`) thì nó trở lại làm nút chính ngay, không phải
         * sửa lại chỗ này.
         */}
        <button
          type="submit"
          disabled={!canSend}
          className={`${
            canSend ? "sora-btn-gold" : "sora-btn-ghost"
          } mt-4 h-11 w-full justify-center text-[15px] tracking-[.08em] uppercase disabled:cursor-not-allowed disabled:opacity-45`}
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
          {/*
           * GỌI ĐIỆN LÀ HÀNH ĐỘNG CHÍNH ở trạng thái này — nên nó mang dáng
           * nút chính, còn nút gửi ở trên lùi về kiểu phụ. Hai số là số THẬT
           * in trên bìa thực đơn, không phải số mẫu.
           *
           * Nhãn loại số xuống DÒNG RIÊNG thay vì `ml-2` chạy tiếp: cột thẻ
           * hẹp lại ở 1280/1366 thì nhãn đẩy số ra ngoài viền thẻ (đo được
           * lòi 35px với `Festnetz`), hoặc tự rớt xuống dòng trông như một từ
           * lạc. Xuống dòng có chủ ý thì ở cỡ nào cũng đọc ra là nhãn.
           */}
          <ul className="mt-3 space-y-2">
            {restaurant.phones.map((p) => (
              <li key={p.number}>
                <a
                  href={telHref(p)}
                  className="sora-btn-primary h-11 w-full justify-center text-[16px]"
                >
                  <Icon name="phone" size={16} />
                  {p.number}
                </a>
                <span className="mt-1 block text-center text-[12px] text-muted">
                  {phoneLabel(p, locale)}
                </span>
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
