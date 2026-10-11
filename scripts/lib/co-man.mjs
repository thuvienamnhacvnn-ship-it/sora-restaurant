/*
 * MA TRẬN CỠ MÀN dùng chung cho mọi phép nghiệm thu giao diện.
 *
 * ── VÌ SAO PHẢI CÓ TỆP NÀY ──
 *
 * 06/10: ba công cụ nghiệm thu đều chỉ đổi BỀ NGANG và để chiều cao cố định
 * 900px. Bệ trưng bày đè lên hàng thẻ danh mục ở **4 trên 5 cỡ màn thật**
 * (1280×720 lấn 108px, 1366×768 lấn 129px, 1600×900 lấn 24px, 1920×1080 lấn
 * 63px) — **chỉ 1440×900 là sạch, đúng cỡ cả đội vẫn kiểm.** Sếp nhìn màn
 * hình và phát hiện ra thay cho công cụ.
 *
 * Bài học không phải "nhớ thêm chiều cao", mà là: khi một chiều không đổi
 * trong mọi phép kiểm thì nó **không được kiểm**, và lỗi sẽ sống đúng ở đó.
 * Trang chủ khoá trong một màn hình nên chiều cao quyết định bố cục ngang với
 * bề ngang — thiếu nó thì ma trận chỉ kiểm một nửa bài toán.
 *
 * Đặt ở MỘT tệp để ba công cụ không trôi mỗi nơi một kiểu. Thêm cỡ ở đây là
 * cả ba cùng có.
 *
 * ── CHỌN SÁU CỠ NÀY ──
 *
 *   1024×768   mốc GIỮA dải 768–1199 (thanh bên rút còn 88px). Thêm 07/10:
 *              dải rộng hơn 400px này trước đây chưa ai kiểm ở giữa, và nó bắt
 *              được đúng lỗi nặng nhất hôm đó — tiêu đề trang Über uns bị cắt
 *              cụt đỉnh 25,6px, trong khi 1280 chỉ mất 2,7px nên trông như
 *              không có gì. Cũng là chỗ khung hero THẤP NHẤT ở khổ desktop.
 *   1280×720   laptop phổ thông, màn thấp -> chỗ chật nhất theo chiều dọc
 *   1366×768   cỡ laptop phổ biến nhất còn dùng
 *   1440×900   MacBook; mốc `--be-dich` đổi giá trị
 *   1600×900   màn rộng, vẫn thấp
 *   1920×1080  Full HD
 *
 * Cặp 1600×900 và 1440×900 cùng chiều cao nhưng khác bề ngang — giữ cả hai để
 * tách được "lỗi do bề ngang" khỏi "lỗi do chiều cao".
 */

/** @type {ReadonlyArray<readonly [number, number]>} */
export const CO_MAN = [
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1600, 900],
  [1920, 1080],
];

/**
 * Đọc cỡ màn từ dòng lệnh.
 *
 *   node script.mjs            -> cả 5 cỡ
 *   node script.mjs 1440       -> mọi cỡ có bề ngang 1440
 *   node script.mjs 1280x720   -> đúng một cỡ
 *
 * Gõ một bề ngang KHÔNG có trong ma trận thì vẫn chạy, nhưng chiều cao lấy
 * mặc định 900 và in cảnh báo — để không ai lặng lẽ kiểm ở một cỡ không nằm
 * trong ma trận rồi tưởng đã kiểm đủ.
 */
export function doiSoCoMan(argv = process.argv[2]) {
  if (!argv) return CO_MAN;

  const m = String(argv).match(/^(\d+)(?:[x×](\d+))?$/i);
  if (!m) {
    console.error('  Cỡ màn không hiểu: "' + argv + '" (dạng đúng: 1440 hoặc 1280x720)');
    process.exit(2);
  }
  const W = Number(m[1]);
  if (m[2]) return [[W, Number(m[2])]];

  const loc = CO_MAN.filter(([w]) => w === W);
  if (loc.length) return loc;

  console.warn("  ⚠ " + W + "px không nằm trong ma trận, tạm lấy chiều cao 900.");
  return [[W, 900]];
}
