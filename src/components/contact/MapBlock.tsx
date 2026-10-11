"use client";

/*
 * Khối bản đồ — mẫu `mockups/06_kontakt.png`, cột trái dưới ba thẻ thông tin.
 *
 * Sếp 07/10/2026: «đưa map vào Kontakt» + link hồ sơ Google Maps của quán.
 *
 * ---- BẢN ĐỒ PHẢI THẤY NGAY, NHƯNG KHÔNG GỌI GOOGLE KHI TẢI TRANG ----
 * Quán ở Đức, trang có Impressum + Datenschutz. Nhúng thẳng iframe Google Maps
 * là ngay khi khách MỞ trang, trình duyệt đã gửi IP + User-Agent sang Google và
 * Google đặt cookie — tức là xử lý dữ liệu cá nhân TRƯỚC khi khách đồng ý.
 * Toà Đức đã phạt chuyện này (LG München I, 20.01.2022, 3 O 17493/20 — vụ
 * Google Fonts, cùng một lập luận). Nên hai tầng:
 *   1. Mở trang: ẢNH BẢN ĐỒ TĨNH nằm sẵn trong dự án
 *      (`public/anh/kontakt-karte-z17.webp`, dựng một lần từ ô OpenStreetMap bằng
 *      `scripts/lam-ban-do-tinh.mjs`) + ghim của mình ở đúng toạ độ quán.
 *      Không một byte nào chạy ra máy chủ ngoài.
 *   2. Bấm "Interaktive Karte laden": mới gắn iframe Google của ĐÚNG hồ sơ
 *      quán (`cid`, xem `maps.ts`).
 * Bản 05/10 chỉ có tầng 2 trên một hộp trống — Sếp không thấy bản đồ đâu.
 *
 * Khi nào bỏ bước bấm: chỉ khi trang có banner đồng ý cookie thật và
 * Datenschutz có mục Google Maps. Lúc đó đổi `BAT_BUOC_DONG_Y` thành false.
 *
 * ---- LUẬT CỦA ẢNH TĨNH ----
 * - Tâm ảnh = toạ độ quán (script bảo đảm), ảnh `cover` căn giữa -> ghim đặt
 *   ở 50% / 50% khung là đúng chỗ ở MỌI cỡ khung. Đổi `objectPosition` là
 *   ghim lệch khỏi quán.
 * - KHÔNG `filter`, KHÔNG lớp màu lên ảnh bản đồ để ép về tông tối (luật Sếp:
 *   cấm phủ màu; và bôi tối thì tên phố đổi màu sai). Nhãn, nút, dòng ghi
 *   công đều có nền đặc RIÊNG, nằm ở mép khung.
 * - Dòng "© OpenStreetMap-Mitwirkende" là BẮT BUỘC theo giấy phép ODbL —
 *   đừng gỡ khi dọn giao diện.
 */
import { SoRaLogo } from "@/components/shell/SoRaLogo";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { KhungThongBao } from "@/components/ui/KhungThongBao";
import { addressLines, hasMap, restaurant } from "@/data/restaurant";
import { directionsHref, embedSrc } from "./maps";

/** Bắt khách bấm một lần trước khi nạp Google. Xem khối chú thích trên. */
const BAT_BUOC_DONG_Y = true;

