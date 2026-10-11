"use client";

/*
 * Galerie — bộ lọc + lưới ảnh + lightbox.
 *
 * LÀM LẠI 07/10 (spec `_w-agent/lam-lai/01_spec.md` mục D). Nguồn kho:
 * `flowbite/content/components/gallery.md` — ba kiểu trong một trang:
 *   "Featured image"            -> hàng 1: ô video lớn + ảnh
 *   "Gallery with tag filters"  -> hàng chip lọc + lưới đều khi đang lọc
 *   "Masonry grid"              -> hàng 2 bề ngang lệch nhau
 * Thuần CSS Grid, không JS đo cột (bản react-bits Masonry cần GSAP, thu nhỏ
 * ảnh khi rê chuột và đổ gradient lên ảnh — đều trái luật, đã loại từ trước).
 *
 * Bố cục "Alle" ở khổ ≥1200 bám mockup 04_galerie.png:
 *   hàng 1  [video 617] [cột 232: 2 ảnh xếp dọc] [ảnh 317 cao hết hàng]
 *   hàng 2  5 ô bề ngang CỐ Ý LỆCH NHAU (KIT: "asymmetrical")
 *   hàng 3  5 ô đều 4:3
 * CHIỀU CAO HÀNG THEO `aspect-ratio`, không px: bản cũ ghim
 * `clamp(250px,19.7vw,330px)` nên từ 1680px trở lên hàng đứng ở 330px trong
 * khi bề ngang cứ nở — ảnh dẹt dần.
 *
 * Bộ lọc nào KHÔNG có ảnh thì chip đó không hiện (bản cũ hiện chip rồi báo
 * "chưa có ảnh"). Mockup vẽ 5 bộ lọc; KIT bắt 6 (thêm `Video`) → spec §11-I.
 */

import { type ReactNode, useMemo, useState } from "react";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Lightbox } from "./Lightbox";
import { PhotoTile } from "./PhotoTile";
import { VideoTile } from "./VideoTile";
import {
  GALLERY_FILTERS,
  photos as anhQuan,
  type GalleryFilter,
  type Photo,
} from "@/data/gallery";

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

/* Bề ngang 5 ô hàng 2, đo từ mockup (spec §7): 231 / 199 / 208 / 214 / 299.
   Lệch nhau là CỐ Ý. */
const HANG_2 = [231, 199, 208, 214, 299];

/** `minmax(0,...)` là bắt buộc — `1fr` trần làm tràn ngang (luật của máy này). */
function cols(widths: number[]): string {
  return widths.map((w) => `minmax(0,${w}fr)`).join(" ");
}

/*
 * Thứ tự ảnh của lưới "Alle": 7 ảnh quán + 6 ảnh món đầu.
 *   0–2   hàng 1 (cạnh video): 3 ảnh quán
 *   3–7   hàng 2: quán · MÓN · quán · MÓN · quán
 *         — ảnh món 4:3 rơi vào hai ô hẹp 199/214 (tỉ lệ ô ~1,2–1,3:1) nên
 *           gần như không bị cắt; ảnh quán dọc vào ô rộng.
 *   8–12  hàng 3: 1 ảnh quán + 4 ảnh món, ô đều 4:3
 * Thiếu ảnh món (dữ liệu đổi) thì lưới chỉ ngắn lại, không thủng giữa chừng.
 */
function thuTuTatCa(mon: Photo[]): Photo[] {
  const q = anhQuan;
  const m = mon.slice(0, 6);
  return [q[0], q[1], q[2], q[3], m[0], q[4], m[1], q[5], q[6], ...m.slice(2)].filter(
    (p): p is Photo => Boolean(p)
  );
}

