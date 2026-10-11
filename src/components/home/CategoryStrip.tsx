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

/*
 * Ảnh VUÔNG cho strip trang chủ — bộ poster Sếp gửi ở `E:/Works/Sora/Nhiệm vụ/`
 * (A1..A9, 1254×1254), xuất sang `public/anh/nhiem-vu/`. Chỉ dùng khi
 * `variant="o-vuong"`; trang Speisekarte vẫn ăn `CAT_IMAGE` 4:3 ở trên.
 *
 * ⚠ ĐỌC TRƯỚC KHI ĐỔI: mỗi poster ĐÃ IN SẴN CHỮ trong ảnh (tên món + nhóm).
 * Gán nhầm là chữ trong ảnh chửi nhau với nhãn của thẻ.
 *   a1 Nem Hai San        – in sẵn "VORSPEISE / STARTER"
 *   a2 Sake Nigiri        – "SUSHI"
 *   a3 Flying Singapore   – "NOODLE & RICE DISHES"
 *   a4 Pho Ha Noi         – "VIETNAMESISCHER KLASSIKER"  (hình là bát súp)
 *   a5 Sake Avocado Maki  – "Sushi"
 *   a6 Xoi Xoai Nep Than  – "DESSERT"
 *   a7 Ebi Tempura        – "VORSPEISE / STARTER"
 *   a8 Rotes Curry        – "HAUPTGERICHT"
 *   a9 Sashimi Mix        – "SASHIMI"
 *
 * Bộ 9 ảnh KHÔNG có ảnh ĐỒ UỐNG -> nhóm `getraenke` không có khoá ở đây và
 * tự rơi về ảnh cũ. Cần Sếp gửi thêm một poster đồ uống.
 */
/*
 * CHỈ gán khi chữ IN TRONG ẢNH khớp đúng nhãn của thẻ. Lần gán đầu em đã sai:
 * cho thẻ "KLEINE SUPPEN" ảnh in "VIETNAMESISCHER KLASSIKER", và thẻ
 * "VIETNAMESISCHE KLASSIKER" ảnh in "NOODLE & RICE DISHES" — hai thẻ tự chửi
 * nhau. Thà để ảnh cũ còn hơn gán bừa.
 *
 * Hai nhóm CHƯA CÓ ẢNH trong bộ 9 (vẫn dùng ảnh cũ, chờ Sếp gửi thêm):
 *   - `suppen`    (Kleine Suppen) — cả bộ chỉ có Pho là món nước, mà Pho đã
 *                 in sẵn "VIETNAMESISCHER KLASSIKER" nên phải để cho nhóm đó.
 *   - `getraenke` (Getränke)      — bộ 9 không có ảnh đồ uống nào.
 */
