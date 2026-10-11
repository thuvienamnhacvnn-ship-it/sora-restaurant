/*
 * Dải 5 THẺ DANH MỤC ở CHÂN BANNER trang chủ — Sếp gửi 06/10/2026.
 *
 * Sếp gửi 10 tệp trong `…\SORA_WEBSITE_CLAUDE_KIT\Menu Bar`:
 *   - 5 tệp CÓ CHỮ + nút  -> *"là để làm mẫu cho mày học mà làm theo"*
 *   - 5 tệp KHÔNG CHỮ     -> thứ đem lên web
 * Kèm ảnh chụp `Screenshot 2026-10-06 113245.png` ("MẪU 1 | 4 DANH MỤC NGANG").
 *
 * ---- VÌ SAO CHỮ VẼ BẰNG HTML CHỨ KHÔNG NƯỚNG VÀO ẢNH ----
 * Tệp mẫu có chữ là ảnh bitmap tiếng Đức. Dùng thẳng thì: bản `/vi` không
 * dịch được, máy đọc màn hình không đọc được, và chữ nhoè khi thẻ co lại.
 * Nên lấy 5 tệp KHÔNG CHỮ làm nền rồi vẽ chữ + nút bằng HTML — đúng ý
 * "học mà làm theo".
 *
 * ---- SỐ ĐO LẤY TỪ CHÍNH TỆP MẪU, KHÔNG ƯỚM MẮT ----
 * Đo trên `11_57_39 AM-1.png` (1448×1086), quy ra % bề ngang ảnh (`cqw`) để
 * mọi cỡ màn nhìn y như mẫu:
 *   khung vàng   x 9,0%–91,0%   y 21,8%–93,3%   (đã in SẴN trong ảnh)
 *   tiêu đề      tâm y 65,7%    cao chữ hoa 5,25% bề ngang -> cỡ chữ ~7,5%
 *   dòng phụ     tâm y 74,2%    cỡ chữ ~3,2%
 *   nút          tâm y 84,9%    rộng 35,6%   cao 11,2% chiều cao ảnh
 *
 * ---- BA ĐIỀU KHÔNG ĐƯỢC ĐỔI ----
 * 1. KHÔNG `overflow-hidden`, KHÔNG bo góc, KHÔNG viền trên thẻ <li>/<a>:
 *    khung vàng nằm TRONG ảnh, và món ăn TRÀN LÊN TRÊN khỏi khung. Cắt là
 *    mất phần tràn — hỏng đúng cái làm nên mẫu này.
 * 2. KHÔNG ghép nền đặc cho ảnh: nền trong suốt phía trên chính là chỗ món
 *    tràn ra.
 * 3. KHÔNG phóng ảnh khi rê chuột, vì phóng là lệch khung vàng so với chữ
 *    đang đặt theo %.
 */
import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/lib/i18n";

/*
 * Thứ tự theo ảnh mẫu của Sếp (Sushi -> Việt -> Món chính -> Tráng miệng),
 * `getraenke` nối tiếp vì tệp mẫu `Luxuriöse Signature Drinks-Karte` xếp cuối.
 *
 * `tua` và `phu` CHÉP ĐÚNG chữ in trên tệp mẫu, không tự đặt lại.
 * Bản tiếng Việt: chỉ dịch NHÃN nhóm món — tên món trong `phu` giữ nguyên
 * như thực đơn in của quán.
 */
const THE = [
  { ma: "sushi",               tua: { de: "SUSHI",                 vi: "SUSHI" },        phu: "Sashimi Mix / Signature Rolls" },
  { ma: "vietnamese-classics", tua: { de: "VIETNAMESISCHE KÜCHE",  vi: "MÓN VIỆT" },     phu: "Phở Hà Nội / Bún / Reisnudeln" },
  { ma: "hauptgerichte",       tua: { de: "HAUPTGERICHTE",         vi: "MÓN CHÍNH" },    phu: "Rotes Curry / SoRa-Sauce" },
  { ma: "desserts",            tua: { de: "DESSERT",               vi: "TRÁNG MIỆNG" },  phu: "Matcha / Mango / Mochi" },
  { ma: "getraenke",           tua: { de: "GETRÄNKE",              vi: "ĐỒ UỐNG" },      phu: "Signature Drinks / Cocktails" },
] as const;

