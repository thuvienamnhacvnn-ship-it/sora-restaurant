/*
 * 01 HOME — thứ tự khối theo KIT 03_PAGE_SPECS/01_HOME.md + mockup 01_home.png:
 *   hero (chữ trái + 3 bệ 360 phải) -> strip 5 danh mục -> 3 thẻ teaser.
 *
 * Mockup không có footer; theo spec §14-11 desktop không làm footer
 * (pháp lý + ngôn ngữ đã nằm trong sidebar), điện thoại có footer gọn.
 */
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { Hero360Object } from "@/components/home/Hero360Object";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { Icon } from "@/components/ui/Icon";
import { GoldLeafEdge } from "@/components/decor/Decor";
import { heroObjects } from "@/data/hero-objects";
import { getT, href, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getT(lang);
  return { description: t("meta.homeDescription") };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  return (
    <>
      <PageHero
        page="home"
        big
        locale={lang}
        /* Không truyền `wordmarkImage` nữa: PageHero tự lấy wordmark nét cọ
           trong bộ chữ Sếp gửi (`public/chu/`, qua <WordmarkSora>). */
        wordmark={t("brand.name")}
        eyebrow={t("brand.eyebrow")}
        chef={{
          eyebrow: t("chef.eyebrow"),
          question: t("chef.question"),
          cta: t("chef.cta.home"),
        }}
        stage={
          <div className="flex w-full items-end justify-center gap-4">
            {heroObjects.map((obj, i) => (
              <Hero360Object
                key={obj.id}
                label={t(obj.labelKey)}
                badge={t("home.stage.badge")}
                placeholder={t("home.stage.placeholder")}
                webm={obj.webm}
                poster={obj.poster}
                primary={obj.primary}
                loadOrder={i}
              />
            ))}
          </div>
        }
      >
        <h2 className="sora-h2">
          {t("home.h2Line1")}
          <br />
          {t("home.h2Line2")}
        </h2>

        {/* 3 dòng thân trong mockup là chữ AI — không chép. */}
        <ChoSep
          note="Hero-Text Startseite (3 Zeilen)"
          lines={3}
          className="mt-4 max-w-[345px]"
        />

        <div className="mt-6 flex flex-wrap gap-4">
          <Link href={href("/reservierung", lang)} className="sora-btn-primary">
            <Icon name="calendar" size={18} />
            {t("home.ctaPrimary")}
            <Icon name="arrow-right" size={16} />
          </Link>
          <Link href={href("/speisekarte", lang)} className="sora-btn-ghost">
            <Icon name="book-open" size={18} />
            {t("home.ctaSecondary")}
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </PageHero>

      {/* Bệ 360 ở khổ điện thoại: xuống dưới hero, chỉ 1 vật thể tự chạy */}
      <div className="mt-8 grid grid-cols-3 items-end gap-3 px-[var(--page-pad)] md:hidden">
        {heroObjects.map((obj, i) => (
          <Hero360Object
            key={obj.id}
            label={t(obj.labelKey)}
            badge={t("home.stage.badge")}
            placeholder={t("home.stage.placeholder")}
            webm={obj.webm}
            poster={obj.poster}
            primary={obj.primary}
            loadOrder={i}
          />
        ))}
      </div>

      <SectionFrame>
        <h2 className="sr-only">{t("home.categoryStrip")}</h2>
        <CategoryStrip locale={lang} dishesLabel={t("common.dishes")} />
      </SectionFrame>

      <SectionFrame>
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <TeaserCard
            title={t("home.teaser.selectionTitle")}
            cta={t("home.teaser.selectionCta")}
            to={href("/speisekarte", lang)}
            note="Untertitel Chef's Selection"
            /*
             * decor: mẫu 01_home có dải VÀNG DÁT chạy hết mép trái đúng thẻ
             * này (đo 1:1 ở _w-agent: x 273→295 trên khung 1672, tức ~21px ở
             * 1440; mép trong tướp như lá vàng rách). Hai thẻ còn lại không có.
             */
            decor={<GoldLeafEdge width={21} opacity={0.9} />}
          />
          <TeaserCard
            title={t("home.teaser.galleryTitle")}
            cta={t("home.teaser.galleryCta")}
            to={href("/galerie", lang)}
            image="/anh/restaurant-01.webp"
            imageAlt=""
            note="Untertitel Galerie"
          />
          <TeaserCard
            title={t("home.teaser.reservationTitle")}
            cta={t("home.teaser.reservationCta")}
            to={href("/reservierung", lang)}
            image="/anh/restaurant-05.webp"
            imageAlt=""
            note="Untertitel Reservierung"
          />
        </ul>
      </SectionFrame>

      <MobileFooter locale={lang} />
    </>
  );
}

/** Thẻ teaser: chữ trái, ảnh nửa phải, nút viền gold dưới cùng. */
function TeaserCard({
  title,
  cta,
  to,
  image,
  imageAlt = "",
  note,
  decor,
}: {
  title: string;
  cta: string;
  to: string;
  image?: string;
  imageAlt?: string;
  note: string;
  /** Hoạ tiết riêng của thẻ (lớp decor chèn vào, luôn nằm sau chữ). */
  decor?: React.ReactNode;
}) {
  return (
    <li className="sora-card relative flex min-h-[160px] overflow-hidden">
      {decor}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="sora-section-title text-[28px]">{title}</h3>
          <ChoSep note={note} className="mt-2 max-w-[90%]" />
        </div>
        <Link href={to} className="sora-btn-outline mt-4 w-fit">
          {cta}
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>
      {image && (
        // Mép trái ảnh tự fade (mask) thay vì bị đổ một lớp màu lên trên.
        <div
          aria-hidden="true"
          className="relative w-[42%] shrink-0"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 45%)",
          }}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1199px) 45vw, 190px"
            style={{ objectFit: "cover", objectPosition: "center 42%" }}
          />
        </div>
      )}
    </li>
  );
}
