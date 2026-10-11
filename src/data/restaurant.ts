/*
 * Thông tin nhà hàng — đọc từ data/restaurant-info.json.
 * Nguồn: bìa trước + bìa sau thực đơn in thật, đã xác minh.
 *
 * LUẬT: trường nào `null` thì ẨN khối tương ứng. Không điền giả, không suy đoán.
 * Dùng các hàm `has*()` bên dưới để quyết định hiện/ẩn, đừng tự kiểm tra lẻ.
 */
import raw from "../../data/restaurant-info.json";
import { getT, type Locale } from "@/lib/i18n";

export type Phone = { label: string; number: string; e164: string };

export const restaurant = {
  name: raw.name,
  tagline: raw.tagline,
  address: raw.address,
  phones: raw.phones as Phone[],
  openingHours: raw.openingHours,
  email: raw.email as string | null,
  whatsapp: raw.whatsapp as string | null,
  instagram: raw.instagram as string | null,
  facebook: raw.facebook as string | null,
  /*
   * CÔNG TẮC khối bản đồ, không mang địa chỉ. Trước đây chỗ này là
   * `googleMapsUrl` + `googleMapsPlaceUrl`, mỗi trường chứa sẵn một URL có
   * địa chỉ gõ tay — hai nguồn sự thật cạnh `address`. Link thật dựng tại chỗ
   * từ `address` trong MapBlock.tsx.
   */
  banDoDaXacNhan: raw.banDoDaXacNhan as boolean,
  /** Chỉ dùng khi nào mua khoá Maps Embed API; chưa ai đọc trường này. */
  googleMapsFtid: raw.googleMapsFtid as string | null,
  /** Toạ độ quán (từ link Maps Sếp gửi) — tâm của ảnh bản đồ tĩnh ở Kontakt. */
  toaDo: (raw.toaDo ?? null) as { lat: number; lng: number } | null,
  /** Mã hồ sơ Google của quán, dạng thập phân — dựng link `maps?cid=…`. */
  googleMapsCid: (raw.googleMapsCid ?? null) as string | null,
};

export const hasEmail = () => Boolean(restaurant.email);
export const hasWhatsapp = () => Boolean(restaurant.whatsapp);
export const hasInstagram = () => Boolean(restaurant.instagram);
export const hasFacebook = () => Boolean(restaurant.facebook);
export const hasMap = () => restaurant.banDoDaXacNhan === true;

/*
 * Nhãn loại số ("Mobil" / "Festnetz") theo ngôn ngữ đang xem.
 *
 * `restaurant-info.json` lưu nhãn bằng TIẾNG ĐỨC vì nó chép từ bìa thực đơn.
 * Sáu chỗ trong giao diện in thẳng `p.label` ra, nên trang `/vi` vừa dịch xong
 * vẫn còn đúng hai chữ Đức nằm lẫn: `01622 979999 Mobil`. Hàm này tra sang
 * `common.mobile` / `common.landline`.
 *
 * Nhãn lạ (Sếp thêm loại số mới) thì TRẢ NGUYÊN chữ trong dữ liệu — thà hiện
 * tiếng Đức còn hơn nuốt mất nhãn hoặc đoán bừa.
 */
export function phoneLabel(phone: Phone, locale: Locale): string {
  const t = getT(locale);
  if (phone.label === "Mobil") return t("common.mobile");
  if (phone.label === "Festnetz") return t("common.landline");
  return phone.label;
}

export function addressLines(): string[] {
  const a = restaurant.address;
  return [restaurant.name, a.street, `${a.postalCode} ${a.city}`];
}

/*
 * `tel:` dùng dạng QUỐC TẾ (e164), không dùng `number`.
 *
 * Bad Säckingen nằm ngay cầu sông Rhein sang Thuỵ Sĩ. Khách gọi từ máy số
 * nước ngoài bấm `tel:01622979999` là KHÔNG NỐI ĐƯỢC — đầu số 0 chỉ có nghĩa
 * trong mạng Đức. RFC 3966 cũng nói liên kết tel: nên để dạng toàn cục.
 * Chữ hiện trên nút vẫn giữ cách nhóm số in trên bìa thực đơn.
 *
 * `replace` vẫn giữ làm lưới an toàn: e164 lọt dấu cách là số chết câm, mà
 * lỗi đó đã xảy ra một lần trong `restaurant-info.json` (`+4916229799 99`).
 */
export function telHref(phone: Phone): string {
  return `tel:${(phone.e164 || phone.number).replace(/[^\d+]/g, "")}`;
}
