/*
 * Link Google Maps của quán — dùng chung cho `MapBlock` (client) và
 * `ReachCard` (server), nên nằm ở tệp không có "use client".
 *
 * HAI ĐƯỜNG, theo dữ liệu có gì:
 *
 * 1. CÓ `googleMapsCid` (Sếp gửi link hồ sơ quán 07/10/2026) -> trỏ thẳng vào
 *    HỒ SƠ của quán trên Google. Đã thử bằng trình duyệt 07/10:
 *      `https://www.google.com/maps?cid=…`            mở đúng hồ sơ
 *        "Sora Asia Cuisine Bad Säckingen · Rheinbrückstraße 24"
 *      `https://maps.google.com/maps?cid=…&output=embed`   (trong iframe)
 *        ghim mang tên quán, đúng điểm mà tìm theo địa chỉ cũng ghim
 *    Link dạng `/maps/place//@…/data=…` Sếp gửi cũng mở đúng, nhưng dài và
 *    kèm tham số theo dõi (`entry=ttu`, `g_ep=…`) — dùng `cid` cho gọn, sạch.
 *    `cid` không mang địa chỉ nên không thành nguồn sự thật thứ hai.
 *
 * 2. CHƯA có CID -> tìm theo chuỗi dựng THẲNG từ `address` (không gõ lại địa
 *    chỉ: trước đây có `googleMapsPlaceUrl` chứa sẵn "Rheinbrückstraße 24"
 *    gõ tay sống song song với `address.street` = "Rheinbrückstr. 24").
 *    ⚠ Đừng ghép tên quán vào chuỗi tìm — ghim bắn đi chỗ khác (xem
 *    `_ghiChuBanDo` trong restaurant-info.json).
 */
import { restaurant } from "@/data/restaurant";

function diaChiTimKiem(): string {
  const a = restaurant.address;
  return `${a.street}, ${a.postalCode} ${a.city}`;
}

/** Mở Google Maps ở tab mới (hồ sơ quán; từ đó khách bấm chỉ đường). */
export function directionsHref(): string {
  if (restaurant.googleMapsCid)
    return `https://www.google.com/maps?cid=${restaurant.googleMapsCid}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    diaChiTimKiem()
  )}`;
}

/*
 * Nguồn cho iframe. Công tắc bật/tắt cả khối là `banDoDaXacNhan` trong JSON.
 * `hl=de` cố ý giữ tiếng Đức cả ở bản VI: tên phố Đức mà dịch thì khách cầm
 * điện thoại hỏi đường không ai hiểu.
 */
export function embedSrc(): string {
  const q = restaurant.googleMapsCid
    ? `cid=${restaurant.googleMapsCid}`
    : `q=${encodeURIComponent(diaChiTimKiem())}`;
  return `https://maps.google.com/maps?${q}&z=17&hl=de&output=embed`;
}
