/*
 * 06 KONTAKT.
 *
 * Dữ liệu thật đã có: địa chỉ, giờ mở cửa, 2 số điện thoại (bìa thực đơn in).
 * Còn null nên ẨN HẲN:
 *  - thẻ E-MAIL và form gửi thư (cột phải thành thẻ gọi điện, xem ReachCard)
 *  - dải CTA WhatsApp của mockup
 *
 * Bản đồ: ĐÃ CÓ link Google Maps của quán (Sếp gửi 05/10/2026). `MapBlock`
 * nạp theo kiểu "hai cú bấm" cho đúng DSGVO — lý do viết trong chính file đó.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapBlock } from "@/components/contact/MapBlock";
import { ReachCard } from "@/components/contact/ReachCard";
import { WhatsAppCta } from "@/components/contact/WhatsAppCta";
import { ChoSepAn } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { Icon } from "@/components/ui/Icon";
import {
  DecorAnchor,
  SakuraEdge,
  SeigaihaWash,
} from "@/components/decor/Decor";
import {
  addressLines,
  hasEmail,
  phoneLabel,
  restaurant,
  telHref,
} from "@/data/restaurant";
import { CT } from "@/components/contact/text";
import { CHU_NHAN } from "@/components/chu/ChuCo";
import { getT, isLocale, pick } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/kontakt">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getT(lang)("nav.contact") };
}

export default async function KontaktPage({
  params,
}: PageProps<"/[lang]/kontakt">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  /*
   * Tiêu đề trang là NHÃN ẢNH nét cọ (public/chu); `PageHero` tự dựng qua
   * <ChuCo> theo `page` + `locale`.
   *
   * Vẫn phải tra CHU_NHAN ở đây vì `wordmark` là CHỮ THẬT, nó đi vào bản ẩn
   * cho máy đọc màn hình. `vi.json` cố ý rỗng nên t("nav.contact") còn rơi về tiếng
   * Đức — truyền t() vào thì ở /vi ảnh hiện một đằng, máy đọc đọc một nẻo.
   */
  const nhan = lang === "vi" && CHU_NHAN.contact.vi ? CHU_NHAN.contact.vi : CHU_NHAN.contact.de;

  return (
    /*
     * `sora-mot-man`: trang ít nội dung -> vừa khít một màn ở khổ máy tính,
     * banner co theo chiều cao màn, bản đồ + thẻ gọi điện giãn lấp chỗ, không
     * cuộn (Sếp 11/10). Luật + ngưỡng nằm ở globals.css.
     */
    <div className="sora-mot-man">
      <PageHero
        page="contact"
        locale={lang}
        wordmark={nhan.chu}
        eyebrow={t("contact.eyebrow")}
        chef={{
          eyebrow: t("chef.eyebrow"),
          question: t("contact.chefQuestion"),
          cta: t("chef.cta.contact"),
        }}
      />
      {/* Chữ hero chưa có (mockup là chữ AI) -> không vẽ gì ra trang, chỉ để
          dấu ẩn cho QA đếm. Xem `ChoSepAn`. */}
      <ChoSepAn note="Hero-Text Kontakt (3 Zeilen)" />

      {/*
       * decor (spec làm lại A6): cột hoa đào CHỈ nằm trong máng rail bên phải
       * — không chạm viền thẻ nào. Bản cũ còn hai cành trong thẻ form (đè
       * icon thư) và một cành góc dưới-phải đè đáy thẻ: đã gỡ.
       */}
      <DecorAnchor>
        <SakuraEdge
          side="right"
          run={520}
          depth={44}
          tile={480}
          top={28}
          opacity={0.5}
          className="hidden xl:block"
        />
      </DecorAnchor>

      <section className="sora-mot-man-than mt-[var(--sau-banner)] px-[var(--page-pad)] lg:pb-[var(--sau-banner)]">
        {/*
         * HAI CỘT 64/36 CAO BẰNG NHAU (mẫu 06: đáy thẻ phải ngang đáy cột
         * trái). Lưới mặc định `align-items: stretch`; cột trái cho khối bản
         * đồ `flex-1`, thẻ phải đẩy hai nút xuống đáy bằng `mt-auto`.
         * Bản cũ lệch nhau 373px vì thẻ form chết cao 883px.
         *
         * Khung 2 cột + `dl` icon/chữ: kho
         * `hyperui/…/marketing/contact-forms/5-dark.html`.
         */}
        <div className="mx-auto grid w-full max-w-[var(--content-max)] grid-cols-1 gap-3 lg:[grid-template-columns:minmax(0,64fr)_minmax(0,36fr)]">
          {/* Cột trái: 3 thẻ thông tin + khối bản đồ + dải WhatsApp */}
          <div className="flex min-w-0 flex-col gap-3">
            {/* Dưới `xl` hai cột xếp chồng và thẻ gọi điện đã đứng ngay trên
                với đủ hai số -> thẻ TELEFON ẩn đi cho khỏi lặp, lưới còn 2. */}
            <ul className="grid grid-cols-1 gap-3 md:[grid-template-columns:repeat(2,minmax(0,1fr))] xl:[grid-template-columns:repeat(3,minmax(0,1fr))]">
              <InfoCard icon="map-pin" title={t("contact.address")}>
                <address className="space-y-0.5 text-[16px] leading-snug not-italic">
                  {addressLines().map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </InfoCard>

              <InfoCard icon="clock" title={t("contact.hours")}>
                <p className="text-[16px] leading-snug">
                  {pick(restaurant.openingHours.text, lang)}
                </p>
              </InfoCard>

              <InfoCard
                icon="phone"
                title={t("contact.phone")}
                className={hasEmail() ? "" : "max-xl:hidden"}
              >
                {/* Thẻ đủ rộng thì hai số nằm NGANG (vòng 2, 11/10): xếp dọc làm
                    thẻ này cao 166px và kéo cả hàng ba thẻ cao theo, ăn mất
                    chiều cao của bản đồ bên dưới. */}
                <ul className="@[260px]:grid @[260px]:grid-cols-2 @[260px]:gap-x-4">
                  {restaurant.phones.map((p) => (
                    <li key={p.number}>
                      {/* Cả hàng là vùng bấm cao 44px; nhãn loại số nằm dưới
                          số, trong cùng thẻ <a> nên không rớt ra ngoài viền. */}
                      <a
                        href={telHref(p)}
                        className="group flex min-h-11 flex-col justify-center"
                      >
                        <span className="text-[16px] leading-tight whitespace-nowrap text-gold-bright group-hover:underline">
                          {p.number}
                        </span>
                        <span className="text-[12px] leading-tight text-muted">
                          {phoneLabel(p, lang)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                {/* Thẻ E-MAIL của mockup bị ẩn: restaurant-info.json.email = null */}
                {hasEmail() && (
                  <p className="mt-2 text-[16px]">
                    <a href={`mailto:${restaurant.email}`} className="text-gold-bright">
                      {restaurant.email}
                    </a>
                  </p>
                )}
              </InfoCard>
            </ul>

            <MapBlock
              title={t("contact.map")}
              loadLabel={pick(CT.mapLoad, lang)}
              openLabel={pick(CT.mapOpen, lang)}
              attribution={pick(CT.mapAttribution, lang)}
              privacyNote={pick(CT.mapPrivacy, lang)}
              className="lg:flex-1"
            />

            {/* Dải WhatsApp của mockup ẩn hẳn: chưa có số WhatsApp. */}
            <WhatsAppCta locale={lang} title={t("rail.whatsapp")} />
          </div>

          {/*
           * Cột phải. CÓ e-mail -> form của mẫu. CHƯA có -> thẻ gọi điện,
           * không dựng form chết. Ở điện thoại thẻ gọi điện lên ĐẦU
           * (`order-first`): gọi là việc khách cần nhất khi cầm máy.
           */}
          {hasEmail() ? (
            <ContactForm
              locale={lang}
              s={{
                title: t("contact.formTitle"),
                name: t("contact.name"),
                mail: t("contact.mail"),
                tel: t("contact.tel"),
                subject: t("contact.subject"),
                message: t("contact.message"),
                send: t("contact.send"),
                noFormTitle: t("contact.noFormTitle"),
                noForm: t("contact.noForm"),
              }}
            />
          ) : (
            <ReachCard
              locale={lang}
              className="order-first lg:order-none"
              s={{
                title: t("common.callUs"),
                hours: t("contact.hours"),
                route: t("contact.route"),
                reserve: t("home.ctaPrimary"),
              }}
            />
          )}
        </div>
      </section>

      {/* `overflow-hidden` (vòng 2, 11/10): vân sóng này vẽ từ mỏ neo XUỐNG DƯỚI đáy
          trang (`inset-0` thắng `bottom-0`), không ai thấy nó, nhưng nó làm <body>
          dài hơn <html> 61px ở điện thoại -> trang có lớp cuộn ngầm thứ hai. Cắt tại
          mỏ neo: hình không đổi, hết cuộn ngầm. */}
      <DecorAnchor className="overflow-hidden">
        <SeigaihaWash
          size={96}
          opacity={0.07}
          color="#8a6a3a"
          className="right-0 bottom-0 left-0 h-[340px]"
        />
      </DecorAnchor>

      <MobileFooter locale={lang} />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: "map-pin" | "clock" | "phone";
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={`@container sora-card min-w-0 px-4 py-3 ${className}`}>
      {/*
       * ICON CÙNG HÀNG VỚI TIÊU ĐỀ (mẫu 06) khi thẻ đủ rộng, xếp dọc khi hẹp.
       *
       * Bản cũ luôn xếp dọc nên thẻ cao 222px (mẫu ~120). Cùng hàng thì cột
       * chữ tiêu đề = bề-ngang-thẻ − `p-4` 32 − icon 34 − khe 10 = cw − 76.
       * `ÖFFNUNGSZEITEN` cần 10,28px bề ngang cho mỗi 1px cỡ chữ (đo 07/10,
       * 15px + tracking .08em = 154,2px), chừa 2px:
       *     cỡ = (cw − 78) / 10,28      trần 15px (cỡ mẫu)
       * Hộp trong ≥ 202px (thẻ ≥ 234px) -> ≥ 12px, vừa một dòng.
       * Hẹp hơn thì 12px không vừa cùng hàng -> xếp dọc, cỡ = cw / 10,28.
       *
       * ⚠ `cqw` và `@[…]` đo HỘP NỘI DUNG của thẻ (đã trừ `p-4`), nên trong
       * công thức chỉ còn trừ icon + khe (44 + 2), không trừ đệm lần nữa.
       */}
      <div className="flex flex-col gap-2 @[170px]:flex-row @[170px]:items-center @[170px]:gap-2.5">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full border border-gold/45 text-gold">
          <Icon name={icon} size={18} />
        </span>
        <h2 className="min-w-0 text-[13px] leading-snug font-semibold tracking-[.04em] text-gold uppercase [overflow-wrap:anywhere] @[240px]:text-[15px]">
          {title}
        </h2>
      </div>
      <div className="mt-2.5 text-text">{children}</div>
    </li>
  );
}
