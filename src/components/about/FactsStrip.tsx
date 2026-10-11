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
 * LÀM LẠI 07/10 (spec làm lại mục E): bản cũ để nhãn nét cọ CÙNG HÀNG với 5
 * mục nên nhãn ăn 235px của dải, ô giờ mở gãy 3–4 dòng
 * (`MO. – SO.: / 11:00 – / 22:30 UHR`). Nay nhãn lên hàng riêng, 5 mục chia
 * `1 / 1 / 1 / 1,6 / 1,4` trọn bề ngang dải. Dáng "số lớn — nhãn nhỏ bên
 * dưới" lấy từ kho `hyperui/…/marketing/stats/3-dark.html`.
 */
import { Icon, type IconName } from "@/components/ui/Icon";
import { GoldLeafEdge } from "@/components/decor/Decor";
import { ChuTieuDe } from "@/components/chu/ChuCo";
import type { Locale } from "@/lib/i18n";

export type Fact = { key: string; icon: IconName; value: string; label: string };

const LA_SO = /^[0-9]+$/;

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
    /* `@container`: năm cột chỉ bật khi CHÍNH DẢI NÀY đủ rộng — xem ghi chú
       ở thẻ <ul> bên dưới. Dùng bề ngang dải chứ không bề ngang màn để đổi lề
       trang không âm thầm làm vỡ lại chỗ này. */
    <div className="@container sora-card relative isolate overflow-hidden">
      {/*
       * decor: mẫu 05 KHÔNG có vòng enso quanh chữ "Warum SoRa?" — soi 1:1
       * dải này (x 258→678, y 855→941 trên khung 1672) thì hoạ tiết duy nhất
       * là một DẢI VÀNG DÁT ở mép trái, rộng ~22px, cao hết dải. Cùng một
       * mô-típ với thẻ "Chef's Selection" ở trang chủ.
       */}
      <GoldLeafEdge width={20} opacity={0.9} />

      <div className="flex flex-col gap-4 py-4 pr-5 pl-9">
        {/*
         * "Warum SoRa?" trong mẫu 05 là NÉT CỌ nguyên câu, không phải chữ
         * thường -> dùng nhãn ảnh `warum-sora` của `sora-chu`.
         *
         * Thẻ <h2> là của mình chứ không truyền `the="h2"` cho ChuTieuDe:
         * với `the="h2"` component dùng `.bocKhoi`, mà `.bocKhoi` CỐ Ý không
         * đặt `width`. Để `the="span"` thì dùng `.boc` — có `width` đúng.
         * `chuThat` giữ chữ thật trong DOM nên <h2> vẫn đọc được "Warum SoRa?".
         */}
        <h2>
          <ChuTieuDe
            nhan="warum-sora"
            locale={locale}
            chuThat
            caoChuHoa={{ dienThoai: 24, mayTinh: 30 }}
          />
        </h2>

        {/*
         * Cột KHÔNG chia đều: ba mục đầu là con số ngắn (207 / 109 / 63), hai
         * mục cuối là giờ mở cửa và địa chỉ. `minmax(0,...)` bắt buộc; `1fr`
         * trần làm tràn ngang.
         *
         * MỐC 760px LÀ BỀ NGANG HỘP TRONG CỦA DẢI, KHÔNG PHẢI CỦA MÀN.
         * Ô giờ mở = 1,6/6 phần của (hộp trong − 4 khe 64), trừ icon 24 + khe
         * 10 + `pl-4` 16. Chuỗi `Mo. – So.: 11:00 – 22:30 Uhr` ở 14px đậm cần
         * ~196px cho MỘT dòng, ~110px cho HAI dòng. Ở 760: (760−64)×1,6/6 − 50
         * = 135px -> hai dòng ✓. Ô địa chỉ: (760−64)×1,4/6 − 50 = 112px, đủ
         * cho `Rheinbrückstr. 24` 12px caps (~108px) ✓.
         * 1280 hộp trong 804 · 1440: 964 · 1024 (thanh bên 88): 752 -> 2 cột.
         */}
        <ul
          className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-4 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] @[760px]:gap-y-0 @[760px]:[grid-template-columns:var(--fact-cols)]"
          style={
            {
              "--fact-cols": facts
                .map((f) =>
                  f.key === "hours"
                    ? "minmax(0,1.6fr)"
                    : f.key === "address"
                      ? "minmax(0,1.4fr)"
                      : "minmax(0,1fr)"
                )
                .join(" "),
            } as React.CSSProperties
          }
        >
          {facts.map((f, i) => (
            <li
              key={f.key}
              className={`flex min-w-0 items-center gap-2.5 ${
                // Vạch dọc gold giữa các mục, đúng mẫu — chỉ khi dải đủ rộng.
                i > 0 ? "@[760px]:border-l @[760px]:border-gold/30 @[760px]:pl-4" : ""
              }`}
            >
              <Icon name={f.icon} size={24} className="shrink-0 text-gold" />
              <span className="min-w-0" lang="de">
                {/* Con số đếm in to (số lớn — nhãn nhỏ); giờ mở và tên phố là
                    CHỮ nên giữ cỡ chữ thường, tối đa 2 dòng. Không
                    `hyphens-auto`: gạch nối tự động cắt giữa `SÄCKIN-GEN`. */}
                <span
                  className={`block font-semibold break-words text-gold-bright ${
                    LA_SO.test(f.value)
                      ? "font-serif text-[30px] leading-[1.2] tabular-nums"
                      : "text-[14px] leading-snug"
                  }`}
                >
                  {f.value}
                </span>
                {/* 12px: trên sàn 11px của KIT cho chữ meta. */}
                <span className="mt-1 block text-[12px] leading-tight tracking-[.04em] break-words text-muted uppercase">
                  {f.label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-gold/20 py-2 pr-5 pl-9 text-[12px] text-muted">
        {source}
      </p>
    </div>
  );
}
