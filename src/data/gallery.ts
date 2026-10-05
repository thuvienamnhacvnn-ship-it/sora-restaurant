/*
 * Galerie — chỉ 7 ẢNH THẬT của nhà hàng (KIT 05_ASSETS/source_photos, đã xuất
 * sang webp trong public/anh) + 1 ô video cắt từ clip đi dạo thật.
 *
 * KIT: "Show the real restaurant as the proof of atmosphere. Real uploaded
 * photos have priority." Không chèn ảnh AI vào đây.
 *
 * Bộ lọc `food` CHƯA CÓ ẢNH — không có ảnh món thật nào trong KIT. Lọc vào đó
 * thì hiện câu báo rỗng chứ không mượn ảnh từ trang thực đơn.
 *
 * `alt` mô tả đúng cái nhìn thấy trong ảnh, không thêm tính từ quảng cáo.
 * Ảnh gốc là ảnh DỌC 1536×2048 -> tỉ lệ 3:4, lưới masonry phải tôn trọng.
 */
export type GalleryFilter = "all" | "restaurant" | "bar" | "food" | "details" | "video";

export type Photo = {
  id: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  tags: Exclude<GalleryFilter, "all" | "video">[];
  alt: string;
};

export const GALLERY_FILTERS: GalleryFilter[] = [
  "all",
  "restaurant",
  "bar",
  "food",
  "details",
  "video",
];

const photo = (
  n: string,
  tags: Photo["tags"],
  alt: string
): Photo => ({
  id: `restaurant-${n}`,
  src: `/anh/restaurant-${n}.webp`,
  thumb: `/anh/restaurant-${n}-thumb.webp`,
  width: 1100,
  height: 1467,
  tags,
  alt,
});

export const photos: Photo[] = [
  photo("01", ["restaurant"], "Gastraum mit Kirschblütendach an der Decke, roten Lampenschirmen und Holztischen"),
  photo("02", ["bar", "restaurant"], "Blick entlang der Bar mit Sushi-Theke in den Gastraum"),
  photo("03", ["bar", "details"], "Rückbuffet der Bar mit Gläsern, Flaschen und blauer Deckenbeleuchtung"),
  photo("04", ["bar"], "Sushi-Vitrine an der Bar unter Pendelleuchten"),
  photo("05", ["restaurant"], "Tischreihen im Gastraum unter dem Kirschblütendach"),
  photo("06", ["bar"], "Sushi-Theke mit Getränkeregal im Hintergrund"),
  photo("07", ["details"], "Rote Deckenskulptur, begrünte Wandnischen und SoRa-Wandteller"),
];

export const video = {
  src: "/video/rundgang.mp4",
  poster: "/video/rundgang-poster.webp",
  /** 90 s — cắt từ clip gốc 4:02, nguồn `restaurant_walkthrough_source.mp4`. */
  durationLabel: "01:30",
  alt: "Rundgang durch das SoRa",
};

export function photosFor(filter: GalleryFilter): Photo[] {
  if (filter === "all") return photos;
  if (filter === "video") return [];
  return photos.filter((p) => p.tags.includes(filter));
}
