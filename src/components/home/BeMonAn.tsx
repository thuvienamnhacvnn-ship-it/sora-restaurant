"use client";

/*
 * BA ĐĨA ĐẶT LÊN BỆ TRƯNG BÀY — banner trang chủ.
 *
 * Sếp 05/10 gửi 12 ảnh món đã cắt nền (`E:\…\Food run`) kèm 4 ảnh mẫu bố cục
 * (`Dreiteilige Gourmet-Japanische Festtafel.png` + 3 ảnh cùng loại), bảo:
 * *"Học cách bố trí của 4 ảnh này … cho hiệu ứng animation mỗi lần hiện lên
 * 3 đĩa thức ăn"*.
 *
 * BỐ CỤC HỌC TỪ ẢNH MẪU:
 *  - ba đĩa cạnh nhau, mỗi đĩa trên một bệ tròn phát sáng;
 *  - **đáy đĩa chạm mặt bệ** — chi tiết làm nó ra "đặt trên bệ" thay vì "trôi
 *    lơ lửng". Vì vậy ảnh xuất giữ TỈ LỆ THẬT (không ép vuông) và dùng
 *    `object-position: center bottom`;
 *  - nền tối tuyệt đối sau đĩa, không thêm bóng đổ hay quầng sáng nào — bệ đã
 *    tự phát sáng trong ảnh.
 *
 * ⚠ ĐÂY LÀ LỚP PHỦ, phải đặt BÊN TRONG khối bệ trưng bày ở `page.tsx`, không
 * đặt vào `stage` của `PageHero`. Lý do đã thử và thấy tận mắt: khối bệ nằm
 * SAU hero trong DOM và mang `z-20`, mà hero lại có `isolate` (nhốt mọi
 * z-index bên trong) — nên đặt đĩa trong hero thì **bệ vẽ đè kín lên đĩa**,
 * chạy ra banner trống trơn.
 *
 * ⚠ Ảnh món ở đây là ảnh TRANG TRÍ Sếp gửi, KHÔNG phải ảnh chụp món quán
 * bán. Nên `aria-hidden` và **không gắn tên/mã món nào của thực đơn in** —
 * gắn là nói dối khách về đĩa họ sắp gọi. Ảnh minh hoạ món thật nằm ở
 * `public/mon/`, đi qua `data/menu-images.json`.
 */

import Image from "next/image";
import DAY from "../../../data/day-dia.json";
import BE_TRU from "../../../data/be-tru.json";
import { useEffect, useRef, useState } from "react";

/*
 * Vị trí ba trụ + khung ảnh bệ: ĐỌC THẲNG từ `data/be-tru.json`, do
 * `scripts/do-mat-be.mjs` đo từ chính ảnh và ghi ra. Không ước lượng bằng mắt,
 * và **không chép tay vào đây nữa**.
 *
 * VÌ SAO (06/10): trước đây bảng này chép tay trong component, còn phép kiểm
 * `do-khop-dia-be.mjs` thì tự dò lại bằng thuật toán riêng — ba nơi, ba cách.
 * Đổi sang bệ mới là lệch nhau ngay: phép kiểm dò theo cột chỉ thấy 2 trụ và
 * báo 12 đĩa sai trong khi đĩa không sai. Giờ cả ba đọc MỘT tệp.
 *
 * Bệ Sếp CHỐT: `Golden Marble Podium Trio` 2172×724 (tỉ lệ 3,00).
 *
 *   trụ   tâm ngang   bề ngang   mặt bệ   đỉnh    độ dẹt b/a
 *   #1      58,9%       16,4%     43,9%    38,1%     0,235
 *   #2      75,6%       15,4%     35,2%    29,7%     0,240
 *   #3      90,8%       15,2%     43,9%    34,1%     0,240 (mượn)
 *   (bảng trên chỉ để ĐỌC cho nhanh — số thật nằm trong tệp JSON)
 *
 * `mat` = TRỤC NGANG của bầu dục mặt bệ, tức chỗ bầu dục RỘNG NHẤT — đặt đáy
 * đĩa đúng đó thì đĩa nằm giữa mặt bệ. KHÔNG phải vành trên: vành trên còn
 * cách trục ngang đúng `b`, lấy nhầm là đĩa treo lên mép SAU và hở hẳn một
 * vạt phía trước (Sếp đã bác đúng lỗi này ở bộ trước).
 *
 * ⚠ TRỤ #2 CAO HƠN hai trụ kia, không phải lùi về sau: mặt nó ở 35,2% trong
 * khi hai trụ kia 43,9%. Dùng chung một `mat` là sai cả ba.
 *
 * ⚠ Ba trụ ở đây SÁT NHAU hơn hẳn hai bệ trước — xem ghi chú ở `rongO` bên
 * dưới, đó là chỗ đã gây lỗi ba đĩa chồng lên nhau.
 *
 * Sửa ảnh bệ thì chỉ cần chạy lại `do-mat-be.mjs` — `BE`, `BE_RONG`, `BE_CAO`,
 * `heDia` đều theo tệp JSON đó.
 */
