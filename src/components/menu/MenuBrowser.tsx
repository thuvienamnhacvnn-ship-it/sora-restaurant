"use client";

/*
 * Speisekarte — một hub duy nhất cho cả thực đơn (KIT: "Do not create separate
 * top-level pages for each food category").
 *
 * LỆNH CỦA SẾP: hiện ĐỦ 100% — cả 207 món.
 * Không cắt bớt, không "xem thêm" giấu phần còn lại. Bộ lọc Alle phải dựng
 * đúng 207 thẻ. Cộng 8 nhóm lại cũng phải ra 207.
 *   sushi 109 · getraenke 63 · hauptgerichte 13 · vorspeisen 8 · salate 4 ·
 *   vietnamese-classics 4 · suppen 3 · desserts 3
 *
 * Dựng hết 207 thẻ một lúc chịu được vì thẻ không có ảnh nặng: ảnh món chưa
 * có (`image: null` toàn bộ), và khi có thì mỗi ảnh đều `loading="lazy"`.
 * Lọc + tìm + sắp xếp chạy hoàn toàn phía client trên mảng đã nạp sẵn.
 *
 * Bốn chỗ "đủ 100%" dễ vỡ, đã xử lý:
 *  1. món không ảnh vẫn hiện — ô hoạ tiết + icon thay ảnh, không ẩn món.
 *  2. nr 22 không có giá -> "Preis auf Anfrage", không in 0 €, không rơi khỏi
 *     danh sách, và khi sắp theo giá thì xuống CUỐI chứ không biến mất.
 *  3. 34 món `priceFrom` -> "ab 14,90 €".
 *  4. `variants`/`sizes` là biến thể của MỘT món -> một thẻ, không tách.
 *
 * Mockup có mà ở đây KHÔNG có, cố ý:
 *  - thẻ "CHEF EMPFEHLUNG": không món nào `featured: true`.
 *  - nút "+" giỏ hàng: `onlineOrdering: false` (§11-E) -> chevron mở modal.
 *  - thang 2–3 quả ớt: thực đơn in không chia cấp độ cay, chỉ có/không.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { DishDetailModal } from "./DishDetailModal";
import { MasterChefTrigger } from "@/components/chef/MasterChef";
import { ChuNhomMon, coChuNhom } from "@/components/chu/ChuCo";
import {
  categories,
  categoryById,
  displayPrice,
  filterItems,
  itemDescription,
  itemName,
  menuItems,
  minPrice,
  type DietaryKey,
  type MenuItem,
} from "@/data/menu";
import { MENU_DISCLAIMER } from "@/data/allergens";
import { dishImage, groupImage } from "@/data/menu-images";
import { pick, type Locale } from "@/lib/i18n";

export type MenuStrings = {
  searchPlaceholder: string;
  searchLabel: string;
  all: string;
  categories: string;
  dietaryLabel: string;
  dietary: Record<DietaryKey, string>;
  empty: string;
  loading: string;
  dishes: string;
  subcategories: string;
  groupPhotoNote: string;
  sortLabel: string;
  sort: { nr: string; name: string; price: string };
  priceOnRequest: string;
  askChefCategory: string;
  pieces: string;
  detail: {
    close: string;
    allergens: string;
    additives: string;
    variants: string;
    sizes: string;
    askChef: string;
    title: string;
    noImage: string;
  };
};

type SortKey = "nr" | "name" | "price";

const DIETARY: { key: DietaryKey; icon: "leaf" | "wheat" | "flame" }[] = [
  { key: "vegetarian", icon: "leaf" },
  { key: "vegan", icon: "leaf" },
  { key: "glutenfree", icon: "wheat" },
  { key: "spicy", icon: "flame" },
];

export function MenuBrowser({
  locale,
  strings,
  kategorieBanDau = null,
  monBanDau = null,
}: {
  locale: Locale;
  strings: MenuStrings;
  /* Lấy từ `searchParams` phía MÁY CHỦ, không phải `useSearchParams()`.
     Gọi `useSearchParams()` ở đây là Next ép cả nhánh sang dựng phía client:
     bản production trả về mỗi dòng "Speisekarte wird geladen", 207 thẻ món
     BIẾN MẤT khỏi HTML (71 KB thay vì 450 KB). Dev không lộ ra vì dev vẫn
     dựng sẵn. Chỉ phát hiện khi đếm thẻ trên bản đã deploy. */
  kategorieBanDau?: string | null;
  monBanDau?: string | null;
}) {

  const [category, setCategory] = useState<string | null>(kategorieBanDau);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [diet, setDiet] = useState<DietaryKey[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("nr");
  const [openDish, setOpenDish] = useState<MenuItem | null>(null);

  /* Mở thẳng một món qua ?dish=<id> (Master Chef gợi ý xong bấm "Gericht
     ansehen"). Chỉnh state khi URL đổi bằng cách so với giá trị lần trước
     NGAY TRONG render — React 19 cấm setState trong useEffect kiểu này. */
  const [lastDishParam, setLastDishParam] = useState(monBanDau);
  if (monBanDau !== lastDishParam) {
    setLastDishParam(monBanDau);
    setOpenDish(monBanDau ? (menuItems.find((i) => i.id === monBanDau) ?? null) : null);
  }

  const activeCat = category ? categoryById(category) : undefined;

  /* id của nhóm con đang mở — dùng cho CẢ ảnh nhóm lẫn chữ nét cọ.
     Khoá theo `subcategory.id`, không phải tên hiển thị. */
  const activeSubId = (() => {
    if (!activeCat || !subcategory) return null;
    const sub = activeCat.subcategories.find(
      (x) => pick(x.name, locale) === subcategory || x.name.de === subcategory
    );
    return sub?.id ?? null;
  })();
  const activeSubImage = activeSubId ? groupImage(activeSubId) : null;

  /* Tiêu đề kết quả viết bằng chữ nét cọ khi có nhãn; "Alle" không có nhãn
     nên vẫn là chữ thường. Chữ GHÉP (ChuNhomMon) nằm ở thân trang, cách xa
     nhãn Sếp vẽ ở hero — trưởng nhóm cấm đặt hai loại cạnh nhau cùng hàng. */
  const nhomChu = activeSubId ?? activeCat?.id ?? null;

  const results = useMemo(() => {
    const list = filterItems({
      category,
      subcategory,
      dietary: diet,
      query,
      locale,
    });
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
  }, [category, subcategory, diet, query, sort, locale]);

  const toggleDiet = (key: DietaryKey) =>
    setDiet((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));

  const chooseCategory = (id: string | null) => {
    setCategory(id);
    setSubcategory(null);
    /* Đồng bộ URL bằng History API, KHÔNG dùng router: router.replace sẽ
       gọi lại server mỗi lần bấm tab. Đây chỉ là đổi địa chỉ cho chia sẻ
       link được, không phải điều hướng. */
    window.history.replaceState(null, "", id ? `?kategorie=${id}` : location.pathname);
  };

  if (menuItems.length === 0) {
    return (
      <p className="sora-card p-6 text-center text-muted">{strings.loading}</p>
    );
  }

  return (
    <>
      {/* Hàng điều khiển: ô tìm kiếm + tab danh mục */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative w-full max-w-[360px] shrink-0">
          <span className="sr-only">{strings.searchLabel}</span>
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={strings.searchPlaceholder}
            className="sora-field h-[35px] pl-10"
          />
        </label>

        <div
          role="tablist"
          aria-label={strings.categories}
          className="flex flex-wrap gap-2.5"
        >
          <Tab
            active={category === null}
            onClick={() => chooseCategory(null)}
            label={strings.all}
            count={menuItems.length}
          />
          {categories.map((c) => (
            <Tab
              key={c.id}
              active={category === c.id}
              onClick={() => chooseCategory(c.id)}
              label={pick(c.name, locale)}
              count={c.itemCount}
            />
          ))}
        </div>
      </div>

      {/* Chip chế độ ăn + sắp xếp */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <div
          className="flex flex-wrap gap-2.5"
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
                className={`inline-flex h-[26px] items-center gap-1.5 rounded-[var(--radius-btn)] border px-3 text-[13px] transition-colors ${
                  on
                    ? "border-gold/80 bg-gold/15 text-gold-bright"
                    : "border-gold/45 text-muted hover:text-gold-bright"
                }`}
              >
                <Icon
                  name={d.icon}
                  size={14}
                  className={d.key === "spicy" ? "text-red" : "text-green"}
                />
                {strings.dietary[d.key]}
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex items-center gap-2 text-[12px] text-muted">
          {strings.sortLabel}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="sora-field h-[26px] w-auto py-0 pr-2 pl-2 text-[12px]"
          >
            <option value="nr">{strings.sort.nr}</option>
            <option value="name">{strings.sort.name}</option>
            <option value="price">{strings.sort.price}</option>
          </select>
        </label>
      </div>

      {/* Nhóm con — chỉ hiện khi đang chọn một danh mục có nhóm con (KIT).
          Sushi 14 nhóm con, Getränke 13 — phải tới được hết. */}
      {activeCat && activeCat.subcategories.length > 1 && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label={strings.subcategories}
        >
          {activeCat.subcategories.map((s) => {
            const name = pick(s.name, locale);
            const on = subcategory === name;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSubcategory(on ? null : name)}
                className={`rounded-[var(--radius-btn)] border px-2.5 py-1 text-[12px] ${
                  on
                    ? "border-gold/80 bg-gold/15 text-gold-bright"
                    : "border-gold/35 text-muted hover:text-gold-bright"
                }`}
              >
                {name}
                <span className="ml-1.5 text-muted/60">{s.itemCount}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tiêu đề kết quả — tên danh mục THẬT, không phải "Beliebte Gerichte"
          của mockup (không có dữ liệu nào nói món nào được ưa chuộng). */}
      <div className="mt-8 mb-4 flex flex-wrap items-end justify-between gap-3">
        {nhomChu && coChuNhom(nhomChu) ? (
          <ChuNhomMon
            nhom={nhomChu}
            locale={locale}
            the="h2"
            chuThat
            caoChuHoa={{ dienThoai: 22, mayTinh: 30 }}
          />
        ) : (
          <h2 className="sora-section-title text-[28px]">
            {activeCat ? pick(activeCat.name, locale) : strings.all}
          </h2>
        )}
        <div className="flex items-center gap-4">
          {/* Master Chef ở trang này: gợi ý bó trong NHÓM ĐANG MỞ (KIT 02). */}
          <MasterChefTrigger
            className="sora-btn-outline"
            category={category}
            seed={category === "sushi" ? "sushi" : undefined}
          >
            <Icon name="chef" size={14} />
            {strings.askChefCategory}
          </MasterChefTrigger>
          <p
            className="text-[13px] text-muted"
            data-ket-qua={results.length}
          >
            {results.length} {strings.dishes}
          </p>
        </div>
      </div>

      {/* Ảnh đại diện nhóm con — chỗ DUY NHẤT được dùng ảnh nhóm. Chữ nằm
          dưới ảnh, không chồng lên (luật của Sếp + dòng đầu 03_PAGE_SPECS). */}
      {activeSubImage && (
        <figure className="mb-5 overflow-hidden rounded-[var(--radius-card)] border border-gold/35">
          {/*
           * Ảnh nhóm là 4:3 nhưng ô này rộng ~1064px — để `aspect-[4/3]` thì
           * cao gần 800px, quá khổ cho một dải giới thiệu. Nên giữ chiều cao và
           * đổi sang `contain`: ảnh hiện TRỌN, không cắt tí nào, phần thừa hai
           * bên là nền thẻ chứ không phải lớp đen phủ lên ảnh.
           * (Khung cũ `cover` ở tỉ lệ 5,6:1 cắt mất 76% chiều cao ảnh.)
           */}
          <div className="relative h-[150px] w-full bg-bg md:h-[190px]">
            <Image
              src={activeSubImage}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 1064px"
              style={{ objectFit: "contain" }}
            />
          </div>
          <figcaption className="bg-elevated px-4 py-2 text-[12px] text-muted">
            {subcategory} · {strings.groupPhotoNote}
          </figcaption>
        </figure>
      )}

      {results.length === 0 ? (
        <p className="sora-card p-6 text-center text-muted">{strings.empty}</p>
      ) : (
        <ul
          className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4"
          data-so-mon={results.length}
        >
          {results.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              locale={locale}
              strings={strings}
              onOpen={() => setOpenDish(item)}
            />
          ))}
        </ul>
      )}

      {/* Miễn trừ in ở chân thực đơn thật — chép nguyên văn */}
      <p className="mt-8 border-t border-gold/20 pt-4 text-[12px] leading-relaxed text-muted/70">
        {MENU_DISCLAIMER.de}
      </p>

      {openDish && (
        <DishDetailModal
          item={openDish}
          locale={locale}
          strings={strings}
          onClose={() => setOpenDish(null)}
        />
      )}
    </>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`h-[35px] rounded-[var(--radius-btn)] border px-3.5 text-[14px] whitespace-nowrap transition-colors ${
        active
          ? "border-gold/65 bg-red text-white"
          : "border-gold/45 bg-[#0e0a05] text-[#d9d8d2] hover:border-gold/80"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-[12px] ${active ? "text-white/70" : "text-muted/60"}`}>
        {count}
      </span>
    </button>
  );
}

/**
 * Thẻ món: ảnh vuông bên TRÁI, chữ bên PHẢI — hai vùng tách hẳn.
 * Không bao giờ đặt chữ chồng lên ảnh (luật cứng của Sếp + dòng đầu
 * `03_PAGE_SPECS` của KIT).
 */
function MenuCard({
  item,
  locale,
  strings,
  onOpen,
}: {
  item: MenuItem;
  locale: Locale;
  strings: MenuStrings;
  onOpen: () => void;
}) {
  const price = displayPrice(item, locale);
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="sora-card group flex h-full w-full gap-2.5 p-2.5 text-left transition-colors hover:border-gold/80"
      >
        <DishThumb item={item} alt={itemName(item, locale)} />

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-w-0 items-start gap-2">
            <span
              lang="de"
              className="min-w-0 flex-1 font-serif text-[15px] leading-snug break-words hyphens-auto text-ivory"
            >
              <span className="mr-1.5 text-[13px] text-muted/60">{item.nr}</span>
              {itemName(item, locale)}
            </span>
            <Icon
              name="chevron-right"
              size={18}
              className="mt-0.5 shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
            />
          </span>

          <span className="mt-1 line-clamp-2 min-w-0 overflow-hidden text-[13px] leading-snug break-words text-muted">
            {itemDescription(item, locale)}
          </span>

          <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
            {price.onRequest ? (
              <span className="text-[13px] text-gold-bright italic">
                {strings.priceOnRequest}
              </span>
            ) : (
              <span className="text-[15px] font-semibold text-gold-bright">
                {price.from ? "ab " : ""}
                {price.text}
              </span>
            )}
            {/* MỘT dấu hiệu cay, không phải thang 2–3 quả ớt: thực đơn in
                không chia cấp độ, vẽ thang là bịa dữ liệu. */}
            {item.spice !== "none" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <Icon name="flame" size={13} className="text-red" />
                {strings.dietary.spicy}
              </span>
            )}
            {item.dietary.includes("vegetarian") && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <Icon name="leaf" size={13} className="text-green" />
                {strings.dietary.vegetarian}
              </span>
            )}
            {item.pieces ? (
              <span className="text-[11px] text-muted/70">
                {item.pieces} {strings.pieces}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * Ô ảnh món. Chưa có ảnh nào (`image: null` cả 207 món, agent `sora-anh`
 * đang cắt) -> hoạ tiết sóng vàng + icon, KHÔNG ẩn món đi vì thiếu ảnh.
 * Có ảnh thì tự hiện, `loading="lazy"` vì một trang có tới 207 thẻ.
 */
function DishThumb({ item, alt }: { item: MenuItem; alt: string }) {
  // Chỉ ảnh RIÊNG. Ảnh nhóm cố ý KHÔNG dùng ở đây — xem data/menu-images.ts.
  const src = item.image ?? dishImage(item.id);
  // 76×57 = đúng tỉ lệ 4:3 của ảnh món. Khung vuông `size-[76px]` cũ cắt mất 25%.
  if (src) {
    return (
      <span className="relative h-[57px] w-[76px] shrink-0 overflow-hidden rounded-[6px] border border-gold/25">
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          sizes="76px"
          style={{ objectFit: "cover" }}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="relative grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-[6px] border border-gold/25 bg-elevated"
    >
      <span
        className="absolute inset-x-0 bottom-0 h-7 bg-cover bg-bottom bg-no-repeat opacity-25"
        style={{ backgroundImage: "url(/decor/gold_wave.svg)" }}
      />
      <Icon name="utensils" size={22} className="relative text-gold/35" />
    </span>
  );
}
