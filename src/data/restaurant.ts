/*
 * Thông tin nhà hàng — đọc từ data/restaurant-info.json.
 * Nguồn: bìa trước + bìa sau thực đơn in thật, đã xác minh.
 *
 * LUẬT: trường nào `null` thì ẨN khối tương ứng. Không điền giả, không suy đoán.
 * Dùng các hàm `has*()` bên dưới để quyết định hiện/ẩn, đừng tự kiểm tra lẻ.
 */
import raw from "../../data/restaurant-info.json";

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
  googleMapsUrl: raw.googleMapsUrl as string | null,
  /** Link mở Google Maps ở tab mới (nút chỉ đường) — không nhúng, không cần đồng ý. */
  googleMapsPlaceUrl: raw.googleMapsPlaceUrl as string | null,
};

export const hasEmail = () => Boolean(restaurant.email);
export const hasWhatsapp = () => Boolean(restaurant.whatsapp);
export const hasInstagram = () => Boolean(restaurant.instagram);
export const hasFacebook = () => Boolean(restaurant.facebook);
export const hasMap = () => Boolean(restaurant.googleMapsUrl);

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
