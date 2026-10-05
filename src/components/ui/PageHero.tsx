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
import type { ReactNode } from "react";
import { MasterChefCard } from "@/components/shell/MasterChefCard";
import { BrushRule, HeroDecor, PetalsSettled } from "@/components/decor/Decor";
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

  return (
    <section className="relative isolate border-b border-gold/40">
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
       *   ≥1200px → 256px
       *
       * Hai ảnh dưới đây loại trừ nhau bằng `md:hidden` / `hidden md:block`.
       * Khổ nào không hiện thì khai `1px` để trình duyệt khỏi tải sẵn bản to
       * của khối đang ẩn — không khai `0px` vì giá trị đó không hợp lệ.
       */}

      {/* --- Khổ điện thoại: ảnh riêng một khối, không có chữ đè --- */}
      {/* Khổ điện thoại cũng theo tỉ lệ 3:1 để hiện trọn ảnh, không cắt. */}
      <div className="relative aspect-[3/1] w-full md:hidden">
        <Image
          src={`/banner/${banner}-768.webp`}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          style={{ objectFit: "cover", objectPosition: "center center" }}
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
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden md:block">
        <Image
          src={`/banner/${banner}-1920.webp`}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 1px, (max-width: 1199px) calc(100vw - 88px), calc(100vw - 256px)"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>

      {/*
       * ---- HOA ĐÀO TRÊN BANNER (Sếp cho gắn lại 05/10) ----
       * Ghi lại để người sau khỏi lật đi lật lại: 04/10 Sếp bảo bỏ hết, 05/10
       * bảo gắn lại kèm cánh rơi và cánh đọng ở đáy. Đây là bản đang dùng.
       *
       * Dùng `HeroDecor` (bộ gom) chứ KHÔNG gắn lẻ từng thẻ như bản cũ: bộ này
       * đã canh để tán hoa và cánh rơi chỉ thả từ x≈580 sang phải, né hẳn cột
       * chữ. Gắn lẻ là hoa rơi đè lên tiêu đề.
       */}
      <HeroDecor big={big} />

      {/* Cánh đã rơi, nằm đọng rải rác dọc đáy banner. Đặt SAU `HeroDecor` để
          cánh đọng nằm trên tán hoa chứ không bị tán che. */}
      <PetalsSettled className="hidden md:block" />

      {/*
       * Chiều cao hero SUY TỪ TỈ LỆ ẢNH, không chốt cứng nữa.
       *
       * Banner nguồn 2172×724 = **3:1**. Khung cũ chốt 493px (trang chủ) /
       * 336px (trang con) trong khi bề ngang là `100vw − sidebar`: ở 1672px
       * màn hình, khung rộng 1416 nên muốn hiện TRỌN ảnh phải cao 1416/3 = 472.
       * Trang con 336 → `objectFit: cover` **cắt mất 29% chiều cao ảnh**, mất
       * đúng chiều sâu căn phòng. Đó là thứ Sếp thấy là "đặt lệch".
       *
       * `--sidebar-w` tự đổi theo khổ (0 / 88 / 256px) nên công thức này đúng ở
       * cả ba khổ mà không phải khai ba lần.
       */}
      <div
        className={`relative flex w-full flex-col justify-center px-[var(--page-pad)] py-9 md:py-0 md:min-h-[calc((100vw-var(--sidebar-w))/3)] ${
          big ? "md:min-h-[calc((100vw-var(--sidebar-w))/3)]" : ""
        }`}
      >
        {/* `md:pr-[88px]` chừa chỗ cho rail tiện ích nổi bên phải. Chỉ đặt trên
            khối NỘI DUNG — ảnh banner vẫn tràn hết mép phải. Thiếu nó thì rail
            đè lên bệ 360° thứ ba. */}
        <div className="mx-auto grid w-full max-w-[var(--content-max)] items-stretch gap-8 md:pr-[88px] md:[grid-template-columns:minmax(0,48fr)_minmax(0,52fr)]">
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
                className="sora-on-photo-img mt-6 md:mt-14"
                tiLe={{ dienThoai: 0.765, mayTinh: 1.215 }}
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
              <p className="mt-3 w-fit">
                {/*
                 * Eyebrow trên hero dùng IVORY, không dùng vàng như trong thân
                 * trang. Vàng `#f0d49a` nằm trên ảnh quán đèn vàng là CÙNG
                 * TÔNG — đo được 2,83–3,14:1 ở cả 6 trang, trượt AA (cần 4,5).
                 * Tăng bóng không chữa được chuyện cùng tông; phải đổi sang
                 * màu đối. Vàng vẫn giữ ở mọi eyebrow trong thân trang.
                 */}
                <span className="sora-eyebrow sora-on-photo block px-5 text-center !text-ivory">
                  {eyebrow}
                </span>
                <BrushRule className="mt-[7px]" />
              </p>
            )}
            <div className="sora-on-photo-block mt-5">{children}</div>
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
        <MasterChefCard {...chef} />
      </div>
    </section>
  );
}
