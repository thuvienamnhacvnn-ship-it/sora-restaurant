"use client";

/*
 * TỔNG QUAN — thứ khách thấy khi vừa vào trang (tab "Alle"), đúng thứ tự của
 * mẫu `02_speisekarte.png`: băng "Chef Empfehlung" → thẻ danh mục có ảnh →
 * "Beliebte Gerichte".
 *
 * Mọi tên/mô tả/giá lấy từ `menu-items.json`. Chữ của mockup ("SoRa Signature
 * Sushi Platte € 24,90", "Dragon Roll"…) là chữ giả, không dùng.
 * Món nào được nêu ở đây: `data/menu-noi-bat.json` (TẠM, chờ Sếp chốt).
 */

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import {
  categories,
  type MenuItem,
} from "@/data/menu";
import { pick, type Locale } from "@/lib/i18n";
import {
  MON_BELIEBT,
  SO_MON_NHOM,
  anhDanhMuc,
  kichThuocAnh,
} from "./du-lieu";
import { TheMon } from "./TheMon";
import type { MenuStrings } from "./kieu";
import s from "./menu.module.css";

export function TongQuan({
  locale,
  strings,
  onOpen,
  chonNhom,
}: {
  locale: Locale;
  strings: MenuStrings;
  onOpen: (item: MenuItem) => void;
  chonNhom: (id: string) => void;
}) {
  return (
    <div
      id="bang-alle"
      role="tabpanel"
      aria-labelledby="tab-alle"
      className={s.tongQuan}
    >
      <DanhMuc locale={locale} strings={strings} chonNhom={chonNhom} />

      {MON_BELIEBT.length > 0 && (
        <section className={s.khoi} aria-labelledby="tua-beliebt">
          <div className={s.khoiDau}>
            <h2 id="tua-beliebt" className={s.khoiTua}>
              <span aria-hidden="true" className={s.khoiVach} />
              {strings.popularTitle}
            </h2>
            <button
              type="button"
              onClick={() => chonNhom(categories[0].id)}
              className={s.lienKet}
            >
              {strings.allDishes}
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
          <ul className={s.luoiNgang}>
            {MON_BELIEBT.map((item) => (
              <TheMon
                key={item.id}
                item={item}
                locale={locale}
                strings={strings}
                onOpen={onOpen}
                kieu="ngang"
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Thẻ danh mục có ảnh — 8 nhóm THẬT của thực đơn (mẫu vẽ 5), lưới 4 × 2.
 * Nguồn kho: hyperui marketing/cards/3.html (thẻ là MỘT liên kết, ảnh phủ kín
 * phần trên) + marketing/product-collections/1.html (khung lưới + hover scale).
 * PHẢI BỎ của kho (trái luật Sếp): `opacity-75` phủ tối lên ảnh, và khối mô tả
 * chỉ hiện khi hover. Chữ đặt ở DẢI NỀN RIÊNG dưới ảnh, ảnh giữ nguyên 100%.
 */
function DanhMuc({
  locale,
  strings,
  chonNhom,
}: {
  locale: Locale;
  strings: MenuStrings;
  chonNhom: (id: string) => void;
}) {
  return (
    <nav aria-label={strings.categories} className={s.khoi}>
      <ul className={s.luoiDanhMuc}>
        {categories.map((c) => {
          const src = anhDanhMuc(c.id);
          const kt = src ? kichThuocAnh(src) : null;
          return (
            <li key={c.id} className={s.oThe}>
              <button
                type="button"
                onClick={() => chonNhom(c.id)}
                className={s.danhMuc}
                data-danh-muc={c.id}
              >
                {src && kt && (
                  <span className={s.danhMucAnh}>
                    <Image
                      src={src}
                      alt=""
                      width={kt.rong}
                      height={kt.cao}
                      sizes="(max-width: 767px) 50vw, 380px"
                      loading="lazy"
                    />
                  </span>
                )}
                <span className={s.danhMucChu}>
                  <span className={s.danhMucHaiDong}>
                    <span
                      lang={locale}
                      className={`${s.danhMucTen} ${
                        locale === "de" ? s.tenDe : s.tenVi
                      }`}
                    >
                      {pick(c.name, locale)}
                    </span>
                    <span className={s.danhMucPhu}>
                      {SO_MON_NHOM[c.id]} {strings.dishes}
                    </span>
                  </span>
                  <span aria-hidden="true" className={s.danhMucMuiTen}>
                    <Icon name="arrow-right" size={15} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
