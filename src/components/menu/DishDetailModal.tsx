"use client";

/*
 * Hộp chi tiết món. Chỉ hiện trường CÓ THẬT trong dataset:
 * mô tả, biến thể (Tofu/Gà/Tôm…), cỡ, mã dị ứng, chế độ ăn, độ cay.
 * Không sao đánh giá, không nút giỏ hàng (`onlineOrdering: false`).
 *
 * Mã dị ứng PHẢI được giải nghĩa — hiện trần `A1,B,C,D,F,I,6,10` thì khách
 * không hiểu gì. Bảng chú giải chép nguyên văn từ trang `002_obj12` của thực
 * đơn in, xem `src/data/allergens.ts`.
 *
 * `note` trong dataset là GHI CHÚ NỘI BỘ — cấm hiện cho khách, không render.
 *
 * ---- KHUNG: `<dialog>` GỐC (làm lại 07/10) ----
 * Nguồn kho: hyperui application/modals/3-dark.html — `dialog[closedby=any]`
 * mở bằng `showModal()`. Trình duyệt tự lo: khoá focus trong hộp, Esc đóng,
 * trả focus về nút đã mở, phần trang phía sau trơ. Bản cũ là `div` cố định +
 * tự nghe phím Esc, không khoá focus (Tab chạy ra sau lớp nền).
 *
 * ẢNH: hiện ở đúng cỡ GỐC, không bao giờ phóng to hơn (ảnh cắt từ thực đơn in,
 * rộng 324–560px). Món không có ảnh riêng thì KHÔNG dựng ô ảnh — hộp thu về
 * một cột chữ. Ảnh NHÓM không dùng ở đây: đĩa thập cẩm dán cạnh "Sake Nigiri"
 * là khách tưởng gọi ra như thế (luật ở `src/data/menu-images.ts`).
 */

