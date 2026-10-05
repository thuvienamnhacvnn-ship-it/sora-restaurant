/*
 * ============================================================================
 *  CHỤP TRANG THỰC ĐƠN TỪ PDF — ra ảnh sRGB ĐÚNG MÀU
 * ============================================================================
 *
 * Chạy:  node scripts/chup-menu-pdf.mjs <file.pdf> <thư-mục-ra> [trang...]
 * Ví dụ: node scripts/chup-menu-pdf.mjs "E:/Works/Sora/IN GẤP.pdf" out 3 4 5
 *        node scripts/chup-menu-pdf.mjs "E:/Works/Sora/IN GẤP.pdf" out      (cả 40 trang)
 *
 * VÌ SAO PHẢI CHỤP CHỨ KHÔNG RÚT ẢNH NHÚNG RA
 * Cả 4 bản PDF của thực đơn đều lưu ảnh `/DeviceCMYK` và **không nhúng hồ sơ
 * màu** (đếm được 0 tham chiếu ICCBased). Rút ảnh ra rồi tự đổi CMYK -> sRGB
 * là đang đoán hồ sơ màu, nên ảnh ra bạc màu/ám cam — đó là cả một chuỗi thất
 * bại đã ghi trong bộ nhớ dự án.
 * Chrome có sẵn bộ giải CMYK chuẩn. Mở PDF rồi chụp màn hình thì màu ra đúng
 * ngay lần đầu, không phải khớp bảng màu, không phải kiểm chéo.
 *
 * NÊN DÙNG BẢN PDF NÀO
 *   E:/Works/Sora/IN GẤP.pdf   324 MB  ảnh nén KHÔNG MẤT DỮ LIỆU (FlateDecode)
 *   E:/Works/Sora/IN.pdf       196 MB  JPEG
 *   E:/Works/Sora/IN-nhe.pdf    41 MB  JPEG, bản nhẹ
 *   …/menu_refs/Menu.pdf        41 MB  TRÙNG HỆT IN-nhe.pdf
 * Đội đã làm từ `Menu.pdf` suốt, tức bản NHẸ NHẤT. Muốn nét nhất thì dùng
 * `IN GẤP.pdf` — nó không qua JPEG lần nào.
 *
 * ĐÃ CÓ ĐƯỜNG NGẮN HƠN — DỰ ÁN SORA KHÔNG CẦN SCRIPT NÀY NỮA (04/10/2026).
 * `E:/Works/Sora/` có sẵn cả bộ trang thực đơn ở RGB (`Elegant Sushi Menu
 * Poster.png`, `m1`–`m7`, `1`–`12`… 1024×1536 srgb 3 kênh). Cắt thẳng từ đó.
 * Đo cùng một vùng món: bản RGB sáng TB 89 / lệch chuẩn 72 / cháy 0,02% /
 * R-G-B 117-79-46; bản CMYK rút từ PDF: 148 / 50 / 8,73% / 143-149-148 —
 * tức đã thành xám trơ. Giữ tệp này làm điểm khởi đầu cho PDF CMYK khác.
 *
 * TRẠNG THÁI: CHẠY CHẬP CHỜN TRÊN MÁY NÀY — chưa dùng cho việc thật được.
 * Màu thì ĐÚNG, đã chụp được trang 3 của IN-nhe.pdf ra đủ màu (nền tối, chữ
 * vàng, món lên màu) — tức cách làm của Sếp là đúng. Nhưng
 * `Page.captureScreenshot` trên trình xem PDF của Chrome hay treo:
 *   - IN GẤP.pdf (324 MB) và IN.pdf (196 MB): KHÔNG BAO GIỜ vẽ xong.
 *   - IN-nhe.pdf (41 MB): chụp được 1 lần rồi sau đó treo cả khi đã nới
 *     thời gian chờ lên 300 s. Máy 4 nhân, lúc đó còn chạy next dev.
 * Muốn chắc ăn thì cài poppler (pdftoppm) hoặc ghostscript — máy này chưa có
 * cái nào; `convert` trong system32 là lệnh đổi ổ đĩa của Windows, không phải
 * ImageMagick.
 *
 * BA BẪY CHỤP, đã thử thật trên máy này
 *  1. `deviceScaleFactor: 2` -> `Page.captureScreenshot` treo vô hạn.
 *  2. Khung nhìn to (2400×3300) -> cũng treo.
 *  3. `clip.scale` -> cũng treo.
 *  Chạy được: khung nhìn 1700×1500, scale 1, lấy độ nét bằng `zoom=200` của
 *  chính trình xem PDF rồi ghép các mảnh lại.
 *
 * `#toolbar=0&navpanes=0` bỏ thanh công cụ + cột ảnh nhỏ bên trái.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9413;
const KHUNG_W = 1700;
const KHUNG_H = 1500;
const ZOOM = 200;
/** Số mảnh chụp theo chiều dọc cho một trang ở zoom 200. */
const SO_MANH = 3;

