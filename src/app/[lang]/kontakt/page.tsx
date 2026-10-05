/*
 * 06 KONTAKT.
 *
 * Dữ liệu thật đã có: địa chỉ, giờ mở cửa, 2 số điện thoại (bìa thực đơn in).
 * Còn null nên ẨN HẲN:
 *  - thẻ E-MAIL (và nút gửi của form bị khoá, xem ContactForm)
 *  - dải CTA WhatsApp của mockup
 *
 * Bản đồ: ĐÃ CÓ link Google Maps của quán (Sếp gửi 05/10/2026). `MapBlock`
 * nạp theo kiểu "hai cú bấm" cho đúng DSGVO — lý do viết trong chính file đó.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapBlock } from "@/components/contact/MapBlock";
import { WhatsAppCta } from "@/components/contact/WhatsAppCta";
import { ChoSep } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { Icon } from "@/components/ui/Icon";
import {
  CornerSakura,
  DecorAnchor,
  SakuraEdge,
  SeigaihaWash,
} from "@/components/decor/Decor";
import {
  addressLines,
  hasEmail,
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
    <>
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
      >
        <ChoSep note="Hero-Text Kontakt (3 Zeilen)" lines={3} className="max-w-[420px]" />
      </PageHero>

      {/*
       * decor — đo 1:1 trên `_w-agent/mau/06_kontakt.png`:
       *  - CỘT HOA ĐÀO dày chạy dọc mép phải trang, vắt qua đường viền phải
       *    thẻ form (x 1620→1672, y 420→quá đáy khung 941), kết thúc bằng
       *    một chùm ở góc dưới-phải;
       *  - nền nửa dưới trang có TRƯỜNG SÓNG lớn rất mờ (cung rộng ~95px ở
       *    khung 1440), rõ nhất ở dải y 887→940.
       * Cả hai nằm ngoài mọi thẻ nên treo vào mỏ neo — không đụng bố cục,
       * không đè ô nhập.
       */}
      <DecorAnchor>
        <SakuraEdge
          side="right"
          run={560}
          depth={44}
          tile={480}
          top={28}
          /* 0.75 -> 0.5 và bề dày 56 -> 44: ở khổ 1440 mép nội dung dừng ở
             1352px còn nhãn rail phải ("Live Support") bắt đầu ~1359px, nên
             cột hoa mép phải KHÔNG có máng trống để né. Hạ độ mờ và thu bề
             dày để nhãn rail còn đọc được. */
          opacity={0.5}
          className="hidden xl:block"
        />
      </DecorAnchor>

      <SectionFrame>
        <div className="grid grid-cols-1 gap-3.5 xl:[grid-template-columns:minmax(0,64fr)_minmax(0,36fr)]">
          {/* Cột trái: 3 thẻ thông tin + khối bản đồ + dải WhatsApp */}
          <div className="flex min-w-0 flex-col gap-3">
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <InfoCard icon="map-pin" title={t("contact.address")}>
                <address className="space-y-0.5 text-[16px] not-italic">
                  {addressLines().map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </InfoCard>

              <InfoCard icon="clock" title={t("contact.hours")}>
                <p className="text-[16px]">
                  {pick(restaurant.openingHours.text, lang)}
                </p>
              </InfoCard>

              <InfoCard icon="phone" title={t("contact.phone")}>
                <ul className="space-y-1.5">
                  {restaurant.phones.map((p) => (
                    <li key={p.number}>
                      <a
                        href={telHref(p)}
                        className="text-[16px] whitespace-nowrap text-gold-bright hover:underline"
                      >
                        {p.number}
                      </a>
                      <span className="ml-2 text-[12px] text-muted">{p.label}</span>
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
              routeLabel={t("contact.route")}
              loadLabel={pick(CT.mapLoad, lang)}
              privacyNote={pick(CT.mapPrivacy, lang)}
            />

            {/* Dải WhatsApp của mockup ẩn hẳn: chưa có số WhatsApp. */}
            <WhatsAppCta locale={lang} title={t("rail.whatsapp")} />
          </div>

          <ContactForm
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
        </div>
      </SectionFrame>

      <DecorAnchor>
        <CornerSakura
          corner="br"
          art="branch"
          width={300}
          offsetX={-58}
          offsetY={-30}
          opacity={0.75}
          className="hidden xl:block"
        />
        <SeigaihaWash
          size={96}
          opacity={0.07}
          color="#8a6a3a"
          className="right-0 bottom-0 left-0 h-[340px]"
        />
      </DecorAnchor>

      <MobileFooter locale={lang} />
    </>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: "map-pin" | "clock" | "phone";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="sora-card min-w-0 p-5">
      <span className="grid size-[34px] place-items-center rounded-full border border-gold/45 text-gold">
        <Icon name={icon} size={18} />
      </span>
      <h2 className="mt-3 text-[15px] font-semibold tracking-[.08em] text-gold uppercase">
        {title}
      </h2>
      <div className="mt-2 text-text">{children}</div>
    </li>
  );
}