export function MapBlock({
  title,
  loadLabel,
  privacyNote,
  openLabel,
  attribution,
  className = "",
}: {
  /** Tiêu đề nằm trong khung, phía trên ảnh bản đồ. */
  title: string;
  /** Nhãn nút nạp bản đồ tương tác. */
  loadLabel: string;
  /** Một dòng nói rõ bấm vào là nối sang Google. */
  privacyNote: string;
  /** Nhãn link mở Google Maps ở tab mới. */
  openLabel: string;
  /** Dòng ghi công OpenStreetMap (bắt buộc). */
  attribution: string;
  className?: string;
}) {
  const [daNap, setDaNap] = useState(!BAT_BUOC_DONG_Y);
  const coBanDo = hasMap();
  /* Ảnh tĩnh chỉ đúng khi dữ liệu còn toạ độ: script dựng ảnh quanh `toaDo`. */
  const coAnhTinh = restaurant.toaDo !== null;

  return (
    <section
      /* `min-h` giữ dáng thẻ bản đồ của mẫu (856×208 @mẫu); ở `xl` thẻ còn
         `flex-1` (do trang truyền vào) để đáy bản đồ ngang đáy thẻ bên phải. */
      className={`sora-card relative isolate flex min-h-[340px] flex-col overflow-hidden md:min-h-[260px] ${className}`}
      data-ban-do={daNap ? "google" : "tinh"}
    >
      <div data-ban-do-dau="" className="flex items-center gap-2.5 border-b border-gold/25 px-4 py-3 text-gold">
        <Icon name="map-pin" size={18} className="shrink-0" />
        <h2 className="min-w-0 font-serif text-[20px] leading-snug text-ivory [overflow-wrap:anywhere]">{title}</h2>
      </div>

      {daNap && coBanDo ? (
        <iframe
          src={embedSrc()}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="min-h-[340px] w-full flex-1 border-0 md:min-h-[260px]"
        />
      ) : (
        <>
          {/* Ảnh bản đồ để TRẦN: trên ảnh chỉ có ghim và dòng ghi công. Bản
              đầu đặt nhãn địa chỉ + bảng nút đè lên ảnh — khung chỉ 646×258
              nên chúng che gần hết bản đồ và che luôn cái ghim. Nút xuống dải
              riêng bên dưới; nhãn địa chỉ thu còn MỘT dòng ở góc trên-trái.
              Từ `md` khung chỉ cao 200px nên đỉnh ghim (y≈39) cao hơn đáy nhãn
              (y≈44) — nhãn vì thế dừng ở 42% bề ngang, ghim bắt đầu từ ~46%.
              Từ `md` nhãn được XUỐNG DÒNG chứ không cắt ba chấm (11/10): ở
              1024–1280 cột bản đồ hẹp, 42% không đủ cho cả tên + phố.
              Điện thoại khung cao 240px: đỉnh ghim y≈59, nhãn chạy trọn hàng. */}
          <div className="relative min-h-[240px] flex-1 md:min-h-[200px]" data-anh-ban-do="">
            {coAnhTinh && (
              /*
               * <img> thường + `srcSet` theo MẬT ĐỘ, không `next/image`:
               * hai tệp là hai MỨC ZOOM của cùng một vùng đất (z17 cho màn
               * thường, z18 cho màn 2x) chứ không phải một ảnh thu nhỏ — chữ
               * tên phố nằm sẵn trong ô ảnh, thu z18 xuống cho màn thường là
               * chữ còn ~5px. `next/image` chỉ biết thu một nguồn theo bề
               * ngang nên không diễn đạt được lựa chọn này.
               */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/anh/kontakt-karte-z17.webp"
                srcSet="/anh/kontakt-karte-z17.webp 1x, /anh/kontakt-karte-z18.webp 2x"
                alt={`${title}: ${addressLines().join(", ")}`}
                width={1000}
                height={460}
                decoding="async"
                className="absolute inset-0 size-full object-cover object-center"
              />
            )}

            {/* Ghim: MŨI nhọn chạm đúng tâm khung (= toạ độ quán). */}
            <span
              aria-hidden="true"
              data-ghim=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pb-[9px]"
            >
              <span className="relative grid size-[52px] place-items-center rounded-full border-2 border-red bg-bg">
                <SoRaLogo size={42} className="rounded-full" />
                <span className="absolute -bottom-[9px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-red bg-bg" />
              </span>
            </span>

            {/* Nhãn địa chỉ THẬT, một dòng, nền đặc riêng. */}
            <address className="absolute top-3 left-3 max-w-[calc(100%-24px)] max-md:truncate md:max-w-[42%] rounded-[var(--radius-btn)] border border-gold/60 bg-bg px-3 py-1.5 text-[14px] leading-snug not-italic text-text">
              <span className="font-serif text-gold-bright">{restaurant.name}</span>
              {" · "}
              {restaurant.address.street}
            </address>

            {/* Ghi công OpenStreetMap — BẮT BUỘC (ODbL). */}
            {coAnhTinh && (
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                /* 24px cao = sàn WCAG 2.5.8; KHÔNG nâng lên 44px như nút thường —
                   dòng ghi công to thế là che mất một dải bản đồ. */
                className="absolute right-0 bottom-0 inline-flex min-h-6 items-center rounded-tl-[var(--radius-btn)] bg-bg px-2 text-[12px] leading-tight text-text hover:underline"
              >
                {attribution}
              </a>
            )}
          </div>

          {/* Dải điều khiển, nền riêng DƯỚI ảnh. */}
          <div data-ban-do-nut="" className="border-t border-gold/25 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {coBanDo && (
                <button
                  type="button"
                  onClick={() => setDaNap(true)}
                  className="sora-btn-gold h-11 flex-1 justify-center text-[13px]"
                >
                  <Icon name="map-pin" size={16} />
                  {loadLabel}
                </button>
              )}
              <a
                href={directionsHref()}
                target="_blank"
                rel="noreferrer"
                className="sora-btn-ghost h-11 flex-1 justify-center px-3 text-[13px]"
              >
                {openLabel}
                <Icon name="arrow-right" size={15} />
              </a>
            </div>
            {coBanDo && (
              <KhungThongBao className="mt-2"><p>{privacyNote}</p></KhungThongBao>
            )}
          </div>
        </>
      )}

      {/* Bản đồ Google đã nạp: vẫn giữ một lối mở hồ sơ quán ở tab mới. */}
      {daNap && coBanDo && (
        <div className="flex justify-end border-t border-gold/25 px-3 py-2">
          <a
            href={directionsHref()}
            target="_blank"
            rel="noreferrer"
            className="sora-btn-ghost h-11 px-3 text-[13px]"
          >
            {openLabel}
            <Icon name="arrow-right" size={15} />
          </a>
        </div>
      )}
    </section>
  );
}
