/*
 * Khung chung cho 2 trang pháp lý. Không hero ảnh — trang chữ.
 * Địa chỉ + điện thoại bên dưới là dữ liệu ĐÃ XÁC MINH, hiện được;
 * phần còn lại chờ Sếp gửi (luật Đức bắt buộc trước khi lên mạng).
 *
 * LÀM LẠI 07/10 (spec `_w-agent/lam-lai/01_spec.md` mục G). Bố cục văn bản
 * dài lấy từ kho `hallmark/…/macrostructures/02-long-document.md`: MỘT cột,
 * bề rộng dòng 60–65ch, line-height ≥ 1.65, khoảng trắng làm vạch ngăn,
 * tiêu đề mục nhỏ nổi lên từ dòng chữ. Bản cũ: tiêu đề 60px + một thẻ viền
 * bọc cả trang + dòng "[chờ Sếp gửi]" và 5 thanh xám lộ ra cho khách.
 *
 * Nội dung pháp lý thật sẽ đi vào `children` dưới dạng <h2>/<p> thường —
 * kiểu chữ đã đặt sẵn ở `.vanBan` bên dưới, không phải sửa lại bố cục.
 */
import type { ReactNode } from "react";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ChoSepAn } from "@/components/ui/ChoSep";
import { MobileFooter } from "@/components/shell/MobileFooter";
import { KhungThongBao } from "@/components/ui/KhungThongBao";
import { addressLines, restaurant, telHref, phoneLabel } from "@/data/restaurant";
import type { Locale } from "@/lib/i18n";

export function LegalPage({
  locale,
  title,
  pending,
  note,
  children,
}: {
  locale: Locale;
  title: string;
  pending: string;
  note: string;
  /** Văn bản pháp lý thật (<h2>, <p>, <ul>). Chưa có thì bỏ trống. */
  children?: ReactNode;
}) {
  return (
    <>
      <SectionFrame className="!mt-10 md:!mt-14">
        {/* `65ch` tính theo cỡ chữ thân 17px của chính khối này -> ~62–66 ký
            tự Đức mỗi dòng ở mọi khổ máy tính. */}
        <article className="max-w-[65ch] text-[17px] leading-[1.7] text-text">
          {/* Lora 40px (cỡ "tiêu đề khối" của KIT) thay cho 60–72px cũ;
              điện thoại 30px để `Datenschutzerklärung` vừa một dòng ở 390. */}
          <h1 className="font-serif text-[30px] leading-tight tracking-[.01em] text-ivory md:text-[40px]">
            {title}
          </h1>
          <span aria-hidden="true" className="mt-4 block h-px w-12 bg-gold" />

          {children ? (
            <div className="mt-8 space-y-4 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-[20px] [&_h2]:leading-snug [&_h2]:text-gold-bright [&_ul]:list-disc [&_ul]:pl-5">
              {children}
            </div>
          ) : (
            <>
              {/* Chưa có nội dung: MỘT câu nói thẳng, không thanh giữ chỗ. */}
              {/* Trong khung thông báo chung (Sếp 11/10), không đứng trơ. */}
              <KhungThongBao className="mt-8 !text-[15px]">
                <p>{pending}</p>
              </KhungThongBao>
              <ChoSepAn note={note} />
            </>
          )}

          {/* Chỉ khối liên hệ nằm trong thẻ (spec G). */}
          <div className="sora-card mt-4 p-5">
            <address className="space-y-0.5 text-[16px] leading-snug not-italic">
              {addressLines().map((line, i) => (
                <p key={line} className={i === 0 ? "font-serif text-[18px] text-gold-bright" : ""}>
                  {line}
                </p>
              ))}
            </address>
            <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-1 border-t border-gold/20 pt-3">
              {restaurant.phones.map((p) => (
                <li key={p.number}>
                  {/* Cả cụm số + nhãn là vùng bấm cao 44px. */}
                  <a
                    href={telHref(p)}
                    className="group flex min-h-11 flex-col justify-center"
                  >
                    <span className="text-[16px] leading-tight text-gold-bright group-hover:underline">
                      {p.number}
                    </span>
                    <span className="text-[12px] leading-tight text-muted">
                      {phoneLabel(p, locale)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </SectionFrame>

      <MobileFooter locale={locale} />
    </>
  );
}