import { useEffect, useId, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { DishPurchase } from "@/components/cart/DishPurchase";
import { Icon } from "@/components/ui/Icon";
import { useMasterChef } from "@/components/chef/MasterChef";
import {
  categoryById,
  formatPrice,
  itemDescription,
  itemName,
  type MenuItem,
} from "@/data/menu";
import { explainAllergens } from "@/data/allergens";
import { pick, type Locale } from "@/lib/i18n";
import { anhMon, kichThuocAnh } from "./du-lieu";
import { GiaMon } from "./TheMon";
import type { MenuStrings } from "./kieu";
import s from "./menu.module.css";

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
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const chef = useMasterChef();

  const codes = explainAllergens(item.allergens, locale);
  const allergens = codes.filter((c) => c.kind === "allergen" || c.kind === "unknown");
  const additives = codes.filter((c) => c.kind === "additive");

  const src = anhMon(item);
  const kt = src ? kichThuocAnh(src) : null;
  const mota = itemDescription(item, locale);

  /* `item.subcategory` trong dữ liệu là tên TIẾNG ĐỨC -> tra lại nhóm con để
     in đúng tên theo ngôn ngữ đang xem. */
  const nhomCon = categoryById(item.category)?.subcategories.find(
    (x) => x.name.de === item.subcategory
  );

  /* KHÔNG gọi `close()` lúc dọn effect: React StrictMode chạy effect hai lần,
     `close()` ở lần dọn đầu sẽ bắn sự kiện `close` -> `onClose` -> hộp vừa mở
     đã tự đóng. Gỡ thẻ `<dialog>` khỏi DOM là trình duyệt tự rút nó khỏi lớp
     trên cùng. */
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  /* Đóng bằng `close()` của chính thẻ dialog (nó bắn sự kiện `close` ->
     `onClose`) chứ không gỡ thẳng khỏi DOM: chỉ `close()` mới trả focus về
     nút món vừa bấm — người dùng bàn phím không bị ném về đầu trang. */
  const dong = () => {
    const d = ref.current;
    if (d?.open) d.close();
    else onClose();
  };

  /* Hỏi Master Chef: phải ĐÓNG hộp này trước. `<dialog>` mở bằng showModal()
     nằm ở lớp trên cùng và làm trơ mọi thứ khác — ngăn kéo Master Chef mở ra
     phía sau sẽ không bấm được. */
  const hoiChef = () => {
    dong();
    chef.open(undefined, item.category);
  };

  return (
    <dialog
      ref={ref}
      /* `closedby="any"`: bấm ra nền là đóng (Chrome ≥ 134). React 19 chưa
         khai kiểu cho thuộc tính này nên truyền qua spread. Trình duyệt cũ
         hơn đã có `onClick` bên dưới lo. */
      {...{ closedby: "any" }}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Bấm trúng CHÍNH thẻ dialog = bấm vào nền (ruột hộp là thẻ con).
        if (e.target === e.currentTarget) dong();
      }}
      className={`${s.hop} ${src ? s.hopCoAnh : ""}`}
      style={
        kt
          ? ({ "--rong-anh": `${Math.min(kt.rong, 520)}px` } as CSSProperties)
          : undefined
      }
    >
      <div className={s.hopRuot}>
        <button
          type="button"
          onClick={dong}
          aria-label={strings.detail.close}
          className={s.hopDong}
        >
          <Icon name="x" size={20} />
        </button>

        {src && kt && (
          <div className={s.hopAnh}>
            <Image
              src={src}
              alt={itemName(item, locale)}
              width={kt.rong}
              height={kt.cao}
              sizes={`(max-width: 767px) 100vw, ${Math.min(kt.rong, 520)}px`}
              loading="eager"
            />
          </div>
        )}

        <div className={s.hopChu}>
          <p className={s.hopNhom}>
            {nhomCon ? pick(nhomCon.name, locale) : item.subcategory} ·{" "}
            {strings.detail.title}
          </p>
          <h2
            id={titleId}
            lang={locale}
            className={`${s.hopTen} ${locale === "de" ? s.tenDe : ""}`}
          >
            <span className={s.hopSo}>{item.nr}</span>
            {itemName(item, locale)}
          </h2>

          {mota && <p className={s.hopMota}>{mota}</p>}

          <p className={s.hopGia}>
            <GiaMon item={item} locale={locale} strings={strings} />
          </p>

          {item.variants && item.variants.length > 0 && (
            <div className={s.hopMuc}>
              <p className={s.hopTuaMuc}>{strings.detail.variants}</p>
              <ul className={s.hopBang}>
                {item.variants.map((v) => (
                  <li key={v.code}>
                    <span className={s.hopMa}>{v.code}</span>
                    <span className={s.hopTenDong}>
                      {pick(v.name, locale)}
                      {v.allergens && v.allergens.length > 0 && (
                        <sup className={s.hopMaNho}>{v.allergens.join(",")}</sup>
                      )}
                    </span>
                    {typeof v.price === "number" && (
                      <span className={s.hopGiaDong}>
                        {formatPrice(v.price, locale)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.sizes && item.sizes.length > 0 && (
            <div className={s.hopMuc}>
              <p className={s.hopTuaMuc}>{strings.detail.sizes}</p>
              <ul className={s.hopBang}>
                {item.sizes.map((z) => (
                  <li key={z.label}>
                    <span className={s.hopTenDong}>{z.label}</span>
                    <span className={s.hopGiaDong}>
                      {formatPrice(z.price, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(item.dietary.length > 0 || item.spice !== "none") && (
            <div className={s.hopNhan}>
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
          )}

          {/* Mã dị ứng ĐÃ GIẢI NGHĨA, tách riêng dị ứng và phụ gia */}
          {allergens.length > 0 && (
            <CodeList title={strings.detail.allergens} items={allergens} />
          )}
          {additives.length > 0 && (
            <CodeList title={strings.detail.additives} items={additives} />
          )}

          <DishPurchase key={item.id} item={item} locale={locale} close={dong} />
          <button type="button" onClick={hoiChef} className={s.hopChef}>
            <Icon name="chef" size={16} />
            {strings.detail.askChef}
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </dialog>
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
    <div className={s.hopMuc}>
      <p className={s.hopTuaMuc}>{title}</p>
      <ul className={s.hopDiUng}>
        {items.map((a) => (
          <li key={a.code}>
            <span className={s.hopMaDiUng}>{a.code}</span>
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
    <span className={s.hopChip}>
      <Icon
        name={icon}
        size={14}
        className={tone === "red" ? "text-red" : "text-green"}
      />
      {text}
    </span>
  );
}
