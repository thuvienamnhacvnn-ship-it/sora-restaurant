/*
 * Ảnh món — do agent `sora-anh` cắt từ 41 trang thực đơn in.
 *
 * Hai tệp, shape phẳng:
 *   data/menu-images.json        34 cặp  id món        -> /mon/*.webp
 *   data/menu-group-images.json  25 cặp  subcategory.id -> /mon/nhom/*.webp
 *
 * LUẬT GÁN ẢNH (quan trọng, dễ làm sai):
 *  - thẻ món CHỈ dùng ảnh RIÊNG của chính nó.
 *  - ảnh NHÓM chỉ được dùng ở TIÊU ĐỀ NHÓM, không bao giờ dán lên thẻ món lẻ.
 *    Lý do: 109 món sushi và 63 đồ uống cố ý không có ảnh riêng — thực đơn in
 *    chỉ chụp một đĩa tổng hợp cho cả trang. Dán đĩa thập cẩm lên thẻ
 *    "Sake Nigiri" là khách tưởng gọi ra như thế.
 *  - không có ảnh thì giữ ô giữ chỗ, TUYỆT ĐỐI không ẩn món.
 */
import images from "../../data/menu-images.json";
import groupImages from "../../data/menu-group-images.json";

const BY_ITEM: Record<string, string> = images;
const BY_GROUP: Record<string, string> = groupImages;

/** Ảnh riêng của một món. `null` nếu chưa cắt được ảnh cho món đó. */
export function dishImage(itemId: string): string | null {
  return BY_ITEM[itemId] ?? null;
}

/** Ảnh đại diện một nhóm con — dùng cho tiêu đề nhóm, KHÔNG cho thẻ món. */
export function groupImage(subcategoryId: string): string | null {
  return BY_GROUP[subcategoryId] ?? null;
}

export const DISH_IMAGE_COUNT = Object.keys(BY_ITEM).length;
export const GROUP_IMAGE_COUNT = Object.keys(BY_GROUP).length;
