import type { ReactNode } from "react";
import { SectionTick } from "@/components/decor/Decor";

/*
 * Khung một section.
 * Khoảng cách dọc 72px desktop / 48px điện thoại (spec §2.4 — mockup đo được
 * 15px nhưng đó là vì cả trang bị ép vào một khung 16:9, không phải thiết kế).
 * Mọi số đo NGANG giữ đúng mockup.
 */
export function SectionFrame({
  children,
  title,
  action,
  className = "",
  id,
  sauHero = false,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  id?: string;
  /**
   * Khối ĐẦU TIÊN ngay dưới banner của trang con: khe `--sau-banner` (16px,
   * globals.css) — MỘT số chung cho mọi trang con, Sếp 11/10 «sát mép chân
   * banner». Trước là 32px (điện thoại 24px). Trang chủ không truyền nên
   * không đổi.
   */
  sauHero?: boolean;
}) {
  return (
    <section
      id={id}
      /*
       * Lề phải = `--page-pad` + LÀN của cột nút nổi (`--rail-lane`, 102px).
       *
       * Trước là `md:pr-[88px]` viết tay: thiếu 14px so với 102px rail thật sự
       * chiếm, nên rail lấn nội dung 14px ở mọi cỡ desktop. Và vì trang chủ đã
       * huỷ số đó về 32px còn bảy tuyến kia giữ 88px, hai nhóm trang lệch lề
       * nhau 56px — đúng cái "không đều" Sếp chê 07/10.
       *
       * Công thức này cho lề TRÁI 32px và khe từ mép nội dung tới MÉP RAIL
       * cũng 32px, nên cụm nội dung nằm giữa khoảng trống thật. Dưới 768px
       * `--rail-lane` = 0 nên lề về đúng 16/16.
       */
      className={`${sauHero ? "mt-[var(--sau-banner)]" : "mt-[var(--section-gap)]"} px-[var(--page-pad)] md:pr-[calc(var(--page-pad)+var(--rail-lane))] ${className}`}
    >
      <div className="mx-auto w-full max-w-[var(--content-max)]">
        {(title || action) && (
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            {title && (
              <h2 className="sora-section-title">
                {/* decor: gạch đỏ dọc trước tiêu đề mục — mẫu 02 có, trưởng
                    nhóm đã duyệt. Chỉ THÊM phần tử, không đổi gì khác. */}
                <SectionTick />
                {title}
              </h2>
            )}
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
