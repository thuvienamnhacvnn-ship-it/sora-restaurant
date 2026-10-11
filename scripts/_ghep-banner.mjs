/* Ghép phần ĐẦU của 6 trang ở khổ 390 thành một tấm, để nhìn banner cạnh nhau.
   Chỉ lấy 560px đầu mỗi trang: đủ thấy banner + tiêu đề, không lẫn nội dung. */
import sharp from "sharp";
import fs from "node:fs";

const CAO = 560;
const RONG = 390;
const KHE = 10;
const TRANG = [
  ["trang chu", "sau_de"],
  ["Speisekarte", "sau_de_speisekarte"],
  ["Reservierung", "sau_de_reservierung"],
  ["Galerie", "sau_de_galerie"],
  ["Uber uns", "sau_de_ueber-uns"],
  ["Kontakt", "sau_de_kontakt"],
];

const manh = [];
for (const [, thuMuc] of TRANG) {
  const f = `_w-agent/soat2/${thuMuc}/mobile.png`;
  if (!fs.existsSync(f)) {
    console.error("  thiếu: " + f);
    process.exit(1);
  }
  const m = await sharp(f).metadata();
  manh.push(
    await sharp(f)
      .extract({ left: 0, top: 0, width: RONG, height: Math.min(CAO, m.height) })
      .toBuffer()
  );
}

const W = TRANG.length * RONG + (TRANG.length - 1) * KHE;
await sharp({
  create: { width: W, height: CAO, channels: 3, background: { r: 24, g: 20, b: 16 } },
})
  .composite(manh.map((b, i) => ({ input: b, left: i * (RONG + KHE), top: 0 })))
  .png()
  .toFile("_w-agent/soat2/ghep-banner-390.png");

console.log("  đã ghép 6 trang -> _w-agent/soat2/ghep-banner-390.png  (" + W + "x" + CAO + ")");
console.log("  thứ tự: " + TRANG.map(([t]) => t).join(" · "));