export function DaiPosterMon({ locale }: { locale: Locale }) {
  const nhanNut = locale === "vi" ? "Khám phá" : "Entdecken";

  return (
    /*
     * 5 cột từ `xl` (mẫu của Sếp xếp 4 ngang; tệp thứ 5 là Getränke nên hàng
     * thành 5). Dưới `xl` xuống 2–3 cột cho chữ còn đọc được.
     */
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {THE.map((t) => (
        <li key={t.ma} style={{ containerType: "inline-size" }}>
          <Link
            href={`${href("/speisekarte", locale)}?kategorie=${t.ma}`}
            className="sora-the-danh-muc group relative block"
          >
            <Image
              src={`/danh-muc/${t.ma}.webp`}
              alt=""
              width={724}
              height={668}
              unoptimized
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {/* `unoptimized`: bộ đệm ảnh của Next khoá theo URL, mà tên tệp không
                đổi khi chạy lại script — nó trả BẢN CŨ và trông như code không
                ăn. Dùng thẳng tệp gốc thì hết. Không tốn gì: ảnh đã xuất đúng
                724px cho ô ~224px, bộ tối ưu chẳng còn gì để cắt. */}

            {/*
             * Tiêu đề — serif hoa, vàng, ĐẶT TRONG KHUNG đúng mẫu.
             * Cỡ chữ co theo độ dài tên nhóm: trên chính tệp mẫu của Sếp,
             * "VIETNAMESISCHE KÜCHE" rộng 89,5% bề ngang trong khi khung chỉ
             * rộng 82% — mẫu cũng tràn. Ở khổ thẻ thật (~224px) thì tràn đọc
             * ra là lỗi. Chữ hoa serif rộng trung bình ~0,62 lần cỡ chữ, muốn
             * n chữ nằm trong 78% bề ngang thì cỡ ≤ 126/n.
             */}
            <span
              className="pointer-events-none absolute inset-x-0 text-center font-semibold tracking-[.02em] text-gold-bright"
              style={{
                top: "64.8%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-serif)",
                fontSize: `${Math.min(7.5, 126 / t.tua[locale].length)}cqw`,
                lineHeight: 1,
              }}
            >
              {t.tua[locale]}
            </span>

            {/*
             * Dòng phụ — tên món, KHÔNG dịch: khách cầm thực đơn in phải khớp.
             *
             * CỠ CHỮ: `min(12px, 5.79cqw)` thay cho `3.2cqw` cứng (07/10).
             *
             * 3,2% là đúng tỉ lệ đo trên tệp mẫu của Sếp — nhưng tệp mẫu rộng
             * 1448px còn thẻ thật chỉ 162–290px, nên cùng tỉ lệ ấy ra
             * **5,2–9,3px ở MỌI cỡ màn**, dưới xa sàn đọc 12px của thước đo.
             * Phóng 4× ảnh chụp vẫn không đọc nổi.
             *
             * Ra số 5.79 thế nào: dòng dài nhất ("Phở Hà Nội / Bún /
             * Reisnudeln") đo được cần 170px ở cỡ 12px; khung vàng in sẵn
             * trong ảnh rộng 82% bề ngang thẻ. Muốn chữ KHÔNG vượt khung:
             *     cỡ ≤ 12 × (0,82 × bề-ngang-thẻ) / 170 = 5.79cqw
             *
             * NÓI THẲNG CHỖ CHƯA ĐẠT: ở 1280/1366/1440 thẻ chỉ rộng 162–194px
             * nên công thức trên trần ra 9,4 / 10,4 / 11,2px — vẫn dưới 12px.
             * Đó là giới hạn hình học, không phải lười: muốn đủ 12px trên một
             * dòng thì thẻ phải rộng ≥207px, tức hàng 5 thẻ cần vùng nội dung
             * ≥1083px (chỉ có từ 1600 lên). Ba đường ra đều phải Sếp chốt vì
             * đụng vào mẫu: (a) xuống 4 thẻ/hàng ở màn hẹp, (b) cho dòng phụ
             * xuống 2 dòng — hiện KHÔNG đủ chỗ dọc giữa tiêu đề và nút, phải
             * nới bố cục trong thẻ, (c) rút ngắn chuỗi tên món.
             * Ở 1024 / 1600 / 1920 / 390 thì đủ 12px.
             */}
            <span
              className="pointer-events-none absolute inset-x-0 text-center text-text"
              style={{
                top: "74.6%",
                transform: "translateY(-50%)",
                fontSize: "min(12px, 5.79cqw)",
                lineHeight: 1,
              }}
            >
              {t.phu}
            </span>

            {/* Nút chỉ là HÌNH: cả thẻ đã là <Link>, lồng thẻ bấm trong thẻ
                bấm là HTML sai và máy đọc màn hình đọc thành hai liên kết. */}
            <span
              className="pointer-events-none absolute left-1/2 flex items-center justify-center rounded-full border border-gold/70 text-gold-bright transition-colors group-hover:border-gold-bright"
              /*
               * Nhãn nút cũng dính đúng bệnh của dòng phụ: `2.9cqw` ra 4,7px
               * ở 1280. Sàn 10px là mức LỚN NHẤT còn nằm gọn trong bề ngang
               * nút của mẫu (35,6% thẻ = 57,7px ở 1280; "Entdecken →" ở 10px
               * cần 56,6px). Chiều cao phải nới sàn 18px theo, không thì
               * 8,4cqw = 13,6px không chứa nổi chữ 10px.
               * Bề ngang nút GIỮ ĐÚNG 35,6% của mẫu, không đụng.
               */
              style={{
                top: "85.5%",
                width: "35.6%",
                height: "max(18px, 8.4cqw)",
                transform: "translate(-50%, -50%)",
                fontSize: "max(10px, 2.9cqw)",
                gap: "1.6cqw",
                lineHeight: 1,
              }}
            >
              {nhanNut}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
