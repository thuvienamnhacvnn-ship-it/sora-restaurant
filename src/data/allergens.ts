/*
 * Bảng chú giải mã dị ứng + phụ gia — chép nguyên văn từ trang `002_obj12`
 * của thực đơn in (xem mục 3 của `_w-agent/02_menu-data.md`).
 *
 * Trong dataset, `allergens` là mảng mã trộn chung chữ và số, đúng như menu
 * in (`["A1","B","C","F","K","I","2","5"]`). Hiện mã trần thì khách không
 * hiểu gì, nên modal chi tiết phải giải nghĩa.
 *
 * Bản tiếng Việt là bản dịch của agent, nhà hàng CHƯA duyệt.
 */

export type AllergenKind = "allergen" | "additive";

export type AllergenEntry = {
  code: string;
  kind: AllergenKind;
  de: string;
  vi: string;
};

const A = (code: string, de: string, vi: string): AllergenEntry => ({
  code,
  kind: "allergen",
  de,
  vi,
});
const Z = (code: string, de: string, vi: string): AllergenEntry => ({
  code,
  kind: "additive",
  de,
  vi,
});

export const ALLERGENS: AllergenEntry[] = [
  A("A", "Glutenhaltiges Getreide", "Ngũ cốc có gluten"),
  A("A1", "Weizen", "Lúa mì"),
  A("A2", "Gerste", "Lúa mạch"),
  A("B", "Krebstiere", "Giáp xác"),
  A("C", "Eier", "Trứng"),
  A("D", "Fisch", "Cá"),
  A("E", "Erdnüsse", "Đậu phộng"),
  A("F", "Sojabohnen", "Đậu nành"),
  A("G", "Milch", "Sữa"),
  A("H", "Schalenfrüchte", "Hạt cứng"),
  A("I", "Sellerie", "Cần tây"),
  A("J", "Senf", "Mù tạt"),
  A("K", "Sesamsamen", "Hạt mè"),
  A("L", "Schwefeldioxid und Sulphite", "Lưu huỳnh dioxit và sulfite"),
  A("M", "Lupinen", "Đậu lupin"),
  A("N", "Weichtiere", "Thân mềm"),
  Z("1", "Farbstoff", "Phẩm màu"),
  Z("2", "Konservierungsstoff", "Chất bảo quản"),
  Z("3", "Süßungsmittel", "Chất tạo ngọt"),
  Z("4", "koffeinhaltig", "Có caffeine"),
  Z("5", "Säuerungsmittel", "Chất điều chỉnh độ chua"),
  Z("6", "Stabilisator", "Chất ổn định"),
  Z("7", "Antioxidationsmittel", "Chất chống oxy hoá"),
  Z("8", "chininhaltig", "Có quinine"),
  Z("9", "Taurin", "Có taurine"),
  Z("10", "Geschmacksverstärker", "Chất điều vị"),
  Z("11", "enthält eine Phenylalaninquelle", "Chứa nguồn phenylalanine"),
];

const BY_CODE = new Map(ALLERGENS.map((a) => [a.code, a]));

export function allergenEntry(code: string): AllergenEntry | undefined {
  return BY_CODE.get(code);
}

/** Giải nghĩa một mảng mã; mã lạ (nếu có) vẫn giữ lại, không nuốt mất. */
export function explainAllergens(
  codes: string[],
  locale: "de" | "vi"
): { code: string; text: string; kind: AllergenKind | "unknown" }[] {
  return codes.map((code) => {
    const hit = BY_CODE.get(code);
    if (!hit) return { code, text: "", kind: "unknown" as const };
    return { code, text: locale === "vi" ? hit.vi : hit.de, kind: hit.kind };
  });
}

/**
 * Miễn trừ in ở chân thực đơn — nhà hàng tự ghi, chép nguyên văn.
 * Phải hiện trên trang Speisekarte.
 */
export const MENU_DISCLAIMER = {
  de: "Alle Preisangaben in Euro inkl. MwSt. · Irrtümer sowie Druck- und Satzfehler vorbehalten. · Alle Angaben ohne Gewähr. · Abbildungen dienen nur zur Illustration und können vom Original abweichen.",
  en: "All prices are stated in EUR and include VAT. Errors, including typographical and wording errors, are reserved. All information is provided without guarantee. Images are for illustrative purposes only and may differ from the actual product.",
};
