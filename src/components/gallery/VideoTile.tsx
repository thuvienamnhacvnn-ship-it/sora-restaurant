"use client";

/*
 * Ô video lớn của Galerie — clip đi dạo THẬT trong quán.
 *
 * Luật đã áp:
 *  - `preload="none"`: file 9,1 MB không được tải trước. Trước khi bấm chỉ có
 *    poster webp 100 KB. Thẻ <video> chỉ được gắn vào DOM sau cú bấm đầu tiên.
 *  - KHÔNG autoplay, KHÔNG tiếng tự phát (KIT). Có tiếng thì người xem tự bật.
 *  - Nút play tròn viền gold mảnh — không glow, không bóng đổ kiểu web 2.0.
 *  - Poster là ảnh, nút play nằm trên nền tròn riêng của nó, KHÔNG phủ lớp
 *    màu lên toàn bộ khung hình.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { video } from "@/data/gallery";

export function VideoTile({
  title,
  caption,
  playLabel,
  className = "",
}: {
  title: string;
  caption: string;
  playLabel: string;
  className?: string;
}) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <figure
      className={`relative overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-elevated ${className}`}
    >
      {started ? (
        <video
          ref={ref}
          src={video.src}
          poster={video.poster}
          controls
          autoPlay
          playsInline
          preload="none"
          className="absolute inset-0 size-full bg-bg object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="group absolute inset-0 size-full cursor-pointer"
          aria-label={`${playLabel}: ${title}`}
        >
          <Image
            src={video.poster}
            alt={video.alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 92vw, 52vw"
            className="transition-transform duration-300 ease-[var(--ease-sora)] group-hover:scale-[1.02]"
            style={{ objectFit: "cover", objectPosition: "center 45%" }}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 grid size-[65px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/60 bg-[rgba(9,8,6,.72)] text-gold-bright transition-colors group-hover:border-gold"
          >
            <Icon name="play" size={26} className="translate-x-[2px]" />
          </span>
        </button>
      )}

      {/*
       * Chú thích. Luật Sếp 05/10: chữ nằm trên ảnh thì CHỈ được một dải
       * chuyển sắc đen DÂNG TỪ CHÂN ẢNH LÊN — trong suốt ở trên, đậm dần
       * xuống dưới. Cấm thanh chữ nhật có cạnh thẳng đè lên khung hình.
       * Bản cũ là `bg-[rgba(9,8,6,.78)]` phẳng, cạnh trên cắt ngang khung
       * hình thành một vạch -> đổi thành gradient và kéo cao hơn (pt-10) để
       * dải đủ dài mà tan ra, thay vì đổi màu đột ngột.
       * Ẩn khi video chạy để không che thanh điều khiển.
       */}
      {!started && (
        <figcaption
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pt-10 pb-2.5"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(9,8,6,.92) 0%, rgba(9,8,6,.80) 34%, rgba(9,8,6,.45) 68%, rgba(9,8,6,0) 100%)",
          }}
        >
          <span className="min-w-0">
            <span className="block font-serif text-[18px] leading-tight text-ivory">
              {title}
            </span>
            <span className="mt-0.5 block font-sans text-[13px] leading-tight text-muted">
              {caption}
            </span>
          </span>
          <span className="shrink-0 font-sans text-[13px] text-muted tabular-nums">
            {video.durationLabel}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
