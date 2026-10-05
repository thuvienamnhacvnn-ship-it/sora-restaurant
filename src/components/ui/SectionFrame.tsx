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
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mt-[var(--section-gap)] px-[var(--page-pad)] md:pr-[88px] ${className}`}
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
