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

  /*
   * Chưa có tệp thật thì KHÔNG vẽ gì. Sếp 05/10: "xóa cả tên món ăn và cái
   * vòng tròn trên home banner đi" — banner phải sạch, không còn chỗ giữ chỗ
   * nào. Trước đây nhánh này vẽ vòng enso vàng; nay bỏ hẳn.
   * Chỗ gọi cũng phải hỏi `coVatThe360()` trước, không thì khối bọc rỗng vẫn
   * chừa khoảng trống.
   */
  if (!webm && !poster) return null;

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
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster!} alt={label} className="relative size-full object-contain" />
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
      {/*
       * Banner trang chủ đã dọn sạch theo hai lệnh của Sếp ngày 05/10:
       *  - "bỏ mấy cái ký hiệu 360độ"  -> gỡ huy hiệu `⊕ 360°` và dòng giữ
       *    chỗ "360°-Objekt folgt";
       *  - "xóa cả tên món ăn và cái vòng tròn" -> gỡ nốt nhãn tên món nằm
       *    dưới mỗi vật thể và vòng enso vàng giữ chỗ.
       * Nay dưới vật thể KHÔNG còn chữ nào. `label` vẫn nhận vào nhưng chỉ
       * dùng làm `alt` cho ảnh poster — máy đọc màn hình còn biết đó là món
       * gì, mắt thường không thấy chữ.
       *
       * Ba chuỗi `home.stage.badge` / `home.stage.placeholder` và các
       * `home.stage.*` nhãn món vẫn nằm trong i18n (file đó agent khác giữ)
       * nhưng chỉ còn `labelKey` được dùng, và chỉ cho `alt`. Đừng thấy chuỗi
       * rỗi mà gắn lại lên banner.
       *
       * Cơ chế video giữ nguyên: có tệp WebM là chạy, không phải dựng lại.
       */}
    </div>
  );
}
