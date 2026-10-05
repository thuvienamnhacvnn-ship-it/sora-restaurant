"use client";

/*
 * Một ô ảnh trong lưới masonry.
 *
 * Ảnh gốc là ảnh DỌC 1536×2048 của chính quán. Ô masonry phần lớn là khung
 * ngang, nên ảnh bị CẮT (`object-fit: cover`) chứ tuyệt đối không kéo giãn.
 * `object-position: center 42%` giữ phần giữa-trên của khung hình — chỗ có
 * trần hoa anh đào và dãy bàn, tức phần nhận ra không gian.
 *
 * Hover: phóng 2% (KIT "hover pan max 2%"), không dịch chuyển, không glow,
 * không phủ màu. Nút kính lúp có nền tròn riêng ở góc dưới-phải.
 */

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/data/gallery";

export function PhotoTile({
  photo,
  onOpen,
  zoomLabel,
  className = "",
  sizes,
  priority = false,
}: {
  photo: Photo;
  onOpen: () => void;
  zoomLabel: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${zoomLabel}: ${photo.alt}`}
      className={`group relative block cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-elevated transition-colors hover:border-gold/80 ${className}`}
    >
      <Image
        src={photo.thumb}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="transition-transform duration-300 ease-[var(--ease-sora)] group-hover:scale-[1.02]"
        style={{ objectFit: "cover", objectPosition: "center 42%" }}
      />
      <span
        aria-hidden="true"
        className="absolute right-2.5 bottom-2.5 grid size-[29px] place-items-center rounded-full border border-gold/45 bg-[rgba(9,8,6,.7)] text-gold-bright transition-colors group-hover:border-gold/80"
      >
        <Icon name="zoom-in" size={15} />
      </span>
    </button>
  );
}
