"use client";

/*
 * Sang trang khác thì LUÔN đứng ở đầu trang — Sếp 12/10: *"bản mobile khi
 * chuyển trang các trang con thường bị hiển thị ở cuối trang"*.
 *
 * Gốc lỗi: `html { scroll-behavior: smooth }` (globals.css). Từ Next 16, lúc
 * đổi trang Next KHÔNG còn tự tắt cuộn mượt nữa, nên cú "về đầu trang" của nó
 * thành một đoạn trượt dài; trên điện thoại trang mới đổi chiều cao giữa chừng
 * (ảnh, font về sau) là đoạn trượt dừng lưng chừng hoặc nằm lại cuối trang.
 * Chữa hai lớp: `data-scroll-behavior="smooth"` trên <html> (layout.tsx) để
 * Next tắt cuộn mượt đúng lúc đổi trang, và tệp này nhảy thẳng về đầu — cả
 * <html> lẫn <body>, vì `body` mang `overflow-x: hidden` nên có trang chính
 * <body> mới là khung cuộn.
 *
 * Nút Lùi/Tiến của trình duyệt thì KHÔNG đụng: khách quay lại phải về đúng chỗ
 * đang đọc. Đổi bộ lọc `?kategorie=` cũng không đụng (cùng đường dẫn).
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VeDauTrang() {
  const duong = usePathname();
  const truoc = useRef(duong);
  const luiTien = useRef(false);

  useEffect(() => {
    const danh = () => { luiTien.current = true; };
    window.addEventListener("popstate", danh);
    return () => window.removeEventListener("popstate", danh);
  }, []);

  useLayoutEffect(() => {
    if (truoc.current === duong) return;
    truoc.current = duong;
    if (luiTien.current) { luiTien.current = false; return; }
    if (window.location.hash) return;
    const ve = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    ve();
    // Lần hai sau khi trang mới vẽ xong, phòng cú trượt đang dở kéo ngược lại.
    const khung = requestAnimationFrame(ve);
    return () => cancelAnimationFrame(khung);
  }, [duong]);

  return null;
}
