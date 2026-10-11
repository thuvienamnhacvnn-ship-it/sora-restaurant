"use client";

/*
 * BẢNG MỘT NHÓM — thứ hiện ra khi bấm một tab / một thẻ danh mục.
 *
 * Hai dáng, chọn theo DỮ LIỆU chứ không theo tên nhóm:
 *   - nhóm có ảnh RIÊNG từng món (6 nhóm món ăn, 34/35 món có ảnh)
 *       -> lưới thẻ ảnh 4:3 LỚN; món không ảnh thành hàng chữ ngay dưới lưới.
 *   - nhóm chỉ có ảnh theo NHÓM CON (Sushi 109 món / 14 nhóm con, Getränke
 *     63 / 13 — thực đơn in chỉ chụp một đĩa tổng hợp mỗi trang)
 *       -> bước 1: lưới thẻ nhóm con có ảnh;
 *          bước 2: ảnh nhóm lớn bên trái + bảng món bên phải.
 *
 * ⚠ CẢ 8 BẢNG LUÔN NẰM TRONG DOM, bảng không xem thì `hidden`. Đó là cách giữ
 * lệnh "hiện đủ 100% — 207 món" của Sếp khi trang đã chia chế độ xem:
 * `[data-so-mon] li[data-mon]` đếm ra 207 ở mọi trạng thái, HTML máy chủ trả
 * về có đủ 207 món, không món nào chỉ tới được qua "xem thêm".
 * Mỗi món có ĐÚNG MỘT `li[data-mon]` — nằm trong bảng nhóm của nó.
 */

import type { CSSProperties } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { MasterChefTrigger } from "@/components/chef/MasterChef";
import { ChuNhomMon, coChuNhom } from "@/components/chu/ChuCo";
import {
  formatPrice,
  itemDescription,
  type Category,
  type MenuItem,
} from "@/data/menu";
import { groupImage } from "@/data/menu-images";
import { pick, type Locale } from "@/lib/i18n";
import {
  TRAN_ANH,
  anhMon,
  giaThapNhat,
  kichThuocAnh,
  laNhomAnhNhom,
  nhomConCua,
  type NhomCon,
} from "./du-lieu";
import { DongMon, TheMon } from "./TheMon";
import type { MenuStrings } from "./kieu";
import s from "./menu.module.css";

type Chung = {
  locale: Locale;
  strings: MenuStrings;
  onOpen: (item: MenuItem) => void;
};

