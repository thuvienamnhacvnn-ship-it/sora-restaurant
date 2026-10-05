/*
 * Đo tương phản WCAG của chữ hero — CÁCH ĐÚNG, không đoán ô lấy mẫu.
 * Chạy: node scripts/do-tuong-phan.mjs [url...]
 *
 * CÁCH LÀM: chụp trang HAI LẦN.
 *   A = bình thường
 *   B = tiêm CSS test cho chữ hero thành trong suốt (nền y nguyên)
 * Điểm nào A khác B chính là NÉT CHỮ. Lấy đúng toạ độ đó đọc trên ảnh B ->
 * nền THẬT nằm dưới từng nét chữ. Không còn chỗ cho người đo gõ sai toạ độ.
 *
 * CSS test chỉ tiêm lúc chạy qua CDP, KHÔNG có dòng nào trong mã nguồn trang.
 *
 * Bốn cách trước đều sai và đã bỏ: ô gõ tay (3 lần đè nhầm nét chữ / thanh
 * giữ chỗ / wordmark), và tự dò hàng sáng (bắt nhầm đèn lồng, 350/500 hàng bị
 * coi là có chữ nên hoá ra đang đo nền của cả banner).
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const URLS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "http://localhost:3160/de",
      "http://localhost:3160/de/speisekarte",
      "http://localhost:3160/de/reservierung",
      "http://localhost:3160/de/galerie",
      "http://localhost:3160/de/ueber-uns",
      "http://localhost:3160/de/kontakt",
    ];

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9431;
const W = 1440;
const H = 760;

const get = (p) =>
  new Promise((r, j) =>
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (s) => {
      let b = "";
      s.on("data", (d) => (b += d));
      s.on("end", () => r(JSON.parse(b)));
    }).on("error", j)
  );
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
const srgb = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const tyLe = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const chrome = spawn(CHROME, [
  "--headless=new", "--remote-debugging-port=" + PORT, "--remote-allow-origins=*",
  "--hide-scrollbars", "--user-data-dir=" + process.env.TEMP + "/sora-do-" + Date.now(),
  "about:blank",
], { stdio: "ignore" });

let ver = null;
for (let i = 0; i < 200 && !ver; i++) { try { ver = await get("/json/version"); } catch { await cho(300); } }
if (!ver) throw new Error("Chrome không lên");

const tab = (await get("/json/list")).find((t) => t.type === "page");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const cmd = (ten, tham = {}, ms = 120000) =>
  new Promise((r, j) => {
    const i = ++id;
    const h = setTimeout(() => { pend.delete(i); j(new Error(ten + " quá giờ")); }, ms);
    pend.set(i, (m) => { clearTimeout(h); if (m.error) j(new Error(ten + ": " + m.error.message)); else r(m.result); });
    ws.send(JSON.stringify({ id: i, method: ten, params: tham }));
  });
const js = async (code) => {
  const r = await cmd("Runtime.evaluate", { expression: `(() => { ${code} })()`, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
const chup = async () => {
  const s = await cmd("Page.captureScreenshot", { format: "png" });
  return sharp(Buffer.from(s.data, "base64")).raw().toBuffer({ resolveWithObject: true });
};

await cmd("Page.enable");
await cmd("Runtime.enable");
await cmd("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });

/* Chọn đúng khối chữ hero: tiêu đề, dòng đề tựa, và chữ trong khối giữ chỗ. */
const CHON = "section:first-of-type :is(h1,h2,p,span,li,a)";

