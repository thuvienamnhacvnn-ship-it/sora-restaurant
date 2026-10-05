/*
 * Dải cuối trang "Über uns" — chỗ mockup đặt strip „Warum SoRa?".
 *
 * ĐÃ ĐỔI NỘI DUNG, GIỮ NGUYÊN HÌNH DÁNG. Mockup liệt kê 5 lời khen
 * (EINZIGARTIGE FUSION-KÜCHE / AUTHENTISCHE ZUTATEN / PERSÖNLICHER SERVICE /
 * BESONDERE ATMOSPHÄRE / MITTEN IN BAD SÄCKINGEN) — 4 câu đầu là chữ AI tự
 * khen quán, không ai xác nhận. Thay bằng 5 SỰ KIỆN đếm/đọc được:
 *   207 món · 109 sushi · 63 đồ uống   -> đếm từ data/menu-items.json
 *   Mo.–So. 11:00–22:30                -> bìa thực đơn in
 *   Rheinbrückstr. 24, Bad Säckingen   -> bìa thực đơn in
 * Mục thứ 5 của mockup (MITTEN IN BAD SÄCKINGEN) hoá ra ĐÚNG (spec §14-1) nên
 * được giữ, chỉ là giờ nó đứng cạnh địa chỉ thật thay vì đứng một mình.
 *
 * Hình thức bám mẫu: chữ brush bên trái, 5 mục cách nhau bằng vạch dọc gold
 * 1px, mỗi mục = icon nét gold + 2 dòng caps.
 */
import { Icon, type IconName } from "@/components/ui/Icon";
import { GoldLeafEdge } from "@/components/decor/Decor";
import { ChuTieuDe } from "@/components/chu/ChuCo";
import type { Locale } from "@/lib/i18n";

export type Fact = { key: string; icon: IconName; value: string; label: string };

export function FactsStrip({
  locale,
  facts,
  source,
}: {
  locale: Locale;
  facts: Fact[];
  source: string;
}) {
  return (
    <div className="sora-card relative isolate overflow-hidden">
      {/*
       * decor: mẫu 05 KHÔNG có vòng enso quanh chữ "Warum SoRa?" — soi 1:1
       * dải này (x 258→678, y 855→941 trên khung 1672) thì hoạ tiết duy nhất
       * là một DẢI VÀNG DÁT ở mép trái, rộng ~22px, cao hết dải. Cùng một
       * mô-típ với thẻ "Chef's Selection" ở trang chủ.
       */}
      <GoldLeafEdge width={20} opacity={0.9} />

      <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:gap-6">
        {/*
         * "Warum SoRa?" trong mẫu 05 là NÉT CỌ nguyên câu, không phải chữ
         * thường -> dùng nhãn ảnh `warum-sora` của `sora-chu`.
         *
         * Thẻ <h2> là của mình chứ không truyền `the="h2"` cho ChuTieuDe:
         * với `the="h2"` component dùng `.bocKhoi`, mà `.bocKhoi` CỐ Ý không
         * đặt `width` (nó sinh ra để chiếm trọn dòng cho tiêu đề căn giữa).
         * Đặt một thẻ không có bề ngang xác định vào hàng flex này thì lúc
         * đo max-content nó rơi về bề ngang gốc của tệp (422px) và bóp nát 5
         * cột số liệu. Để `the="span"` thì dùng `.boc` — có `width` đúng.
         * `chuThat` giữ chữ thật trong DOM nên <h2> vẫn đọc được "Warum SoRa?".
         *
         * caoChuHoa 30 -> 211×37 ở máy tính, khớp số đo trên mẫu (~207×43).
         */}
        <h2 className="shrink-0 pl-2">
          <ChuTieuDe
            nhan="warum-sora"
            locale={locale}
            chuThat
            caoChuHoa={{ dienThoai: 24, mayTinh: 30 }}
          />
        </h2>

        {/*
         * Cột KHÔNG chia đều: ba mục đầu là con số ngắn (207 / 109 / 63),
         * hai mục cuối là giờ mở cửa và địa chỉ — dài gấp ba. Chia đều thì
         * "Rheinbrückstr." bị ngắt giữa từ thành "RHEINBRÜC / KSTR.".
         * `minmax(0,...)` bắt buộc; `1fr` trần làm tràn ngang.
         */}
        <ul
          className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:gap-y-0 xl:[grid-template-columns:var(--fact-cols)]"
          style={
            {
              "--fact-cols": facts
                .map((f) =>
                  f.key === "hours" || f.key === "address"
                    ? "minmax(0,1.15fr)"
                    : "minmax(0,0.9fr)"
                )
                .join(" "),
            } as React.CSSProperties
          }
        >
          {facts.map((f, i) => (
            <li
              key={f.key}
              className={`flex min-w-0 items-center gap-2.5 ${
                // Vạch dọc gold giữa các mục, đúng mẫu — chỉ ở khổ ≥1200.
                i > 0 ? "xl:border-l xl:border-gold/30 xl:pl-4" : ""
              }`}
            >
              <Icon
                name={f.icon}
                size={24}
                className="shrink-0 text-gold/85"
              />
              {/*
               * `break-words` + tracking thấp là BẮT BUỘC, không phải cho đẹp:
               * cột thứ 5 chứa "Rheinbrückstr. 24" — một từ dài không có chỗ
               * ngắt. Để tracking .06em như các nhãn khác thì nó tràn khỏi ô
               * và bị `overflow-hidden` của thẻ cắt cụt mất đuôi.
               */}
              <span className="min-w-0" lang="de">
                <span className="block text-[13px] leading-tight font-semibold tracking-normal break-words hyphens-auto text-gold-bright uppercase">
                  {f.value}
                </span>
                {/* 11px là SÀN của KIT cho chữ meta (11–14px) — đừng hạ xuống
                    10px nữa. Nhãn đã rút ngắn trong about/text.ts nên 11px vừa. */}
                <span className="mt-0.5 block text-[11px] leading-tight tracking-normal break-words hyphens-auto text-muted uppercase">
                  {f.label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-gold/20 px-5 py-2 text-[12px] text-muted/70">
        {source}
      </p>
    </div>
  );
}
