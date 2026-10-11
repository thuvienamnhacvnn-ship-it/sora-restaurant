"use client";

/*
 * Lightbox ảnh — `<dialog>` thật, không tự dựng lại modal.
 * Lý do: `showModal()` cho sẵn bẫy focus, Esc đóng, và `inert` phần nền —
 * ba thứ KIT bắt buộc (điều khiển được bằng bàn phím) mà tự viết hay sai.
 *
 * Crossfade (KIT): giữ ảnh cũ ở DOM thêm một nhịp rồi mới gỡ, hai lớp chồng
 * nhau đổi opacity. KHÔNG phủ màu lên ảnh — nền tối là nền của dialog, nằm
 * DƯỚI ảnh, không đè lên.
 *
 * Mọi chuyển động tự tắt theo khối `prefers-reduced-motion` trong globals.css.
 */

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/data/gallery";

export type LightboxStrings = {
  close: string;
  prev: string;
  next: string;
};

export function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
  strings,
}: {
  photos: Photo[];
  /** `null` = đóng. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  strings: LightboxStrings;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const go = useCallback(
    (step: number) => {
      if (index === null || photos.length === 0) return;
      onIndex((index + step + photos.length) % photos.length);
    },
    [index, photos.length, onIndex]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = index === null ? null : photos[index];

  return (
    <dialog
      ref={ref}
      aria-label={current?.alt ?? ""}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Bấm ra ngoài khung ảnh thì đóng.
        if (e.target === ref.current) onClose();
      }}
      className="m-0 h-screen max-h-none w-screen max-w-none bg-[rgba(9,8,6,.95)] p-0 text-text backdrop:bg-[rgba(9,8,6,.6)]"
    >
      {current && (
        <div className="relative flex h-full w-full flex-col">
          <div className="relative min-h-0 flex-1" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}>
            {photos.map((p, i) => {
              // Chỉ gắn ảnh kề bên: đủ để crossfade mà không tải cả bộ.
              const near =
                index !== null &&
                (Math.abs(i - index) <= 1 ||
                  Math.abs(i - index) === photos.length - 1);
              if (!near) return null;
              return (
                /*
                 * KHÔNG KÉO ẢNH QUÁ CỠ GỐC. Hộp bọc bị chặn ở đúng
                 * `width × height` của tệp và căn giữa (`inset-0 m-auto`);
                 * ảnh `contain` trong hộp đó. Ảnh món gốc chỉ 560×420 — để
                 * `fill` trọn màn như trước là phóng 2–3 lần, vỡ hạt.
                 */
                <div
                  key={p.id}
                  className="absolute inset-0 m-auto transition-opacity duration-300 ease-[var(--ease-sora)]"
                  style={{
                    maxWidth: p.width,
                    maxHeight: p.height,
                    opacity: i === index ? 1 : 0,
                  }}
                  aria-hidden={i === index ? undefined : true}
                >
                  <Image
                    src={p.src}
                    alt={i === index ? p.alt : ""}
                    fill
                    sizes={`(max-width: ${p.width}px) 100vw, ${p.width}px`}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              );
            })}
          </div>

          <p className="shrink-0 px-5 pt-3 pb-5 text-center text-[14px] text-muted">
            {current.alt}
            <span className="ml-3 text-[13px] text-muted/60">
              {(index ?? 0) + 1} / {photos.length}
            </span>
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label={strings.close}
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-[var(--radius-btn)] border border-gold/45 bg-[rgba(9,8,6,.9)] text-gold-bright transition-colors hover:border-gold/80"
          >
            <Icon name="x" size={20} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={strings.prev}
                className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-[var(--radius-btn)] border border-gold/45 bg-[rgba(9,8,6,.9)] text-gold-bright transition-colors hover:border-gold/80"
              >
                <Icon name="chevron-left" size={20} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={strings.next}
                className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-[var(--radius-btn)] border border-gold/45 bg-[rgba(9,8,6,.9)] text-gold-bright transition-colors hover:border-gold/80"
              >
                <Icon name="chevron-right" size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