const BE = BE_TRU.tru;

/* 12 món xếp thành 4 BỘ BA. Mỗi bộ cố ý trộn loại khác nhau (một món nước /
   một món khô / một món sushi hoặc tráng miệng) để ba đĩa cạnh nhau không
   trông giống hệt nhau. Đổi thứ tự ở đây là đổi thứ tự hiện trên web. */
/*
 * ⚠⚠ THỨ TỰ TẠM — CHƯA PHẢI PHÂN NHÓM CHÍNH THỨC.
 *
 * Sếp 06/10: *"tất cả theo bộ của nó tương ứng với các ảnh đề mục bên dưới …
 * đang thiếu 1 bộ Getränke tao sẽ cập nhật sau"* — tức mỗi bộ ba phải ứng với
 * MỘT thẻ danh mục ở chân trang.
 *
 * Nhưng 12 ảnh mới KHÔNG chia đều được theo nhóm. Đếm theo nội dung ảnh:
 *   Sushi       3  thunfisch-tataki · sushi-sashimi-platte · tempura
 *   Việt        3  pho-bo · wok-nudeln-garnelen · sommerrollen
 *   Món chính   5  rotes-curry-huhn · curry-ente · rind-pak-choi ·
 *                  garnelen-wok · ente-pak-choi
 *   Tráng miệng 1  dessert-matcha
 * → 3/3/5/1, không ra 3/3/3/3.
 *
 * Nên bảng dưới đây chỉ xếp theo thứ tự tệp để CÒN NHÌN ĐƯỢC trong lúc chờ.
 * **Trưởng nhóm đang hỏi Sếp phân nhóm.** Có câu trả lời thì sửa đúng ở đây,
 * không phải sửa chỗ nào khác.
 */
const BO_BA: readonly (readonly [string, string, string])[] = [
  ["rotes-curry-huhn", "thunfisch-tataki", "sushi-sashimi-platte"],
  ["curry-ente", "pho-bo", "tempura"],
  ["wok-nudeln-garnelen", "rind-pak-choi", "dessert-matcha"],
  ["garnelen-wok", "sommerrollen", "ente-pak-choi"],
];

/** Bề ngang ảnh món gốc (px) — mọi tệp trong `public/mon-be/v2/` đều 520. */
const RONG_ANH = 520;
/** Khung ảnh bệ (px) — để quy nửa bầu dục sang % chiều cao khối bệ.
 *  Lấy từ `data/be-tru.json` để không bao giờ lệch với ảnh đang dùng. */
const BE_RONG = BE_TRU.w;
const BE_CAO = BE_TRU.h;

