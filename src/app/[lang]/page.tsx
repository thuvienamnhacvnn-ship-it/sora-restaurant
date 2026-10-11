/*
 * 01 HOME — dựng lại vòng 2 (07/10/2026) theo ảnh mẫu TOÀN TRANG của Sếp
 * (`_w-agent/trang-chu-v2/mau/mau-0-toan-trang.png`) và bản chốt
 * `_w-agent/trang-chu-v2/02_chot.md`.
 *
 * Thứ tự khối, đúng ảnh mẫu:
 *   hero ba lớp (ảnh quán + đĩa sushi + cột chữ)  ->  khu danh mục
 *   (1 thẻ lớn SUSHI + lưới 2×2).
 *
 * NHỮNG THỨ ĐÃ GỠ KHỎI TRANG CHỦ, và vì sao:
 *   - `DaiPosterMon` (dải 5 thẻ BẰNG NHAU): mục 23 lời Sếp cấm thẳng *"không
 *     tạo 5 card cùng kích thước như catalog cứng nhắc"*. Tệp giữ nguyên,
 *     chưa xoá.
 *   - `BeMonAn` + `Hero360Object` + ảnh bệ trưng bày (3 đĩa trên bệ): mục 7
 *     cấm hẳn phương án *"3 đĩa thức ăn nhỏ đặt rời rạc trên mặt bàn hero"*.
 *     Hai tệp giữ nguyên trong `components/home/`, không xoá.
 *   - 3 thẻ teaser ở khổ điện thoại: ảnh mẫu toàn trang không có, và spec §4
 *     liệt kê đủ 6 khối của trang chủ mới — không có khối này.
 *   Ba thứ trên GỠ KHỎI TRANG CHỦ chứ không xoá khỏi dự án: Sếp đã lật ý vài
 *   lần, dựng lại chỉ là thêm một dòng import.
 *
 * Mockup không có footer; theo spec §14-11 desktop không làm footer
 * (pháp lý + ngôn ngữ đã nằm trong sidebar), điện thoại có footer gọn.
 */
import type { Metadata } from "next";
import { HomeDishes } from "@/components/home/HomeDishes";
import { notFound } from "next/navigation";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { HienKhiCuon } from "@/components/home/HienKhiCuon";
import { getT, isLocale } from "@/lib/i18n";

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
    /*
     * TRANG CHỦ KHOÁ TRONG MỘT MÀN HÌNH (Sếp 05/10: "home page khoá cứng 1
     * trang duy nhất không kéo được xuống bên dưới") — nhưng CHỈ từ 1200px
     * và chỉ khi màn đủ cao. Ngân sách dọc ở 1920×1080:
     *     hero 558 + khe 28 + khối thẻ 436 + chừa đáy 28 = 1050 ≤ 1080 ✓
     * Điều kiện nằm trong `.sora-tc-khoa` (globals.css), kèm lý do vì sao mốc
     * là 1200 chứ không phải 768 như luật cũ.
     */
    <HomeDishes><div className="sora-tc xl:flex xl:flex-col">
      <HomeHero
        locale={lang}
        eyebrow={t("brand.eyebrow")}
        dong1={t("home.h2Line1")}
        dong2={t("home.h2Line2")}
        phu={t("home.heroTagline")}
        ctaChinh={t("home.ctaPrimary")}
        ctaPhu={t("home.ctaSecondary")}
        chuDoc={t("home.heroRail")}
        chef={{
          eyebrow: t("chef.eyebrow"),
          question: t("chef.question"),
          cta: t("chef.cta.home"),
        }}
      />

      <section className="sora-tc-dm">
        <h2 className="sr-only">{t("common.dishes")}</h2>
        <CategoryShowcase locale={lang} nhanNut={t("common.discover")} />
      </section>



      {/* Một observer cho mọi `.sora-hien` trên trang. Không có JS thì CSS tự
          trả nội dung về hiện sẵn — xem `globals.css`. */}
      <HienKhiCuon />
    </div></HomeDishes>
  );
}
