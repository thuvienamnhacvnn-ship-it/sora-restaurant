/*
 * 3 vật thể 360° trên hero trang chủ (KIT 06_360_WEBM).
 *
 * TRẠNG THÁI: chưa có file. Trưởng nhóm đang dựng 3 WebM alpha song song.
 * Khi có file, bỏ vào `public/360/` rồi điền `webm` + `poster` dưới đây —
 * `Hero360Object` tự chuyển từ bệ giữ chỗ sang video, không phải sửa component.
 *
 * Quy cách KIT: VP9 + alpha, 1440×1440, 24 fps, loop liền 6–8 s, < 4–6 MB.
 * Tên file KIT chờ: sushi-platter-alpha.webm / pho-bowl-alpha.webm /
 * signature-drink-alpha.webm + poster PNG/WebP cùng tên.
 *
 * Thứ tự trong mảng = thứ tự nạp (sushi trước, phở, rồi đồ uống).
 * `primary` = vật thể duy nhất được tự chạy trên điện thoại.
 */
export type HeroObject = {
  id: "sushi" | "pho" | "drink";
  labelKey: string;
  webm: string | null;
  poster: string | null;
  primary: boolean;
};

/*
 * Có tệp thật nào chưa? Sếp 05/10 bắt dọn sạch banner trang chủ: không nhãn
 * tên món, không vòng enso giữ chỗ, không huy hiệu 360°. Nên khi cả ba vật
 * thể còn `webm`/`poster` null thì KHÔNG dựng khối nào hết — phải hỏi qua hàm
 * này ở chỗ gọi, chứ để khối rỗng thì `gap`/`mt` vẫn chừa một dải trống trên
 * banner.
 */
export const coVatThe360 = () =>
  heroObjects.some((o) => o.webm || o.poster);

export const heroObjects: HeroObject[] = [
  { id: "sushi", labelKey: "home.stage.sushi", webm: null, poster: null, primary: true },
  { id: "pho", labelKey: "home.stage.pho", webm: null, poster: null, primary: false },
  { id: "drink", labelKey: "home.stage.drink", webm: null, poster: null, primary: false },
];
