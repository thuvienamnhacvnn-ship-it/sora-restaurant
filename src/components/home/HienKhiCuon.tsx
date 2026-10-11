"use client";

/*
 * Hiện dần khi cuộn tới — CSS thuần, một vòng kiểm cho cả trang.
 *
 * Nguồn: `_w-agent/trang-chu-v2/01_tra-kho.md` §7. Kho có `FadeContent`
 * (gsap + ScrollTrigger) và `blur-fade` (motion/react) nhưng cả hai kéo thêm
 * một thư viện animation chỉ để làm đúng một hiệu ứng mờ-dịch 20px, và cả hai
 * đều ẩn nội dung BẰNG JS — máy tìm kiếm thấy trang trống. Đúng mục 17 lời
 * Sếp ("không dùng animation quá nhiều") thì CSS thuần nhẹ hơn.
 *
 * Nội dung mặc định ẩn bằng CSS (`.sora-hien`), nhưng `globals.css` có sẵn
 * hai lối thoát: `prefers-reduced-motion` và `@media (scripting: none)` đều
 * trả về hiện sẵn. Không JS -> vẫn đọc được.
 *
 * ---- VÌ SAO KHÔNG DÙNG IntersectionObserver ----
 * Bản đầu dùng IntersectionObserver và **thẻ cuối cùng không bao giờ hiện**.
 * Cơ chế: bản ghi của observer được giao ở cuối khung hình, nên nếu cuộn qua
 * một thẻ rồi cuộn tiếp (hoặc nhảy về đầu trang) thì lúc bản ghi tới nơi thẻ
 * đã ra khỏi khung — `isIntersecting` là `false` và thẻ ở lại `opacity: 0`
 * vĩnh viễn. Đây là một cuộc đua: đo DOM lần này thấy đủ 5 thẻ, lần sau thiếu
 * 1. Bắt được nhờ đo hộp: thẻ chưa hiện vẫn mang `translateY(20px)` nên nó
 * nằm thấp hơn các thẻ kia đúng 20px — `do-hop.cjs` báo "nội dung cao hơn hộp
 * 20px", và ảnh chụp toàn trang khổ 390 ra thẻ đen thui.
 *
 * Vòng kiểm theo `scroll` thì không có bản ghi nào để trễ: đọc thẳng vị trí
 * thật tại thời điểm kiểm. Mỗi lần chỉ duyệt vài phần tử và tự gỡ bỏ khi hiện
 * hết, nên rẻ hơn cả một observer.
 */

import { useEffect } from "react";

export function HienKhiCuon() {
  useEffect(() => {
    let con = Array.from(document.querySelectorAll<HTMLElement>(".sora-hien"));
    if (!con.length) return;

    /*
     * Hiện xong thì GỠ HẲN hai class đi, đừng để lại `opacity` + `transition`.
     *
     * Vì sao: để nguyên là phần tử vẫn mang `opacity` và `transition` nên
     * trình duyệt giữ nó trên một lớp vẽ riêng. Chụp TOÀN TRANG (CDP
     * `captureBeyondViewport` — nới khung hình ra bằng cả trang rồi vẽ) thì
     * mấy lớp đó không được vẽ lại: ảnh ra thẻ trắng trong khi
     * `getComputedStyle` vẫn báo `opacity: 1`. Không chỉ hỏng ảnh QA — mọi thứ
     * chụp trang (xem trước link, Lighthouse) đều có thể thấy thẻ trắng.
     *
     * Có hẹn giờ dự phòng vì `transitionend` không bắn khi người dùng xin ít
     * chuyển động (lúc đó thời lượng bị ép còn 0,001ms).
     */
    const doSach = (el: HTMLElement) => {
      const xong = () => {
        el.classList.remove("sora-hien", "sora-da-vao");
        el.style.removeProperty("--i");
      };
      el.addEventListener("transitionend", xong, { once: true });
      window.setTimeout(xong, 1500);
    };

    const itChuyenDong = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (itChuyenDong) {
      con.forEach((el) => el.classList.remove("sora-hien"));
      return;
    }

    con.forEach((el, i) => el.style.setProperty("--i", String(i % 5)));

    const kiem = () => {
      /*
       * Hiện SỚM hơn một phần tư màn, không đợi thẻ chạm mép dưới.
       *
       * Hai lý do, cả hai đều đo được:
       * - Người cuộn nhanh trên điện thoại thì thẻ vừa trồi lên đã phải sẵn
       *   sàng, không thì họ thấy một khoảng trống rồi chữ mới hiện ra.
       * - Ảnh chụp toàn trang: công cụ cuộn theo bước bằng chiều cao màn, mà
       *   ảnh thẻ nạp lười nên trang còn đang DÀI RA trong lúc nó cuộn — bước
       *   cuối cùng dừng thấp hơn mức cần và thẻ chót không bao giờ vào khung.
       *   Đã đo: cuộn hết rồi về đầu trang thì thẻ GETRÄNKE vẫn `opacity: 0`,
       *   cuộn thẳng xuống đáy thì hiện ngay.
       * 1,25 màn là đủ cho cả hai mà vẫn còn ra hiệu ứng khi cuộn thường.
       */
      const nguong = window.innerHeight * 1.25;
      con = con.filter((el) => {
        if (el.getBoundingClientRect().top >= nguong) return true;
        el.classList.add("sora-da-vao");
        doSach(el);
        return false;
      });
      if (con.length) return;
      removeEventListener("scroll", kiem);
      removeEventListener("resize", kiem);
    };

    /*
     * GỌI THẲNG, KHÔNG BỌC `requestAnimationFrame`.
     *
     * Bản trước gộp qua rAF cho "đỡ tốn". Hậu quả đo được: Chrome **hãm rAF**
     * khi trang không ở tiền cảnh — đúng cảnh trình duyệt chạy ẩn để chụp ảnh.
     * Cuộn theo bước 150ms mà rAF chỉ chạy chừng 1 lần/giây thì phần lớn bước
     * cuộn không có lần kiểm nào: ảnh chụp toàn trang khổ 390 ra **hai thẻ
     * cuối đen thui**, lần chạy khác lại chỉ một thẻ — số lượng đổi theo từng
     * lần chạy, dấu hiệu rõ của một cuộc đua.
     *
     * Không bọc thì không tốn gì thật: mỗi lần chỉ đọc `getBoundingClientRect`
     * của vài phần tử, và danh sách rỗng dần rồi tự gỡ bỏ cả hai trình nghe.
     */
    kiem();
    addEventListener("scroll", kiem, { passive: true });
    addEventListener("resize", kiem, { passive: true });

    return () => {
      removeEventListener("scroll", kiem);
      removeEventListener("resize", kiem);
    };
  }, []);

  return null;
}
