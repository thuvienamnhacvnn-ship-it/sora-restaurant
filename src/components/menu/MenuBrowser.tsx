"use client";

/*
 * Speisekarte — một hub duy nhất cho cả thực đơn (KIT: "Do not create separate
 * top-level pages for each food category").
 *
 * ---- LÀM LẠI 07/10 ----
 * Sếp: «làm lại phần Speisekarte đi, nhìn thế mà được à, ảnh món ăn quá nhỏ,
 * cách sắp xếp thì lộn xộn». Bản cũ đổ 207 món thành cột chữ trên một trang
 * dài 12 màn, ảnh món 56×42px. Ảnh to và trang ngắn chỉ cùng đạt được khi mỗi
 * lần xem MỘT nhóm, nên trang chia ba chế độ (spec `_w-agent/lam-lai/01_spec.md`
 * mục B2):
 *
 *   1. TỔNG QUAN (tab "Alle", giống mẫu)  băng Chef → thẻ danh mục → Beliebte
 *   2. MỘT NHÓM  (bấm tab / thẻ danh mục)  lưới thẻ ảnh lớn, hoặc thẻ nhóm con
 *                                          → ảnh nhóm + bảng món
 *   3. TÌM / LỌC (gõ ô tìm, bật chip)      danh sách phẳng
 *
 * LỆNH CŨ CỦA SẾP VẪN GIỮ: hiện ĐỦ 100% — cả 207 món. Không món nào rơi:
 *   - cả 8 bảng nhóm LUÔN dựng trong DOM (kể cả HTML máy chủ trả về), bảng
 *     không xem thì `hidden`;
 *   - mỗi món có đúng một `li[data-mon]` trong bảng nhóm của nó, nên
 *     `[data-so-mon] li[data-mon]` đếm ra 207 ở mọi chế độ;
 *   - thẻ nổi bật và kết quả tìm là bản hiển thị thứ hai -> `li[data-mon-phu]`.
 *   sushi 109 · getraenke 63 · hauptgerichte 13 · vorspeisen 8 · salate 4 ·
 *   vietnamese-classics 4 · suppen 3 · desserts 3
 *
 * Giá: nr 22 không có giá -> "Preis auf Anfrage" (không in 0 €, sắp theo giá
 * thì xuống CUỐI); 34 món `priceFrom` -> "ab 14,90 €"; `variants`/`sizes` là
 * biến thể của MỘT món -> một thẻ, không tách.
 *
 * Mockup có mà ở đây KHÔNG có, cố ý:
 *  - nút "+" giỏ hàng: `onlineOrdering: false` -> bấm thẻ mở hộp chi tiết.
 *  - thang 2–3 quả ớt: thực đơn in không chia cấp độ cay, chỉ có/không.
 *  - chip Vegan / Glutenfrei: dữ liệu không có món nào -> chip tự ẩn.
 *
 * ⚠ HỢP ĐỒNG DOM (scripts/kiem-speisekarte.mjs + kiem-trang-chu.mjs):
 *   `[data-so-mon] li[data-mon]` = 207 · MỘT `input[type=search]` ·
 *   tab nhóm `role="tab"` · chip nhóm con trong `[aria-label="Unterkategorien"]`
 *   · kết quả tìm trong `[data-ket-qua]` · `<select>` chỉ có ở chế độ tìm/lọc.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MagicBannerTitle } from "@/components/ui/MagicBannerTitle";
import { KhungThongBao } from "@/components/ui/KhungThongBao";
import { FallingPetals } from "@/components/decor/Decor";
import { Icon } from "@/components/ui/Icon";
import { DishDetailModal } from "./DishDetailModal";
import { HangCuon } from "./HangCuon";
import { TongQuan } from "./TongQuan";
import { BangNhom } from "./BangNhom";
import { TheMon } from "./TheMon";
import {
  categories,
  categoryById,
  filterItems,
  itemName,
  matchesDietary,
  menuItems,
  minPrice,
  type DietaryKey,
  type MenuItem,
} from "@/data/menu";
import { pick, type Locale } from "@/lib/i18n";
import { TONG_SO_MON, laNhomAnhNhom } from "./du-lieu";
import type { MenuStrings } from "./kieu";
import s from "./menu.module.css";

export type { MenuStrings } from "./kieu";

type SortKey = "nr" | "name" | "price";

/*
 * Chip chế độ ăn — CHỈ hiện chip có ít nhất một món (KIT: nhãn chỉ khi dữ
 * liệu nói thế). Hôm nay dữ liệu chỉ đánh dấu vegetarisch (10) và scharf (12);
 * Vegan / Glutenfrei bấm vào ra 0 món nên không dựng. Ai bổ sung dữ liệu thì
 * chip tự hiện lại, không phải sửa code.
 */
