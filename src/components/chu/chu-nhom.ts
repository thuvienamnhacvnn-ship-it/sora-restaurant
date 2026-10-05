/*
 * SINH TỰ ĐỘNG từ `data/categories.json` — đừng sửa tay.
 *
 * Tên nhóm món bằng chữ nét cọ. Khác `CHU_NHAN` ở một điểm quan trọng: chỗ
 * này KHÔNG phải nhãn Sếp cho sẵn mà là chữ GHÉP từ bảng ký tự (tệp #2 + #6
 * trong bộ font). Chất lượng và chỗ còn yếu: `_w-agent/06_chu.md` §5.
 *
 * Khoá = `id` của nhóm / nhóm con trong `data/categories.json`.
 * Muốn sinh lại: xem mục "Dựng lại bộ chữ" trong `_w-agent/06_chu.md`.
 */
import type { ChuTep } from "./chu-kho";

export const CHU_NHOM = {
  "suppen": {
    de: { tep: "tu-kleine-suppen", chu: "Kleine Suppen" },
    vi: { tep: "tu-sup", chu: "Súp" },
  },
  "kleine-suppen": {
    de: { tep: "tu-kleine-suppen", chu: "Kleine Suppen" },
    vi: { tep: "tu-sup-nho", chu: "Súp nhỏ" },
  },
  "vorspeisen": {
    de: { tep: "tu-vorspeisen", chu: "Vorspeisen" },
    vi: { tep: "tu-khai-vi", chu: "Khai vị" },
  },
  "salate": {
    de: { tep: "tu-salate-va-mixteller", chu: "Salate & Mixteller" },
    vi: { tep: "tu-salad-va-dia-tong-hop", chu: "Salad & Đĩa tổng hợp" },
  },
  "salate-mixteller": {
    de: { tep: "tu-salate-va-mixteller", chu: "Salate & Mixteller" },
    vi: { tep: "tu-salad-va-dia-tong-hop", chu: "Salad & Đĩa tổng hợp" },
  },
  "hauptgerichte": {
    de: { tep: "tu-hauptgerichte", chu: "Hauptgerichte" },
    vi: { tep: "tu-mon-chinh", chu: "Món chính" },
  },
  "nudeln-reisgerichte": {
    de: { tep: "tu-nudeln-va-reisgerichte", chu: "Nudeln & Reisgerichte" },
    vi: { tep: "tu-mi-va-com", chu: "Mì & Cơm" },
  },
  "vietnamese-classics": {
    de: { tep: "tu-vietnamesische-klassiker", chu: "Vietnamesische Klassiker" },
    vi: { tep: "tu-mon-viet-truyen-thong", chu: "Món Việt truyền thống" },
  },
  "vietnamesische-klassiker": {
    de: { tep: "tu-vietnamesische-klassiker", chu: "Vietnamesische Klassiker" },
    vi: { tep: "tu-mon-viet-truyen-thong", chu: "Món Việt truyền thống" },
  },
  "desserts": {
    de: { tep: "tu-desserts", chu: "Desserts" },
    vi: { tep: "tu-trang-mieng", chu: "Tráng miệng" },
  },
  "sushi": {
    de: { tep: "tu-sushi", chu: "Sushi" },
    vi: { tep: "tu-sushi", chu: "Sushi" },
  },
  "nigiri": {
    de: { tep: "tu-nigiri", chu: "Nigiri" },
    vi: { tep: "tu-nigiri", chu: "Nigiri" },
  },
  "temaki": {
    de: { tep: "tu-temaki", chu: "Temaki" },
    vi: { tep: "tu-temaki", chu: "Temaki" },
  },
  "maki": {
    de: { tep: "tu-maki", chu: "Maki" },
    vi: { tep: "tu-maki", chu: "Maki" },
  },
  "chu-maki": {
    de: { tep: "tu-chu-maki", chu: "Chu Maki" },
    vi: { tep: "tu-chu-maki", chu: "Chu Maki" },
  },
  "inside-out": {
    de: { tep: "tu-inside-out", chu: "Inside Out" },
    vi: { tep: "tu-inside-out", chu: "Inside Out" },
  },
  "crunchy-roll": {
    de: { tep: "tu-crunchy-roll", chu: "Crunchy Roll" },
    vi: { tep: "tu-crunchy-roll", chu: "Crunchy Roll" },
  },
  "mini-crunchy-roll": {
    de: { tep: "tu-mini-crunchy-roll", chu: "Mini Crunchy Roll" },
    vi: { tep: "tu-mini-crunchy-roll", chu: "Mini Crunchy Roll" },
  },
  "special-roll": {
    de: { tep: "tu-special-roll", chu: "Special Roll" },
    vi: { tep: "tu-special-roll", chu: "Special Roll" },
  },
  "sashimi": {
    de: { tep: "tu-sashimi", chu: "Sashimi" },
    vi: { tep: "tu-sashimi", chu: "Sashimi" },
  },
  "poke-bowl": {
    de: { tep: "tu-poke-bowl", chu: "Poke Bowl" },
    vi: { tep: "tu-poke-bowl", chu: "Poke Bowl" },
  },
  "sushi-menu-for-one": {
    de: { tep: "tu-sushi-menu-for-one", chu: "Sushi Menu for One" },
    vi: { tep: "tu-set-sushi-1-nguoi", chu: "Set sushi 1 người" },
  },
  "menu-sets": {
    de: { tep: "tu-menu-sets", chu: "Menu Sets" },
    vi: { tep: "tu-set-tong-hop", chu: "Set tổng hợp" },
  },
  "family-sushi-menu": {
    de: { tep: "tu-family-sushi-menu", chu: "Family Sushi Menu" },
    vi: { tep: "tu-set-sushi-gia-dinh", chu: "Set sushi gia đình" },
  },
  "sushi-menu": {
    de: { tep: "tu-sushi-menu", chu: "Sushi Menu" },
    vi: { tep: "tu-set-sushi-lon", chu: "Set sushi lớn" },
  },
  "getraenke": {
    de: { tep: "tu-getranke", chu: "Getränke" },
    vi: { tep: "tu-do-uong", chu: "Đồ uống" },
  },
  "limonaden": {
    de: { tep: "tu-limonaden", chu: "Limonaden" },
    vi: { tep: "tu-nuoc-chanh-nha-lam", chu: "Nước chanh nhà làm" },
  },
  "fruchtsaefte": {
    de: { tep: "tu-fruchtsafte", chu: "Fruchtsäfte" },
    vi: { tep: "tu-nuoc-ep-trai-cay", chu: "Nước ép trái cây" },
  },
  "homemades": {
    de: { tep: "tu-homemades", chu: "Homemades" },
    vi: { tep: "tu-do-uong-nha-lam", chu: "Đồ uống nhà làm" },
  },
  "softdrinks": {
    de: { tep: "tu-softdrinks", chu: "Softdrinks" },
    vi: { tep: "tu-nuoc-ngot", chu: "Nước ngọt" },
  },
  "tee": {
    de: { tep: "tu-tee", chu: "Tee" },
    vi: { tep: "tu-tra", chu: "Trà" },
  },
  "kaffee": {
    de: { tep: "tu-kaffee", chu: "Kaffee" },
    vi: { tep: "tu-ca-phe", chu: "Cà phê" },
  },
  "longdrinks": {
    de: { tep: "tu-longdrinks", chu: "Longdrinks" },
    vi: { tep: "tu-longdrink", chu: "Longdrink" },
  },
  "cocktails": {
    de: { tep: "tu-cocktails", chu: "Cocktails" },
    vi: { tep: "tu-cocktail", chu: "Cocktail" },
  },
  "weisswein": {
    de: { tep: "tu-weisswein", chu: "Weißwein" },
    vi: { tep: "tu-vang-trang", chu: "Vang trắng" },
  },
  "rotwein": {
    de: { tep: "tu-rotwein", chu: "Rotwein" },
    vi: { tep: "tu-vang-do", chu: "Vang đỏ" },
  },
  "bier-vom-fass": {
    de: { tep: "tu-bier-vom-fass", chu: "Bier vom Fass" },
    vi: { tep: "tu-bia-tuoi", chu: "Bia tươi" },
  },
  "flaschenbier": {
    de: { tep: "tu-flaschenbier", chu: "Flaschenbier" },
    vi: { tep: "tu-bia-chai", chu: "Bia chai" },
  },
  "alkohol-spirituosen": {
    de: { tep: "tu-alkohol-spirituosen", chu: "Alkohol / Spirituosen" },
    vi: { tep: "tu-ruou-manh", chu: "Rượu mạnh" },
  },
} as const satisfies Record<
  string,
  { de: { tep: ChuTep; chu: string }; vi?: { tep: ChuTep; chu: string } }
>;

export type ChuNhom = keyof typeof CHU_NHOM;