const CAT_IMAGE_VUONG: Record<string, string> = {
  sushi: "/anh/nhiem-vu/a2.webp", //           in sẵn "SUSHI"
  "vietnamese-classics": "/anh/nhiem-vu/a4.webp", // in sẵn "VIETNAMESISCHER KLASSIKER"
  hauptgerichte: "/anh/nhiem-vu/a8.webp", //   in sẵn "HAUPTGERICHT"
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
  /**
   * `round`   = chevron trong nút tròn (trang Speisekarte, spec §5).
   * `o-vuong` = ảnh VUÔNG, chữ nằm trong NHÃN ĐÈ lên ảnh (trang chủ, Sếp
   *             05/10). Kiểu này cao bằng đúng bề ngang thẻ nên hàng thẻ gọn
   *             lại, đủ chỗ khoá trang chủ trong một màn hình.
   */
  variant?: "plain" | "round" | "o-vuong";
}) {
  const cats = stripCategories();
  if (cats.length === 0) return null;

  /*
   * Thẻ giữ ĐÚNG HÌNH VUÔNG — đừng kéo cho cao bằng chỗ trống.
   *
   * Đã thử cho thẻ `h-full` để lấp hết khoảng đen (05/10): thẻ cao ra nhưng
   * bề ngang bị `max-w` chặn nên MẤT HÌNH VUÔNG, và `object-fit:cover` cắt
   * mất chữ in trong poster ("Sake N…", "Kotes C…"). Đúng cái Sếp vừa cấm.
   *
   * Số học của khung này: 5 thẻ vuông trên hàng rộng 1184 thì mỗi thẻ chỉ cao
   * được (1184 − 4×12)/5 = 227px. Banner 395px + thẻ 227px = 622 trong màn
   * 900px → dư ~278px là CHUYỆN ĐƯƠNG NHIÊN, không phải lỗi. Muốn hết dư thì
   * phải đổi một ràng buộc: bớt số cột, hoặc bỏ khoá một-màn-hình.
   * Chỗ dư đó xử lý bằng cách đẩy hàng thẻ xuống đáy (xem `page.tsx`).
   */
  if (variant === "o-vuong") {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cats.map((cat) => {
          const anh = CAT_IMAGE_VUONG[cat.id] ?? CAT_IMAGE[cat.id];
          return (
            <li key={cat.id}>
              <Link
                href={`${href("/speisekarte", locale)}?kategorie=${cat.id}`}
                className="group relative block aspect-square overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-elevated transition-colors hover:border-gold/80"
              >
                {anh ? (
                  <Image
                    src={anh}
                    alt=""
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1199px) 33vw, 220px"
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center"
                  >
                    <Icon
                      name={CAT_ICON[cat.id] ?? "utensils"}
                      size={34}
                      className="text-gold/80"
                    />
                  </span>
                )}

                {/*
                 * NHÃN đè lên ảnh (Sếp 05/10: "Text sẽ nằm ở 1 label trên ảnh").
                 * Đặt SÁT ĐÁY vì mọi poster trong bộ đều in chữ ở NỬA TRÊN —
                 * để nhãn lên trên là hai lớp chữ chồng nhau.
                 * Nền nhãn là dải tối ôm sát chân thẻ, KHÔNG phải lớp phủ cả
                 * ảnh: luật của Sếp cấm phủ màu lên ảnh.
                 */}
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-[linear-gradient(0deg,rgba(9,8,6,.93)_0%,rgba(9,8,6,.78)_62%,transparent_100%)] px-3 pt-6 pb-2.5">
                  <span className="min-w-0 flex-1">
                    {/* Cho xuống 2 dòng thay vì cắt cụt: "VIETNAMESISCHE
                        KLASSIKER" dài 24 ký tự, `truncate` biến nó thành
                        "VIETNAMESISCH…" — khách không đọc ra nhóm nào. */}
                    <span className="block text-[14px] leading-[1.15] font-semibold tracking-[.04em] text-gold-bright uppercase [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                      {pick(cat.name, locale)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ivory/70">
                      {cat.itemCount} {dishesLabel}
                    </span>
                  </span>
                  <Icon
                    name="chevron-right"
                    size={16}
                    className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    // grid-cols-N của Tailwind đã là repeat(N, minmax(0,1fr)) — đúng luật,
    // không được thay bằng `1fr` trần.
    //
    // 4 CỘT Ở DẢI 1200–1599, 5 cột từ 1600 (sửa 07/10). Năm cột ở 1280 cho
    // mỗi thẻ 162px, trừ đệm và mũi tên thì cột chữ còn **89px** — không cỡ
    // chữ đọc được nào nhét vừa "VIETNAMESISCHE KLASSIKER" trong đó, và thẻ
    // `overflow-hidden` nên nó bị cắt cụt thật. Bốn cột trả lại 134px và
    // cũng chia 8 nhóm thành 4+4 thay vì 5+3.
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 min-[1600px]:grid-cols-5">
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
              <span className="@container min-w-0 flex-1">
                {/*
                 * Tên nhóm phải VỪA CỘT, không được để thẻ cắt cụt.
                 *
                 * Thẻ có `overflow-hidden` (bo góc), nên một từ dài hơn cột là
                 * mất chữ thật: đo 07/10 ở `/de/speisekarte`,
                 * "VIETNAMESISCHE KLASSIKER" cần 164px mà cột chỉ 121px @1440
                 * và 89px @1280 -> hiện ra "VIETNAMESISC".
                 *
                 * Chữa bằng HAI thay đổi đi cùng nhau:
                 *  1. cỡ chữ co theo cột — đo thật: "VIETNAMESISCHE" cần
                 *     9,65px bề ngang cho mỗi 1px cỡ chữ, nên cột/9,65 =
                 *     10cqw (chừa sẵn vài px), trần 17px như mẫu;
                 *  2. bớt một cột ở dải 1200–1599 (xem `grid-cols` bên dưới),
                 *     vì chỉ riêng co chữ thì ở 1280 cột còn 89px -> phải hạ
                 *     xuống 9px mới vừa, dưới xa mức đọc được.
                 *
                 * KHÔNG dùng `hyphens: auto`: đã thử và đo — Chrome hồ sơ mới
                 * **không có sẵn từ điển ngắt từ tiếng Đức** (tải theo nhu cầu
                 * qua component updater), nên chữ vẫn tràn y nguyên. Một cách
                 * chữa chỉ chạy trên máy đã tải từ điển thì không phải cách
                 * chữa. Cũng không dùng `break-words`: cắt trần giữa từ.
                 */}
                <span className="block text-[min(17px,10cqw)] leading-tight font-semibold tracking-[.05em] text-gold-bright uppercase">
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
