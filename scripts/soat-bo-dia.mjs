/*
 * Nghiệm thu BA ĐĨA TRÊN BỆ bằng MẮT, không bằng số.
 *
 * Chụp đủ 4 BỘ đĩa ở mỗi cỡ màn, cắt riêng vùng từng bệ rồi PHÓNG 4× — hỏi
 * đúng hai câu cho mỗi đĩa:
 *   1. dưới mép trước đĩa còn hở không?
 *   2. bóng có làm đĩa trông như ĐẶT trên bệ không, hay vẫn như dán?
 *
 * ⚠ BẪY 1: phải CHỜ `opacity === 1` rồi mới chụp. Chu kỳ đổi bộ là 5,2s; nếu
 * nhịp chụp xấp xỉ con số đó thì mọi lần chụp đều rơi vào giữa lúc animation
 * chạy và ảnh ra BỆ TRỐNG TRƠN. Đã dính hai lần.
 *
 * ⚠ BẪY 2: **chờ tới khi TÊN MÓN ĐỔI, đừng chờ theo đồng hồ.** Bản cũ nghỉ
 * 2,6s giữa hai lượt trong khi chu kỳ là 5,2s, nên bắt TRÙNG bộ: lần chạy
 * 06/10 in ra "bộ 2" và "bộ 3" y hệt nhau và không bao giờ chụp được bộ cuối
 * — soi 9/12 đĩa mà vẫn trông như đã soi đủ. In luôn tên món ra để người đọc
 * ĐẾM được, và báo đỏ nếu không gom đủ 12.
 *
 * Chạy:  node scripts/soat-bo-dia.mjs [1440]
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import sharp from "sharp";

const CO = process.argv[2] ? [Number(process.argv[2])] : [1280, 1440, 1920];
const PHONG = 8;
/** Món đã soi được — để báo đỏ nếu không gom đủ 12. */
const daSoi = new Set();

const b = await dungKhung();

for (const W of CO) {
  await b.khoKhung(W, 900);
  await b.go("http://localhost:3160/de");
  await cho(1800);

  let truoc = null;
  for (let i = 0; i < 4; i++) {
    /* Lượt đầu: chỉ cần đĩa hiện hẳn. Lượt sau: phải là bộ KHÁC bộ vừa chụp. */
    const khac = truoc === null ? "true" :
      "d.map(e=>e.src).join('|') !== " + JSON.stringify(truoc);
    const san = await b.choTới(
      "const d=[...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src));" +
        "return d.length === 3 && " + khac +
        " && d.every(e => getComputedStyle(e).opacity === '1' && e.complete);",
      12000
    );
    if (!san) console.log("     (đĩa chưa hiện hẳn / chưa đổi bộ sau 12s)");
    await cho(250);
    truoc = await b.js(
      "return [...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src))" +
        ".map(e=>e.src).join('|');"
    );

    const v = await b.js(`
      const be = document.querySelector('img[src*="be-trung-bay"]');
      const r = be.getBoundingClientRect();
      const d = [...document.querySelectorAll('img')].filter((e) => /mon-be/.test(e.src));
      return {
        ten: d.map((e) => (e.src.match(/([^/]+)\\.webp/) || [, '?'])[1]),
        o: d.map((e) => {
          const q = e.parentElement.getBoundingClientRect();
          // lấy rộng hơn ô một chút để thấy cả mặt bệ hai bên
          const no = q.width * 0.22;
          return {
            x: Math.max(0, Math.round(q.left - no)),
            w: Math.round(q.width + no * 2),
            y: Math.round(q.bottom - q.width * 0.62),
            h: Math.round(q.width * 0.62 + r.height * 0.45),
          };
        }),
      };
    `);

    const anh = await b.cmd("Page.captureScreenshot", { format: "png" });
    const buf = Buffer.from(anh.data, "base64");
    const kt = await sharp(buf).metadata();

    for (let k = 0; k < v.o.length; k++) {
      const o = v.o[k];
      /* KẸP vào trong khung ảnh: bệ #3 chạy ra ngoài mép phải màn hình nên
         vùng cắt của nó vượt biên -> sharp ném "bad extract area". */
      const x = Math.max(0, Math.min(o.x, kt.width - 1));
      const y = Math.max(0, Math.min(o.y, kt.height - 1));
      const w = Math.max(1, Math.min(o.w, kt.width - x));
      const h = Math.max(1, Math.min(o.h, kt.height - y));
      await sharp(buf)
        .extract({ left: x, top: y, width: w, height: h })
        .resize({ width: w * PHONG, kernel: "nearest" })
        .toFile(`_w-agent/soat2/zoom-${W}-bo${i + 1}-be${k + 1}.png`);
    }
    v.ten.forEach((t) => daSoi.add(t));
    console.log("  " + W + "px bộ " + (i + 1) + ": " + v.ten.join(" · "));
  }
}
console.log("\n  ảnh: _w-agent/soat2/zoom-<cỡ>-bo<n>-be<n>.png  (phóng " + PHONG + "×)");
console.log("  đã soi " + daSoi.size + "/12 món: " + [...daSoi].sort().join(" · "));
b.dong();
process.exit(daSoi.size === 12 ? 0 : 1);
