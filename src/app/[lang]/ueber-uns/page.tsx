/*
 * 05 ÜBER UNS — KIT 03_PAGE_SPECS/05_UEBER_UNS.md + mockup 05_ueber_uns.png.
 *
 * ĐÂY LÀ TRANG DỄ BỊA NHẤT CỦA CẢ SITE. KIT ghi thẳng:
 *   "Do not fabricate founder/team biography unless supplied."
 * Nên: KHÔNG tiểu sử chủ quán, KHÔNG năm thành lập, KHÔNG số năm kinh nghiệm,
 * KHÔNG câu chuyện khởi nghiệp. Năm khối câu chuyện của KIT chỉ có TIÊU ĐỀ —
 * tiêu đề là của KIT nên dùng được; phần thân là chữ AI trong mockup nên nằm
 * trong <ChoSep/> cho tới khi Sếp gửi.
 *
 * Phần DUY NHẤT được viết thật là dải số liệu cuối trang (trưởng nhóm đã
 * duyệt 04/10) — xem components/about/FactsStrip.tsx.
 *
 * DECOR — dùng lớp chung `components/decor`, mỗi mục MỘT họ hoạ tiết:
 *   hero          -> do chính PageHero lo, trang này KHÔNG tự dán thêm
 *   4 thẻ triết lý-> không có gì (đã 4 thẻ + 3 ảnh, thêm là rối)
 *   câu chuyện    -> <GoldLeafEdge/> dải vàng dát mép trái (đúng mẫu 05)
 *   dải số liệu   -> <GoldLeafEdge/> cùng dải vàng dát (trong FactsStrip)
 *
 * ẢNH: ảnh THẬT của quán. Không phủ lớp màu lên ảnh để ép về tông tối.
 */
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { GoldLeafEdge } from "@/components/decor/Decor";
import { PhilosophyCards } from "@/components/about/PhilosophyCards";
import { FactsStrip, type Fact } from "@/components/about/FactsStrip";
import { at } from "@/components/about/text";
import { categoryById, menuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { CHU_NHAN, WordmarkSora } from "@/components/chu/ChuCo";
import { getT, isLocale, pick } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/ueber-uns">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getT(lang);
  return { title: t("nav.about") };
}

