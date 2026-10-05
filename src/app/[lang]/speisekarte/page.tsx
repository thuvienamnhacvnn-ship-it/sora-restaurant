/*
 * 02 SPEISEKARTE — hub thực đơn duy nhất.
 * Dữ liệu: data/menu-items.json (207 món) + data/categories.json (8 nhóm),
 * do agent sora-menu-data rút từ 41 trang thực đơn in. Không gõ tay món nào.
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { CornerSakura } from "@/components/decor/Decor";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { getT, isLocale } from "@/lib/i18n";

/*
 * Trang này dựng ĐỘNG, không dựng tĩnh.
 * Nó đọc  (?kategorie=, ?dish=). Nếu để dựng tĩnh thì bản
 * build sẵn luôn có searchParams RỖNG -> link sâu  ra đủ
 * 207 món thay vì 109, và client cũng không sửa được vì nó nhận prop rỗng.
 * Dựng động ở đây rẻ: dữ liệu nằm sẵn trong bộ nhớ, không gọi DB.
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
      <PageHero
        page="menu"
        locale={lang}
        wordmark={t("nav.menu")}
        eyebrow={t("brand.eyebrow")}
        chef={{
          eyebrow: t("chef.eyebrow"),
          question: t("chef.question"),
          cta: t("chef.cta.menu"),
        }}
      >
        <ChoSep note="Hero-Text Speisekarte (3 Zeilen)" lines={3} className="max-w-[420px]" />
      </PageHero>

      <SectionFrame>
        {/*
         * decor: mẫu 02 có một cành hoa đào bám MÉP PHẢI ngay dưới hero, tràn
         * ra khỏi khung (đo 1:1: x 1613→quá 1672, y 497→660 trên khung 1672).
         * Lớp bọc `relative isolate` chỉ để định vị cành — không đổi bố cục
         * bên trong. Cành nằm ở máng lề phải, không chạm ô tìm kiếm/chip lọc.
         */}
        <div className="relative isolate">
          <CornerSakura
            corner="tr"
            art="branch"
            width={240}
            offsetX={-150}
            offsetY={232}
            opacity={0.8}
            className="hidden xl:block"
          />
        <Suspense
          fallback={
            <p className="sora-card p-6 text-center text-muted">
              {t("common.loading")}
            </p>
          }
        >
          <MenuBrowser
            locale={lang}
            kategorieBanDau={motGiaTri(sp.kategorie)}
            monBanDau={motGiaTri(sp.dish)}
            strings={{
              searchPlaceholder: t("menu.searchPlaceholder"),
              searchLabel: t("menu.searchLabel"),
              all: t("menu.all"),
              categories: t("menu.categories"),
              dietaryLabel: t("menu.dietary.label"),
              dietary: {
                vegetarian: t("menu.dietary.vegetarian"),
                vegan: t("menu.dietary.vegan"),
                glutenfree: t("menu.dietary.glutenfree"),
                spicy: t("menu.dietary.spicy"),
              },
              empty: t("common.empty"),
              loading: t("common.loading"),
              dishes: t("common.dishes"),
              subcategories: t("menu.subcategories"),
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
              detail: {
                close: t("common.close"),
                allergens: t("menu.allergens"),
                additives: t("menu.additives"),
                variants: t("menu.variants"),
                sizes: t("menu.sizes"),
                askChef: t("menu.askChef"),
                title: t("menu.detailTitle"),
                noImage: t("menu.noImage"),
              },
            }}
          />
        </Suspense>
        </div>
      </SectionFrame>

      <SectionFrame>
        <h2 className="sr-only">{t("menu.categories")}</h2>
        <CategoryStrip
          locale={lang}
          dishesLabel={t("common.dishes")}
          variant="round"
        />
      </SectionFrame>

      <MobileFooter locale={lang} />
    </>
  );
}