const [PDF, OUT, ...dsTrang] = process.argv.slice(2);
if (!PDF || !OUT) {
  console.error(
    "Dùng: node scripts/chup-menu-pdf.mjs <file.pdf> <thư-mục-ra> [trang...]"
  );
  process.exit(1);
}
const trangs = dsTrang.length
  ? dsTrang.map(Number)
  : Array.from({ length: 40 }, (_, i) => i + 1);

const get = (p) =>
  new Promise((r, j) =>
    http
      .get({ host: "127.0.0.1", port: PORT, path: p }, (s) => {
        let b = "";
        s.on("data", (d) => (b += d));
        s.on("end", () => r(JSON.parse(b)));
      })
      .on("error", j)
  );
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--remote-allow-origins=*",
    "--hide-scrollbars",
    "--user-data-dir=" + path.join(OUT, "cdp"),
    "about:blank",
  ],
  { stdio: "ignore" }
);

let ver = null;
for (let i = 0; i < 250 && !ver; i++) {
  try {
    ver = await get("/json/version");
  } catch {
    await cho(300);
  }
}
if (!ver) throw new Error("Chrome không lên");

const tab = (await get("/json/list")).find((t) => t.type === "page");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const cho_doi = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (cho_doi.has(m.id)) {
    cho_doi.get(m.id)(m);
    cho_doi.delete(m.id);
  }
};
const cmd = (ten, tham = {}, ms = 300000) =>
  new Promise((r, j) => {
    const i = ++id;
    const h = setTimeout(() => {
      cho_doi.delete(i);
      j(new Error(ten + " quá giờ"));
    }, ms);
    cho_doi.set(i, (m) => {
      clearTimeout(h);
      if (m.error) j(new Error(ten + ": " + m.error.message));
      else r(m.result);
    });
    ws.send(JSON.stringify({ id: i, method: ten, params: tham }));
  });

await cmd("Page.enable");
await cmd("Emulation.setDeviceMetricsOverride", {
  width: KHUNG_W,
  height: KHUNG_H,
  deviceScaleFactor: 1,
  mobile: false,
});

const abs = path.resolve(PDF).split(path.sep).join("/");

for (const t of trangs) {
  await cmd("Page.navigate", {
    url: `file:///${abs}#page=${t}&toolbar=0&navpanes=0&zoom=${ZOOM}`,
  });
  await cho(Number(process.env.CHO_NAP || 14000));

  const manh = [];
  for (let k = 0; k < SO_MANH; k++) {
    if (k > 0) {
      // Trình xem PDF không nhận `window.scrollTo`; phải gửi sự kiện cuộn thật.
      await cmd("Input.dispatchMouseEvent", {
        type: "mouseWheel",
        x: KHUNG_W / 2,
        y: KHUNG_H / 2,
        deltaX: 0,
        deltaY: KHUNG_H - 40,
      });
      await cho(2500);
    }
    const s = await cmd("Page.captureScreenshot", { format: "png" });
    manh.push(Buffer.from(s.data, "base64"));
  }

  const ghep = await sharp({
    create: {
      width: KHUNG_W,
      height: (KHUNG_H - 40) * (SO_MANH - 1) + KHUNG_H,
      channels: 3,
      background: "#000",
    },
  })
    .composite(manh.map((b, k) => ({ input: b, top: k * (KHUNG_H - 40), left: 0 })))
    .png()
    .toBuffer();

  // Cắt bỏ viền xám của trình xem, giữ đúng khung giấy.
  const f = path.join(OUT, `trang${String(t).padStart(3, "0")}.png`);
  await sharp(ghep).trim({ threshold: 12 }).png().toFile(f);
  const m = await sharp(f).metadata();
  console.log(`trang ${t} -> ${f}  ${m.width}x${m.height}`);
}

ws.close();
chrome.kill();
console.log("Xong.");
