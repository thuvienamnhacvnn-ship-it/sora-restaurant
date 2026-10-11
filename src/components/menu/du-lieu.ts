/*
 * Dữ liệu phụ của trang Speisekarte — mọi thứ trang cần mà `src/data/menu.ts`
 * chưa có: món nổi bật, ảnh thẻ danh mục, kích thước GỐC của ảnh.
 *
 * Không gõ tên/giá món nào ở đây: chỉ có ID và đường dẫn ảnh.
 */
import noiBatRaw from "../../../data/menu-noi-bat.json";
import kichThuocRaw from "../../../data/menu-image-sizes.json";
import {
  categories,
  menuItems,
  minPrice,
  type Category,
  type MenuItem,
  type Subcategory,
} from "@/data/menu";
import { dishImage, groupImage } from "@/data/menu-images";

/* ---------------------------------------------------------------------------
 * Kích thước gốc của ảnh
 *
 * `data/menu-image-sizes.json` đo bằng sharp từ `public/mon/**` và
 * `public/anh/danh-muc/**`. Ảnh món cắt từ thực đơn in nên rộng chỉ 324–560px;
 * bảng này là thứ cho phép trang KHÔNG phóng ảnh quá cỡ gốc (Sếp chê ảnh nhỏ,
 * nhưng ảnh vỡ hạt còn tệ hơn). Thay ảnh thì đo lại — lệnh ở
 * `_w-agent/lam-lai/02_speisekarte.md`.
 * ------------------------------------------------------------------------ */
const KICH_THUOC = kichThuocRaw as unknown as Record<string, [number, number]>;

/** Ảnh món cắt 4:3, rộng tối đa 560. Không có trong bảng thì coi như nhỏ nhất. */
const MAC_DINH: [number, number] = [324, 243];

export function kichThuocAnh(src: string): { rong: number; cao: number } {
  const [rong, cao] = KICH_THUOC[src] ?? MAC_DINH;
  return { rong, cao };
}

/** Trần hiển thị: không ảnh món nào được dựng rộng hơn 440px (spec B1). */
export const TRAN_ANH = 440;

/** Ảnh RIÊNG của món (thẻ món chỉ dùng ảnh riêng — xem `menu-images.ts`). */
export function anhMon(item: MenuItem): string | null {
  return item.image ?? dishImage(item.id);
}

/* ---------------------------------------------------------------------------
 * Món nổi bật — `data/menu-noi-bat.json` (TẠM, chờ Sếp chốt)
 * ------------------------------------------------------------------------ */
const NOI_BAT = noiBatRaw as { chef?: string; beliebt?: string[] };

const timMon = (id: string | undefined) =>
  id ? menuItems.find((i) => i.id === id && i.available) : undefined;

/** Món "Chef Empfehlung". Không có, hoặc món không có ảnh riêng -> `null`. */
export const MON_CHEF: MenuItem | null = (() => {
  const m = timMon(NOI_BAT.chef);
  return m && anhMon(m) ? m : null;
})();

/** Các món của khối "Beliebte Gerichte" — bỏ qua ID lạ và món không ảnh. */
export const MON_BELIEBT: MenuItem[] = (NOI_BAT.beliebt ?? [])
  .map(timMon)
  .filter((m): m is MenuItem => Boolean(m && anhMon(m)));

/* ---------------------------------------------------------------------------
 * Ảnh thẻ danh mục (8 nhóm thật của thực đơn)
 *
 * 5 nhóm có ảnh danh mục 640×360 trong `public/anh/danh-muc`. Ba nhóm còn lại
 * chưa có -> dùng ảnh một MÓN THẬT của chính nhóm đó (spec B3-4), cắt 16:9
 * bằng `object-fit: cover`. Không lấy ảnh nhóm khác, không tạo ảnh.
 * ------------------------------------------------------------------------ */
const ANH_DANH_MUC: Record<string, string> = {
  suppen: "/anh/danh-muc/kleine-suppen.webp",
  hauptgerichte: "/anh/danh-muc/hauptgerichte.webp",
  "vietnamese-classics": "/anh/danh-muc/vietnamesische-klassiker.webp",
  sushi: "/anh/danh-muc/sushi.webp",
  getraenke: "/anh/danh-muc/getraenke.webp",
  // ảnh món thật của chính nhóm:
  vorspeisen: "/mon/5-nem-hai-san.webp",
  salate: "/mon/15-sora-mixteller.webp",
  desserts: "/mon/33-chuoi-chien-gion.webp",
};

export function anhDanhMuc(id: string): string | null {
  return ANH_DANH_MUC[id] ?? null;
}

/* ---------------------------------------------------------------------------
 * Gom món theo nhóm / nhóm con
 * ------------------------------------------------------------------------ */

/** Nhóm chỉ có ảnh theo NHÓM CON, không món nào có ảnh riêng. */
export function laNhomAnhNhom(cat: Category): boolean {
  return cat.subcategories.some((x) => groupImage(x.id) != null);
}

export type NhomCon = {
  sub: Subcategory & { note?: { de: string; vi?: string | null } };
  mon: MenuItem[];
};

/**
 * Các nhóm con của một nhóm, kèm món. Món nào không khớp nhóm con nào (dữ
 * liệu lạ) được dồn vào nhóm con CUỐI chứ không bị đánh rơi — lệnh "đủ 100%".
 */
export function nhomConCua(cat: Category): NhomCon[] {
  const cua = menuItems.filter((i) => i.available && i.category === cat.id);
  const ds: NhomCon[] = cat.subcategories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((sub) => ({
      sub,
      mon: cua.filter((i) => i.subcategory === sub.name.de),
    }));
  const daCo = new Set(ds.flatMap((g) => g.mon.map((m) => m.id)));
  const soCon = cua.filter((i) => !daCo.has(i.id));
  if (soCon.length > 0 && ds.length > 0) ds[ds.length - 1].mon.push(...soCon);
  return ds;
}

/** Giá thấp nhất trong một loạt món — TÍNH từ dữ liệu, không gõ tay. */
export function giaThapNhat(mon: MenuItem[]): number | null {
  const ds = mon.map(minPrice).filter((v): v is number => v != null);
  return ds.length === 0 ? null : Math.min(...ds);
}

/** Số món đang bán của từng nhóm (tab + thẻ danh mục dùng chung một nguồn). */
export const SO_MON_NHOM: Record<string, number> = Object.fromEntries(
  categories.map((c) => [
    c.id,
    menuItems.filter((i) => i.available && i.category === c.id).length,
  ])
);

export const TONG_SO_MON = menuItems.filter((i) => i.available).length;