export function GalleryBrowser({
  strings,
  foodPhotos,
  hero,
}: {
  hero?: ReactNode;
  strings: GalleryStrings;
  /** Ảnh món thật, dựng phía server từ `components/gallery/food.ts`. */
  foodPhotos: Photo[];
}) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const tatCa = useMemo(() => thuTuTatCa(foodPhotos), [foodPhotos]);
  const list = useMemo(() => {
    if (filter === "all") return tatCa;
    if (filter === "video") return [];
    if (filter === "food") return foodPhotos;
    return anhQuan.filter((p) => p.tags.includes(filter));
  }, [filter, tatCa, foodPhotos]);

  /* Chip chỉ hiện khi bộ lọc có nội dung. `video` luôn có đúng một clip. */
  const boLoc = GALLERY_FILTERS.filter((f) => {
    if (f === "all" || f === "video") return true;
    if (f === "food") return foodPhotos.length > 0;
    return anhQuan.some((p) => p.tags.includes(f));
  });

  /* Khảm đầy đủ chỉ dựng được khi có video + đủ 3 ảnh cho hàng 1. */
  const mosaic = filter === "all" && list.length >= 3;
  const hang2 = mosaic ? list.slice(3, 8) : [];
  const hang3 = mosaic ? list.slice(8) : [];
  const laMon = (p: Photo) => p.tags.includes("food");

  return (
    <>
      <div className="relative isolate">
      {hero}
      {/* ---- Bộ lọc: chip cao 44px, bo 6px (KHÔNG pill tròn — §11-B) ---- */}
      <div
        role="group"
        aria-label={strings.filterLabel}
        className="relative z-30 flex gap-2 overflow-x-auto px-[var(--page-pad)] pt-[var(--sau-banner)] pb-1 md:flex-wrap md:overflow-visible md:justify-end xl:absolute xl:right-[calc(var(--page-pad)+var(--rail-lane))] xl:bottom-3 xl:max-w-[calc(100%-64px)] xl:px-0 xl:pt-0"
      >
        {boLoc.map((f) => {
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
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-btn)] border px-4 text-[15px] whitespace-nowrap transition-colors ${
                active
                  ? "border-gold-bright bg-red font-semibold text-white"
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

      </div>
      <SectionFrame sauHero className="!mt-3 pb-[var(--page-pad)]">
      {/* ---- Hàng 1: video lớn + 3 ảnh (chỉ khi lọc "Alle") ----
          `xl:aspect-[1166/330]` = đúng tỉ lệ hàng 1 của mẫu (x 273→1643 rộng
          ~1166 phần ảnh, cao 330). */}
      {mosaic && (
        <div
          className="mt-4 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:aspect-[1166/330] xl:grid-rows-[repeat(2,minmax(0,1fr))] xl:[grid-template-columns:var(--cols)]"
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
            photo={list[0]}
            onOpen={() => setLightbox(0)}
            zoomLabel={strings.zoom}
            priority
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
            className="aspect-[3/4] md:aspect-[4/5] xl:col-start-2 xl:row-start-1 xl:aspect-auto"
          />
          <PhotoTile
            photo={list[1]}
            onOpen={() => setLightbox(1)}
            zoomLabel={strings.zoom}
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
            className="aspect-[3/4] md:aspect-[4/5] xl:col-start-2 xl:row-start-2 xl:aspect-auto"
          />
          {/* Ô thứ BA trải hết bề ngang ở khổ điện thoại (`col-span-2`): 3 ảnh
              trên lưới 2 cột thì ảnh thứ ba đứng lẻ, để lại một ô trống. */}
          <PhotoTile
            photo={list[2]}
            onOpen={() => setLightbox(2)}
            zoomLabel={strings.zoom}
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 27vw"
            className="col-span-2 aspect-[16/10] md:col-span-1 md:aspect-[4/5] xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:aspect-auto"
          />
        </div>
      )}

      {/* ---- Hàng 2 (5 ô lệch) + hàng 3 (5 ô đều) của "Alle" ----
       *
       * Dưới `xl` hai hàng mang `display: contents` nên 10 ảnh chảy liên tục
       * trong MỘT lưới 2 cột (điện thoại) / 3 cột (768–1199), mọi ô 4:3 —
       * không có khái niệm "hàng" để mà thủng giữa chừng. Ô lẻ cuối lưới
       * trải hết hàng (`ô-cuối` bên dưới). Từ `xl` mỗi hàng là một lưới riêng.
       */}
      {mosaic && (hang2.length > 0 || hang3.length > 0) && (
        <div
          data-luoi-duoi=""
          className="mt-2 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:block"
        >
          <div
            className="contents xl:grid xl:aspect-[1151/175] xl:gap-2 xl:[grid-template-columns:var(--cols)]"
            style={
              {
                "--cols": cols(HANG_2.slice(0, Math.max(hang2.length, 1))),
              } as React.CSSProperties
            }
          >
            {hang2.map((p, i) => (
              <PhotoTile
                key={p.id}
                photo={p}
                onOpen={() => setLightbox(3 + i)}
                zoomLabel={strings.zoom}
                sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 22vw"
                position={laMon(p) ? "center" : undefined}
                className="aspect-[4/3] xl:aspect-auto"
              />
            ))}
          </div>
          {hang3.length > 0 && (
            <div className="contents xl:mt-2 xl:grid xl:gap-2 xl:[grid-template-columns:repeat(5,minmax(0,1fr))]">
              {hang3.map((p, i) => (
                <PhotoTile
                  key={p.id}
                  photo={p}
                  onOpen={() => setLightbox(8 + i)}
                  zoomLabel={strings.zoom}
                  sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 20vw"
                  position={laMon(p) ? "center" : undefined}
                  className={`aspect-[4/3] ${
                    i === hang3.length - 1 ? oCuoiTheoTong(hang2.length + hang3.length) : ""
                  }`}
                />
              ))}
            </div>
          )}
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

      {/* ---- Đang lọc: lưới đều (kho: flowbite "Gallery with tag filters") ----
       *
       * Số cột ở `xl` = min(số ảnh, 4) để 2–3 ảnh quán không để hở ô cuối
       * hàng; riêng ảnh món (16 tấm, gốc 560px) lên 5 cột từ 1536px để không
       * ô nào rộng quá ~330px — quá cỡ đó là ảnh vỡ ở màn thường.
       */}
      {!mosaic && list.length > 0 && (
        <div
          data-luoi-loc=""
          className={`mt-4 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] md:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:[grid-template-columns:repeat(var(--so-cot),minmax(0,1fr))] ${
            filter === "food" ? "2xl:[grid-template-columns:repeat(5,minmax(0,1fr))]" : ""
          }`}
          style={{ "--so-cot": Math.min(list.length, 4) } as React.CSSProperties}
        >
          {list.map((p, i) => (
            <PhotoTile
              key={p.id}
              photo={p}
              onOpen={() => setLightbox(i)}
              zoomLabel={strings.zoom}
              sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"
              position={laMon(p) ? "center" : undefined}
              className={
                laMon(p)
                  ? `aspect-[4/3] ${O_CUOI}`
                  : `aspect-[3/4] md:aspect-[4/5] xl:aspect-[4/3] ${O_CUOI}`
              }
            />
          ))}
        </div>
      )}

      {/* Lưới chót: bộ lọc rỗng vốn đã không có chip, nhưng nếu dữ liệu đổi
          giữa chừng thì nói thẳng chứ không để trang trắng. */}
      {filter !== "all" && filter !== "video" && list.length === 0 && (
        <p role="status" className="sora-card mt-4 px-5 py-8 text-center text-[15px] text-muted">
          {strings.noFood}
        </p>
      )}

      </SectionFrame>
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

/*
 * Ô LẺ CUỐI LƯỚI TRẢI HẾT HÀNG (chỉ dưới `xl`).
 *
 * Lưới 2 cột (<768) hoặc 3 cột (768–1199); số ảnh tuỳ bộ lọc nên không số cột
 * nào chia hết mọi trường hợp. `:last-child:nth-child(odd)` (2 cột) và
 * `:nth-child(3n+1)` (3 cột) chỉ khớp khi ô cuối đứng MỘT MÌNH trên hàng của
 * nó — lúc đó cho nó trải hết hàng và đổi sang tỉ lệ ngang, thành một ô toàn
 * cảnh khép lại lưới thay vì để hở 1–2 ô.
 *
 * Viết bằng biến thể Tailwind chứ không luật CSS riêng: luật trần thắng cả
 * `@layer utilities`, còn để trong layer thì thua `aspect-[…]` đứng cạnh.
 */
/*
 * Bản cho lưới "Alle": hàng 2 và hàng 3 là hai thẻ `display: contents` nên
 * `:nth-child` chỉ đếm trong TỪNG thẻ, không đếm được cả lưới -> tính bằng
 * tổng số ô rồi gắn class cho đúng ô cuối.
 */
function oCuoiTheoTong(tong: number): string {
  return [
    tong % 2 === 1 ? "max-md:col-span-2 max-md:aspect-[16/9]" : "",
    tong % 3 === 1 ? "md:max-xl:col-span-3 md:max-xl:aspect-[21/9]" : "",
  ].join(" ");
}

const O_CUOI =
  "max-md:[&:last-child:nth-child(odd)]:col-span-2 max-md:[&:last-child:nth-child(odd)]:aspect-[16/9] md:max-xl:[&:last-child:nth-child(3n+1)]:col-span-3 md:max-xl:[&:last-child:nth-child(3n+1)]:aspect-[21/9]";
