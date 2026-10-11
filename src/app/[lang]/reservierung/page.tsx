/*
 * 03 RESERVIERUNG.
 *
 * Bốn khu vực bàn trong mockup (Hauptbereich / Fensterplätze / Bar Bereich /
 * Ruhiger Bereich) là chữ AI — KHÔNG dùng. Ở đây chỉ đưa hai khu vực NHÌN THẤY
 * ĐƯỢC trong 7 ảnh thật của nhà hàng: Gastraum và Bar, mỗi cái kèm đúng ảnh
 * của nó. Khu vực khác chờ nhà hàng xác nhận (ghi rõ dưới khối).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ReservationForm } from "@/components/reservation/ReservationExperience";
import { ChoSepAn } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { CHU_NHAN } from "@/components/chu/ChuCo";
import { getT, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reservierung">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getT(lang)("nav.reservation") };
}

export default async function ReservierungPage({
  params,
}: PageProps<"/[lang]/reservierung">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);

  /*
   * Tiêu đề trang là NHÃN ẢNH nét cọ (public/chu); `PageHero` tự dựng qua
   * <ChuCo> theo `page` + `locale`.
   *
   * Vẫn phải tra CHU_NHAN ở đây vì `wordmark` là CHỮ THẬT, nó đi vào bản ẩn
   * cho máy đọc màn hình. `vi.json` cố ý rỗng nên t("nav.reservation") còn rơi về tiếng
   * Đức — truyền t() vào thì ở /vi ảnh hiện một đằng, máy đọc đọc một nẻo.
   */
  const nhan = lang === "vi" && CHU_NHAN.reservation.vi ? CHU_NHAN.reservation.vi : CHU_NHAN.reservation.de;

  return (
    <>
      <PageHero
        page="reservation"
        locale={lang}
        wordmark={nhan.chu}
        eyebrow={t("brand.eyebrow")}
        chef={{
          eyebrow: t("chef.eyebrow"),
          question: t("reservation.chefQuestion"),
          cta: t("chef.cta.reservation"),
        }}
      />
      {/* Chữ hero + sơ đồ mặt bằng chưa có -> không vẽ gì ra trang, chỉ để
          dấu ẩn cho QA đếm. Xem `ChoSepAn`. */}
      <ChoSepAn note="Hero-Text Reservierung (4 Zeilen)" />
      <ChoSepAn note="Tischplan: echter Grundriss des Restaurants + bestätigte Bereiche" />

      <SectionFrame sauHero>
        <ReservationForm
          locale={lang}
          s={{
            title: t("reservation.title"),
            steps: [
              t("reservation.step1"),
              t("reservation.step2"),
              t("reservation.step3"),
              t("reservation.step4"),
              t("reservation.step5"),
              t("reservation.step6"),
            ],
            guests: t("reservation.guests"),
            guest: t("reservation.guest"),
            notesPlaceholder: t("reservation.notesPlaceholder"),
            submit: t("reservation.submit"),
            tablePlan: t("reservation.tablePlan"),
            openingHours: t("reservation.openingHours"),
            summary: t("reservation.summary"),
            labels: {
              date: t("reservation.summaryDate"),
              time: t("reservation.summaryTime"),
              guests: t("reservation.summaryGuests"),
              area: t("reservation.summaryArea"),
              occasion: t("reservation.summaryOccasion"),
              notes: t("reservation.summaryNotes"),
            },
            notChosen: t("reservation.notChosen"),
            prevMonth: t("reservation.prevMonth"),
            nextMonth: t("reservation.nextMonth"),
            weekdays: t.list("reservation.weekdays"),
            months: t.list("reservation.months"),
            areas: [
              {
                id: "gastraum",
                name: t("reservation.areas.dining"),
                photo: "/anh/restaurant-05.webp",
                alt: "Gastraum mit Tischreihen unter dem Kirschblütendach",
              },
              {
                id: "bar",
                name: t("reservation.areas.bar"),
                photo: "/anh/restaurant-04.webp",
                alt: "Sushi-Vitrine an der Bar unter Pendelleuchten",
              },
            ],
            areasNote: t("reservation.areasNote"),
            occasions: [
              { id: "birthday", label: t("reservation.occasions.birthday"), icon: "gift" },
              { id: "anniversary", label: t("reservation.occasions.anniversary"), icon: "heart" },
              { id: "business", label: t("reservation.occasions.business"), icon: "briefcase" },
              { id: "other", label: t("reservation.occasions.other"), icon: "star" },
            ],
            areaHintTitle: t("reservation.areaHintTitle"),
            areaHint: t("reservation.areaHint"),
            noBackendTitle: t("reservation.noBackendTitle"),
            noBackend: t("reservation.noBackend"),
            callUs: t("common.callUs"),
          }}
        />
      </SectionFrame>

      <MobileFooter locale={lang} />
    </>
  );
}
