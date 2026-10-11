/*
 * Ảnh MÓN cho bộ lọc "Speisen" của Galerie (làm lại 07/10, spec mục D).
 *
 * Toàn bộ là ảnh THẬT cắt từ thực đơn in của quán, đang nằm trong
 * `public/mon/` — không ảnh AI, không ảnh mượn. Chỉ lấy tấm đủ 560×420 (cỡ
 * gốc lớn nhất hiện có); tấm nhỏ hơn (324–548px) để dành cho trang thực đơn.
 *
 * TÊN MÓN KHÔNG GÕ TAY: `alt` tra từ `menu-items.json` theo số món, tên nhóm
 * tra từ `categories.json` theo id nhóm con. Món/nhóm không còn trong dữ liệu
 * thì tấm đó tự rơi khỏi lưới chứ không hiện tên cũ.
 *
 * Tệp này CHỈ được gọi từ server (`galerie/page.tsx`) rồi truyền kết quả
 * xuống `GalleryBrowser` — import thẳng vào component client là kéo cả
 * `menu-items.json` (207 món) vào gói JS của trang Galerie.
 */
import { categories, menuItems } from "@/data/menu";
import type { Photo } from "@/data/gallery";

/** Số món có ảnh riêng 560×420, xếp theo thứ tự hiện trong lưới. */
const MON = ["30", "24", "10", "1", "19", "25", "26", "27", "29", "3"];

/** Ảnh NHÓM 560×420 (một đĩa tổng hợp cho cả nhóm con, in trên thực đơn). */
const NHOM = ["maki", "inside-out", "special-roll", "poke-bowl", "cocktails", "longdrinks"];

const W = 560;
const H = 420;

export function foodPhotos(): Photo[] {
  const mon: Photo[] = MON.flatMap((nr) => {
    const item = menuItems.find((i) => i.nr === nr);
    if (!item) return [];
    const src = `/mon/${item.id}.webp`;
    return [
      {
        id: `mon-${item.id}`,
        src,
        thumb: src,
        width: W,
        height: H,
        tags: ["food" as const],
        alt: item.name.de,
      },
    ];
  });

  const nhomCon = categories.flatMap((c) => c.subcategories);
  const nhom: Photo[] = NHOM.flatMap((id) => {
    const sub = nhomCon.find((s) => s.id === id);
    if (!sub) return [];
    const src = `/mon/nhom/${id}.webp`;
    return [
      {
        id: `nhom-${id}`,
        src,
        thumb: src,
        width: W,
        height: H,
        tags: ["food" as const],
        alt: sub.name.de,
      },
    ];
  });

  return [...mon, ...nhom];
}
