/*
 * Datenschutzerklärung — bắt buộc theo DSGVO.
 * Chưa có nội dung: cần tên bên chịu trách nhiệm, mục đích xử lý dữ liệu,
 * nhà cung cấp hosting, cookie, thời hạn lưu. Không ai được tự điền.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/LegalPage";
import { getT, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/datenschutz">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getT(lang)("legal.privacyTitle"), robots: { index: false } };
}

export default async function DatenschutzPage({
  params,
}: PageProps<"/[lang]/datenschutz">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getT(lang);
  return (
    <LegalPage
      locale={lang}
      title={t("legal.privacyTitle")}
      pending={t("legal.pending")}
      note="Datenschutzerklärung: Verantwortlicher, Zwecke der Verarbeitung, Hosting-Anbieter, Cookies, Speicherdauer, Betroffenenrechte"
    />
  );
}
