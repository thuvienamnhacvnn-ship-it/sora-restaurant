/*
 * Hero dùng chung cho 6 trang.
 *
 * KHÔNG CÓ LỚP PHỦ NÀO LÊN ẢNH — đã đo trên `_w-agent/mau/01_home.png`:
 * vùng ảnh hero của mẫu sáng TB 69,3 / lệch chuẩn 75,2, tức ảnh hiện nguyên
 * vẹn. Chữ đọc được là nhờ BÓNG ĐỔ CỦA CHÍNH CHỮ, không nhờ bôi tối ảnh.
 * (Bản cũ mask ảnh về `#000` từ mốc 42% -> mất 58% banner, Sếp bác.)
 *
 * Mọi chữ nằm trên ảnh phải mang class `.sora-on-photo` (globals.css).
 * Khổ điện thoại thì tách hẳn: ảnh một khối, chữ một khối, không chồng —
 * ở 390px không có đủ chỗ để chữ và ảnh cùng tồn tại mà vẫn đọc được.
 */
import Image from "next/image";
import { MagicBannerTitle } from "./MagicBannerTitle";
import type { CSSProperties, ReactNode } from "react";
import { MasterChefCard } from "@/components/shell/MasterChefCard";
import {
  BrushRule,
  FallingPetals,
  NE_CHU_HERO,
  PetalsSettled,
} from "@/components/decor/Decor";
import { ChuCo, WordmarkSora, type ChuNhan } from "@/components/chu/ChuCo";
import { HERO_BANNER, type NavKey } from "@/data/site";
import type { Locale } from "@/lib/i18n";

/** Trang -> nhãn nét cọ Sếp gửi. Trùng khoá `nav.*` nên ánh xạ 1-1. */
const CHU_TRANG: Record<NavKey, ChuNhan> = {
  home: "home",
  menu: "menu",
  reservation: "reservation",
  gallery: "gallery",
  about: "about",
  contact: "contact",
};

