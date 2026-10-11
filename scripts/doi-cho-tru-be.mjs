/*
 * DỊCH BA TRỤ BỆ SANG PHẢI TRONG CHÍNH ẢNH — giữ nguyên cỡ bệ.
 *
 * Vì sao phải làm ở mức ẢNH chứ không mức CSS:
 *
 * Ba trụ nằm ở x 722–1794 của khung 1920 (37,6%–93,4%). Khi khối bệ trải hết
 * bề ngang, trụ #1 rơi vào đúng chỗ nút `Speisekarte entdecken` và che mất
 * chữ. Tôi đã thử chữa bằng CSS — thu khối bệ còn 62% — nút hết cụt nhưng
 * **bệ nhỏ đi gần 40%** (ở 1440: cao 129px còn 80px). Sếp bác đúng: chữa một
 * lỗi bằng cách làm hỏng thứ khác không phải là chữa.
 *
 * Cách đúng: giữ khung ảnh rộng hết màn (bệ nguyên cỡ, dải mặt bàn vẫn chạy
 * hết bề ngang, không có mép nào để cắt) và chỉ **dịch phần có trụ sang
 * phải**. Phần trống để lại bên trái được lấp bằng chính dải mặt bàn ở cạnh
 * nó — chỗ đó vốn là mặt bàn trơn nên ghép không thấy đường nối.
 *
 * DỊCH BAO NHIÊU: trụ #1 phải nằm bên phải mép phải của nút ở MỌI cỡ màn.
 * Đo được tỉ lệ cần vượt: 0,401 (1280) · 0,407 (1366) · 0,412 (1440).
 * Lấy 0,46 cho dư — tức trụ #1 từ 37,6% lên 46%, dịch 8,4% × 1920 ≈ 161px.
 * Trụ #3 hiện hết ở 1794, cộng 161 thành 1955 > 1920 nên sẽ bị xén 35px —
 * chấp nhận được, trụ #3 vốn đã là cái nhỏ nhất và nằm sát mép.
 *
 * Chạy lại:  node scripts/doi-cho-tru-be.mjs
 * Gốc giữ ở `public/decor/be-trung-bay-goc.webp`, xoá bản mới là quay lại.
 */
import sharp from "sharp";
import fs from "node:fs";

const RA = "public/decor/be-trung-bay.webp";
const GOC = "public/decor/be-trung-bay-goc.webp";
const DICH = 161; // px trên khung 1920

/* Lần đầu chạy thì cất bản gốc; lần sau luôn dựng TỪ bản gốc, không chồng
   nhiều lần lên nhau (chạy hai lần là trụ bay ra khỏi khung). */
if (!fs.existsSync(GOC)) {
  fs.copyFileSync(RA, GOC);
  console.log("  đã cất bản gốc -> " + GOC);
}

const m = await sharp(GOC).metadata();
const W = m.width;
const H = m.height;

/* Toàn bộ ảnh dịch sang phải `DICH` px, phần thừa bên phải bị khung xén. */
const dayRa = await sharp(GOC)
  .extract({ left: 0, top: 0, width: W - DICH, height: H })
  .toBuffer();

const buocMot = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: dayRa, left: DICH, top: 0 }])
  .png()
  .toBuffer();

/*
 * Lấp khoảng trống bên trái bằng ẢNH GƯƠNG của chính dải kề nó.
 *
 * Lần đầu tôi chép một mảnh mặt bàn ở chỗ khác (x 540–701) dán vào — ra một
 * **vệt nối dọc rất rõ**, vì vân gỗ và vệt sáng hai bên không khớp nhau.
 * Soi gương thì tại đúng đường nối, điểm ảnh hai bên BẰNG NHAU theo định
 * nghĩa, nên không thể thấy mối. Mặt bàn là vân ngẫu nhiên nên lật ngược
 * cũng không ai nhận ra.
 */
const guong = await sharp(buocMot)
  .extract({ left: DICH, top: 0, width: DICH, height: H })
  .flop()
  .toBuffer();

await sharp(buocMot)
  .composite([{ input: guong, left: 0, top: 0 }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(RA);

/* Đo lại vị trí trụ trên ảnh MỚI để xác nhận, không tin phép tính suông. */
const { data, info } = await sharp(RA).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const cot = [];
for (let x = 0; x < info.width; x++) {
  let n = 0;
  for (let y = 20; y < 100; y++) if (data[(y * info.width + x) * info.channels + 3] > 24) n++;
  cot.push(n);
}
const khoi = [];
let d = null;
for (let x = 0; x < info.width; x++) {
  if (cot[x] >= 40) {
    if (d === null) d = x;
  } else if (d !== null) {
    if (x - d > 40) khoi.push([d, x - 1]);
    d = null;
  }
}
if (d !== null) khoi.push([d, info.width - 1]);

console.log("  ảnh mới: " + info.width + "x" + info.height +
  "  (" + Math.round(fs.statSync(RA).size / 1024) + " KB)");
console.log("  trụ sau khi dịch:");
for (const [a, b] of khoi) {
  console.log("    x " + a + "–" + b + "  rộng " + (b - a + 1) +
    "  tâm " + ((100 * (a + b)) / 2 / info.width).toFixed(1) + "%" +
    "  rộng " + ((100 * (b - a + 1)) / info.width).toFixed(1) + "%");
}
console.log("\n  ⚠ Chép mấy số này vào bảng `BE` trong components/home/BeMonAn.tsx.");
