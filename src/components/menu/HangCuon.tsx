"use client";

/* ---------------------------------------------------------------------------
 * HangCuon — vỏ bọc một dải chip cuộn ngang, có DẤU HIỆU còn nội dung
 *
 * Dùng cho hàng tab nhóm món và hàng chip nhóm con khi chúng dài hơn khung
 * (khổ máy tính hẹp + điện thoại). Mép cắt PHẲNG trông như lỗi dựng chứ không
 * như "còn nữa, kéo sang" — mà đây là đường vào chính của cả 207 món.
 *
 * Ba dấu hiệu, bật/tắt theo vị trí cuộn THẬT:
 *   1. mờ dần mép phải — tắt khi đã cuộn hết;
 *   2. mờ dần mép trái — chỉ hiện khi đã cuộn qua đầu dải;
 *   3. hai nút mũi tên tròn, chỉ hiện khi dải thật sự dài hơn khung (và chỉ
 *      trên máy có chuột — màn cảm ứng vuốt là đủ, nút còn che mất chip đầu).
 *
 * Hai nút `aria-hidden` + `tabIndex={-1}` CÓ CHỦ Ý: chúng chỉ là lối tắt cho
 * chuột. Bàn phím Tab qua từng chip thì trình duyệt tự cuộn tới, nên không
 * mất chức năng nào.
 * -------------------------------------------------------------------------- */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import s from "./menu.module.css";

export function HangCuon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const oRef = useRef<HTMLDivElement>(null);
  const chonTruoc = useRef<HTMLElement | null>(null);
  const [trai, setTrai] = useState(false);
  const [phai, setPhai] = useState(false);

  const doLai = useCallback(() => {
    const o = oRef.current?.querySelector<HTMLElement>(`.${s.hangCuon}`);
    if (!o) return;
    /* 2px dung sai: bề ngang phân số làm `scrollLeft` không bao giờ chạm đúng
       mốc cuối, mũi tên phải sẽ không bao giờ tắt. */
    setTrai(o.scrollLeft > 2);
    setPhai(o.scrollLeft + o.clientWidth < o.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const o = oRef.current?.querySelector<HTMLElement>(`.${s.hangCuon}`);
    if (!o) return;
    /* Chip đang chọn nằm khuất (mở link `?gruppe=sushi-menu`, hoặc tab cuối ở
       điện thoại) -> kéo nó vào giữa khung. Chỉnh `scrollLeft` của CHÍNH dải,
       không dùng `scrollIntoView` (nó kéo luôn cả trang theo chiều dọc). */
    const chon = o.querySelector<HTMLElement>(
      '[aria-selected="true"], [aria-pressed="true"]'
    );
    /* Chỉ khi chip được chọn ĐỔI: effect này chạy lại mỗi lần dựng, kéo lại
       mỗi lần là giật khỏi tay người đang tự cuộn dải. */
    if (chon && chon !== chonTruoc.current) {
      const trai = chon.offsetLeft - o.offsetLeft;
      const khuat =
        trai < o.scrollLeft ||
        trai + chon.offsetWidth > o.scrollLeft + o.clientWidth;
      if (khuat) o.scrollLeft = trai - (o.clientWidth - chon.offsetWidth) / 2;
    }
    chonTruoc.current = chon;
    doLai();
    o.addEventListener("scroll", doLai, { passive: true });
    /* Đổi nhóm là số chip đổi theo, mà `scroll` không bắn — phải nghe cả thay
       đổi kích thước của chính dải lẫn của khung. */
    const ro = new ResizeObserver(doLai);
    ro.observe(o);
    for (const con of Array.from(o.children)) ro.observe(con);
    return () => {
      o.removeEventListener("scroll", doLai);
      ro.disconnect();
    };
  }, [doLai, children]);

  const day = (huong: 1 | -1) => {
    const o = oRef.current?.querySelector<HTMLElement>(`.${s.hangCuon}`);
    if (!o) return;
    o.scrollBy({ left: huong * o.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div
      ref={oRef}
      className={`${s.oCuon} ${className}`}
      data-trai={trai ? "1" : undefined}
      data-phai={phai ? "1" : undefined}
    >
      {children}
      {trai && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => day(-1)}
          className={`${s.nutCuon} ${s.nutCuonTrai}`}
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
        </button>
      )}
      {phai && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => day(1)}
          className={`${s.nutCuon} ${s.nutCuonPhai}`}
        >
          <Icon name="arrow-right" size={14} />
        </button>
      )}
    </div>
  );
}
