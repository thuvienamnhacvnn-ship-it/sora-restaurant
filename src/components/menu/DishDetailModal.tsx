"use client";

/*
 * Modal chi tiết món. Chỉ hiện trường CÓ THẬT trong dataset:
 * mô tả, biến thể (Tofu/Gà/Tôm…), cỡ, mã dị ứng, chế độ ăn, độ cay.
 * Không sao đánh giá, không nút giỏ hàng (`onlineOrdering: false`).
 *
 * Mã dị ứng PHẢI được giải nghĩa — hiện trần `A1,B,C,D,F,I,6,10` thì khách
 * không hiểu gì. Bảng chú giải chép nguyên văn từ trang `002_obj12` của thực
 * đơn in, xem `src/data/allergens.ts`.
 *
 * `note` trong dataset là GHI CHÚ NỘI BỘ — cấm hiện cho khách, không render.
 */

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { MasterChefTrigger } from "@/components/chef/MasterChef";
import {
  displayPrice,
  formatPrice,
  itemDescription,
  itemName,
  type MenuItem,
} from "@/data/menu";
import { explainAllergens } from "@/data/allergens";
import { pick, type Locale } from "@/lib/i18n";
import type { MenuStrings } from "./MenuBrowser";

export function DishDetailModal({
  item,
  locale,
  strings,
  onClose,
}: {
  item: MenuItem;
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const price = displayPrice(item, locale);

  const codes = explainAllergens(item.allergens, locale);
  const allergens = codes.filter((c) => c.kind === "allergen" || c.kind === "unknown");
  const additives = codes.filter((c) => c.kind === "additive");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label={strings.detail.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sora-card relative max-h-[86vh] w-full max-w-[640px] overflow-y-auto p-5 shadow-card"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted/70">
              {item.subcategory} · {strings.detail.title}
            </p>
            <h2
              id={titleId}
              lang="de"
              className="mt-0.5 font-serif text-[24px] leading-snug break-words text-ivory"
            >
              <span className="mr-2 text-[16px] text-muted/60">{item.nr}</span>
              {itemName(item, locale)}
            </h2>
          </div>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label={strings.detail.close}
            className="grid size-9 shrink-0 place-items-center rounded-[6px] border border-gold/45 text-muted hover:text-gold"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Ảnh lớn — chưa có ảnh món nào, để khung rỗng nói rõ là chưa có */}
        {item.image ? (
          <div className="relative mt-4 h-[220px] overflow-hidden rounded-[6px] border border-gold/20">
            <Image
              src={item.image}
              alt={itemName(item, locale)}
              fill
              sizes="640px"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="mt-4 grid h-[120px] place-items-center gap-1 rounded-[6px] border border-gold/20 bg-elevated text-gold/25">
            <Icon name="utensils" size={34} />
            <span className="text-[11px] text-muted/60">
              {strings.detail.noImage}
            </span>
          </div>
        )}

        {itemDescription(item, locale) && (
          <p className="mt-4 text-[15px] leading-relaxed text-text">
            {itemDescription(item, locale)}
          </p>
        )}

        <p className="mt-3 text-[20px] font-semibold text-gold-bright">
          {price.onRequest ? (
            <span className="text-[16px] italic">{strings.priceOnRequest}</span>
          ) : (
            <>
              {price.from ? "ab " : ""}
              {price.text}
            </>
          )}
        </p>

        {item.variants && item.variants.length > 0 && (
          <div className="mt-4">
            <p className="sora-eyebrow text-[11px]">{strings.detail.variants}</p>
            <ul className="mt-2 divide-y divide-gold/15">
              {item.variants.map((v) => (
                <li
                  key={v.code}
                  className="flex items-center gap-3 py-1.5 text-[14px]"
                >
                  <span className="w-5 shrink-0 text-muted/70">{v.code}</span>
                  <span className="min-w-0 flex-1 text-text">
                    {pick(v.name, locale)}
                    {v.allergens && v.allergens.length > 0 && (
                      <sup className="ml-1 text-[10px] text-muted/70">
                        {v.allergens.join(",")}
                      </sup>
                    )}
                  </span>
                  {typeof v.price === "number" && (
                    <span className="shrink-0 text-gold-bright">
                      {formatPrice(v.price, locale)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div className="mt-4">
            <p className="sora-eyebrow text-[11px]">{strings.detail.sizes}</p>
            <ul className="mt-2 divide-y divide-gold/15">
              {item.sizes.map((s) => (
                <li
                  key={s.label}
                  className="flex items-center justify-between py-1.5 text-[14px]"
                >
                  <span className="text-text">{s.label}</span>
                  <span className="text-gold-bright">
                    {formatPrice(s.price, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {item.dietary.includes("vegetarian") && (
            <Chip icon="leaf" tone="green" text={strings.dietary.vegetarian} />
          )}
          {item.dietary.includes("vegan") && (
            <Chip icon="leaf" tone="green" text={strings.dietary.vegan} />
          )}
          {item.dietary.includes("glutenfree") && (
            <Chip icon="wheat" tone="green" text={strings.dietary.glutenfree} />
          )}
          {item.spice !== "none" && (
            <Chip icon="flame" tone="red" text={strings.dietary.spicy} />
          )}
        </div>

        {/* Mã dị ứng ĐÃ GIẢI NGHĨA, tách riêng dị ứng và phụ gia */}
        {allergens.length > 0 && (
          <CodeList title={strings.detail.allergens} items={allergens} />
        )}
        {additives.length > 0 && (
          <CodeList title={strings.detail.additives} items={additives} />
        )}

        <MasterChefTrigger
          className="sora-btn-outline mt-5"
          category={item.category}
        >
          {strings.detail.askChef}
          <Icon name="arrow-right" size={14} />
        </MasterChefTrigger>
      </div>
    </div>
  );
}

function CodeList({
  title,
  items,
}: {
  title: string;
  items: { code: string; text: string }[];
}) {
  return (
    <div className="mt-4">
      <p className="sora-eyebrow text-[11px]">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((a) => (
          <li key={a.code} className="text-[13px] text-muted">
            <span className="mr-1.5 font-semibold text-gold">{a.code}</span>
            {a.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({
  icon,
  tone,
  text,
}: {
  icon: "leaf" | "flame" | "wheat";
  tone: "green" | "red";
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-gold/35 px-2 py-0.5 text-[12px] text-muted">
      <Icon
        name={icon}
        size={13}
        className={tone === "red" ? "text-red" : "text-green"}
      />
      {text}
    </span>
  );
}
