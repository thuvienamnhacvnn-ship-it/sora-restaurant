/*
 * Thẻ phải của trang Kontakt KHI CHƯA CÓ E-MAIL (làm lại 07/10).
 *
 * Mẫu `06_kontakt.png` đặt form "NACHRICHT SENDEN" ở cột phải. Nhưng
 * `restaurant-info.json.email` còn null nên form không có chỗ nhận: bản cũ
 * dựng một form chết (nút khoá + hộp báo "chưa mở") cao 883px cạnh cột trái
 * 510px — hụt 373px đen và mời khách điền một thứ không gửi được.
 *
 * Nên chưa có e-mail thì cột phải là thẻ GỌI ĐIỆN: hai số THẬT in trên bìa
 * thực đơn, giờ mở cửa, chỉ đường, đặt bàn. Có e-mail thì trang tự đổi lại
 * sang `ContactForm` (xem `kontakt/page.tsx`) — không phải sửa gì ở đây.
 *
 * Khung lấy từ kho: `hyperui/…/marketing/contact-forms/5-dark.html`
 * (`dl` + mỗi hàng `grid-cols-[24px_1fr]`: icon 24px + chữ).
 */
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { phoneLabel, restaurant, telHref } from "@/data/restaurant";
import { href, pick, type Locale } from "@/lib/i18n";
import { directionsHref } from "./maps";

export function ReachCard({
  locale,
  s,
  className = "",
}: {
  locale: Locale;
  s: { title: string; hours: string; route: string; reserve: string };
  className?: string;
}) {
  return (
    <section
      className={`sora-card flex min-w-0 flex-col p-5 ${className}`}
      data-the-goi-dien=""
    >
      <div className="flex items-center gap-3">
        <span className="grid size-[38px] shrink-0 place-items-center rounded-full border border-gold/45 text-gold">
          <Icon name="phone" size={19} />
        </span>
        <h2 className="min-w-0 font-serif text-[22px] leading-tight tracking-[.04em] text-ivory uppercase [overflow-wrap:anywhere]">
          {s.title}
        </h2>
      </div>

      {/* Hai số THẬT. Nhãn loại số nằm TRONG nút, cùng hàng — nút rộng trọn
          thẻ nên không còn chuyện nhãn đẩy số ra ngoài viền như bản cũ. */}
      <ul className="mt-5 space-y-2.5 lg:mb-5">
        {restaurant.phones.map((p) => (
          <li key={p.number}>
            <a
              href={telHref(p)}
              className="sora-btn-primary h-12 w-full justify-between gap-3 px-4 text-[16px] tracking-[.04em]"
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon name="phone" size={17} />
                {p.number}
              </span>
              <span className="text-[12px] font-medium tracking-[.06em] normal-case">
                {phoneLabel(p, locale)}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Giờ mở chỉ hiện từ `lg` (hai cột cạnh nhau — trang chuyển hai cột từ
          1024 kể từ 11/10). Dưới `lg` các thẻ xếp chồng và thẻ ÖFFNUNGSZEITEN
          nằm ngay dưới -> ẩn cho khỏi lặp.

          BA CỤM CHIA ĐỀU (vòng 2, 11/10): hai số · giờ mở · hai nút. Khối này
          có hai vạch kẻ trên/dưới và nằm chính giữa (`my-auto`), nên khoảng dư
          của thẻ chia đôi hai phía thay vì dồn thành một lỗ 187px trên hai nút. */}
      <dl className="my-auto hidden border-y border-gold/20 py-4 lg:block">
        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3">
          <Icon name="clock" size={20} className="mt-0.5 text-gold" />
          <div className="min-w-0">
            <dt className="text-[12px] font-semibold tracking-[.08em] text-gold uppercase">
              {s.hours}
            </dt>
            <dd className="mt-0.5 text-[16px] text-text">
              {pick(restaurant.openingHours.text, locale)}
            </dd>
          </div>
        </div>
      </dl>

      {/* `mt-auto`: thẻ kéo cao bằng cột trái (`items-stretch`) thì hai nút
          bám đáy, khoảng dư nằm ở giữa chứ không thành mảng trống cuối thẻ. */}
      <div className="mt-auto flex flex-col gap-2.5 pt-6 lg:mt-0 lg:pt-5">
        <a
          href={directionsHref()}
          target="_blank"
          rel="noreferrer"
          className="sora-btn-ghost h-11 w-full justify-center"
        >
          <Icon name="map-pin" size={16} />
          {s.route}
          <Icon name="arrow-right" size={16} />
        </a>
        <Link
          href={href("/reservierung", locale)}
          className="sora-btn-ghost h-11 w-full justify-center"
        >
          <Icon name="calendar" size={16} />
          {s.reserve}
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </section>
  );
}
