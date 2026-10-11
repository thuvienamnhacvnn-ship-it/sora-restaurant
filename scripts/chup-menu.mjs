/*
 * Chụp trang Speisekarte theo TỪNG MÀN, không chụp cả trang một lần.
 *
 * Vì sao phải có script riêng: thực đơn 207 món dài ~7000px, mà
 * `Page.captureScreenshot` của skill soát mẫu chụp một phát cả trang nên quá
 * giờ ở độ dài đó ("CHỤP HỎNG: quá giờ"). Ở đây cuộn từng màn rồi chụp đúng
 * khung đang thấy — vừa không quá giờ, vừa là ĐÚNG thứ cần nhìn (thanh lọc
 * dính và dòng tiêu đề nhóm chỉ đọc được trong khung màn thật).
 *
 * Chạy:  node scripts/chup-menu.mjs [1440] [số màn] [đường?kategorie=sushi]
 */
import fs from "node:fs";
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";

const W = Number(process.argv[2] || 1440);
const SO_MAN = Number(process.argv[3] || 3);
const DUONG = process.argv[4] || "/de/speisekarte";
const H = W < 500 ? 844 : 900;
const RA = "_w-agent/shots/menu";

fs.mkdirSync(RA, { recursive: true });

const b = await dungKhung({ rong: W, cao: H });
await b.khoKhung(W, H);
await b.go(`http://localhost:3160${DUONG}`);
/* Trang Speisekarte chờ tới khi dựng xong món; trang khác chỉ chờ tải xong. */
await b.choTới(
  "return document.readyState === 'complete' && (!location.pathname.includes('speisekarte')" +
    " || document.querySelectorAll('[data-so-mon] li[data-mon]').length > 0);",
  30000
);
await cho(1200);

const dai = await b.js("return document.documentElement.scrollHeight;");
const soMon = await b.js(
  "return document.querySelectorAll('[data-so-mon] li[data-mon]').length;"
);
const tran = await b.js(`
  const d = document.documentElement;
  return { scroll: d.scrollWidth, client: d.clientWidth };
`);
console.log(`khổ ${W}×${H} · trang dài ${dai}px · ${soMon} món`);
console.log(
  tran.scroll > tran.client
    ? `❌ TRÀN NGANG: ${tran.scroll} > ${tran.client}`
    : "✔ không tràn ngang"
);

for (let i = 0; i < SO_MAN; i++) {
  const y = i * (H - 60); // chồng 60px để không mất đường cắt
  await b.js(`window.scrollTo(0, ${y}); return 1;`);
  await cho(650);
  const anh = await b.cmd("Page.captureScreenshot", { format: "png" });
  const tep = `${RA}/${W}-man${i + 1}.png`;
  fs.writeFileSync(tep, Buffer.from(anh.data, "base64"));
  console.log("→", tep);
}

await b.dong?.();
process.exit(0);