export default async function UeberUnsPage({
  params,
}: PageProps<"/[lang]/ueber-uns">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  /* Đếm lúc build từ data/menu-items.json — tuyệt đối không gõ tay con số. */
  const sushi = categoryById("sushi");
  const drinks = categoryById("getraenke");

  const facts: Fact[] = [
    {
      key: "total",
      icon: "book-open",
      value: String(menuItems.length),
      label: at("dishesOnMenu", lang),
    },
    ...(sushi
      ? [
          {
            key: "sushi",
            icon: "utensils" as const,
            value: String(sushi.itemCount),
            label: at("sushiPositions", lang),
          },
        ]
      : []),
    ...(drinks
      ? [
          {
            key: "drinks",
            icon: "globe" as const,
            value: String(drinks.itemCount),
            label: at("drinkPositions", lang),
          },
        ]
      : []),
    {
      key: "hours",
      icon: "clock",
      value: pick(restaurant.openingHours.text, lang),
      label: at("openDaily", lang),
    },
    {
      key: "address",
      icon: "map-pin",
      value: restaurant.address.city,
      label: restaurant.address.street,
    },
  ];

  /*
   * Tiêu đề trang là NHÃN ẢNH nét cọ vàng (public/chu) — `PageHero` tự dựng
   * qua <ChuCo> theo `page` + `locale`, đúng spec §2.2 ("wordmark ảnh riêng,
   * không phải webfont").
   *
   * Vẫn phải tự tra CHU_NHAN ở đây vì `wordmark` là CHỮ THẬT đi vào `alt` +
   * bản ẩn cho máy đọc màn hình. Bản VI của ảnh là "Về chúng tôi", trong khi
   * t("nav.about") còn rơi về tiếng Đức (vi.json cố ý rỗng) -> truyền t() vào
   * là máy đọc màn hình đọc một đằng, ảnh hiện một nẻo.
   */
  const nhan = lang === "vi" && CHU_NHAN.about.vi ? CHU_NHAN.about.vi : CHU_NHAN.about.de;

  return (
    <>
      {/*
       * decor: hoạ tiết hero nay nằm trong chính `PageHero` (lớp dùng chung
       * `components/decor`, áp cho cả 6 trang). Bản cũ tự dán thêm một cành ở
       * đây -> thành HAI họ hoa đào chồng nhau trong cùng một mục. Đã gỡ.
       */}
      <div className="relative isolate">
        <PageHero
          page="about"
          locale={lang}
          wordmark={nhan.chu}
          chef={{
            eyebrow: t("chef.eyebrow"),
            question: t("chef.question"),
            cta: t("chef.cta.about"),
          }}
        >
          <ChoSep note="Lead Über uns (1 Zeile)" className="max-w-[460px]" />
          <ChoSep
            note="Einleitungstext Über uns (5 Zeilen)"
            lines={5}
            className="mt-3 max-w-[460px]"
          />
        </PageHero>
      </div>

      {/* --- 4 thẻ triết lý --- */}
      <SectionFrame>
        <h2 className="sr-only">{t("about.philosophy")}</h2>
        <PhilosophyCards
          cards={[
            { key: "philosophy", title: t("about.philosophy"), icon: "sparkles" },
            {
              key: "freshness",
              title: t("about.freshness"),
              icon: "leaf",
              image: { src: "/anh/restaurant-06.webp" },
            },
            {
              key: "craft",
              title: t("about.craft"),
              icon: "chef",
              image: { src: "/anh/restaurant-04.webp" },
            },
            {
              key: "ambience",
              title: t("about.ambience"),
              icon: "home",
              image: { src: "/anh/restaurant-01.webp" },
            },
          ]}
        />
      </SectionFrame>

      {/* --- Thẻ câu chuyện (trái, rộng) + ảnh (phải) --- */}
      <SectionFrame>
        <div className="grid grid-cols-1 gap-3 xl:[grid-template-columns:minmax(0,904fr)_minmax(0,469fr)]">
          <article className="sora-card relative flex min-h-[204px] overflow-hidden">
            {/*
             * decor: mẫu 05 KHÔNG gạch chân đỏ dưới "DIE GESCHICHTE VON SoRa"
             * (soi 1:1 x 285→685, y 660→720 trên khung 1672 thì sạch). Hoạ
             * tiết của thẻ này là DẢI VÀNG DÁT ở mép trái, rộng ~22px, cùng
             * mô-típ với thẻ "Chef's Selection" và dải "Warum SoRa?".
             */}
            <GoldLeafEdge width={20} opacity={0.9} />
            <div className="relative z-10 flex min-w-0 flex-1 flex-col p-5">
              {/*
               * KHÔNG dùng flex cho tiêu đề này. `.boc` của <WordmarkSora> là
               * `inline-block; width: min(100%, …)` — sinh ra để chạy trong
               * DÒNG CHỮ THƯỜNG. Nhét vào flex thì lúc trình duyệt đo
               * max-content, `100%` ăn trọn bề ngang dòng nên flex chia phần
               * cho nó trước: đo được chữ co còn 60px, ảnh giữ 97px, tiêu đề
               * vỡ làm ba dòng. Để inline bình thường thì `100%` quy theo bề
               * ngang <h2> (349px) -> min(349,97) = 97px, nằm gọn một dòng
               * đúng như mẫu.
               */}
              <h2 className="relative text-[19px] leading-tight">
                <span className="font-serif tracking-[.04em] text-ivory uppercase">
                  {t("about.storyTitle")}
                </span>{" "}
                {/*
                 * Cỡ đi qua prop `tiLe` dạng CẶP (ngưỡng 768px do chu.module
                 * giữ, người gọi không phải biết con số):
                 *   0,35 ở máy tính -> nét cọ 97px, nằm cùng dòng với hàng
                 *     chữ hoa 221px trong cột rộng 349px, đúng mẫu 05.
                 *   0,26 ở điện thoại -> 72px; cột chỉ còn 318px nên để 0,35
                 *     là 221+97 vượt chỗ và tiêu đề vỡ làm hai dòng.
                 * KHÔNG đặt `--chu-ti-le` bằng class ở đây: class đứng TRƯỚC
                 * prop (chu.module.css), đặt là cặp theo khổ màn mất tác dụng.
                 * Cũng không còn phải tự đặt `width` cho thẻ bọc — `sora-chu`
                 * đã vá `.boc` nhận đúng bề ngang ảnh.
                 */}
                <WordmarkSora
                  bien="gon"
                  tiLe={{ dienThoai: 0.26, mayTinh: 0.35 }}
                  className="ml-1 translate-y-[0.22em] align-baseline"
                />
              </h2>
              {/*
               * 7 dòng câu chuyện của mockup kể một lịch sử không ai xác nhận
               * ("SoRa entstand aus einer tiefen Leidenschaft …") -> để trống.
               * Nút „UNSERE GESCHICHTE →" cũng BỎ: nó phải dẫn tới một trang
               * câu chuyện mà cả nội dung lẫn trang đều chưa có.
               */}
              <ChoSep
                note="Die Geschichte von SoRa (7 Zeilen) + Ziel des Buttons „Unsere Geschichte“"
                lines={7}
                className="mt-3 max-w-[560px]"
              />
            </div>

            {/*
             * `maskImage` ≠ lớp phủ. Mask chỉ quyết định phần nào CỦA CHÍNH
             * ẢNH được vẽ ra; nó không bôi thêm một giọt màu nào lên ảnh.
             * `#000` trong mask nghĩa là "giữ nguyên ảnh", không phải màu đen.
             * Fade chỉ ăn 30% mép trái để nối vào nền thẻ, 70% còn lại là ảnh
             * nguyên bản — đúng luật mới của Sếp (04/10): không bôi đen ảnh.
             */}
            <div
              aria-hidden="true"
              className="relative hidden w-[42%] shrink-0 sm:block"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, #000 30%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, #000 30%)",
              }}
            >
              <Image
                src="/anh/restaurant-05.webp"
                alt=""
                fill
                sizes="(max-width: 1199px) 42vw, 380px"
                loading="lazy"
                style={{ objectFit: "cover", objectPosition: "center 42%" }}
              />
            </div>
          </article>

          {/* Ảnh đứng một mình: không mask, không phủ, nguyên bản. */}
          <div className="relative min-h-[204px] overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-elevated">
            <Image
              src="/anh/restaurant-07.webp"
              alt="Rote Deckenskulptur, begrünte Wandnischen und SoRa-Wandteller im Gastraum"
              fill
              sizes="(max-width: 1199px) 100vw, 404px"
              loading="lazy"
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
            />
          </div>
        </div>
      </SectionFrame>

      {/* --- Dải số liệu thật (giữ hình dáng strip „Warum SoRa?" của mockup) --- */}
      <SectionFrame>
        {/* Không còn <h2 className="sr-only"> ở đây: nhãn nét cọ trong
            FactsStrip ĐÃ là <h2> mang chữ thật, thêm nữa là trùng tiêu đề. */}
        <FactsStrip
          locale={lang}
          facts={facts}
          source={at("factsSource", lang)}
        />
      </SectionFrame>

      <MobileFooter locale={lang} />
    </>
  );
}
