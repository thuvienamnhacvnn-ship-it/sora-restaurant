/*
 * Chữ riêng của trang "Über uns".
 *
 * TẠI SAO KHÔNG NẰM TRONG src/i18n/de.json: file đó do agent khác đang giữ,
 * ranh giới file là tuyệt đối. Khi gộp lại thì chuyển nguyên khối này sang
 * khoá `about.facts.*`.
 *
 * TẤT CẢ chữ ở đây là NHÃN SỰ KIỆN, không phải câu quảng cáo:
 *  - số món / số sushi / số đồ uống  -> đếm từ data/menu-items.json lúc build
 *  - giờ mở cửa + địa chỉ            -> data/restaurant-info.json (đọc từ bìa
 *    trước và bìa sau thực đơn in thật, in hai lần khớp nhau)
 * Không có chữ nào ở đây khen quán, hứa hẹn, hay kể lịch sử. Phần kể chuyện
 * của mockup là chữ AI và vẫn đang nằm trong <ChoSep/>.
 *
 * Bản VI chỉ dịch nhãn đếm số — không phải nội dung marketing, nên không
 * đụng vào luật "chưa ai được tự dịch nội dung" của src/i18n/vi.json.
 */
import type { Locale } from "@/lib/i18n";

type Str = { de: string; vi: string };

export const aboutText = {
  /*
   * Nhãn dưới con số, caps 11px như mockup. GIỮ NGẮN — cột chỉ rộng ~140px
   * ở 1440; nhãn dài như "Sushi-Positionen" bị ngắt giữa từ thành
   * "SUSHI-POSITIONE / N". Đã thử, đã sửa, đừng nối dài lại.
   *
   * "auf der Karte" chứ không phải "Gerichte": 207 là TỔNG số mục trên thực
   * đơn, trong đó 63 là đồ uống — gọi hết là "Gerichte" (món ăn) là sai.
   */
  dishesOnMenu: { de: "auf der Karte", vi: "mục trong thực đơn" },
  sushiPositions: { de: "Sushi", vi: "Sushi" },
  drinkPositions: { de: "Getränke", vi: "Đồ uống" },
  openDaily: { de: "Täglich geöffnet", vi: "Mở cửa cả tuần" },

  /** Ghi rõ số liệu lấy từ đâu — để không ai tưởng đây là chữ quảng cáo. */
  factsSource: {
    de: "Alle Zahlen gezählt aus der gedruckten Speisekarte des Restaurants.",
    vi: "Mọi con số đếm từ thực đơn in của nhà hàng.",
  },
} satisfies Record<string, Str>;

export function at(key: keyof typeof aboutText, locale: Locale): string {
  return locale === "vi" ? aboutText[key].vi : aboutText[key].de;
}
