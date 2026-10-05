"use client";

/*
 * Galerie — bộ lọc + lưới masonry lệch + lightbox.
 *
 * Gốc lấy từ `E:\Tools\ui-library\3-component\react-bits\src\content\Components\
 * Masonry\Masonry.jsx` (MIT + Commons Clause). Hai thứ của nó PHẢI bỏ:
 *   - `hoverScale: 0.95` → nó THU NHỎ ảnh khi rê chuột, ngược luật KIT
 *     ("hover pan max 2%", tức phóng lên). Ở đây dùng scale 1.02.
 *   - `colorShiftOnHover` → đổ gradient hồng/xanh lên ảnh, vi phạm cả
 *     "never gradient rainbow" của KIT lẫn luật "không phủ màu lên ảnh" của Sếp.
 * Phần còn lại (đo cột bằng JS, animate GSAP, absolute positioning) cũng bỏ nốt:
 * lưới ở đây dựng bằng CSS Grid nên chạy ngay ở lần render đầu, không nhảy
 * layout, không cần thư viện, và số đo khớp thẳng với spec §7.
 *
 * Bố cục ở khổ ≥1200 bám đúng mockup 04_galerie.png:
 *   hàng 1  [video 617] [cột 232: 2 ảnh xếp dọc] [ảnh 317 cao hết hàng]
 *   hàng 2  các ảnh còn lại, bề ngang CỐ Ý LỆCH NHAU (KIT: "asymmetrical")
 * Dưới 1200 thì lưới đều và ảnh giữ tỉ lệ dọc 3:4 — không cắt vô cớ.
 *
 * Mockup chỉ vẽ 5 bộ lọc; KIT bắt 6 (thiếu `Video`) → spec §11-I. Đã thêm.
 */

import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Lightbox } from "./Lightbox";
import { PhotoTile } from "./PhotoTile";
import { VideoTile } from "./VideoTile";
import { GALLERY_FILTERS, photosFor, type GalleryFilter } from "@/data/gallery";

export type GalleryStrings = {
  filters: Record<GalleryFilter, string>;
  filterLabel: string;
  videoTitle: string;
  videoCaption: string;
  play: string;
  zoom: string;
  close: string;
  prev: string;
  next: string;
  noFood: string;
};

const FILTER_ICON: Record<GalleryFilter, IconName> = {
  all: "images",
  restaurant: "home",
  bar: "sparkles",
  food: "utensils",
  details: "star",
  video: "play",
};

/* Bề ngang các ô trong một hàng masonry, đo từ mockup (spec §7):
   231 / 199 / 208 / 214 / 299. Lệch nhau là CỐ Ý. Hàng ít ảnh hơn thì bỏ bớt
   từ giữa ra, luôn giữ ô rộng nhất ở cuối hàng như mẫu. */
const ROW_WIDTHS: Record<number, number[]> = {
  1: [1],
  2: [231, 299],
  3: [231, 208, 299],
  4: [231, 208, 214, 299],
  5: [231, 199, 208, 214, 299],
};