export function PageHero({
  page,
  locale = "de",
  wordmark,
  wordmarkImage,
  eyebrow,
  big = false,
  chef,
  children,
  stage,
}: {
  page: NavKey;
  /** Mặc định `de` để mấy trang chưa truyền vẫn chạy, không phải sửa đồng loạt. */
  locale?: Locale;
  /** Chữ thật của tiêu đề — vào `alt` + bản ẩn cho máy đọc màn hình. */
  wordmark: string;
  /**
   * Ảnh tiêu đề tự chọn. Trang nào truyền thì dùng ảnh đó; không truyền thì
   * PageHero tự lấy nhãn nét cọ tương ứng trong `public/chu/`.
   */
  wordmarkImage?: { src: string; width: number; height: number };
  eyebrow?: string;
  /** Hero trang chủ cao hơn (spec: 493px @1440 vs ~336px trang con). */
  big?: boolean;
  chef: { eyebrow: string; question: string; cta: string };
  children?: ReactNode;
  /** Cột phải của hero trang chủ: 3 bệ 360°. */
  stage?: ReactNode;
}) {
  const banner = HERO_BANNER[page];
  if (page !== "home" && !big) {
    return (
      <section className="sora-subpage-magic-hero" data-subpage-banner="">
        <Image src={`/banner/${banner}-1920.webp`} alt="" fill priority
          sizes="(max-width:767px) 100vw, (max-width:1199px) calc(100vw - 88px), calc(100vw - 250px)"
          className="sora-subpage-magic-background" />
        <FallingPetals className="sora-subpage-petals" />
        <div className="sora-subpage-magic-heading">
          <MagicBannerTitle nhan={CHU_TRANG[page]} locale={locale}
            {...(page === "reservation" ? { desktop: 1.6, mobile: 0.992, fit: 80 } : {})} />
        </div>
        {(eyebrow || children) && <div className="sora-subpage-magic-copy sora-on-photo-block">
          {eyebrow && <p className="sora-eyebrow !text-ivory">{eyebrow}</p>}
          {children}
        </div>}
      </section>
    );
  }
  /*
   * Tỉ lệ khung hero = ĐÚNG tỉ lệ ảnh banner, để ảnh hiện trọn, không cắt.
   *
   * CẢ 6 TRANG nay đều 3:1. Trang chủ 05/10 đổi sang ảnh mới Sếp gửi
   * (2172×724 = 3,00:1); ảnh cũ 1817×770 = 2,36:1 đã bỏ.
   *
   * ⚠ Số này mà lệch tỉ lệ ảnh thật là ảnh BIẾN DẠNG ngay — chính lỗi
   * 05/10: ảnh banner đã đổi sang 3:1 nhưng chỗ này còn 2,36:1, cộng với
   * khung dùng `min-h` nên phình tới 1,68:1 → ảnh bị phóng 1,79 lần, cắt mất
   * 44% bề ngang. ĐỔI ẢNH BANNER THÌ SỬA LUÔN SỐ NÀY.
   */
  const tiLeAnh = 3;

  return (
    /*
     * KHÔNG `isolate` ở đây — cố ý (07/10). Đừng thêm lại.
     *
     * `isolate` nhốt mọi z-index bên trong hero thành MỘT tầng duy nhất. Mà bệ
     * trưng bày ở trang chủ (`[lang]/page.tsx`) là khối ANH EM đứng sau hero
     * trong DOM và mang `z-20`, nên cả hero — kể cả cụm chữ và hai nút — luôn
     * bị bệ vẽ đè lên. Hậu quả: bệ không nâng cao hơn mép dưới hai nút được,
     * vì nâng là dải mặt bàn vàng cắt ngang chữ nút. Đó đúng là cái trần đã
     * chặn lệnh Sếp 07/10 *"đẩy cao cái bàn thức ăn lên"*.
     *
     * Bỏ `isolate` thì z-index trong hero tính chung một thang với bệ:
     *   ảnh banner   -z-10   dưới cùng
     *   bệ + ba đĩa   z-20   đè lên banner
     *   cụm chữ hero  z-30   đè lên bệ
     * Banner vẫn nằm dưới bệ, chữ vẫn nằm trên bệ — đúng thứ tự cần.
     *
     * Ảnh banner xuống `-z-10` của gốc trang thì nằm dưới `body::before` (vân
     * gỗ 4,5%) — đã nhìn ảnh chụp, không thấy khác biệt.
     */
    <section className="relative border-b border-gold/40">
      {/*
       * `sizes` phải trừ sidebar, đừng để `100vw`.
       *
       * Hero nằm trong `<main>` của AppShell, mà khối đó có
       * `md:ml-[var(--sidebar-w)]` — nên nó CHƯA BAO GIỜ rộng đúng 100vw ở
       * khổ desktop. Khai `100vw` làm Next chọn ảnh to hơn mức cần và in cảnh
       * báo "image is not rendered at full viewport width" mỗi lần dựng trang.
       *
       * Bề ngang sidebar đổi theo khổ (globals.css):
       *   ≤767px  → 0px   (ảnh chiếm trọn bề ngang)
       *   ≤1199px → 88px
       *   ≥1200px → 250px
       *
       * Hai ảnh dưới đây loại trừ nhau bằng `md:hidden` / `hidden md:block`.
       * Khổ nào không hiện thì khai `1px` để trình duyệt khỏi tải sẵn bản to
       * của khối đang ẩn — không khai `0px` vì giá trị đó không hợp lệ.
       */}

      {/*
       * --- Khổ điện thoại: khung 16/10, ảnh CẮT hai bên (cover) ---
       *
       * ⚠ CHỖ DUY NHẤT khổ điện thoại CỐ Ý khác khổ máy tính. Muốn đảo lại:
       * đổi `aspectRatio` dưới đây về `tiLeAnh` và `objectFit` về `contain`
       * — một dòng, không phải sửa chỗ nào khác.
       *
       * VÌ SAO KHÁC. Bản cũ dùng đúng tỉ lệ ảnh (3:1) để hiện trọn, không
       * cắt. Hệ quả ở 390px: banner chỉ cao **130px trên màn 844px = 15%**,
       * ra đúng dáng "một dải mỏng rồi tới mảng đen" mà Sếp đã bác
       * (*"banner bị hụt nhìn rất xấu"*). Đồng bộ cả 6 trang, nhưng đồng bộ
       * ở một dáng Sếp không thích thì vẫn là lỗi.
       *
       * CÁI GIÁ, nói rõ chứ không giấu: 3:1 cắt xuống 1,6:1 là **bỏ mất 47%
       * bề ngang**, chỉ còn phần giữa. Trưởng nhóm đã dựng bảng so 6 banner ×
       * 3 chiều cao (130/177/244) và nhìn tận mắt trước khi duyệt: cả 6 đều
       * là ảnh không khí phòng ăn — **không chủ thể, không logo, không mặt
       * người, không chữ** — nên bỏ hai bên không mất gì, và 244px thì thấy
       * được cả trần hoa lẫn sàn phản chiếu, đọc ra "một căn phòng" chứ không
       * phải một lát cắt. **Banner nào sau này có logo hoặc chủ thể lệch thì
       * phải xét lại chỗ này**, đừng mặc định cắt là an toàn.
       *
       * Về lệnh của Sếp *"ở các trang con cắt ngắn chiều cao banner đi"*:
       * đọc theo chữ thì việc này NGƯỢC (làm banner cao lên). Câu đó nói về
       * khổ MÁY TÍNH, chỗ banner chiếm quá nhiều màn; ở điện thoại vấn đề
       * ngược lại. Trưởng nhóm tự quyết và đã báo Sếp — Sếp bác thì đảo lại
       * bằng một dòng như trên. KHỔ MÁY TÍNH GIỮ NGUYÊN, không đụng.
       *
       * `objectPosition: center 42%` lấy hơi cao hơn tâm: phần trên khung
       * hình là trần hoa đào, phần dưới là sàn — nhích lên giữ được trần.
       */}
      {/* TRANG CON (làm lại 07/10, spec A): ảnh 180px thay cho 16/10 (244px ở
          390) — hero điện thoại 479–544px đẩy nội dung chính xuống quá nửa
          màn thứ hai. Trang chủ (`big`) GIỮ NGUYÊN 16/10. */}
      <div
        className={`relative w-full md:hidden ${big ? "" : "h-[180px]"}`}
        style={big ? { aspectRatio: "16 / 10" } : undefined}
      >
        <Image
          src={`/banner/${banner}-768.webp`}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
      </div>

      {/*
       * --- Desktop: ảnh TRÀN HẾT KHUNG, đúng như mẫu ---
       *
       * Sếp 05/10: *"Tất cả Banner ở trang chủ và trang con đang đặt lệch, phải
       * đưa vào đúng vị trí full khung như ban đầu"*. Trước đó (04/10 20:43)
       * banner bị co còn `w-[52%]` dán vào nửa phải để chữ không nằm trên ảnh.
       *
       * ĐÁNH ĐỔI PHẢI BIẾT, đừng âm thầm sửa lại: chuẩn WCAG KHÔNG tính bóng
       * chữ. Đo thật khi chữ nằm trên ảnh: **1,05–3,71:1**, dưới ngưỡng AA
       * (3:1 cho chữ lớn). Ba đường ra, Sếp đã loại hai:
       *   1. phủ một lớp sau chữ — Sếp CẤM 04/10
       *   2. co banner lại, chữ ra ngoài ảnh — Sếp bác 05/10 (chính là lệnh này)
       *   3. để nguyên, chấp nhận trượt AA — đang là cái này
       * Muốn vừa full khung vừa đạt AA thì phải đổi ảnh banner sang bản tối hơn
       * ở nửa trái, hoặc cho phép quầng tối cục bộ sau chữ. Cần Sếp chốt.
       *
       * `objectPosition` đổi `center 40%` → `center center`: khung giờ đúng tỉ
       * lệ 3:1 của ảnh nên không còn phải né, lấy giữa là hiện trọn.
       */}
      {/*
       * CÁCH VẼ NÀY KHIẾN PHÓNG ẢNH LÀ BẤT KHẢ THI (Sếp 05/10: "nghiêm cấm
       * zoom lớn ảnh banner").
       *
       * Không dùng `fill` + `object-fit` nữa. Ảnh là thẻ thường `w-full h-auto`
       * nên bề cao LUÔN suy từ bề ngang theo đúng tỉ lệ gốc — hệ số phóng luôn
       * đúng bằng (bề ngang khung ÷ bề ngang ảnh), không có đường nào để nó
       * phình theo chiều cao khung.
       *
       * Khung bọc `overflow-hidden`, ảnh neo MÉP TRÊN. Khung thấp hơn ảnh thì
       * ảnh bị CẮT BỚT PHÍA DƯỚI — đúng điều Sếp yêu cầu cho trang con, và là
       * cắt thật chứ không phải thu nhỏ.
       */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden overflow-hidden md:block"
      >
        <Image
          src={`/banner/${banner}-1920.webp`}
          alt=""
          width={1920}
          height={640}
          priority
          className="h-auto w-full"
          sizes="(max-width: 767px) 1px, (max-width: 1199px) calc(100vw - 88px), calc(100vw - 250px)"
          /*
           * `contain` CHỨ KHÔNG `cover` — Sếp 05/10: "NGHIÊM CẤM ZOOM LỚN ẢNH
           * BANNER".
           *
           * `cover` phóng ảnh lên cho lấp đầy khung và cắt phần thừa; khung chỉ
           * cần lệch tỉ lệ một chút là ảnh méo ngay (đã xảy ra: phóng 1,79 lần,
           * cắt 44% bề ngang). `contain` thì KHÔNG BAO GIỜ phóng quá cỡ và
           * không bao giờ cắt — khung có sai tỉ lệ thì cùng lắm hở viền, ảnh
           * vẫn nguyên vẹn.
           *
           * Đây là chốt chặn cứng: dù sau này ai đổi chiều cao khung hay quên
           * cập nhật `tiLeAnh`, ảnh banner vẫn không thể bị phóng/cắt.
           * ĐỪNG ĐỔI VỀ `cover`.
           */
          style={{ objectFit: "contain", objectPosition: "center center" }}
        />
      </div>

      {/*
       * ---- CHỈ CÒN CÁNH RƠI, KHÔNG CÒN TÁN HOA PNG (Sếp 05/10) ----
       * Sếp: *"vẫn để hoa đào rơi, xoá ảnh hoa đào PNG trên banner đi"*.
       *
       * Bỏ `HeroDecor` vì bộ đó gom 4 lớp PNG TĨNH (hai `SakuraCanopy` rủ mép
       * trên cho điện thoại/desktop, một dải mỏng trên cột chữ ở trang con,
       * một `SakuraEdge` chạy dọc mép trái) — chính là mấy lớp cần xoá. Chỉ
       * giữ `FallingPetals`, là thứ duy nhất trong bộ đó không phải PNG dán.
       *
       * Vì sao không cần tán hoa nữa: ảnh banner mới đã có sẵn tán hoa đào
       * thật rủ kín mép trên, dán thêm PNG lên là hai lớp hoa chồng nhau.
       *
       * `HeroDecor` giữ lại trong `Decor.tsx` (không ai dùng nữa) phòng khi
       * Sếp đổi ý — đã lật hai lần trong hai ngày.
       */}
      {/* `neChu` — cánh hoa ở ĐÂY bay ngang qua cột chữ hero, nên phải né.
          Dải cánh phủ cái bệ ở trang chủ thì KHÔNG né (chỗ đó không có chữ,
          và Sếp dặn cho hoa rơi lên cả bệ). Xem `NE_CHU_HERO`. */}
      <FallingPetals left={0} neChu={NE_CHU_HERO} className="hidden md:block" />

      {/* Cánh đã rơi, nằm đọng rải rác dọc đáy banner. */}
      <PetalsSettled neChu={NE_CHU_HERO} className="hidden md:block" />

      {/*
       * Chiều cao hero SUY TỪ TỈ LỆ ẢNH, không chốt cứng nữa.
       *
       * Banner nguồn 2172×724 = **3:1**. Khung cũ chốt 493px (trang chủ) /
       * 336px (trang con) trong khi bề ngang là `100vw − sidebar`: ở 1672px
       * màn hình, khung rộng 1416 nên muốn hiện TRỌN ảnh phải cao 1416/3 = 472.
       * Trang con 336 → `objectFit: cover` **cắt mất 29% chiều cao ảnh**, mất
       * đúng chiều sâu căn phòng. Đó là thứ Sếp thấy là "đặt lệch".
       *
       * `--sidebar-w` tự đổi theo khổ (0 / 88 / 250px) nên công thức này đúng ở
       * cả ba khổ mà không phải khai ba lần.
       */}
      <div
        /*
         * TRANG CHỦ khoá chiều cao cứng · TRANG CON dùng `min-h`. Hai luật
         * khác nhau, có lý do, đừng gộp lại.
         *
         * ── LỊCH SỬ (giữ nguyên để không ai lật lại bằng trí nhớ) ──
         * 05/10 chốt `md:h-` cho CẢ SÁU trang, vì Sếp bác bản `min-h`: *"sao
         * mày làm biến dạng ảnh, để nguyên kích thước ảnh banner"*. Khi đó ảnh
         * banner vẽ bằng `fill` + `objectFit: cover`, nên khung phình là ảnh
         * bị PHÓNG theo: đo ở 1440 khung 1184×395 phình thành 1184×706 = 1,68:1
         * -> ảnh phóng 1,79 lần, cắt mất 44% bề ngang.
         *
         * ── LÝ DO ĐÓ NAY KHÔNG CÒN ĐÚNG (07/10) ──
         * Ảnh banner đã đổi sang thẻ thường `width/height` + `h-auto w-full`
         * trong hộp `overflow-hidden` (xem khối ảnh desktop ở trên, dòng
         * ~160-200). Chiều cao ảnh nay suy DUY NHẤT từ bề ngang theo tỉ lệ
         * gốc — **khung cao thêm không có đường nào phóng được ảnh**. Khung
         * cao hơn chỉ hé ra thêm phần ảnh đang bị cắt.
         *
         * Nên ở TRANG CON (`CAT_DAY = 0,66`, đang cắt bỏ 34% dưới ảnh) `min-h`
         * là lời đúng: cụm chữ cao hơn khung thì khung nới ra và **hé thêm
         * banner**, không sinh ra một px đen nào, miễn còn trong 52% dư địa.
         * Đo 07/10 cho thấy phải nới: ở 1024×768 cụm chữ Über uns cao 257px
         * trong khung 206px -> tiêu đề "Über uns" bị cắt cụt đỉnh 25,6px và
         * ba dòng chữ chờ rơi xuống nền đen (tổ C xếp CHẶN).
         *   1024: cần 269px / ảnh cho tối đa 312px  ✓ còn dư
         *   1280: cần 243px / 341px                 ✓
         * `md:py-5` để lúc khung nới ra chữ không dán sát mép banner.
         *
         * TRANG CHỦ thì KHÔNG được `min-h`: `CAT_DAY = 1` nên khung đã cao
         * đúng bằng ảnh, nới ra là dải ĐEN giữa chân banner và bệ trưng bày.
         * Ở đó chữa bằng cách THU CỤM CHỮ theo chiều cao banner —
         * `.sora-hero-khoa` trong globals.css, có dẫn giải đầy đủ số liệu.
         */
        /* `z-30` — trên bệ trưng bày (`z-20`). Xem ghi chú "KHÔNG isolate" ở
           thẻ <section>: thiếu nó là dải mặt bàn vàng cắt ngang hai nút. */
        className={`relative z-30 flex w-full flex-col justify-center px-[var(--page-pad)] md:py-0 ${
          big
            ? "sora-hero-khoa py-9 md:h-[var(--hero-h)]"
            : "py-6 md:min-h-[var(--hero-h)] md:py-5"
        }`}
        style={
          {
            /*
             * Chiều cao desktop = bề ngang / tỉ lệ ảnh, rồi NHÂN HỆ SỐ CẮT.
             * `--sidebar-w` tự đổi theo khổ (0 / 88 / 250px) nên một công thức
             * đúng cho cả ba khổ.
             *
             * `CAT_DAY` (Sếp 05/10: "ở các trang con cắt ngắn chiều cao banner
             * đi, là cắt phía dưới banner để lấy không gian cho các thông tin
             * chính của trang"):
             *   - trang chủ  : 1    → banner hiện trọn
             *   - trang con  : 0,66 → chỉ hiện 2/3 trên của ảnh
             *
             * Đây là CẮT, không phải thu nhỏ: ảnh vẽ bằng thẻ `w-full h-auto`
             * neo mép trên trong khung `overflow-hidden`, nên phần dưới bị
             * khung che đi còn phần hiện vẫn đúng cỡ gốc. Muốn cắt nhiều/ít
             * hơn thì đổi đúng số này, ĐỪNG đụng vào `object-fit`.
             */
            "--hero-h": `calc((100vw - var(--sidebar-w)) / ${tiLeAnh} * ${big ? 1 : 0.66})`,

          } as CSSProperties
        }
      >
        {/*
         * Chừa LÀN của rail tiện ích nổi bên phải (`--rail-lane` 102px, xem
         * globals.css) cộng lề trang. Chỉ đặt trên khối NỘI DUNG — ảnh banner
         * vẫn tràn hết mép phải. Số cũ `88px` thiếu 14px nên rail lấn chữ.
         *
         * CỘT CHỮ 60fr DƯỚI 1440, 48fr TỪ 1440 LÊN (07/10).
         *
         * 48/52 là bố cục của mẫu: chữ nửa trái, bệ trưng bày nửa phải. Nhưng
         * dưới 1440 `--be-dich-so` = 1,18 nên **cả cái bệ nằm hẳn dưới khung
         * hero** — nửa phải hero ở những khổ đó là nền trống, không có gì để
         * né. Trong khi nửa trái thì chật tới mức nhãn nút dài nhất
         * ("SPEISEKARTE ENTDECKEN") lòi ra khỏi nút 15px ở 1024 và 4px ở 1280.
         *
         * Nới cột chữ lên 60fr ở những khổ đó: nút rộng 213px (1024) / 239px
         * (1280) so với 177px mà nhãn cần -> hết lòi, và KHÔNG phải hạ cỡ chữ
         * nút (vốn đã 11,5px, mức thấp nhất chấp nhận được cho CTA chính).
         *
         * ⚠ TỪ 1440 PHẢI QUAY VỀ 48fr. Ở đó `--be-dich-so` tụt còn 0,58 nên
         * 42% trên của bệ đè vào đáy hero, và mép trái bệ (neo phải, rộng 62%)
         * chạy tới gần hàng nút — nới cột chữ là dải mặt bàn vàng cắt ngang
         * hai nút. Chính cái đã xảy ra 05/10. Đổi số ở đây thì chạy lại
         * `node scripts/do-che-nut.mjs`.
         */}
        <div className="mx-auto grid w-full max-w-[var(--content-max)] items-stretch gap-8 md:pr-[calc(var(--page-pad)+var(--rail-lane))] md:[grid-template-columns:minmax(0,60fr)_minmax(0,40fr)] min-[1440px]:[grid-template-columns:minmax(0,48fr)_minmax(0,52fr)]">
          <div className="relative isolate min-w-0 self-center md:pr-6">
            {/*
             * MỘT lớp phủ đen, chỉ nằm DƯỚI KHỐI CHỮ — Sếp chốt 05/10:
             * *"Text trên ảnh chỉ có 1 lớp phủ đen dưới text"*.
             *
             * Lịch sử để người sau khỏi lật lại: 04/10 Sếp bảo bỏ hết quầng tối
             * → đo ra 1,05–3,71:1, trượt AA (cần 4,5) → 04/10 tối có người co
             * banner còn 52% cho chữ ra khỏi ảnh → 05/10 Sếp bác, đòi banner
             * full khung → và cho lại ĐÚNG MỘT lớp phủ dưới chữ. Đây là bản đó.
             *
             * Luật của lớp này, đừng nới:
             *   - CHỈ một lớp, không chồng tầng.
             *   - Bám theo khối chữ (`absolute` trong cột chữ), KHÔNG trải lên
             *     cả banner — ảnh minh hoạ phải hiện nguyên vẹn.
             *   - Tắt hẳn trước khi chạm mép ảnh (dừng ở 92%) để không thấy
             *     đường biên.
             */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 hidden rounded-[32px] md:block"
              style={{
                background:
                  "radial-gradient(ellipse 72% 66% at 38% 50%, rgba(9,8,6,.82) 0%, rgba(9,8,6,.66) 48%, rgba(9,8,6,.30) 74%, rgba(9,8,6,0) 92%)",
              }}
            />

            {wordmarkImage ? (
              <h1 className="sora-on-photo-img">
                <Image
                  src={wordmarkImage.src}
                  alt={wordmark}
                  width={wordmarkImage.width}
                  height={wordmarkImage.height}
                  priority
                  sizes="(max-width: 767px) 72vw, 420px"
                  className="h-auto w-[min(72vw,420px)]"
                />
              </h1>
            ) : page === "home" ? (
              /*
               * Sếp 05/10: chữ SoRa nhỏ lại 10% và hạ xuống.
               * Tỉ lệ 1.35 -> 1.215 và 0.85 -> 0.765 (đúng ×0,9).
               * Hạ xuống: bản trước chữ chạm sát mép trên banner, đỉnh nét bị
               * cắt — mẫu `01_home` chừa khoảng trống phía trên. `mt-*` ở đây
               * đẩy cả cụm title xuống chứ không riêng chữ, đúng như mẫu.
               */
              <WordmarkSora
                the="h1"
                chuThat
                nganGon
                /* Khung hero nay khoá cứng theo tỉ lệ ảnh (395px @1440), nên
                   cụm chữ phải vừa đúng chừng đó. Lề trên 56→16, cỡ chữ
                   1.215→0.92. Nới lại là khung phình, ảnh banner méo ngay. */
                /* Sếp 05/10: "chữ SoRa to hơn". 0,6 → 1,0 (cao ~113px → ~190px
                   ở khổ 1664). Khung hero vẫn khoá cứng theo tỉ lệ ảnh nên
                   phần nới ra đây đã bù lại bằng cách rút khoảng cách giữa
                   các cụm bên dưới — nới thêm nữa là chữ tràn khỏi khung. */
                /*
                 * `--chu-tran` thu nét cọ theo chiều cao banner ở màn thấp:
                 * chiều cao 189px ở ≥1440 (KHÔNG thu, đúng cỡ Sếp duyệt) ->
                 * 174px ở 1366 -> 157px ở 1280 -> 139px ở 1024.
                 *
                 * `var(--chu-w)` là bề ngang tệp gốc, do chính `AnhChu` ghi ra
                 * — không chép tay số 339 vào đây, đổi tệp chữ là số này tự
                 * đúng. Nhân với `--hero-thu` (≤1px) nên chỉ co, không phóng;
                 * `<img>` trong `chu.module.css` vẫn là `min(100%, cỡ-gốc)`.
                 *
                 * Dùng `--chu-tran` chứ KHÔNG `md:max-w-[…]`: xem ghi chú
                 * "ĐƯỜNG THỨ BA" trong `chu.module.css` — class Tailwind thua
                 * `max-width` của CSS module và lệnh thu mất tác dụng âm thầm.
                 */
                className="sora-on-photo-img mt-4 md:mt-0 md:[--chu-tran:calc(var(--chu-w)*var(--hero-thu))]"
                tiLe={{ dienThoai: 0.765, mayTinh: 1 }}
              />
            ) : (
              /*
               * KHÔNG truyền `chu` ở đây.
               * Trước có `chu={wordmark}` mà `wordmark` lấy từ `t("nav.*")`;
               * `vi.json` cố ý rỗng nên `t()` rơi về tiếng Đức -> ở
               * /vi/speisekarte ảnh hiện "Thực đơn" còn máy đọc màn hình đọc
               * "Speisekarte". Để trống thì `ChuCo` tự tra `CHU_NHAN` theo
               * locale, ảnh và chữ thật luôn khớp nhau.
               */
              <ChuCo
                nhan={CHU_TRANG[page]}
                locale={locale}
                the="h1"
                chuThat
                nganGon
                className="sora-on-photo-img"
                tiLe={{ dienThoai: 0.62, mayTinh: 1 }}
              />
            )}

            {eyebrow && (
              /*
               * decor: mẫu KHÔNG có gạch ngắn đứng TRƯỚC eyebrow. Soi 1:1 trên
               * 01_home (x 298→702) và 06_kontakt (x 303→715): đó là một chỉ
               * vàng mảnh chạy BÊN DƯỚI cả dòng, chính giữa có một đoạn cọ đỏ
               * đè lên. Đổi gạch-trước thành chỉ-dưới là việc của lớp decor.
               */
              /* Bốn khe dọc của cụm chữ (8 / 7 / 12 / 16px) đều bọc
                 `min(gốc, gốc × --hero-thu)`: ở ≥1440 và ở 5 trang con
                 `--hero-thu` = 1px nên ra ĐÚNG số cũ, không đổi gì; ở màn thấp
                 trang chủ chúng co cùng hệ số với chữ ký và H2 nên nhịp dọc
                 giữ nguyên tỉ lệ chứ không bị bóp méo một chỗ. */
              <p className="mt-2 w-fit md:mt-[min(8px,calc(8*var(--hero-thu)))]">
                {/*
                 * Eyebrow trên hero dùng IVORY, không dùng vàng như trong thân
                 * trang. Vàng `#f0d49a` nằm trên ảnh quán đèn vàng là CÙNG
                 * TÔNG — đo được 2,83–3,14:1 ở cả 6 trang, trượt AA (cần 4,5).
                 * Tăng bóng không chữa được chuyện cùng tông; phải đổi sang
                 * màu đối. Vàng vẫn giữ ở mọi eyebrow trong thân trang.
                 */}
                {/* Bỏ `px-5 text-center` (Sếp 05/10: "toàn bộ cân lề trái").
                    Hộp eyebrow vốn đã bắt đầu đúng lề 288, nhưng đệm 20px +
                    căn giữa đẩy CHỮ vào 308 — lệch 20px so với chữ SoRa, tiêu
                    đề và hai nút. Bỏ đi thì cả 4 cụm cùng một mép. */}
                <span className="sora-eyebrow sora-on-photo block text-left !text-ivory">
                  {eyebrow}
                </span>
                <BrushRule className="mt-[7px] md:mt-[min(7px,calc(7*var(--hero-thu)))]" />
              </p>
            )}
            {/* Trang con chưa có chữ hero (chờ Sếp gửi) thì KHÔNG truyền
                `children` -> không dựng khối rỗng, không để lại 12px lề. Trang
                chủ luôn truyền nên không đổi gì. */}
            {children && (
              <div className="sora-on-photo-block mt-3 md:mt-[min(12px,calc(12*var(--hero-thu)))]">
                {children}
              </div>
            )}
          </div>

          {/* Bệ 360 đẩy xuống dưới để không chạm thẻ Master Chef ở góc trên */}
          {stage && (
            <div className="hidden min-w-0 flex-1 items-end justify-center pt-[170px] pb-8 md:flex">
              {stage}
            </div>
          )}
        </div>
      </div>

      {/* Thẻ Master Chef — góc trên phải, không che chữ hero */}
      <div className="pointer-events-none absolute top-5 right-6 z-10 hidden xl:block">
        <MasterChefCard {...chef} gon={!big} nutCao={!big} />
      </div>
    </section>
  );
}