export function BangNhom({
  cat,
  an,
  subId,
  chonNhomCon,
  ...chung
}: Chung & {
  cat: Category;
  /** Bảng đang KHÔNG được xem — vẫn dựng, chỉ ẩn. */
  an: boolean;
  subId: string | null;
  chonNhomCon: (id: string | null) => void;
}) {
  const { locale, strings } = chung;
  const nhom = nhomConCua(cat);
  const tong = nhom.reduce((n, g) => n + g.mon.length, 0);

  return (
    <section
      id={`bang-${cat.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${cat.id}`}
      hidden={an}
      className={s.bang}
    >
      <div className={s.tua}>
        {coChuNhom(cat.id) ? (
          <ChuNhomMon
            nhom={cat.id}
            locale={locale}
            the="h2"
            chuThat
            caoChuHoa={{ dienThoai: 22, mayTinh: 30 }}
          />
        ) : (
          <h2 lang={locale} className={s.tuaChu}>
            {pick(cat.name, locale)}
          </h2>
        )}
        <span className={s.tuaSo}>
          {tong} {strings.dishes}
        </span>
        <span aria-hidden="true" className={s.tuaVach} />
        {/* Master Chef ở trang này: gợi ý bó trong NHÓM ĐANG MỞ (KIT 02). */}
        <MasterChefTrigger
          className={s.nutPhu}
          category={cat.id}
          seed={cat.id === "sushi" ? "sushi" : undefined}
        >
          <Icon name="chef" size={16} />
          {strings.askChefCategory}
        </MasterChefTrigger>
      </div>

      {laNhomAnhNhom(cat) ? (
        <NhomAnh
          nhom={nhom}
          subId={subId}
          chonNhomCon={chonNhomCon}
          {...chung}
        />
      ) : (
        <NhomMonAn nhom={nhom} tenNhom={cat.name.de} {...chung} />
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * MÓN ĂN — lưới thẻ ảnh lớn
 * ------------------------------------------------------------------------ */

/**
 * Số cột chọn theo SỐ MÓN để hàng cuối không còn thẻ mồ côi:
 * 4 hoặc 8 món -> 4 cột; 3 hoặc 6 món -> 3 cột.
 */
function soCot(n: number): number {
  if (n <= 3) return Math.max(n, 1);
  if (n % 4 === 0) return 4;
  if (n % 3 === 0) return 3;
  return 4;
}

function NhomMonAn({
  nhom,
  tenNhom,
  ...chung
}: Chung & { nhom: NhomCon[]; tenNhom: string }) {
  const { locale } = chung;
  return (
    <>
      {nhom.map(({ sub, mon }) => {
        const coAnh = mon.filter((m) => anhMon(m));
        const khongAnh = mon.filter((m) => !anhMon(m));
        /* Thẻ không được rộng hơn ảnh NHỎ NHẤT trong lưới (và không quá trần
           440px): ảnh cắt từ thực đơn in, phóng quá cỡ gốc là vỡ hạt. */
        const tran = Math.min(
          TRAN_ANH,
          ...coAnh.map((m) => kichThuocAnh(anhMon(m) as string).rong)
        );
        return (
          <section key={sub.id} className={s.tieuMuc}>
            {/* Tiểu mục trùng tên nhóm ("Hauptgerichte" trong Hauptgerichte) thì
                không lặp lại ngay dưới tiêu đề lớn. */}
            {nhom.length > 1 && sub.name.de !== tenNhom && (
              <h3 className={s.tieuMucTua}>
                <span
                  lang={locale}
                  className={`${s.tieuMucChu} ${locale === "vi" ? s.tenVi : ""}`}
                >
                  {pick(sub.name, locale)}
                </span>
                <span aria-hidden="true" className={s.tuaVach} />
              </h3>
            )}
            {coAnh.length > 0 && (
              <ul
                className={s.luoiMon}
                data-cot={soCot(coAnh.length)}
                style={{ "--tran": `${tran}px` } as CSSProperties}
              >
                {coAnh.map((item) => (
                  <TheMon key={item.id} item={item} kieu="doc" dem {...chung} />
                ))}
              </ul>
            )}
            {/* Món không ảnh: KHÔNG vẽ ô giữ chỗ, KHÔNG mượn ảnh khác. */}
            {khongAnh.length > 0 && (
              <ul className={`${s.bangMon} ${s.bangMonDuoiLuoi}`}>
                {khongAnh.map((item) => (
                  <DongMon key={item.id} item={item} {...chung} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

/* ---------------------------------------------------------------------------
 * SUSHI · GETRÄNKE — thẻ nhóm con -> ảnh nhóm lớn + bảng món
 * ------------------------------------------------------------------------ */

function NhomAnh({
  nhom,
  subId,
  chonNhomCon,
  ...chung
}: Chung & {
  nhom: NhomCon[];
  subId: string | null;
  chonNhomCon: (id: string | null) => void;
}) {
  const { locale, strings } = chung;
  /* 13 nhóm đồ uống xếp 4 cột thì hàng cuối trơ MỘT thẻ; 5 cột ra 5 + 5 + 3. */
  const cot = nhom.length % 4 === 1 ? 5 : 4;

  return (
    <>
      {/* Bước 1 — chọn nhóm con */}
      <ul className={s.luoiNhom} data-cot={cot} hidden={subId !== null}>
        {nhom.map(({ sub, mon }) => {
          const src = groupImage(sub.id);
          const kt = src ? kichThuocAnh(src) : null;
          const gia = giaThapNhat(mon);
          return (
            <li key={sub.id} className={s.oThe}>
              <button
                type="button"
                onClick={() => chonNhomCon(sub.id)}
                className={s.theNhom}
                data-nhom-con={sub.id}
              >
                {src && kt ? (
                  <span className={s.theNhomAnh}>
                    <Image
                      src={src}
                      alt=""
                      width={kt.rong}
                      height={kt.cao}
                      sizes="(max-width: 767px) 50vw, 380px"
                      loading="lazy"
                    />
                  </span>
                ) : (
                  /* Nhóm chưa có ảnh (Crunchy Roll, Fruchtsäfte): hoạ tiết
                     enso, KHÔNG mượn ảnh nhóm khác. */
                  <span
                    aria-hidden="true"
                    className={`${s.theNhomAnh} ${s.theNhomTrong}`}
                  />
                )}
                <span className={s.theNhomChu}>
                  <span
                    lang={locale}
                    className={`${s.theNhomTen} ${
                      locale === "de" ? s.tenDe : s.tenVi
                    }`}
                  >
                    {pick(sub.name, locale)}
                  </span>
                  <span className={s.theNhomPhu}>
                    {mon.length} {strings.dishes}
                    {gia != null &&
                      ` · ${strings.from} ${formatPrice(gia, locale)}`}
                    {sub.pieces ? ` · ${sub.pieces} ${strings.pieces}` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bước 2 — một nhóm con. Cả 14 (13) bảng luôn nằm trong DOM. */}
      {nhom.map((g) => (
        <BangNhomCon key={g.sub.id} g={g} an={subId !== g.sub.id} {...chung} />
      ))}
    </>
  );
}

/**
 * Ảnh nhóm lớn (dính khi cuộn) + bảng món.
 * Nguồn kho: khung hai cột của hyperui marketing/sections/1.html đổi thành
 * `[ảnh | bảng]` căn đầu; hàng món theo daisyUI list.css; kiểu "catalogue" của
 * hallmark (kẻ hairline giữa hàng, nhãn nhóm làm dải).
 */
function BangNhomCon({
  g,
  an,
  ...chung
}: Chung & { g: NhomCon; an: boolean }) {
  const { locale, strings } = chung;
  const { sub, mon } = g;
  const src = groupImage(sub.id);
  const kt = src ? kichThuocAnh(src) : null;
  const gia = giaThapNhat(mon);
  /* Hai cột chỉ khi nhóm đủ dài VÀ mô tả ngắn (Nigiri, Maki, Longdrinks…).
     Bộ set ghi thành phần dài tới 300 ký tự -> một cột, hiện đủ. */
  const dai = Math.max(0, ...mon.map((m) => itemDescription(m, locale).length));
  const haiCot = mon.length >= 10 && dai <= 60;

  return (
    <section
      hidden={an}
      aria-label={pick(sub.name, locale)}
      className={`${s.nhomCon} ${src ? "" : s.nhomConKhongAnh}`}
      data-bang-nhom-con={sub.id}
      style={
        kt
          ? ({ "--rong-anh": `${Math.min(kt.rong, 400)}px` } as CSSProperties)
          : undefined
      }
    >
      {src && kt && (
        <figure className={s.nhomConHinh}>
          <span className={s.nhomConAnh}>
            <Image
              src={src}
              alt=""
              width={kt.rong}
              height={kt.cao}
              sizes="(max-width: 873px) 100vw, 400px"
              loading="lazy"
            />
          </span>
          <figcaption className={s.nhomConChuThich}>
            {strings.groupPhotoNote}
          </figcaption>
        </figure>
      )}
      <div className={s.nhomConBang}>
        <h3 className={s.nhomConTua}>
          <span
            lang={locale}
            className={`${s.tieuMucChu} ${locale === "vi" ? s.tenVi : ""}`}
          >
            {pick(sub.name, locale)}
          </span>
          <span className={s.tuaSo}>
            {mon.length} {strings.dishes}
            {gia != null && ` · ${strings.from} ${formatPrice(gia, locale)}`}
            {sub.pieces ? ` · ${sub.pieces} ${strings.pieces}` : ""}
          </span>
        </h3>
        {sub.note && <p className={s.nhomConGhiChu}>{pick(sub.note, locale)}</p>}
        <ul className={`${s.bangMon} ${haiCot ? s.bangMonHaiCot : ""}`}>
          {mon.map((item) => (
            <DongMon key={item.id} item={item} {...chung} />
          ))}
        </ul>
      </div>
    </section>
  );
}