/** `minmax(0,...)` là bắt buộc — `1fr` trần làm tràn ngang (luật của máy này). */
function cols(widths: number[]): string {
  return widths.map((w) => `minmax(0,${w}fr)`).join(" ");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function GalleryBrowser({ strings }: { strings: GalleryStrings }) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const list = useMemo(() => photosFor(filter), [filter]);
  const showVideo = filter === "all" || filter === "video";
  /* Mosaic đầy đủ chỉ dựng được khi có video + đủ 3 ảnh cho hàng 1. */
  const mosaic = filter === "all" && list.length >= 3;

  const bandOne = mosaic ? list.slice(0, 3) : [];
  const rest = mosaic ? list.slice(3) : list;

  return (
    <>
      {/* ---- Bộ lọc: 6 pill, cao 38px, bo 6px (KHÔNG pill tròn — §11-B) ---- */}
      <div
        role="group"
        aria-label={strings.filterLabel}
        className="-mx-[var(--page-pad)] flex gap-2.5 overflow-x-auto px-[var(--page-pad)] pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      >
        {GALLERY_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setFilter(f);
                setLightbox(null);
              }}
              className={`inline-flex h-[38px] shrink-0 items-center gap-2 rounded-[var(--radius-btn)] border px-4 text-[14px] whitespace-nowrap transition-colors ${
                active
                  ? "border-gold/65 bg-red text-white"
                  : "border-gold/45 bg-[#0e0a05] text-[#d9d8d2] hover:border-gold/80"
              }`}
            >
              <Icon
                name={FILTER_ICON[f]}
                size={17}
                className={active ? "text-white" : "text-gold"}
              />
              {strings.filters[f]}
            </button>
          );
        })}
      </div>

      {/* ---- Hàng 1: video lớn + 3 ảnh (chỉ khi lọc "Alle") ---- */}
      {mosaic && (
        <div
          className="mt-4 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:h-[clamp(250px,19.7vw,330px)] xl:grid-rows-2 xl:[grid-template-columns:var(--cols)]"
          style={
            {
              "--cols": cols([617, 232, 317]),
            } as React.CSSProperties
          }
        >
          <VideoTile
            title={strings.videoTitle}
            caption={strings.videoCaption}
            playLabel={strings.play}
            className="col-span-2 aspect-video md:col-span-3 xl:col-span-1 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:aspect-auto"
          />
          <PhotoTile
            photo={bandOne[0]}
            onOpen={() => setLightbox(0)}
            zoomLabel={strings.zoom}
            priority
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
            className="aspect-[3/4] md:aspect-[4/5] xl:col-start-2 xl:row-start-1 xl:aspect-auto"
          />
          <PhotoTile
            photo={bandOne[1]}
            onOpen={() => setLightbox(1)}
            zoomLabel={strings.zoom}
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
            className="aspect-[3/4] md:aspect-[4/5] xl:col-start-2 xl:row-start-2 xl:aspect-auto"
          />
          <PhotoTile
            photo={bandOne[2]}
            onOpen={() => setLightbox(2)}
            zoomLabel={strings.zoom}
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 27vw"
            className="aspect-[3/4] md:aspect-[4/5] xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:aspect-auto"
          />
        </div>
      )}

      {/* ---- Ô video đứng một mình khi lọc "Video" ---- */}
      {filter === "video" && (
        <div className="mt-4">
          <VideoTile
            title={strings.videoTitle}
            caption={strings.videoCaption}
            playLabel={strings.play}
            className="aspect-video w-full xl:aspect-[1183/440]"
          />
        </div>
      )}

      {/* ---- Các hàng ảnh còn lại ---- */}
      {chunk(rest, 4).map((row, rowIndex) => {
        const offset = (mosaic ? 3 : 0) + rowIndex * 4;
        return (
          <div
            key={`row-${rowIndex}`}
            className="mt-2 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:h-[clamp(130px,9.8vw,176px)] xl:[grid-template-columns:var(--cols)]"
            style={
              {
                "--cols": cols(ROW_WIDTHS[row.length] ?? ROW_WIDTHS[4]),
              } as React.CSSProperties
            }
          >
            {row.map((p, i) => (
              <PhotoTile
                key={p.id}
                photo={p}
                onOpen={() => setLightbox(offset + i)}
                zoomLabel={strings.zoom}
                sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 22vw"
                className="aspect-[3/4] md:aspect-[4/5] xl:aspect-auto"
              />
            ))}
          </div>
        );
      })}

      {/* Lọc "Speisen" chưa có ảnh món thật nào — nói thẳng, không mượn ảnh
          AI hay ảnh nội thất để lấp chỗ. */}
      {!showVideo && list.length === 0 && (
        <p className="sora-card mt-4 px-5 py-8 text-center text-[15px] text-muted">
          {strings.noFood}
        </p>
      )}

      <Lightbox
        photos={list}
        index={lightbox}
        onIndex={setLightbox}
        onClose={() => setLightbox(null)}
        strings={{
          close: strings.close,
          prev: strings.prev,
          next: strings.next,
        }}
      />
    </>
  );
}
