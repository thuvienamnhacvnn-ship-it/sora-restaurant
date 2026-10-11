/*
 * ĐO "ĐỀU / CÂN ĐỐI" — một tệp cho cả 8 tuyến × 7 cỡ màn.
 *
 * Sinh ra để trả lời đúng bốn câu Sếp hỏi hôm 07/10 ("đều, cân đối chưa"),
 * bằng SỐ chứ bằng mắt:
 *
 *   1. LỀ  — cụm nội dung có nằm giữa khoảng trống THẬT không (khoảng trống
 *            thật = bề ngang màn trừ thanh bên trừ LÀN của cột nút nổi).
 *            Không phải lề-trái-bằng-lề-phải tính từ mép màn.
 *   2. RAIL — cột nút nổi có lấn vào mép nội dung không (âm = lấn).
 *   3. HERO — đỉnh chữ ký/nhãn nét cọ so với mép trên khung nhìn lúc chưa
 *            cuộn. ÂM = mất vĩnh viễn, không cuộn ngược lên được.
 *   4. TRỐNG — mảng đen giữa chân banner và khối kế tiếp (trang chủ).
 *
 * Kèm: cuộn chết (`scrollHeight − clientHeight` khi không có gì ở dưới),
 * tràn ngang, và chữ bị cắt giữa từ (so `scrollWidth` với `clientWidth` của
 * chính phần tử chữ).
 *
 * ⚠ PHẢI ĐỔI CẢ CHIỀU CAO. Ma trận lấy từ `lib/co-man.mjs` (đã có chiều cao)
 * cộng thêm 390×844. Lý do nằm ở đầu tệp đó: cỡ 1440×900 là "sạch giả".
 *
 * Chạy:  node scripts/do-can-doi.mjs [tuyến]      (tuyến: chuỗi con của URL)
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import { CO_MAN } from "./lib/co-man.mjs";
import fs from "node:fs";

const GOC = "http://localhost:3160";

/** 8 tuyến đang thuộc lượt này (không gồm Đặt bàn / Bộ sưu tập — tổ B giữ). */
const TUYEN = [
  "/de",
  "/vi",
  "/de/speisekarte",
  "/vi/speisekarte",
  "/de/ueber-uns",
  "/vi/kontakt",
  "/de/impressum",
  "/de/datenschutz",
];

/** Ma trận 7 cỡ = 6 cỡ desktop dùng chung (`lib/co-man.mjs`) + điện thoại. */
const CO = [...CO_MAN, [390, 844]];

const loc = process.argv[2];
const dsTuyen = loc ? TUYEN.filter((t) => t.includes(loc)) : TUYEN;