/**
 * Nửa bầu dục đáy, quy sang PHẦN TRĂM CHIỀU CAO khối bệ — vì `bottom` của ô
 * đĩa tính theo đơn vị đó.
 *
 *   px CSS     = nua × (bề ngang ô / 520)        (ảnh co theo bề ngang ô)
 *   bề ngang ô = rong% × bề ngang khối bệ
 *   cao khối bệ = bề ngang khối bệ × BE_CAO/BE_RONG
 *   => %       = nua × rong × BE_RONG / (520 × BE_CAO)
 *
 * Bề ngang khối bệ tự triệt tiêu, nên công thức đúng ở mọi cỡ màn.
 *
 * `nua` đọc THẲNG từ `data/day-dia.json` — trước đây là một bảng hằng số chép
 * tay trong tệp này, tức thêm ảnh món mới mà quên chép là đĩa sai lặng lẽ.
 * Giờ chạy `scripts/do-day-dia.mjs` là xong.
 */
const haXuong = (nua: number, rong: number) =>
  (nua * rong * BE_RONG) / (RONG_ANH * BE_CAO);

/** Mỗi bộ đứng bao lâu rồi đổi (ms). */
const GIU = 5200;
/** Lệch pha giữa ba đĩa (ms) — trái vào trước, rồi giữa, rồi phải. */
const LECH = 130;
/*
 * ĐÃ BỎ ba hằng số từng nằm ở đây — `CAO_DIA`, `DAY_TREN_BE`, `HE_CHIM`.
 * Cả ba là tàn dư của hai cách làm trước, không chỗ nào còn dùng (eslint báo
 * `no-unused-vars`). Giữ hằng số chết cạnh hằng số sống là mời người sau sửa
 * nhầm cái không có tác dụng rồi tưởng mình đã đổi gì đó.
 *
 * Chiều cao đĩa nay lấy từ tỉ lệ thật của ảnh (`width`/`height` của từng tệp),
 * phần chìm lấy từ `nua` trong `data/day-dia.json`.
 *
 * ⚠ ĐỪNG dựng lại kiểu "chuẩn hoá bề ngang đáy cho cả 12 món bằng nhau" —
 * đã thử và HỎNG: `kokos-suppe` đáy chỉ 40% bề ngang ảnh, ép chân nó bằng
 * chân món khác thì cả cái bát phóng to gấp đôi và trèo khỏi khung. Đáy các
 * món dao động 40–83% bề ngang bệ nhưng đều NẰM TRONG mặt bệ, nên không món
 * nào thật sự tràn vì bề ngang; thứ làm đĩa tràn là TÂM ĐÁY lệch, đã xử bằng
 * `translateX(-cx)`.
 */

/*
 * BỀ NGANG BÓNG, tính theo bề ngang ô đĩa.
 *
 * Bản đầu lấy thẳng `đáy × 1,4` — SAI, và Sếp bắt được ngay: *"mới có 1 số
 * đĩa có bóng, còn lại chưa có"*. Lý do: đáy mỗi món rộng rất khác nhau
 * (bát sâu 40% bề ngang ảnh, khay dài 83%). Món đáy rộng thì bóng ló ra hai
 * bên nên nhìn thấy; món đáy hẹp thì bóng nằm GỌN SAU cái bát, bị chính nó
 * che kín — có vẽ mà không ai thấy.
 *
 * Bóng chỉ đọc được khi nó RỘNG HƠN bóng dáng của món tại chỗ tiếp xúc. Nên
 * lấy sàn 0,8 trước khi nhân: mọi món đều ra 1,08–1,12 lần bề ngang ô, tức
 * luôn ló ra quanh chân. Chặn trên 1,25 để bóng không loe quá mặt bệ.
 */
const BONG_SAN = 0.8;
const BONG_NHAN = 1.35;
const BONG_TRAN = 1.25;
const beNgangBong = (rongDay: number) =>
  Math.min(BONG_TRAN, Math.max(rongDay, BONG_SAN) * BONG_NHAN);

/** Kiểu một dòng trong `data/day-dia.json`. */
type SoDay = { cx: number; rong: number; day: number; nua: number; w: number; h: number };
const DAY_MAC_DINH: SoDay = { cx: 0.5, rong: 0.7, day: 1, nua: 30, w: 520, h: 330 };

