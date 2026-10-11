/*
 * Mặt bàn đá PHẲNG (không trụ) cho bệ trưng bày ở chân banner trang chủ.
 *   node scripts/lam-ban-phang.mjs  &&  node scripts/do-mat-be.mjs
 *
 * Sếp 07/10 gửi `Glossy Gold-Veined Marble Display Slab.png` (3788×362, nền
 * trong suốt) bảo thay cái bàn có các trụ tròn. Ảnh dùng NGUYÊN, không cắt
 * ngang, không tô sửa — chỉ thu về bề ngang 2172 như bản trước.
 *
 * GIỮ KHUNG 2172×313 của bản v5 và đặt ĐÁY bàn mới trùng đáy bàn cũ (hàng
 * 311): `--be-dich-so` và `--be-hang` trong globals.css tính theo chiều cao
 * khung này, đổi khung là hàng thẻ danh mục bên dưới xô lệch theo.
 *
 * Alpha ≤ 24 ép về 0: PNG ChatGPT mang màu rác ở vùng gần trong suốt.
 */
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

const SRC = process.argv[2] || "_w-agent/mau/ban-da-phang.png";
const RA = "public/decor/be-trung-bay-v6.webp";
const KHUNG_W = 2172;
const KHUNG_H = 313;
/** Hàng đục cuối cùng của bàn v5 — đáy bàn mới phải nằm đúng đây. */
const DAY_CU = 311;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 3; i < data.length; i += 4) if (data[i] <= 24) data[i] = 0;

const cao = Math.round((info.height * KHUNG_W) / info.width);
const ban = await sharp(data, { raw: info }).resize(KHUNG_W, cao).png().toBuffer();

await sharp({
  create: { width: KHUNG_W, height: KHUNG_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: ban, left: 0, top: DAY_CU + 1 - cao }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(RA);

console.log(`  ${SRC} ${info.width}x${info.height} -> ${RA} ${KHUNG_W}x${KHUNG_H} (bàn cao ${cao}px, đáy ở hàng ${DAY_CU})`);
