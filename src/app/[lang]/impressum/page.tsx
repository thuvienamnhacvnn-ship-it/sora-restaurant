/*
 * Impressum — BẮT BUỘC theo luật Đức (§5 DDG / §18 MStV).
 * Nội dung chưa có: cần tên pháp nhân, người đại diện, số đăng ký, số thuế
 * doanh thu, cơ quan giám sát... Không ai được tự điền.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { getT, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/impressum">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getT(lang)("legal.imprintTitle"), robots: { index: false } };
}

export default async function ImpressumPage({
  params,
}: PageProps<"/[lang]/impressum">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);
  return (
    <LegalPage
      locale={lang}
      title={t("legal.imprintTitle")}
      pending={t("legal.pending")}
      note="Impressum: Firmierung, Vertretungsberechtigte, Registernummer, USt-IdNr., zuständige Aufsichtsbehörde"
    />
  );
}
