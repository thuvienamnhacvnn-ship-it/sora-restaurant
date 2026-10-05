/*
 * Xuất tài nguyên từ KIT sang public/.
 * Chạy: node scripts/build-assets.mjs
 *
 * Dùng `sharp` đi kèm Next (không khai trong package.json vì đây là script
 * một lần, không nằm trong `next build`).
 *
 * Vì sao phải có script này:
 * - logo gốc 1254x1254 nặng 2,9 MB và thừa ~7% viền trong suốt -> phải trim
 *   rồi xuất 3 cỡ, CẤM ship bản gốc.
 * - banner 2172x724 cần thêm bản 1280/768 cho máy nhỏ.
 * - 7 ảnh thật là ảnh DỌC 1536x2048 -> xuất bản web + bản thumb, không kéo giãn.
 * - poster 360: xem ghi chú cuối file, cố ý KHÔNG xuất.
 *
 * BẪY sau khi chạy script: Next 16 để bộ đệm ảnh ở `.next/dev/cache/images`,
 * KHÔNG còn `.next/cache/images`. Thay ảnh xong mà trang vẫn vẽ ảnh cũ thì xoá
 * CẢ HAI thư mục rồi chạy lại. Dấu hiệu nhận ra nhanh nhất: so tỉ lệ
 * `naturalWidth/naturalHeight` của thẻ <img> với tỉ lệ ảnh thật.
 */
import { mkdir, copyFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const KIT = "E:/Works/Sora/SORA_WEBSITE_CLAUDE_KIT/05_ASSETS";
const PUB = path.resolve(import.meta.dirname, "..", "public");

const dirs = ["logo", "banner", "anh", "decor", "icons", "360"];

async function ensureDirs() {
  for (const d of dirs) await mkdir(path.join(PUB, d), { recursive: true });
}

async function logo() {
  const src = `${KIT}/logo/sora_logo_3d_transparent.png`;
  // trim() cắt viền trong suốt thừa; nếu không trim thì logo hiện nhỏ hơn số đo
  const trimmed = await sharp(src).trim().png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  console.log(`logo sau trim: ${width}x${height}`);
  await sharp(trimmed).resize(320, 320, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88 }).toFile(path.join(PUB, "logo", "logo-320.webp"));
  await sharp(trimmed).resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 }).toFile(path.join(PUB, "logo", "logo-96.webp"));
  await sharp(trimmed).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(PUB, "logo", "logo-512.png"));
  await sharp(trimmed).resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(PUB, "icon.png"));
}

/*
 * BANNER — bộ MỚI Sếp gửi 04/10/2026 lúc 17:55, nằm ở `05_ASSETS/Banner/`
 * (chữ B hoa, đuôi .png). Bộ cũ `05_ASSETS/banners/*.jpg` ĐÃ BỎ — trỏ nhầm
 * vào đó là ghi đè ngược, mất hết banner mới.
 *
 * Tên tệp nguồn là `ChatGPT Image …-N.png`, không suy ra được trang nào, nên
 * phải khai tay. Bảng dưới đối chiếu bằng cách so chữ ký ảnh 16×16 của từng
 * tệp nguồn với bản .webp trưởng nhóm đã triển khai: mỗi trang khớp đúng một
 * tệp, cách tệp á quân 5,1–9,5 lần, nên không có chỗ nhầm.
 *
 * Nguồn 2172×724 — tỉ lệ 3:1, KHÁC bộ cũ 1920×720 (2,67:1). Vì thế chiều cao
 * phải tính từ chính ảnh nguồn, đừng khoá cứng tỉ lệ cũ.
 */
const BANNERS = {
  home_hero: "ChatGPT Image Oct 4, 2026, 05_55_14 PM-5.png",
  speisekarte_hero: "ChatGPT Image Oct 4, 2026, 05_55_10 PM-2.png",
  reservierung_hero: "ChatGPT Image Oct 4, 2026, 05_55_09 PM-1.png",
  galerie_hero: "ChatGPT Image Oct 4, 2026, 05_55_15 PM-6.png",
  ueber_uns_hero: "ChatGPT Image Oct 4, 2026, 05_55_12 PM-4.png",
  kontakt_hero: "ChatGPT Image Oct 4, 2026, 05_55_11 PM-3.png",
};

async function banners() {
  for (const [slug, file] of Object.entries(BANNERS)) {
    const src = `${KIT}/Banner/${file}`;
    const meta = await sharp(src).metadata();
    const ratio = meta.height / meta.width;
    for (const w of [1920, 1280, 768]) {
      await sharp(src)
        .resize(w, Math.round(ratio * w))
        .webp({ quality: 78 })
        .toFile(path.join(PUB, "banner", `${slug}-${w}.webp`));
    }
    console.log("banner", slug, `${meta.width}x${meta.height}`);
  }
}

async function photos() {
  for (let i = 1; i <= 7; i++) {
    const n = String(i).padStart(2, "0");
    const src = `${KIT}/source_photos/restaurant_${n}.jpg`;
    // ảnh DỌC 1536x2048 -> giữ nguyên tỉ lệ, chỉ giảm cỡ
    await sharp(src).resize({ width: 1100 }).webp({ quality: 80 })
      .toFile(path.join(PUB, "anh", `restaurant-${n}.webp`));
    await sharp(src).resize({ width: 480 }).webp({ quality: 72 })
      .toFile(path.join(PUB, "anh", `restaurant-${n}-thumb.webp`));
  }
  console.log("7 ảnh thật xong");
}

async function decorAndIcons() {
  for (const f of await readdir(`${KIT}/decor/svg`)) {
    await copyFile(`${KIT}/decor/svg/${f}`, path.join(PUB, "decor", f));
  }
  for (const f of ["master_chef.svg", "customer_care.svg"]) {
    await copyFile(`${KIT}/icons/${f}`, path.join(PUB, "icons", f));
  }
  console.log("decor + icons xong");
}

/*
 * Poster 360 — KHÔNG xuất ở đây, cố ý.
 *
 * Đã thử cắt 3 vật thể (sushi / phở / đồ uống) từ `_w-agent/menu-pages/rgb`:
 * 41 trang đó bị phủ một lớp sương nhạt khi rút khỏi PDF (mean kênh ~150 ở MỌI
 * trang), kéo tương phản lên thì cháy sáng, `negate()` thì ra màu tím/xanh sai.
 * Ảnh ra sáng bệch, đặt trên nền onyx là phá luôn tỉ lệ "68-72% tối" của KIT.
 *
 * => Không ship ảnh xấu. `Hero360Object` tự vẽ bệ CSS + vòng enso vàng khi
 *    chưa có poster. Khi có file thật, bỏ vào `public/360/` rồi khai
 *    `webm`/`poster` trong `src/data/hero-objects.ts` là component tự dùng.
 */

await ensureDirs();
await logo();
await banners();
await photos();
await decorAndIcons();
console.log("Xong.");