let tongHong = 0;
for (const url of URLS) {
  await cmd("Page.navigate", { url });
  await cho(8000);

  // từng phần tử chữ: khung + màu chữ thật đang hiển thị
  const els = await js(`
    const cv = document.createElement('canvas'); cv.width = cv.height = 1;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    // Tô màu lên nền TRẮNG rồi đọc lại: ra đúng màu mắt thấy, kể cả khi
    // màu gốc có alpha hay viết kiểu color(srgb ...).
    const doMau = (m) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, 1, 1);
      cx.fillStyle = m; cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const out = [];
    for (const el of document.querySelectorAll(${JSON.stringify(CHON)})) {
      if (el.querySelector(${JSON.stringify(CHON)})) continue;      // chỉ lấy nút lá
      const t = el.textContent.trim();
      if (!t) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 6 || r.top > ${H}) continue;
      const cs = getComputedStyle(el);
      out.push({
        chu: t.slice(0, 34),
        x: Math.max(0, Math.floor(r.left)), y: Math.max(0, Math.floor(r.top)),
        w: Math.ceil(r.width), h: Math.ceil(r.height),
        mau: doMau(cs.color), co: parseFloat(cs.fontSize), dam: cs.fontWeight,
      });
    }
    return out;
  `);

  const A = await chup();
  /*
   * CHỈ DÙNG LÚC ĐO — không có dòng nào trong mã nguồn trang.
   * Phải đặt INLINE + important chứ không tiêm <style>: lớp utilities của
   * Tailwind có `!important` riêng (vd class `!text-ivory`) và nó thắng
   * `!important` của thẻ <style> tiêm vào. Hậu quả lúc trước: chữ KHÔNG hề
   * trong suốt ở lần chụp thứ hai, nên "nền" đo được chính là nét chữ ->
   * ivory trên ivory ra 1,01:1 trong khi mắt thấy chữ trên nền đen.
   */
  await js(`
    for (const el of document.querySelectorAll(${JSON.stringify(CHON)})) {
      el.style.setProperty('color', 'transparent', 'important');
      el.style.setProperty('text-shadow', 'none', 'important');
    }
    for (const im of document.querySelectorAll('section:first-of-type img[src*="/chu/"]'))
      im.style.setProperty('visibility', 'hidden', 'important');
    return 'ok';
  `);
  await cho(600);
  const B = await chup();
  await js(`document.getElementById('__do__')?.remove(); return 'ok';`);

  console.log("\n" + url);
  for (const el of els) {
    const Lchu = lum(el.mau[0], el.mau[1], el.mau[2]);
    const lon = el.co >= 24 || (el.co >= 18.66 && +el.dam >= 700);
    const can = lon ? 3 : 4.5;

    /*
     * Gom theo TỪNG HÀNG rồi bỏ hàng không có nét chữ.
     * Khung của phần tử thường cao hơn chữ (line-height, và ở hero còn có
     * chỉ vàng trang trí nằm trong khung). Đo cả khung thì chỉ vàng đó bị
     * tính thành "nền sau chữ" -> ivory trên vàng ra 1,0:1 trong khi mắt
     * thấy chữ nằm trên nền đen, đọc tốt.
     */
    const nen = [];
    for (let yy = el.y; yy < Math.min(el.y + el.h, A.info.height); yy++) {
      const hang = [];
      for (let xx = el.x; xx < Math.min(el.x + el.w, A.info.width); xx++) {
        const i = (yy * A.info.width + xx) * A.info.channels;
        const khac =
          Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) +
          Math.abs(A.data[i + 2] - B.data[i + 2]);
        if (khac < 40) continue;                       // không phải nét chữ
        hang.push(lum(B.data[i], B.data[i + 1], B.data[i + 2]));
      }
      if (hang.length >= 3) nen.push(...hang);         // hàng này thật sự có chữ
    }
    if (nen.length < 40) continue;
    nen.sort((a, b) => a - b);
    const p95 = nen[Math.floor(nen.length * 0.95)];
    const r = tyLe(Lchu, p95);
    const dat = r >= can;
    if (!dat) tongHong++;
    console.log(
      `  ${dat ? "ĐẠT " : "HỎNG"} ${r.toFixed(2).padStart(6)}:1 (cần ${can})  ` +
      `${String(Math.round(el.co)).padStart(3)}px  [${el.mau}] nen ${Math.round(p95*255)}  ${el.chu}`
    );
  }
}

console.log(tongHong ? `\n${tongHong} chỗ TRƯỢT chuẩn AA` : "\nTất cả đạt AA");
ws.close();
chrome.kill();
process.exit(tongHong ? 1 : 0);