const DIETARY = (
  [
    { key: "vegetarian", icon: "leaf" },
    { key: "vegan", icon: "leaf" },
    { key: "glutenfree", icon: "wheat" },
    { key: "spicy", icon: "flame" },
  ] as { key: DietaryKey; icon: "leaf" | "wheat" | "flame" }[]
).filter((d) => menuItems.some((i) => i.available && matchesDietary(i, d.key)));

/** `?kategorie=` lạ (gõ tay, link cũ) -> coi như không chọn nhóm nào. */
const chuanNhom = (id: string | null | undefined): string | null =>
  id && categoryById(id) ? id : null;

/** `?gruppe=` chỉ có nghĩa với nhóm chia theo nhóm con có ảnh (sushi, đồ uống). */
const chuanNhomCon = (
  nhom: string | null,
  id: string | null | undefined
): string | null => {
  const cat = nhom ? categoryById(nhom) : undefined;
  if (!cat || !id || !laNhomAnhNhom(cat)) return null;
  return cat.subcategories.some((x) => x.id === id) ? id : null;
};

const timMon = (id: string | null | undefined): MenuItem | null =>
  id ? (menuItems.find((i) => i.id === id) ?? null) : null;

export function MenuBrowser({
  locale,
  strings,
  kategorieBanDau = null,
  nhomConBanDau = null,
  monBanDau = null,
}: {
  locale: Locale;
  strings: MenuStrings;
  /* Lấy từ `searchParams` phía MÁY CHỦ, không phải `useSearchParams()`.
     Gọi `useSearchParams()` ở đây là Next ép cả nhánh sang dựng phía client:
     bản production trả về mỗi dòng "Speisekarte wird geladen", 207 món
     BIẾN MẤT khỏi HTML (71 KB thay vì 450 KB). Dev không lộ ra vì dev vẫn
     dựng sẵn. Chỉ phát hiện khi đếm thẻ trên bản đã deploy. */
  kategorieBanDau?: string | null;
  nhomConBanDau?: string | null;
  monBanDau?: string | null;
}) {
  const [category, setCategory] = useState<string | null>(() =>
    chuanNhom(kategorieBanDau)
  );
  /* Giữ ID nhóm con, KHÔNG giữ tên hiển thị: `item.subcategory` trong dữ liệu
     là tên TIẾNG ĐỨC, so với tên đã dịch ở /vi là lọc ra 0 món. */
  const [subId, setSubId] = useState<string | null>(() =>
    chuanNhomCon(chuanNhom(kategorieBanDau), nhomConBanDau)
  );
  const [diet, setDiet] = useState<DietaryKey[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("nr");
  const [openDish, setOpenDish] = useState<MenuItem | null>(() =>
    timMon(monBanDau)
  );

  /* Tham số máy chủ đổi (bấm link `?dish=` của Master Chef, link nhóm từ
     trang khác khi đang đứng sẵn ở đây) -> chỉnh state theo NGAY TRONG render,
     so với giá trị lần trước — React 19 cấm setState trong useEffect kiểu này. */
  const [thamSo, setThamSo] = useState({
    k: kategorieBanDau,
    g: nhomConBanDau,
    d: monBanDau,
  });
  if (
    thamSo.k !== kategorieBanDau ||
    thamSo.g !== nhomConBanDau ||
    thamSo.d !== monBanDau
  ) {
    setThamSo({ k: kategorieBanDau, g: nhomConBanDau, d: monBanDau });
    if (thamSo.k !== kategorieBanDau || thamSo.g !== nhomConBanDau) {
      const k = chuanNhom(kategorieBanDau);
      setCategory(k);
      setSubId(chuanNhomCon(k, nhomConBanDau));
    }
    if (thamSo.d !== monBanDau) setOpenDish(timMon(monBanDau));
  }

  const neoRef = useRef<HTMLDivElement>(null);
  const oTimRef = useRef<HTMLInputElement>(null);

  /* Nút Back/Forward của trình duyệt: mỗi lần đổi tab là một `pushState`, nên
     lùi lại phải ra đúng tab trước đó. Đọc lại địa chỉ rồi chỉnh state — Next
     không dựng lại trang cho các mục lịch sử do `pushState` tạo ra. */
  useEffect(() => {
    const khiLui = () => {
      const p = new URLSearchParams(window.location.search);
      const k = chuanNhom(p.get("kategorie") ?? p.get("kat"));
      setCategory(k);
      setSubId(chuanNhomCon(k, p.get("gruppe")));
    };
    window.addEventListener("popstate", khiLui);
    return () => window.removeEventListener("popstate", khiLui);
  }, []);

  /* Đồng bộ địa chỉ bằng History API, KHÔNG dùng router: `router.push` sẽ gọi
     lại máy chủ mỗi lần bấm tab. `pushState` (không phải `replaceState`) để
     link chia sẻ được VÀ nút Back quay về tab trước. */
  const ghiDiaChi = (nhom: string | null, nhomCon: string | null) => {
    const p = new URLSearchParams();
    if (nhom) p.set("kategorie", nhom);
    if (nhom && nhomCon) p.set("gruppe", nhomCon);
    const q = p.toString();
    const moi = q ? `?${q}` : window.location.pathname;
    if (moi === (window.location.search || window.location.pathname)) return;
    window.history.pushState(null, "", moi);
  };

  /** Đưa đầu danh sách về mép trên — chỉ khi nó đang nằm khuất phía trên,
   *  hoặc `luon` (bấm thẻ danh mục ở giữa trang tổng quan). */
  const veDauDanhSach = (luon: boolean) => {
    requestAnimationFrame(() => {
      const neo = neoRef.current;
      if (!neo) return;
      if (luon || neo.getBoundingClientRect().top < 0) {
        neo.scrollIntoView({ block: "start" });
      }
    });
  };

  const chonNhom = (id: string | null, tuThe = false) => {
    setCategory(id);
    setSubId(null);
    ghiDiaChi(id, null);
    veDauDanhSach(tuThe);
  };

  const chonNhomCon = (id: string | null) => {
    setSubId(id);
    ghiDiaChi(category, id);
    veDauDanhSach(true);
  };

  const toggleDiet = (key: DietaryKey) =>
    setDiet((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));

  const xoaLoc = () => {
    setQuery("");
    setDiet([]);
    setSort("nr");
  };

  const dangLoc = query.trim() !== "" || diet.length > 0;

  /* Chế độ 3: danh sách phẳng. Đang đứng ở một nhóm thì tìm TRONG nhóm đó
     (tab là phạm vi tìm); đứng ở "Alle" thì tìm khắp 207 món. */
  const results = useMemo(() => {
    if (!dangLoc) return [];
    const list = filterItems({ category, dietary: diet, query, locale });
    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) =>
        itemName(a, locale).localeCompare(itemName(b, locale), locale)
      );
    } else if (sort === "price") {
      // Món không có giá (nr 22) xuống CUỐI, tuyệt đối không bị loại.
      sorted.sort((a, b) => {
        const pa = minPrice(a);
        const pb = minPrice(b);
        if (pa == null && pb == null) return 0;
        if (pa == null) return 1;
        if (pb == null) return -1;
        return pa - pb;
      });
    }
    // sort === "nr": giữ nguyên thứ tự dataset, vốn đã theo số in trên menu.
    return sorted;
  }, [dangLoc, category, diet, query, sort, locale]);

  /* Không thấy gì trong nhóm đang mở nhưng nhóm khác có -> mời tìm khắp. */
  const soONhomKhac = useMemo(() => {
    if (!dangLoc || !category || results.length > 0) return 0;
    return filterItems({ category: null, dietary: diet, query, locale }).length;
  }, [dangLoc, category, results.length, diet, query, locale]);

  if (menuItems.length === 0) {
    return (
      <p className="sora-card p-6 text-center text-muted">{strings.loading}</p>
    );
  }

  const activeCat = category ? categoryById(category) : undefined;
  const coHangNhomCon = Boolean(
    activeCat && laNhomAnhNhom(activeCat) && subId && !dangLoc
  );

  return (
    <div className={s.goc}>
      {/* Mốc cuộn: đổi tab khi đang ở giữa trang thì đưa mốc này về mép trên. */}
      <div ref={neoRef} aria-hidden="true" className={s.neo} />

      {/* ===== THANH LỌC (dính theo màn) =====
          Nguồn kho: ô tìm = flowbite forms/search-input.md (icon tuyệt đối bên
          trái + nhãn sr-only); tab = hyperui application/tabs/4-dark.html
          (`role=tablist` > `button[role=tab][aria-selected]` + `tabpanel`);
          chip chế độ ăn = `button[aria-pressed]` (chọn nhiều). */}
      <section className={s.menuHero} data-menu-hero="">
        <Image src="/banner/speisekarte_hero-1920.webp" alt="" fill priority sizes="(max-width:767px) 100vw, (max-width:1199px) calc(100vw - 88px), calc(100vw - 250px)" className={s.menuHeroImage} />
        <FallingPetals className="sora-subpage-petals" />
        <div className={s.menuHeroTitle}><MagicBannerTitle nhan="menu" locale={locale} desktop={1.4} mobile={1.04} /></div>
      <div className={s.thanhLoc}>
        <div className={s.thanhDinh}>
          <label className={s.oTim}>
            <span className="sr-only">{strings.searchLabel}</span>
            <Icon name="search" size={18} className={s.oTimIcon} />
            <input
              ref={oTimRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={strings.searchPlaceholder}
              className={`sora-field ${s.oTimNhap}`}
            />
            {query !== "" && (
              <button
                type="button"
                aria-label={strings.clearSearch}
                onClick={() => {
                  setQuery("");
                  oTimRef.current?.focus();
                }}
                className={s.oTimXoa}
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </label>

          <HangCuon className={s.hangTab}>
            <div
              role="tablist"
              aria-label={strings.categories}
              className={s.hangCuon}
            >
              <Tab
                id="alle"
                active={category === null}
                onClick={() => chonNhom(null)}
                label={strings.all}
              />
              {categories.map((c) => (
                <Tab
                  key={c.id}
                  id={c.id}
                  active={category === c.id}
                  onClick={() => chonNhom(c.id)}
                  label={strings.tabs[c.id] ?? pick(c.name, locale)}
                />
              ))}
            </div>
          </HangCuon>
        </div>

        {DIETARY.length > 0 && (
          <div
            className={s.cheDoAn}
            role="group"
            aria-label={strings.dietaryLabel}
          >
            {DIETARY.map((d) => {
              const on = diet.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDiet(d.key)}
                  className={s.chip}
                >
                  <Icon
                    name={d.icon}
                    size={16}
                    className={d.key === "spicy" ? "text-red" : "text-green"}
                  />
                  {strings.dietary[d.key]}
                  {/* Trạng thái bật không chỉ báo bằng màu (KIT a11y). */}
                  {on && <Icon name="check" size={15} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Nhóm con — chỉ khi đang xem MỘT nhóm con của Sushi / Getränke, để
            nhảy sang nhóm con khác mà không phải quay lại lưới thẻ. */}
        {coHangNhomCon && activeCat && (
          <HangCuon className={s.hangNhomCon}>
            <div
              className={s.hangCuon}
              role="group"
              aria-label={strings.subcategories}
            >
              <button
                type="button"
                onClick={() => chonNhomCon(null)}
                className={`${s.chip} ${s.chipLui}`}
              >
                <Icon name="chevron-left" size={16} />
                {strings.allGroups}
              </button>
              {activeCat.subcategories.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={subId === x.id}
                  onClick={() => chonNhomCon(x.id)}
                  className={s.chip}
                >
                  {pick(x.name, locale)}
                </button>
              ))}
            </div>
          </HangCuon>
        )}
      </div>

      </section>
      <div className={s.menuBody}>
      {/* ===== 1. TỔNG QUAN ===== */}
      {!dangLoc && category === null && (
        <TongQuan
          locale={locale}
          strings={strings}
          onOpen={setOpenDish}
          chonNhom={(id) => chonNhom(id, true)}
        />
      )}

      {/* ===== 3. TÌM / LỌC ===== */}
      {dangLoc && (
        <section className={s.ketQua} aria-live="polite">
          {results.length === 0 ? (
            /* Nguồn kho: hyperui application/empty-states/2-dark.html (căn
               giữa: icon, tiêu đề, câu gợi ý, nút xếp dọc). */
            <div role="status" className={s.rong} data-ket-qua={0}>
              <Icon name="search" size={56} className={s.rongIcon} />
              <h2 className={s.rongTua}>{strings.empty}</h2>
              <p className={s.rongGoiY}>{strings.emptyHint}</p>
              <div className={s.rongNut}>
                {soONhomKhac > 0 && (
                  <button
                    type="button"
                    onClick={() => chonNhom(null)}
                    className={`sora-btn-gold ${s.nutLon}`}
                  >
                    {strings.searchAllCategories} ({soONhomKhac})
                  </button>
                )}
                <button
                  type="button"
                  onClick={xoaLoc}
                  className={`${s.nutPhu} ${s.nutLon}`}
                >
                  {strings.resetFilters}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={s.ketQuaDau}>
                <p className={s.ketQuaSo} data-ket-qua={results.length}>
                  {results.length} {strings.dishes}
                  {activeCat && (
                    <span className={s.ketQuaPhamVi}>
                      {" "}
                      · {pick(activeCat.name, locale)}
                    </span>
                  )}
                </p>
                <label className={s.sapXep}>
                  {strings.sortLabel}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className={`sora-field ${s.sapXepO}`}
                  >
                    <option value="nr">{strings.sort.nr}</option>
                    <option value="name">{strings.sort.name}</option>
                    <option value="price">{strings.sort.price}</option>
                  </select>
                </label>
              </div>
              <ul className={`${s.luoiNgang} ${s.luoiKetQua}`} data-ket-qua-ds="">
                {results.map((item) => (
                  <TheMon
                    key={item.id}
                    item={item}
                    locale={locale}
                    strings={strings}
                    onOpen={setOpenDish}
                    kieu="ngang"
                  />
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ===== 2. MỘT NHÓM — cả 8 bảng luôn nằm trong DOM (đủ 207 món) ===== */}
      <div data-so-mon={TONG_SO_MON}>
        {categories.map((c) => (
          <BangNhom
            key={c.id}
            cat={c}
            an={dangLoc || category !== c.id}
            subId={category === c.id ? subId : null}
            chonNhomCon={chonNhomCon}
            locale={locale}
            strings={strings}
            onOpen={setOpenDish}
          />
        ))}
      </div>

      {/* Miễn trừ in ở chân thực đơn thật — trong khung thông báo chung
          (Sếp 11/10), trước là một dòng chữ trơ dưới vạch kẻ. */}
      <KhungThongBao className={s.mienTruKhung}><p>{strings.disclaimer}</p></KhungThongBao>

      </div>
      {openDish && (
        <DishDetailModal
          key={openDish.id}
          item={openDish}
          locale={locale}
          strings={strings}
          onClose={() => setOpenDish(null)}
        />
      )}
    </div>
  );
}

function Tab({
  id,
  active,
  onClick,
  label,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      aria-controls={`bang-${id}`}
      onClick={onClick}
      className={s.tab}
    >
      {label}
    </button>
  );
}
