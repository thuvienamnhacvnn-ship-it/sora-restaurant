import type { DietaryKey } from "@/data/menu";

/** Mọi chuỗi giao diện của trang Speisekarte — trang truyền từ `i18n` xuống. */
export type MenuStrings = {
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  all: string;
  categories: string;
  /** Nhãn NGẮN của tab, theo `id` nhóm. Tên đầy đủ dùng ở tiêu đề + thẻ. */
  tabs: Record<string, string>;
  dietaryLabel: string;
  dietary: Record<DietaryKey, string>;
  empty: string;
  emptyHint: string;
  resetFilters: string;
  searchAllCategories: string;
  loading: string;
  dishes: string;
  from: string;
  more: string;
  subcategories: string;
  allGroups: string;
  groupPhotoNote: string;
  sortLabel: string;
  sort: { nr: string; name: string; price: string };
  priceOnRequest: string;
  askChefCategory: string;
  pieces: string;
  chefBadge: string;
  popularTitle: string;
  allDishes: string;
  disclaimer: string;
  detail: {
    close: string;
    allergens: string;
    additives: string;
    variants: string;
    sizes: string;
    askChef: string;
    title: string;
  };
};