export function BeMonAn() {
  const [bo, setBo] = useState(0);
  /* `null` = chưa đọc được sở thích của máy; chỉ chạy đổi bộ sau khi biết. */
  const [chay, setChay] = useState<boolean | null>(null);
  const dong = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dat = () => setChay(!mq.matches);
    dat();
    mq.addEventListener("change", dat);
    return () => mq.removeEventListener("change", dat);
  }, []);

  /*
   * NẠP TRƯỚC bộ kế tiếp.
   *
   * Không có bước này thì mỗi lần đổi bộ, React gắn ba thẻ ảnh MỚI và trình
   * duyệt bắt đầu tải từ đầu — đĩa có trong DOM, `opacity` đã là 1, nhưng
   * **ảnh chưa về nên bệ trống trơn** trong vài trăm mili giây. Tôi chụp
   * trúng đúng lúc đó và tưởng đĩa bay mất.
   *
   * 5,2 giây giữa hai bộ là quá đủ để tải sẵn, nên khi đổi thì ảnh đã nằm
   * trong bộ đệm và hiện ngay. Chỉ nạp bộ KẾ TIẾP, không nạp cả 12 — 12 ảnh
   * là ~900 KB, nặng cho một banner.
   */
  useEffect(() => {
    if (!chay) return;
    const ke = BO_BA[(bo + 1) % BO_BA.length];
    const huy = ke.map((ten) => {
      const im = new window.Image();
      im.src = `/mon-be/v2/${ten}.webp`;
      return im;
    });
    return () => huy.forEach((im) => (im.src = ""));
  }, [bo, chay]);

  useEffect(() => {
    if (!chay) return;
    /* Dừng hẳn khi tab bị ẩn: `setInterval` vẫn chạy ở tab nền, đổi ảnh cho
       không ai xem thì chỉ tốn CPU và pin. */
    const batDau = () => {
      if (dong.current) return;
      dong.current = setInterval(() => setBo((n) => (n + 1) % BO_BA.length), GIU);
    };
    const dungLai = () => {
      if (!dong.current) return;
      clearInterval(dong.current);
      dong.current = null;
    };
    const theoTab = () => (document.hidden ? dungLai() : batDau());

    theoTab();
    document.addEventListener("visibilitychange", theoTab);
    return () => {
      dungLai();
      document.removeEventListener("visibilitychange", theoTab);
    };
  }, [chay]);

  return (
    <>
      {BE.map((be, i) => {
        const ten = BO_BA[bo][i];
        /* Số đo ĐÁY của riêng món này — đo từ chính tệp ảnh, không ước. */
        const d = (DAY as Record<string, SoDay>)[ten] ?? DAY_MAC_DINH;

        /*
         * Bề ngang ô = `heDia` × bề ngang trụ (xem `data/be-tru.json`).
         *
         * ⚠ KHÔNG để bằng đúng bề ngang trụ. Bệ này có tâm ba trụ cách nhau
         * 16,7 và 15,2 điểm phần trăm, trong khi nửa bề ngang hai trụ cạnh
         * nhau cộng lại đã là 15,9 và 15,3 — ô rộng bằng trụ là cặp #2–#3
         * **chồng lên nhau**, đúng thứ Sếp nhìn thấy và gắt 06/10. Hệ số
         * 0,85 cho khe hở 3,2% và 2,2%. `do-mat-be.mjs` kiểm lại khe này mỗi
         * lần chạy và thoát mã 1 nếu chồng.
         *
         * Bề ngang trụ giảm dần 16,4 → 15,4 → 15,2 nên ô đĩa cũng nhỏ dần
         * theo — đó là phần "to nhỏ xa gần" Sếp yêu cầu, lấy từ số đo chứ
         * không chọn tay.
         *
         * ⚠ KHÔNG chuẩn hoá theo bề ngang ĐÁY: thử rồi, đáy các món dao động
         * 40–83% bề ngang ảnh nên ép chân bằng nhau thì món đáy hẹp phóng to
         * gấp đôi và trèo khỏi khung. Thứ làm đĩa lệch khỏi tâm bệ là TÂM ĐÁY,
         * xử ở `translateX` bên dưới.
         */
        const rongO = be.rong * BE_TRU.heDia;

        return (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{
            left: `${be.tam}%`,
            width: `${rongO}%`,
            /*
             * Căn theo TÂM ĐÁY, không theo tâm ảnh. `rainbow-maki` có tâm đáy
             * ở 35,5% bề ngang ảnh (khay lệch hẳn sang trái) — căn theo tâm
             * ảnh là chân khay rơi ra ngoài mép bệ. Đẩy ô sang trái đúng
             * d.cx để tâm đáy trùng tâm bệ.
             */
            transform: `translateX(${-d.cx * 100}%)`,
            /* Đáy ô = tâm mặt bệ, HẠ THÊM nửa bầu dục đáy đĩa (xem `haXuong`).
               `bottom` đo từ đáy ảnh bệ nên lấy phần bù, và hạ xuống là TRỪ. */
            bottom: `${100 - be.mat - haXuong(d.nua, rongO)}%`,
          }}
        >
          {/*
           * BÓNG ĐỔ dưới đĩa (Sếp 05/10: *"bóng đổ phải có độ blur, đậm ở đáy
           * và lan toả ra xung quanh"*).
           *
           * Phần tử RIÊNG, đứng TRƯỚC ảnh món trong DOM nên vẽ DƯỚI đĩa và
           * TRÊN ảnh bệ. KHÔNG dùng `filter`/`box-shadow` trên chính ảnh món,
           * không phủ mảng màu lên ảnh — luật Sếp.
           *
           * Bám theo ĐÁY THẬT của từng món: rộng đúng `d.rong` của ô, tâm đặt
           * đúng `d.cx`. Độ dẹt lấy đúng `be.dep` của trụ nó đứng — b/a là
           * tính chất của GÓC NHÌN, nên bóng phải dẹt y như mặt bệ, không thì
           * nó trông như nằm trên một mặt phẳng khác.
           *
           * `blur` thật chứ không chỉ gradient: gradient một mình cho mép hơi
           * "nhựa", blur làm bóng tan vào mặt đá. Bán kính tính theo bề ngang
           * bóng nên mọi cỡ màn nhìn như nhau.
           */}
          <span
            aria-hidden="true"
            className={"absolute rounded-[50%]" + (chay ? " sora-be-mon-vao" : "")}
            style={{
              left: `${d.cx * 100}%`,
              bottom: 0,
              width: `${beNgangBong(d.rong) * 100}%`,
              aspectRatio: `1 / ${be.dep}`,
              transform: "translate(-50%, 34%)",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,.95) 0%, rgba(0,0,0,.82) 30%, rgba(0,0,0,.5) 52%, rgba(0,0,0,.2) 72%, transparent 88%)",
              filter: "blur(10px)",
              animationDelay: chay ? `${i * LECH}ms` : undefined,
            }}
          />

          {/* `key` đổi theo TÊN MÓN -> React tháo ảnh cũ, gắn ảnh mới, nên
              animation `sora-be-mon-vao` chạy lại mỗi lần đổi bộ. */}
          {/*
           * `unoptimized` CÓ CHỦ Ý, đừng gỡ — phần nạp trước dùng đường dẫn
           * gốc `/mon-be/x.webp`; để Next tối ưu thì nó xin qua
           * `/_next/image?url=…`, URL khác nên nạp trước vô dụng và bệ trống
           * trơn vài trăm mili giây mỗi vòng đổi bộ.
           *
           * KHÔNG dùng `fill`: với `fill` + `contain`, ảnh co theo CHIỀU CAO ô
           * khi ô rộng hơn ảnh, nên bề ngang vẽ ra không còn bằng bề ngang ô —
           * phá toàn bộ phép tính `rongO` ở trên. Đặt bề ngang 100% và để
           * chiều cao tự chạy thì ảnh luôn rộng đúng bằng ô.
           */}
          <Image
            key={ten}
            src={`/mon-be/v2/${ten}.webp`}
            alt=""
            width={d.w}
            height={d.h}
            unoptimized
            priority={bo === 0}
            className={chay ? "sora-be-mon-vao" : undefined}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              animationDelay: chay ? `${i * LECH}ms` : undefined,
            }}
          />
        </div>
        );
      })}
    </>
  );
}