const DO = `
  const W = innerWidth, H = innerHeight;
  const main = document.querySelector('main');
  const css = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;
  const r = (x) => Math.round(x * 10) / 10;

  /* Mép nội dung: lấy mọi khung section đang hiện, union của các hộp trong. */
  const khung = [...document.querySelectorAll('main section > div.mx-auto, main section > div[class*="max-w-"]')]
    .map((e) => e.getBoundingClientRect())
    .filter((b) => b.width > 40 && b.height > 4);
  let L = Infinity, R = -Infinity;
  for (const b of khung) { L = Math.min(L, b.left); R = Math.max(R, b.right); }
  if (!khung.length) { L = 0; R = 0; }

  /* Cột nút nổi (fixed) — toạ độ khung nhìn thật. */
  const rail = [...document.querySelectorAll('div.fixed')]
    .map((e) => e.getBoundingClientRect())
    .filter((b) => b.width > 10 && b.width < 200 && b.height > 60 && b.right > W * 0.8)
    .sort((a, b) => a.left - b.left)[0];

  /* Nhãn nét cọ / chữ ký trong hero. */
  const h1 = main && main.querySelector('h1');
  const anhH1 = h1 && h1.querySelector('img');
  const hopH1 = (anhH1 || h1) ? (anhH1 || h1).getBoundingClientRect() : null;

  /* Khung hero + cột chữ bên trong (để biết cụm chữ có cao hơn khung không). */
  const heroSec = main && main.querySelector('section');
  const heroKhoa = heroSec && heroSec.querySelector('div[style*="--hero-h"]');
  const cotChu = heroKhoa && heroKhoa.querySelector('div.mx-auto > div');

  /* Ảnh banner (desktop vẽ bằng thẻ thường trong hộp overflow-hidden). */
  const banner = main && main.querySelector('img[src*="/banner/"]');
  const hopBanner = banner ? banner.getBoundingClientRect() : null;

  /* Khối ngay sau hero (trang chủ: hàng thẻ danh mục). */
  const sauHero = main && main.querySelector('[class*="--be-hang"]');
  const beAnh = main && main.querySelector('img[src*="be-trung-bay"]');

  /* Chữ bị cắt: phần tử chữ thật có scrollWidth > clientWidth. */
  const cat = [];
  for (const e of document.querySelectorAll('main h1,main h2,main h3,main p,main span,main dt,main dd,main li,main button,main a')) {
    if (e.children.length) continue;
    const t = (e.textContent || '').trim();
    if (!t || t.length < 2) continue;
    const s = getComputedStyle(e);
    if (s.position === 'absolute' && s.clip !== 'auto') continue;
    if (e.getClientRects().length === 0) continue;
    /* Bỏ sr-only và bản chữ ẩn sau nhãn nét cọ (chu_anChu): chúng CỐ Ý bị ép
       về 1x1 nên lúc nào cũng "tràn". Đo bằng kích thước thật chứ không bằng
       tên class — clip-path không hiện ra ở s.clip.
       (Không dùng dấu huyền trong chú thích NÀY: cả khối đang nằm trong một
       chuỗi template, một dấu huyền là chuỗi đứt ngay giữa.) */
    if (e.clientWidth <= 2 || e.clientHeight <= 2) continue;
    if (s.overflow === 'visible' && s.whiteSpace !== 'nowrap') continue;
    if (e.scrollWidth - e.clientWidth > 1)
      cat.push({ t: t.slice(0, 28), thieu: e.scrollWidth - e.clientWidth });
  }

  /* Dải cuộn ngang (chip danh mục) — còn bao nhiêu khuất. */
  const dai = [...document.querySelectorAll('main *')]
    .filter((e) => {
      const s = getComputedStyle(e);
      return (s.overflowX === 'auto' || s.overflowX === 'scroll') && e.scrollWidth - e.clientWidth > 2;
    })
    .map((e) => ({ hien: e.clientWidth, that: e.scrollWidth, khuat: e.scrollWidth - e.clientWidth }));

  return {
    W, H,
    sidebar: css('--sidebar-w'),
    pad: css('--page-pad'),
    lan: css('--rail-lane'),
    noiDung: { L: r(L), R: r(R) },
    leTrai: r(L),
    lePhai: r(W - R),
    rail: rail ? { L: r(rail.left), R: r(rail.right) } : null,
    lanRail: rail ? r(rail.left - R) : null,
    heroH: heroKhoa ? r(heroKhoa.getBoundingClientRect().height) : null,
    cotChuH: cotChu ? r(cotChu.getBoundingClientRect().height) : null,
    h1Top: hopH1 ? r(hopH1.top) : null,
    h1H: hopH1 ? r(hopH1.height) : null,
    bannerDay: hopBanner ? r(hopBanner.bottom) : null,
    heroDay: heroSec ? r(heroSec.getBoundingClientRect().bottom) : null,
    sauHeroDinh: sauHero ? r(sauHero.getBoundingClientRect().top) : null,
    /* Hỏi getClientRects().length chứ không getComputedStyle: khối bệ là
       hidden md:block, ở 390 nó không có hộp nào -> phải ra null, không phải
       0 (0 làm phép trừ bên dưới in ra một con số vô nghĩa). */
    beDay: beAnh && beAnh.getClientRects().length ? r(beAnh.getBoundingClientRect().bottom) : null,
    cuonChet: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    tranNgang: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    cat: cat.slice(0, 8),
    dai,
  };
`;

const b = await dungKhung();
const ra = {};

for (const tuyen of dsTuyen) {
  console.log("\n" + tuyen);
  ra[tuyen] = {};
  for (const [W, H] of CO) {
    await b.khoKhung(W, H, W < 768);
    await b.go(GOC + tuyen);
    await cho(1500);
    const d = await b.js(DO);
    ra[tuyen][W + "x" + H] = d;

    const ten = (W + "×" + H).padEnd(10);
    const le = `lề ${String(d.leTrai).padStart(5)} / ${String(d.lePhai).padStart(5)}`;
    const rail = d.lanRail === null ? "rail —    " : `rail ${String(d.lanRail).padStart(5)}`;
    const h1 = d.h1Top === null ? "h1 —    " : `h1 ${String(d.h1Top).padStart(6)}`;
    const trong =
      d.sauHeroDinh !== null && d.beDay
        ? `trống ${String(Math.round(d.sauHeroDinh - d.beDay)).padStart(4)}`
        : "trống —   ";
    console.log(
      `  ${ten}${le}  ${rail}  ${h1}  ${trong}  cuộn ${String(d.cuonChet).padStart(5)}` +
        (d.tranNgang > 0 ? `  TRÀN ${d.tranNgang}` : "") +
        (d.cat.length ? `  CẮT ${d.cat.map((c) => c.t + "(" + c.thieu + ")").join(", ")}` : "") +
        (d.dai.length ? `  khuất ${d.dai.map((x) => x.khuat).join("/")}` : "")
    );
  }
}

fs.mkdirSync("_w-agent/do", { recursive: true });
fs.writeFileSync("_w-agent/do/can-doi.json", JSON.stringify(ra, null, 1));
console.log("\n  số liệu -> _w-agent/do/can-doi.json");
b.dong();
process.exit(0);
