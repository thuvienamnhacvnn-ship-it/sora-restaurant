/*
 * Tách nền TRẮNG khỏi ảnh bệ trưng bày, xuất PNG trong suốt + WebP cho web.
 *   node scripts/tach-nen-be.mjs
 *
 * Vì sao cần: tệp Sếp gửi
 * `05_ASSETS/Banner/Cinematic Cherry Blossom Lounge Display.png` tuy có kênh
 * alpha nhưng **0% điểm trong suốt** — nền là trắng ĐẶC. Đắp thẳng lên banner
 * tối là hiện một khối trắng to đùng.
 *
 * Cách tách: nền trắng thì ba kênh R≈G≈B và đều rất sáng. Bệ thì tối, còn
 * quầng sáng quanh chân bệ tuy sáng nhưng ngả VÀNG CAM (R hơn B nhiều). Nên
 * điều kiện xoá là "vừa sáng VỪA bạc màu", không chỉ dựa vào độ sáng — chỉ
 * dựa độ sáng là ăn mất quầng đèn.
 *
 * Mép chuyển mềm (`feather`) chứ không cắt ngọt: cắt ngọt để lại viền trắng
 * răng cưa quanh bệ, nhìn như dán sticker.
 */
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

const SRC =
  "E:/Works/Sora/SORA_WEBSITE_CLAUDE_KIT/05_ASSETS/Banner/Cinematic Cherry Blossom Lounge Display.png";
const RA_PNG = "public/decor/be-trung-bay.png";
const RA_WEBP = "public/decor/be-trung-bay.webp";

/** Trên ngưỡng này + bạc màu => nền, xoá hẳn. */
const SANG_XOA = 232;
/** Dưới ngưỡng này => giữ nguyên. Ở giữa hai mức thì mờ dần. */
const SANG_GIU = 198;
/** Chênh lệch R-B tối đa còn coi là "bạc màu". Quầng đèn cam vượt xa mức này. */
const BAC_MAU = 26;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const n = info.width * info.height;
let xoa = 0;
let minX = info.width, maxX = 0, minY = info.height, maxY = 0;

for (let p = 0; p < n; p++) {
  const i = p * info.channels;
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const sang = (r + g + b) / 3;
  const lech = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  let a = data[i + 3];
  if (lech <= BAC_MAU && sang >= SANG_GIU) {
    const t = Math.min(1, (sang - SANG_GIU) / (SANG_XOA - SANG_GIU));
    a = Math.round(a * (1 - t));
  }
  data[i + 3] = a;
  if (a < 10) xoa++;
  else {
    const x = p % info.width, y = (p / info.width) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

console.log(`đã xoá nền: ${((xoa / n) * 100).toFixed(1)}% số điểm`);
console.log(`vùng còn nét: x ${minX}–${maxX}, y ${minY}–${maxY} (ảnh ${info.width}x${info.height})`);

const cat = {
  left: minX,
  top: minY,
  width: maxX - minX + 1,
  height: maxY - minY + 1,
};

const goc = sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
}).extract(cat);

await goc.clone().png({ compressionLevel: 9 }).toFile(RA_PNG);
const w = await goc.clone().webp({ quality: 88, alphaQuality: 100 }).toFile(RA_WEBP);
console.log(`→ ${RA_WEBP}  ${w.width}x${w.height}  ${Math.round(w.size / 1024)} KB`);

// Soi thử trên nền tối giống banner
const xem = await sharp(RA_WEBP).resize({ width: 900 }).png().toBuffer();
const m = await sharp(xem).metadata();
await sharp({ create: { width: 900, height: m.height + 40, channels: 4, background: "#14100c" } })
  .composite([{ input: xem, left: 0, top: 20 }])
  .png()
  .toFile("_w-agent/soi-be.png");
console.log("xem thử trên nền tối: _w-agent/soi-be.png");
