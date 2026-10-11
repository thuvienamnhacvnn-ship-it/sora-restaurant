/*
 * 02 SPEISEKARTE — hub thực đơn duy nhất.
 * Dữ liệu: data/menu-items.json (207 món) + data/categories.json (8 nhóm),
 * do agent sora-menu-data rút từ 41 trang thực đơn in. Không gõ tay món nào.
 *
 * Bố cục (làm lại 07/10): hero → thanh lọc dính → TỔNG QUAN (băng Chef, thẻ
 * danh mục có ảnh, Beliebte) hoặc bảng MỘT NHÓM hoặc kết quả TÌM/LỌC. Tất cả
 * nằm trong `MenuBrowser`; thẻ danh mục của trang này là khối riêng trong
 * `components/menu/`, KHÔNG dùng `home/CategoryStrip` (trang chủ do phiên khác
 * làm).
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { categories } from "@/data/menu";
import { getT, isLocale } from "@/lib/i18n";

/*
 * Trang này dựng ĐỘNG, không dựng tĩnh.
 * Nó đọc `searchParams` (?kategorie=, ?gruppe=, ?dish=). Nếu để dựng tĩnh thì
 * bản build sẵn luôn có searchParams RỖNG -> link sâu `?kategorie=sushi` mở ra
 * trang tổng quan thay vì bảng Sushi, và client cũng không sửa được vì nó nhận
 * prop rỗng. Dựng động ở đây rẻ: dữ liệu nằm sẵn trong bộ nhớ, không gọi DB.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/speisekarte">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getT(lang)("nav.menu") };
}

export default async function SpeisekartePage({
  params,
  searchParams,
}: PageProps<"/[lang]/speisekarte">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  const sp = await searchParams;
  const motGiaTri = (v: string | string[] | undefined) =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

  return (
    <>
          <Suspense
            fallback={
              <p className="sora-card p-6 text-center text-muted">
                {t("common.loading")}
              </p>
            }
          >
            <MenuBrowser
              locale={lang}
              /* `?kat=` là dạng viết tắt, nhận cho link gõ tay; trang tự ghi
                 `?kategorie=` (các link từ trang chủ đang dùng tên này). */
              kategorieBanDau={motGiaTri(sp.kategorie) ?? motGiaTri(sp.kat)}
              nhomConBanDau={motGiaTri(sp.gruppe)}
              monBanDau={motGiaTri(sp.dish)}
              strings={{
                searchPlaceholder: t("menu.searchPlaceholder"),
                searchLabel: t("menu.searchLabel"),
                clearSearch: t("menu.clearSearch"),
                all: t("menu.all"),
                categories: t("menu.categories"),
                tabs: Object.fromEntries(
                  categories.map((c) => [c.id, t(`menu.tabs.${c.id}`)])
                ),
                dietaryLabel: t("menu.dietary.label"),
                dietary: {
                  vegetarian: t("menu.dietary.vegetarian"),
                  vegan: t("menu.dietary.vegan"),
                  glutenfree: t("menu.dietary.glutenfree"),
                  spicy: t("menu.dietary.spicy"),
                },
                empty: t("common.empty"),
                emptyHint: t("menu.emptyHint"),
                resetFilters: t("menu.resetFilters"),
                searchAllCategories: t("menu.searchAllCategories"),
                loading: t("common.loading"),
                dishes: t("common.dishes"),
                from: t("common.from"),
                more: t("common.more"),
                subcategories: t("menu.subcategories"),
                allGroups: t("menu.allGroups"),
                groupPhotoNote: t("menu.groupPhotoNote"),
                sortLabel: t("menu.sortLabel"),
                sort: {
                  nr: t("menu.sort.nr"),
                  name: t("menu.sort.name"),
                  price: t("menu.sort.price"),
                },
                priceOnRequest: t("menu.priceOnRequest"),
                askChefCategory: t("menu.askChefCategory"),
                pieces: t("menu.pieces"),
                chefBadge: t("menu.chefBadge"),
                popularTitle: t("menu.popularTitle"),
                allDishes: t("menu.allDishes"),
                disclaimer: t("menu.disclaimer"),
                detail: {
                  close: t("common.close"),
                  allergens: t("menu.allergens"),
                  additives: t("menu.additives"),
                  variants: t("menu.variants"),
                  sizes: t("menu.sizes"),
                  askChef: t("menu.askChef"),
                  title: t("menu.detailTitle"),
                },
              }}
            />
          </Suspense>


      <MobileFooter locale={lang} />
    </>
  );
}
