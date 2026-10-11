/*
 * Chụp VÙNG BỆ (cả ba đĩa trong một khung) để nhìn bố cục — khác
 * `soat-bo-dia.mjs` vốn cắt từng bệ một và phóng to.
 *
 * Dùng khi cần trả lời câu "ba đĩa có chồng nhau không", vì chồng chéo chỉ
 * thấy được khi ba đĩa nằm chung một khung.
 *
 * Chạy:  node scripts/chup-vung-be.mjs [1440 | 1280x720]
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import sharp from "sharp";
import fs from "node:fs";
import { doiSoCoMan } from "./lib/co-man.mjs";

const CO = doiSoCoMan();
fs.mkdirSync("_w-agent/soat2", { recursive: true });

const b = await dungKhung();
const daSoi = new Set();

for (const [W, H] of CO) {
  await b.khoKhung(W, H);
  await b.go("http://localhost:3160/de");
  await cho(1800);

  let truoc = null;
  for (let i = 0; i < 4; i++) {
    const khac = truoc === null ? "true" :
      "d.map(e=>e.src).join('|') !== " + JSON.stringify(truoc);
    await b.choTới(
      "const d=[...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src));" +
        "return d.length === 3 && " + khac +
        " && d.every(e => getComputedStyle(e).opacity === '1' && e.complete);",
      12000
    );
    await cho(250);
    truoc = await b.js(
      "return [...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src))" +
        ".map(e=>e.src).join('|');"
    );

    const v = await b.js(`
      const be = document.querySelector('img[src*="be-trung-bay"]');
      const r = be.getBoundingClientRect();
      const d = [...document.querySelectorAll('img')].filter((e) => /mon-be/.test(e.src));
      const hop = d.map((e) => e.getBoundingClientRect());
      const tren = Math.min(...hop.map((q) => q.top));
      return {
        ten: d.map((e) => (e.src.match(/([^/]+)\\.webp/) || [, '?'])[1]),
        o: {
          x: Math.max(0, Math.round(Math.min(...hop.map((q) => q.left)) - 40)),
          y: Math.max(0, Math.round(tren - 24)),
          w: Math.round(Math.max(...hop.map((q) => q.right)) - Math.min(...hop.map((q) => q.left)) + 80),
          h: Math.round(r.bottom - tren + 40),
        },
        /* mép phải ô này có đè lên mép trái ô kia không — tính bằng px thật */
        chongNhau: [0, 1].map((k) => Math.round(hop[k].right - hop[k + 1].left)),
      };
    `);

    const anh = await b.cmd("Page.captureScreenshot", { format: "png" });
    const buf = Buffer.from(anh.data, "base64");
    const kt = await sharp(buf).metadata();
    const x = Math.max(0, Math.min(v.o.x, kt.width - 1));
    const y = Math.max(0, Math.min(v.o.y, kt.height - 1));
    const w = Math.max(1, Math.min(v.o.w, kt.width - x));
    const h = Math.max(1, Math.min(v.o.h, kt.height - y));
    await sharp(buf)
      .extract({ left: x, top: y, width: w, height: h })
      .resize({ width: Math.min(1600, w * 2), kernel: "lanczos3" })
      .toFile(`_w-agent/soat2/vung-be-${W}x${H}-bo${i + 1}.png`);

    v.ten.forEach((t) => daSoi.add(t));
    console.log(
      "  " + (W + "×" + H).padEnd(10) + "bộ " + (i + 1) + ": " + v.ten.join(" · ") +
        "   chồng ô #1↔#2 " + v.chongNhau[0] + "px, #2↔#3 " + v.chongNhau[1] + "px"
    );
  }
}

console.log("\n  ảnh: _w-agent/soat2/vung-be-<rộng>x<cao>-bo<n>.png");
console.log("  đã soi " + daSoi.size + "/12 món");
b.dong();
process.exit(daSoi.size === 12 ? 0 : 1);
