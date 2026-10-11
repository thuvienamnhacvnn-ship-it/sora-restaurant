"use client";

/*
 * Ba dáng hiển thị MỘT món — dùng chung cho mọi chế độ của trang Speisekarte.
 *
 *   TheMon kieu="doc"    thẻ ảnh LỚN 4:3 trên, chữ dưới (lưới món ăn).
 *                        Nguồn kho: hyperui marketing/product-cards/6.html
 *                        + quy tắc hallmark f6-product-card-grid (một tín hiệu
 *                        khung, hover chỉ scale ảnh ≤ 1.02).
 *   TheMon kieu="ngang"  ảnh trái, chữ phải (Beliebte Gerichte, kết quả tìm).
 *                        Nguồn kho: hyperui marketing/cards/9.html (ảnh trái +
 *                        `line-clamp-2`), ảnh phóng từ 56px lên 140px.
 *   DongMon              hàng chữ gọn, giá thẳng một cột (món không ảnh, bảng
 *                        sushi/đồ uống). Nguồn kho: daisyUI list.css `.list-row`
 *                        (lưới `auto 1fr auto` + kẻ hairline giữa hàng).
 *
 * LUẬT (Sếp + dòng đầu `03_PAGE_SPECS`): chữ KHÔNG nằm trên ảnh món, không lớp
 * màu nào phủ lên ảnh. Ảnh là một ô riêng; tên/giá ở dải nền riêng.
 * Món không có ảnh riêng thì KHÔNG dựng ô ảnh giữ chỗ.
 */

import Image from "next/image";
import { AddDishButton } from "@/components/cart/DishPurchase";
import { Icon } from "@/components/ui/Icon";
import {
  displayPrice,
  itemDescription,
  itemName,
  type MenuItem,
} from "@/data/menu";
import type { Locale } from "@/lib/i18n";
import { anhMon, kichThuocAnh } from "./du-lieu";
import type { MenuStrings } from "./kieu";
import s from "./menu.module.css";

type Chung = {
  item: MenuItem;
  locale: Locale;
  strings: MenuStrings;
  onOpen: (item: MenuItem) => void;
  /**
   * `true`  -> `li[data-mon]`: món này tính vào hợp đồng "đủ 207 món".
   * `false` -> `li[data-mon-phu]`: bản hiển thị THỨ HAI của một món đã có
   *            trong bảng nhóm (thẻ nổi bật, kết quả tìm) — không đếm trùng.
   */
  dem?: boolean;
};

/** Giá: "ab 14,90 €" · "14,90 €" · "Preis auf Anfrage" (món 22 không có giá). */
export function GiaMon({
  item,
  locale,
  strings,
  className = "",
}: Pick<Chung, "item" | "locale" | "strings"> & { className?: string }) {
  const price = displayPrice(item, locale);
  return (
    <span
      className={`${s.gia} ${price.onRequest ? s.giaHoi : ""} ${className}`}
    >
      {price.onRequest
        ? strings.priceOnRequest
        : `${price.from ? `${strings.from} ` : ""}${price.text}`}
    </span>
  );
}

/** Nhãn nhỏ: cay · chay · số miếng. Chỉ in khi dữ liệu nói thế. */
function NhanMon({
  item,
  strings,
}: Pick<Chung, "item" | "strings">) {
  const cay = item.spice !== "none";
  const chay = item.dietary.includes("vegetarian");
  if (!cay && !chay && !item.pieces) return null;
  return (
    <span className={s.nhan}>
      {/* MỘT dấu hiệu cay, không phải thang 2–3 quả ớt: thực đơn in không
          chia cấp độ, vẽ thang là bịa dữ liệu. */}
      {cay && (
        <span className={s.nhanMuc}>
          <Icon name="flame" size={13} className="text-red" />
          {strings.dietary.spicy}
        </span>
      )}
      {chay && (
        <span className={s.nhanMuc}>
          <Icon name="leaf" size={13} className="text-green" />
          {strings.dietary.vegetarian}
        </span>
      )}
      {item.pieces ? (
        <span className={s.nhanMuc}>
          {item.pieces} {strings.pieces}
        </span>
      ) : null}
    </span>
  );
}

/** `hyphens: auto` chỉ đúng với tiếng Đức; chữ Việt chỉ ngắt ở dấu cách. */
const lopTen = (locale: Locale) => `${s.ten} ${locale === "de" ? s.tenDe : ""}`;

export function TheMon({
  item,
  locale,
  strings,
  onOpen,
  dem = false,
  kieu,
  nap = "lazy",
}: Chung & {
  kieu: "doc" | "ngang";
  /** Ảnh nằm trong màn đầu thì nạp ngay. */
  nap?: "lazy" | "eager";
}) {
  const src = anhMon(item);
  const kt = src ? kichThuocAnh(src) : null;
  const mota = itemDescription(item, locale);
  const dinhDanh = dem ? { "data-mon": item.id } : { "data-mon-phu": item.id };

  return (
    <li {...dinhDanh} className={s.oThe}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={`${s.the} ${kieu === "doc" ? s.theDoc : s.theNgang} ${
          src ? "" : s.theKhongAnh
        }`}
      >
        {src && kt && (
          <span className={s.theAnh}>
            <Image
              src={src}
              alt=""
              width={kt.rong}
              height={kt.cao}
              loading={nap}
              sizes={
                kieu === "doc"
                  ? "(max-width: 873px) 160px, (max-width: 1199px) 380px, 440px"
                  : "160px"
              }
            />
          </span>
        )}
        <span className={s.theThan}>
          <span className={s.theDau}>
            <span className={s.so}>{item.nr}</span>
            <span lang={locale} className={lopTen(locale)}>
              {itemName(item, locale)}
            </span>
          </span>
          {mota && <span className={s.theMota}>{mota}</span>}
          <span className={s.theChan}>
            <NhanMon item={item} strings={strings} />
            <GiaMon item={item} locale={locale} strings={strings} />
          </span>
        </span>
      </button>
      <AddDishButton item={item} locale={locale} onOpen={onOpen} />
    </li>
  );
}

/**
 * Một HÀNG món kiểu thực đơn in: số · tên (+ mô tả, nhãn) · giá căn phải.
 * Mô tả KHÔNG cắt dòng: bộ set sushi ghi thành phần dài tới 300 ký tự, cắt là
 * khách không biết set có gì.
 */
export function DongMon({ item, locale, strings, onOpen, dem = true }: Chung) {
  const mota = itemDescription(item, locale);
  const dinhDanh = dem ? { "data-mon": item.id } : { "data-mon-phu": item.id };
  return (
    <li {...dinhDanh} className={s.oDong}>
      <button type="button" onClick={() => onOpen(item)} className={s.dong}>
        <span className={s.so}>{item.nr}</span>
        <span className={s.dongChu}>
          <span lang={locale} className={lopTen(locale)}>
            {itemName(item, locale)}
          </span>
          {mota && <span className={s.dongMota}>{mota}</span>}
          <NhanMon item={item} strings={strings} />
        </span>
        <GiaMon item={item} locale={locale} strings={strings} />
      </button>
      <AddDishButton item={item} locale={locale} onOpen={onOpen} />
    </li>
  );
}
