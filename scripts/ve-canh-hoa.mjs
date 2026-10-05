/*
 * Vẽ bộ cánh hoa đào ĐỎ dùng cho hiệu ứng hoa rơi trên banner.
 *   node scripts/ve-canh-hoa.mjs
 * Ra: public/decor/sakura-petals-do.webp (900×900, nền trong suốt)
 *     _w-agent/soi-canh-moi.png (ảnh soi thử trên nền tối)
 *
 * Vì sao phải tự vẽ: bộ `sakura-petals.webp` Sếp gửi là HỒNG NHẠT, đặt lên
 * banner đèn lồng ấm thì lạc tông hẳn. Sếp 05/10 duyệt: vẽ lại màu ĐỎ.
 *
 * Giữ NGUYÊN toạ độ `PETAL_SPRITE` trong `Decor.tsx` — chỉ thay nội dung tấm
 * sprite, nên không phải sửa code nào khác.
 *
 * Hình cánh: gốc THON ở dưới, loe dần, rộng nhất ~70% chiều cao, đầu tròn có
 * khía chữ V NÔNG. Khía sâu + gốc bè = ra hình TRÁI TIM (đã vấp 2 lần).
 */
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

const O = [
  { x: 473, y: 335, w: 150, h: 114 },
  { x: 660, y: 425, w: 127, h: 90 },
  { x: 317, y: 400, w: 137, h: 80 },
  { x: 567, y: 507, w: 91, h: 70 },
  { x: 517, y: 184, w: 80, h: 90 },
  { x: 204, y: 705, w: 111, h: 84 },
  { x: 42, y: 377, w: 89, h: 117 },
  { x: 433, y: 474, w: 68, h: 56 },
];

const CANH = [
  "M50,100",
  "C46,78 28,70 26,52",
  "C24,32 34,16 46,14",
  "C48,14 49,16 50,20",
  "C51,16 52,14 54,14",
  "C66,16 76,32 74,52",
  "C72,70 54,78 50,100 Z",
].join(" ");

const xoay = [0, 28, -22, 55, -40, 15, -66, 38];
const to = [0, 1, 2, 0, 2, 1, 0, 1];

let g = "";
O.forEach((p, i) => {
  g +=
    `<g transform="translate(${p.x},${p.y}) scale(${p.w / 100},${p.h / 100}) rotate(${xoay[i]},50,56)">` +
    `<path d="${CANH}" fill="url(#g${to[i]})"/>` +
    `<path d="${CANH}" fill="none" stroke="#5c080e" stroke-width="1.2" stroke-opacity=".45"/>` +
    `<path d="M50,96 C48,74 47,46 50,22" fill="none" stroke="#6d0d14" stroke-width="1" stroke-opacity=".3"/>` +
    `</g>`;
});

/*
 * Dải ĐỎ (Sếp 05/10: "phải đỏ hơn"). Bản trước lấy trung vị màu đo từ ảnh
 * banner ra #b74521 — đúng về đo đạc nhưng ngả CAM, nhìn không ra hoa đào.
 * Nay kéo hẳn về đỏ thẫm → đỏ tươi, chỉ chừa mép cánh hồng nhạt cho có sáng.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><defs>
<linearGradient id="g0" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6b0b11"/><stop offset=".45" stop-color="#a81320"/><stop offset=".85" stop-color="#d9303d"/><stop offset="1" stop-color="#ff8591"/></linearGradient>
<linearGradient id="g1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5d080e"/><stop offset=".5" stop-color="#9c0f1b"/><stop offset=".9" stop-color="#cf2a38"/><stop offset="1" stop-color="#ff7684"/></linearGradient>
<linearGradient id="g2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#780d16"/><stop offset=".5" stop-color="#b81824"/><stop offset=".9" stop-color="#e23c4c"/><stop offset="1" stop-color="#ff9ba6"/></linearGradient>
</defs>${g}</svg>`;

const r = await sharp(Buffer.from(svg))
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile("public/decor/sakura-petals-do.webp");
console.log(`đã vẽ public/decor/sakura-petals-do.webp  ${r.width}x${r.height}  ${Math.round(r.size / 1024)} KB`);

const parts = [];
for (let i = 0; i < 4; i++) {
  const p = O[[0, 6, 5, 2][i]];
  parts.push({
    input: await sharp("public/decor/sakura-petals-do.webp")
      .extract({ left: p.x, top: p.y, width: p.w, height: p.h })
      .resize({ height: 150 })
      .png()
      .toBuffer(),
    left: 20 + i * 150,
    top: 20,
  });
}
await sharp({ create: { width: 640, height: 190, channels: 4, background: "#140f0b" } })
  .composite(parts)
  .png()
  .toFile("_w-agent/soi-canh-moi.png");
console.log("xem thử: _w-agent/soi-canh-moi.png");
