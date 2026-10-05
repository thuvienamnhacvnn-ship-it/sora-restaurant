/*
 * Strip 5 danh mục — lưới 5 cột, gap 12px.
 * ⚠ `minmax(0,1fr)` là bắt buộc: để `1fr` trần thì hàng chữ không xuống dòng
 *   được và đẩy rộng cả màn hình (bẫy đã gặp trên máy này).
 *
 * KHÔNG có ảnh món thật nào trong KIT, nên nửa trên thẻ dùng hoạ tiết
 * `gold_wave` + icon danh mục chứ KHÔNG mượn ảnh AI hay ảnh nội thất.
 * Phụ đề là dòng tiếng Anh IN THẬT trên thực đơn (`categories.json.subtitle`),
 * không phải câu quảng cáo của mockup.
 */
import Link from "next/link";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { stripCategories } from "@/data/menu";
import { href, pick, type Locale } from "@/lib/i18n";

/*
 * Ảnh 640×360 do `sora-anh` cắt từ thực đơn (public/anh/danh-muc/).
 * Chỉ 5 nhóm có ảnh — nhóm nào chưa có thì giữ ô hoạ tiết + icon.
 * Khoá là id nhóm trong categories.json; tên tệp theo id nhóm con chính.
 */
const CAT_IMAGE: Record<string, string> = {
  sushi: "/anh/danh-muc/sushi.webp",
  suppen: "/anh/danh-muc/kleine-suppen.webp",
  "vietnamese-classics": "/anh/danh-muc/vietnamesische-klassiker.webp",
  hauptgerichte: "/anh/danh-muc/hauptgerichte.webp",
  getraenke: "/anh/danh-muc/getraenke.webp",
};

const CAT_ICON: Record<string, IconName> = {
  sushi: "utensils",
  "vietnamese-classics": "leaf",
  suppen: "flame",
  hauptgerichte: "crown",
  getraenke: "globe",
  vorspeisen: "star",
  salate: "leaf",
  desserts: "heart",
};

export function CategoryStrip({
  locale,
  dishesLabel,
  variant = "plain",
}: {
  locale: Locale;
  dishesLabel: string;
  /** `round` = chevron nằm trong nút tròn (trang Speisekarte, spec §5). */
  variant?: "plain" | "round";
}) {
  const cats = stripCategories();
  if (cats.length === 0) return null;

  return (
    // grid-cols-N của Tailwind đã là repeat(N, minmax(0,1fr)) — đúng luật,
    // không được thay bằng `1fr` trần.
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cats.map((cat) => (
        <li key={cat.id}>
          <Link
            href={`${href("/speisekarte", locale)}?kategorie=${cat.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-bg transition-colors hover:border-gold/80"
          >
            {/* Nửa trên: ảnh. Chữ nằm hẳn nửa dưới, không chồng lên ảnh.
                Khung theo ĐÚNG tỉ lệ ảnh gốc 4:3 — Sếp 05/10: ảnh minh hoạ từ
                đồ ăn đến không gian phải để FULL, không được cắt. Khung cũ
                `h-[112px]` trên thẻ rộng ~220px là 1,96:1 → cắt mất 32%. */}
            {CAT_IMAGE[cat.id] ? (
              <span aria-hidden="true" className="relative block aspect-[4/3]">
                <Image
                  src={CAT_IMAGE[cat.id]}
                  alt=""
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 1199px) 33vw, 220px"
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-[1.035]"
                />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="relative grid h-[112px] place-items-center bg-elevated"
              >
                <span
                  className="absolute inset-x-0 bottom-0 h-14 bg-cover bg-bottom bg-no-repeat opacity-30"
                  style={{ backgroundImage: "url(/decor/gold_wave.svg)" }}
                />
                <Icon
                  name={CAT_ICON[cat.id] ?? "utensils"}
                  size={34}
                  className="relative text-gold/80"
                />
              </span>
            )}
            <span className="flex flex-1 items-center gap-2 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] leading-tight font-semibold tracking-[.05em] text-gold-bright uppercase">
                  {pick(cat.name, locale)}
                </span>
                <span className="mt-1 block truncate text-[13px] text-muted">
                  {pick(cat.subtitle, locale)}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted/70">
                  {cat.itemCount} {dishesLabel}
                </span>
              </span>
              {variant === "round" ? (
                <span className="grid size-[31px] shrink-0 place-items-center rounded-full border border-gold/45 text-gold">
                  <Icon name="chevron-right" size={16} />
                </span>
              ) : (
                <Icon
                  name="chevron-right"
                  size={18}
                  className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
                />
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
