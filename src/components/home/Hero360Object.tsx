"use client";

/*
 * Bệ 360° trên hero trang chủ — theo KIT 06_360_WEBM/WEBM_360_IMPLEMENTATION.md.
 *
 * Luật đã cài sẵn, không phải làm lại khi có file:
 *  - chỉ tự chạy khi hero NẰM TRONG khung nhìn (IntersectionObserver)
 *  - nạp lần lượt theo `loadOrder`: sushi -> phở -> đồ uống
 *  - điện thoại chỉ `primary` được tự chạy, hai cái kia là poster tĩnh
 *  - tôn trọng `prefers-reduced-motion` và `Save-Data` -> poster
 *  - WebM alpha hỏng (trình duyệt không đọc được) -> tự rơi về poster
 *  - bóng dưới vật thể vẽ bằng CSS radial, KHÔNG nướng vào video
 *
 * Chưa có file: `webm` và `poster` đều null -> vẽ bệ giữ chỗ (vòng enso vàng).
 * Xem src/data/hero-objects.ts.
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  webm: string | null;
  poster: string | null;
  primary: boolean;
  /** 0,1,2 — thứ tự nạp video, mỗi bậc chờ thêm 700ms. */
  loadOrder: number;
};

export function Hero360Object({
  label,
  webm,
  poster,
  primary,
  loadOrder,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mayPlay, setMayPlay] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!webm) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduced || saveData || (isMobile && !primary)) return;

    const el = wrapRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setMayPlay(true), loadOrder * 700);
        } else {
          clearTimeout(timer);
          setMayPlay(false);
          videoRef.current?.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [webm, primary, loadOrder]);

  const showVideo = Boolean(webm) && mayPlay && !videoFailed;

  return (
    /* `data-be-360`: mốc neo cho bài kiểm, không có tác dụng gì về hiển thị.
       Cần vì khi chưa có tệp WebM thì component không sinh thẻ <video> nào,
       nên bài kiểm không có gì để tìm và sẽ "đạt" một cách rỗng. */
    <div ref={wrapRef} data-be-360 className="flex min-w-0 flex-1 flex-col items-center">
      <div className="relative aspect-square w-full max-w-[168px]">
        {/* Quầng nền rất nhẹ cho vật thể tách khỏi ảnh hero.
            Bản cũ dùng `rgba(9,8,6,.92)` -> ba vết mực đen chình ình trên
            banner, Sếp bác. Giờ chỉ còn một hơi tối, nhìn xuyên thấy ảnh. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 48%, rgba(9,8,6,.38) 0%, rgba(9,8,6,.18) 50%, rgba(9,8,6,0) 70%)",
          }}
        />
        {showVideo ? (
          <video
            ref={videoRef}
            src={webm!}
            poster={poster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVideoFailed(true)}
            className="relative size-full object-contain"
          />
        ) : poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={label} className="relative size-full object-contain" />
        ) : (
          <Placeholder />
        )}

        {/* Bóng toả dưới vật thể — CSS, chỉnh được theo từng khổ màn hình */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-[-6px] h-5 rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,.42) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
      </div>

      {/*
        Nhãn nằm trên ảnh banner -> cho nó NỀN RIÊNG như huy hiệu 360° bên
        dưới. Spec §0 cho phép: thẻ/nút có nền riêng đặt trên ảnh KHÔNG phải
        lớp phủ. Không có nền thì chữ trắng trên đèn vàng chỉ đạt 1,6:1.
      */}
      <p className="mt-3 rounded-[4px] bg-bg/85 px-2 py-0.5 text-center text-[12px] leading-tight font-semibold tracking-[.08em] text-white uppercase backdrop-blur-[2px]">
        {label}
      </p>
      {/*
       * Sếp 05/10/2026: "bỏ mấy cái ký hiệu 360độ trên banner home đi".
       * Đã gỡ HAI thứ in chữ 360° đè lên banner:
       *  - huy hiệu `⊕ 360°` từng nằm ngay dưới nhãn món;
       *  - dòng giữ chỗ "360°-Objekt folgt" trong vòng enso.
       * Hai chuỗi `home.stage.badge` / `home.stage.placeholder` vẫn còn trong
       * i18n (file đó agent khác giữ) nhưng KHÔNG còn chỗ nào gọi — đừng thấy
       * chuỗi rỗi mà gắn lại.
       * Cơ chế video giữ nguyên: có WebM là chạy, không phải dựng lại.
       */}
    </div>
  );
}

/*
 * Bệ giữ chỗ: chỉ còn vòng enso vàng của KIT. Trước đây giữa vòng có dòng
 * "360°-Objekt folgt" — Sếp đã bác (xem chú thích trên). Không thay bằng ảnh
 * món giả: ảnh banner mới đã vẽ sẵn ba bệ tròn ở đúng chỗ này.
 */
function Placeholder() {
  return (
    <div className="grid size-full place-items-center">
      <div
        className="absolute inset-[8%] bg-contain bg-center bg-no-repeat opacity-35"
        style={{ backgroundImage: "url(/decor/enso_gold.svg)" }}
        aria-hidden="true"
      />
    </div>
  );
}
