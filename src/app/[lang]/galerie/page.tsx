/*
 * 04 GALERIE — KIT 03_PAGE_SPECS/04_GALERIE.md + mockup 04_galerie.png.
 *
 * KIT: "Show the real restaurant as the proof of atmosphere. Real uploaded
 * photos have priority." → lưới dùng 7 ẢNH THẬT của quán + clip đi dạo thật,
 * KHÔNG ảnh AI.
 *
 * LUẬT ẢNH (Sếp, 04/10): ảnh thật chụp ban ngày, đèn LED xanh lạnh, lệch tông
 * "Sakura Night" — KỆ. CẤM phủ lớp tối lên ảnh để ép về tông đêm. Ảnh là bằng
 * chứng không gian thật; muốn hoà vào nền tối thì dùng khoảng trắng, viền chỉ
 * vàng mảnh và nền trang tối, không phải bôi đen lên ảnh.
 *
 * DECOR (_w-agent/05_decor.md): trang này dè dặt nhất vì cả trang đã là ảnh.
 * Chỉ MỘT cành sakura ở góc trên-trái hero, nằm SAU chữ (`-z-10`), và không
 * có một cánh hoa nào trên lưới ảnh hay trong lightbox.
 *
 * Phụ đề hero + 3 dòng thân trong mockup là chữ AI → <ChoSep/> (spec §13).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { DecorAnchor, SakuraEdge } from "@/components/decor/Decor";
import { GalleryBrowser } from "@/components/gallery/GalleryBrowser";
import { CHU_NHAN } from "@/components/chu/ChuCo";
import { getT, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/galerie">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getT(lang);
  return { title: t("nav.gallery") };
}

export default async function GaleriePage({
  params,
}: PageProps<"/[lang]/galerie">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  /*
   * Tiêu đề trang là NHÃN ẢNH nét cọ vàng (public/chu) — `PageHero` tự dựng
   * qua <ChuCo> theo `page` + `locale`, đúng spec §2.2 ("wordmark ảnh riêng,
   * không phải webfont").
   *
   * Vẫn phải tự tra CHU_NHAN ở đây vì `wordmark` là CHỮ THẬT đi vào `alt` +
   * bản ẩn cho máy đọc màn hình. Bản VI của ảnh là "Bộ sưu tập", trong khi
   * t("nav.gallery") còn rơi về tiếng Đức (vi.json cố ý rỗng) -> truyền t() vào
   * là máy đọc màn hình đọc một đằng, ảnh hiện một nẻo.
   */
  const nhan = lang === "vi" && CHU_NHAN.gallery.vi ? CHU_NHAN.gallery.vi : CHU_NHAN.gallery.de;

  return (
    <>
      {/*
       * decor: cành hoa góc trên-trái hero nay nằm trong chính `PageHero`
       * (dùng chung cả 6 trang). Bản cũ đặt ở đây với `-z-10` nên từ lúc hero
       * bỏ mask, ảnh banner tràn kín và che mất nó hoàn toàn — gỡ đi.
       */}
      <div className="relative isolate">
        <PageHero
          page="gallery"
          locale={lang}
          wordmark={nhan.chu}
          chef={{
            eyebrow: t("chef.eyebrow"),
            question: t("chef.question"),
            cta: t("chef.cta.gallery"),
          }}
        >
          <ChoSep note="Untertitel Galerie (1 Zeile)" className="max-w-[420px]" />
          <ChoSep
            note="Einleitungstext Galerie (3 Zeilen)"
            lines={3}
            className="mt-3 max-w-[345px]"
          />
        </PageHero>

        {/*
         * decor: cành hoa bám mép phải cuối hero ĐÃ GỠ. Sếp ra lệnh 04/10
         * "bỏ hết hoa đào khỏi banner, trang chủ lẫn trang con — ảnh banner
         * đứng một mình", và phép đo điểm ảnh cho thấy cành này vẽ lên 2,0%
         * diện tích `banner/galerie_hero` (lệch màu tối đa 477). Cột hoa ở
         * MÁNG LỀ dưới đây thì giữ — nó nằm trên nền trang, không trên ảnh.
         */
        }
      </div>

      <DecorAnchor>
        <SakuraEdge
          side="left"
          run={520}
          /* 32px = đúng bề rộng máng lề (nội dung bắt đầu ở x 288, sidebar
             hết ở 256). Luật: KHÔNG một điểm decor nào đè lên ảnh trong lưới. */
          depth={32}
          tile={520}
          top={40}
          opacity={0.4}
          className="hidden xl:block"
        />
      </DecorAnchor>

      <SectionFrame>
        <h2 className="sr-only">{t("nav.gallery")}</h2>
        <GalleryBrowser
          strings={{
            filters: {
              all: t("gallery.filters.all"),
              restaurant: t("gallery.filters.restaurant"),
              bar: t("gallery.filters.bar"),
              food: t("gallery.filters.food"),
              details: t("gallery.filters.details"),
              video: t("gallery.filters.video"),
            },
            filterLabel: t("gallery.filterLabel"),
            videoTitle: t("gallery.videoTitle"),
            videoCaption: t("gallery.videoCaption"),
            play: t("gallery.play"),
            zoom: t("gallery.zoom"),
            close: t("common.close"),
            prev: t("gallery.prev"),
            next: t("gallery.next"),
            noFood: t("gallery.noFood"),
          }}
        />
      </SectionFrame>

      <MobileFooter locale={lang} />
    </>
  );
}
