"use client";

/*
 * Khối bản đồ — mẫu `mockups/06_kontakt.png`, cột trái dưới ba thẻ thông tin.
 *
 * Link Google Maps của quán: Sếp gửi 05/10/2026, đã điền vào
 * `data/restaurant-info.json`. Trước đó khối này là bản tĩnh chờ link.
 *
 * ---- VÌ SAO PHẢI BẤM MỘT LẦN MỚI HIỆN BẢN ĐỒ (giải pháp "hai cú bấm") ----
 * Quán ở Đức, trang có Impressum + Datenschutz. Nhúng thẳng iframe Google Maps
 * là ngay khi khách MỞ trang, trình duyệt đã gửi IP + User-Agent sang Google và
 * Google đặt cookie — tức là xử lý dữ liệu cá nhân TRƯỚC khi khách đồng ý.
 * Toà Đức đã phạt chuyện này (LG München I, 20.01.2022, 3 O 17493/20 — vụ
 * Google Fonts, cùng một lập luận). Nên:
 *   - chưa bấm: KHÔNG có iframe trong DOM, không một byte nào chạy sang Google;
 *   - bấm "Karte laden": mới gắn iframe.
 * Khách không muốn bấm vẫn có đủ địa chỉ + nút chỉ đường ngay trên khối này —
 * nút đó chỉ là thẻ <a> mở tab mới, không nhúng gì, không cần đồng ý.
 *
 * Khi nào bỏ bước bấm: chỉ khi trang có banner đồng ý cookie thật và
 * Datenschutz có mục Google Maps. Lúc đó đổi `BAT_BUOC_DONG_Y` thành false.
 *
 * KHÔNG tự ý đổi màu bản đồ: mẫu vẽ bản đồ nền tối, nhưng bản nhúng không khoá
 * của Google không cho đặt style. Lấy `filter` CSS bôi tối thì chữ tên đường và
 * logo Google bị đổi màu sai — phạm luật "cấm phủ màu". Muốn đúng nền tối thì
 * cần Maps Embed API có khoá + map style, ghi sẵn `googleMapsFtid` trong
 * restaurant-info.json để lúc đó ghim đúng hồ sơ quán.
 */
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { addressLines, hasMap, restaurant } from "@/data/restaurant";

/** Bắt khách bấm một lần trước khi nạp Google. Xem khối chú thích trên. */
const BAT_BUOC_DONG_Y = true;

function directionsHref(): string {
  if (restaurant.googleMapsPlaceUrl) return restaurant.googleMapsPlaceUrl;
  const a = restaurant.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${a.street}, ${a.postalCode} ${a.city}`
  )}`;
}

export function MapBlock({
  title,
  routeLabel,
  loadLabel,
  privacyNote,
}: {
  /** Tiêu đề cho máy đọc màn hình — mẫu không in tiêu đề cho khối này. */
  title: string;
  routeLabel: string;
  /** Nhãn nút nạp bản đồ, ví dụ "Karte laden". */
  loadLabel: string;
  /** Một dòng nói rõ bấm vào là nối sang Google. */
  privacyNote: string;
}) {
  const [daNap, setDaNap] = useState(!BAT_BUOC_DONG_Y);

  /* Chưa có link thì giữ nguyên khối tĩnh cũ: địa chỉ + nút chỉ đường. */
  if (!hasMap()) return <KhoiTinh title={title} routeLabel={routeLabel} />;

  return (
    <section className="sora-card relative isolate overflow-hidden">
      <h2 className="sr-only">{title}</h2>

      {/* Tỉ lệ đo trên mẫu: khối bản đồ 860x234 trong khung 1672 -> 3,67:1.
          Dưới 768px khung hẹp lại, 3,67:1 thành một dải mỏng không đọc được
          tên đường, nên khổ điện thoại nới về 16:10. */}
      <div className="relative aspect-[16/10] w-full md:aspect-[3.67/1]">
        {daNap ? (
          <iframe
            src={restaurant.googleMapsUrl ?? ""}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setDaNap(true)}
            className="group absolute inset-0 flex size-full flex-col items-center justify-center gap-3 bg-elevated px-6 text-center transition-colors hover:bg-elevated/70"
          >
            <span className="grid size-14 place-items-center rounded-full border border-gold/45 bg-bg text-gold transition-colors group-hover:border-gold">
              <Icon name="map-pin" size={26} />
            </span>
            <span className="text-[16px] font-semibold tracking-[.04em] text-gold-bright uppercase">
              {loadLabel}
            </span>
            <span className="max-w-[46ch] text-[13px] leading-snug text-muted">
              {privacyNote}
            </span>
          </button>
        )}
      </div>

      {/* Dải địa chỉ + nút chỉ đường: mẫu in thẻ địa chỉ ĐÈ LÊN bản đồ, nhưng
          đè lên iframe thì che mất nút +/− và chặn kéo bản đồ. Đặt thành dải
          riêng ngay dưới, vẫn đủ thông tin mà không phá thao tác. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/25 px-5 py-4">
        <address className="space-y-0.5 text-[15px] leading-snug not-italic text-text">
          {addressLines().map((line) => (
            <p key={line}>{line}</p>
          ))}
        </address>
        <a
          href={directionsHref()}
          target="_blank"
          rel="noreferrer"
          className="sora-btn-ghost"
        >
          <Icon name="map-pin" size={16} />
          {routeLabel}
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </section>
  );
}

/** Bản chờ link — giữ lại phòng khi `googleMapsUrl` bị gỡ về null. */
function KhoiTinh({
  title,
  routeLabel,
}: {
  title: string;
  routeLabel: string;
}) {
  return (
    <section className="sora-card relative isolate flex min-h-[230px] flex-col items-center justify-center gap-4 overflow-hidden p-6 text-center">
      <h2 className="sr-only">{title}</h2>
      <span className="grid size-14 place-items-center rounded-full border border-gold/45 bg-bg text-gold">
        <Icon name="map-pin" size={26} />
      </span>
      <address className="space-y-0.5 text-[16px] leading-snug not-italic text-text">
        {addressLines().map((line) => (
          <p key={line}>{line}</p>
        ))}
      </address>
      <a
        href={directionsHref()}
        target="_blank"
        rel="noreferrer"
        className="sora-btn-ghost"
      >
        <Icon name="map-pin" size={16} />
        {routeLabel}
        <Icon name="arrow-right" size={16} />
      </a>
    </section>
  );
}
