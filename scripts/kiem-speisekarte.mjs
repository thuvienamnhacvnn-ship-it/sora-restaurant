/*
 * Kiểm CHẠY THẬT trang Speisekarte — bấm như khách, không phải đọc HTML.
 * Chạy: node scripts/kiem-speisekarte.mjs [url]
 *
 * Đếm HTML server trả về chỉ chứng minh lần dựng ĐẦU đúng. Mọi thứ còn lại
 * của trang này là trạng thái phía client: tab, nhóm con, chip lọc, ô tìm,
 * sắp xếp, modal, drawer. Chưa bấm thì chưa biết chúng có chạy không.
 */
import http from "node:http";
import { spawn } from "node:child_process";

const URL_GOC = process.argv[2] || "http://localhost:3160/de/speisekarte";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9421;

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

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--remote-allow-origins=*",
    "--hide-scrollbars",
    "--user-data-dir=" + process.env.TEMP + "/sora-kiem-" + Date.now(),
    "about:blank",
  ],
  { stdio: "ignore" }
);

let ver = null;
for (let i = 0; i < 200 && !ver; i++) {
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
const pend = new Map();
const loiConsole = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    loiConsole.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Runtime.exceptionThrown")
    loiConsole.push(m.params.exceptionDetails.text);
  if (pend.has(m.id)) {
    pend.get(m.id)(m);
    pend.delete(m.id);
  }
};
const cmd = (ten, tham = {}, ms = 90000) =>
  new Promise((r, j) => {
    const i = ++id;
    const h = setTimeout(() => {
      pend.delete(i);
      j(new Error(ten + " quá giờ"));
    }, ms);
    pend.set(i, (m) => {
      clearTimeout(h);
      if (m.error) j(new Error(ten + ": " + m.error.message));
      else r(m.result);
    });
    ws.send(JSON.stringify({ id: i, method: ten, params: tham }));
  });

const js = async (bieuThuc) => {
  const r = await cmd("Runtime.evaluate", {
    expression: `(() => { ${bieuThuc} })()`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await cmd("Page.enable");
await cmd("Runtime.enable");
await cmd("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
/*
 * Chờ THEO ĐIỀU KIỆN, không theo đồng hồ.
 *
 * `cho(9000)` cố định là đủ trên máy rảnh, nhưng máy này 4 nhân và thường có
 * sẵn ~67 tiến trình Chrome của Sếp. Lúc đó React chưa gắn xong trong 9 giây,
 * cú bấm rơi vào HTML tĩnh và không có gì xảy ra — bài kiểm hỏng oan. Đã thấy
 * thật ở `kiem-trang.mjs`: cùng code, một lượt 51/55, lượt sau 55/55.
 *
 * Mốc chờ ở đây là "đã có 207 thẻ món TRONG DOM", tức vừa chứng minh máy chủ
 * trả đủ dữ liệu, vừa chứng minh React đã dựng xong danh sách.
 */
/* Cùng hạn với lib dùng chung; nới bằng `KIEM_HAN_MS` khi máy đang tải nặng. */
const HAN_MAC_DINH = Number(process.env.KIEM_HAN_MS) || 60000;

const choTới = async (bieuThuc, hanMs = HAN_MAC_DINH) => {
  const hetHan = Date.now() + hanMs;
  for (;;) {
    let v = null;
    try {
      v = await js(bieuThuc);
    } catch {
      v = null; // đang điều hướng -> thử lại
    }
    if (v) return v;
    if (Date.now() > hetHan) return null;
    await cho(250);
  }
};

const choTrangSan = async () => {
  const san = await choTới(
    "return document.readyState === 'complete' &&" +
      " document.querySelectorAll('[data-so-mon] > li').length === 207 &&" +
      " [...document.querySelectorAll('button')].some(e=>" +
      "   Object.keys(e).some(k=>k.startsWith('__reactProps$')||k.startsWith('__reactFiber$')));"
  );
  if (!san) throw new Error("trang Speisekarte không sẵn sàng: " + URL_GOC);
  await cho(350); // một nhịp cho effect chạy nốt
};

await cmd("Page.navigate", { url: URL_GOC });
await choTrangSan();

/* Bấm bằng chính sự kiện của trình duyệt, không gọi hàm React trực tiếp. */
const bam = (chon, ms = 1200) =>
  js(`
    const el = [...document.querySelectorAll(${JSON.stringify(chon)})][0];
    if (!el) return "KHÔNG THẤY " + ${JSON.stringify(chon)};
    el.click();
    return "ok";
  `).then(async (v) => {
    await cho(ms);
    return v;
  });

const bamChu = (the, chu, ms = 1200) =>
  js(`
    const el = [...document.querySelectorAll(${JSON.stringify(the)})]
      .find((e) => e.textContent.trim().startsWith(${JSON.stringify(chu)}));
    if (!el) return "KHÔNG THẤY nút có chữ " + ${JSON.stringify(chu)};
    el.click();
    return "ok";
  `).then(async (v) => {
    await cho(ms);
    return v;
  });

const demThe = () =>
  js(`return document.querySelectorAll('[data-so-mon] > li').length;`);

const ketQua = [];
const ghi = (ten, dat, chiTiet = "") =>
  ketQua.push({ ten, dat, chiTiet });

// 1. dựng lần đầu
ghi("dựng lần đầu, bộ lọc Alle", (await demThe()) === 207, `${await demThe()} thẻ`);

// 2. tab danh mục
await bamChu("[role=tab]", "Sushi");
let n = await demThe();
ghi("bấm tab Sushi", n === 109, `${n} thẻ`);

// 3. nhóm con — chỉ hiện khi đã chọn danh mục
const soNhomCon = await js(
  `return document.querySelectorAll('[aria-label*="nterkategorien"] button, [aria-label*="Unterkategorien"] button').length;`
);
ghi("hiện nhóm con của Sushi", soNhomCon === 14, `${soNhomCon} nhóm con`);

await bamChu("[aria-label*='nterkategorien'] button", "Nigiri");
n = await demThe();
ghi("bấm nhóm con Nigiri", n === 10, `${n} thẻ`);

// 4. ảnh nhóm chỉ hiện ở tiêu đề nhóm con
const coAnhNhom = await js(`return !!document.querySelector('figure img');`);
ghi("ảnh nhóm hiện ở tiêu đề nhóm con", coAnhNhom === true);

// bỏ chọn nhóm con
await bamChu("[aria-label*='nterkategorien'] button", "Nigiri");

// 5. chip chế độ ăn
await bamChu("button", "Vegetarisch");
const nVeg = await demThe();
ghi("lọc Vegetarisch trong Sushi", nVeg >= 0 && nVeg <= 109, `${nVeg} thẻ`);
await bamChu("button", "Vegetarisch"); // bỏ lọc

// 6. về Alle
await bamChu("[role=tab]", "Alle");
n = await demThe();
ghi("quay lại Alle ra đủ 207", n === 207, `${n} thẻ`);

// 7. ô tìm kiếm
await js(`
  const o = document.querySelector('input[type=search]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(o, 'tempura');
  o.dispatchEvent(new Event('input', { bubbles: true }));
  return 'ok';
`);
await cho(1200);
const nTim = await demThe();
ghi("tìm 'tempura'", nTim > 0 && nTim < 207, `${nTim} thẻ`);

// 8. sắp xếp theo giá — món không giá phải xuống CUỐI, không biến mất
await js(`
  const o = document.querySelector('input[type=search]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(o, '');
  o.dispatchEvent(new Event('input', { bubbles: true }));
  const s = document.querySelector('select');
  const ss = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  ss.call(s, 'price');
  s.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok';
`);
await cho(1500);
n = await demThe();
const viTri22 = await js(`
  const ds = [...document.querySelectorAll('[data-so-mon] > li')];
  const i = ds.findIndex((li) => li.textContent.includes('Preis auf Anfrage'));
  return i < 0 ? -1 : Math.round(((i + 1) / ds.length) * 100);
`);
ghi("sắp theo giá vẫn đủ 207", n === 207, `${n} thẻ`);
ghi(
  "món không giá xuống cuối, không rụng",
  viTri22 > 90,
  viTri22 < 0 ? "KHÔNG TÌM THẤY" : `nằm ở ${viTri22}% cuối danh sách`
);

// 9. modal chi tiết món
await bam("[data-so-mon] > li button");
const modal = await js(`
  const d = document.querySelector('[role=dialog]');
  if (!d) return { mo: false };
  return {
    mo: true,
    coGiaiNghiaDiUng: /Allergene|Zusatzstoffe/.test(d.textContent),
    coNutGioHang: /Warenkorb/i.test(d.textContent),
    coNutHoiChef: /Passt das zu mir/.test(d.textContent),
  };
`);
ghi("mở modal chi tiết món", modal.mo === true);
ghi("modal giải nghĩa mã dị ứng", modal.coGiaiNghiaDiUng === true);
ghi("modal KHÔNG có nút giỏ hàng", modal.coNutGioHang === false);

// Esc đóng modal
await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await cho(900);
ghi("Esc đóng modal", (await js(`return !document.querySelector('[role=dialog]');`)) === true);

// 10. Master Chef drawer
await bamChu("button", "Master Chef fragen", 1600);
const chef = await js(`
  const d = document.querySelector('[role=dialog][aria-modal=true]');
  if (!d) return { mo: false };
  return { mo: true, coChip: /Überrasch mich/.test(d.textContent), coAriaLive: !!d.querySelector('[aria-live]') };
`);
ghi("mở drawer Master Chef", chef.mo === true);
ghi("drawer có chip gợi ý nhanh", chef.coChip === true);
ghi("drawer có vùng aria-live", chef.coAriaLive === true);

if (chef.mo) {
  await bamChu("[role=dialog] button", "Sushi", 1600);
  const goiY = await js(`
    const d = document.querySelector('[role=dialog]');
    return d ? d.querySelectorAll('article').length : -1;
  `);
  ghi("chip Sushi ra tối đa 3 thẻ gợi ý", goiY > 0 && goiY <= 3, `${goiY} thẻ`);
}

// 11. tràn ngang ở 390 với bộ lọc Alle
await cmd("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844,
  screenOrientation: { type: "portraitPrimary", angle: 0 },
});
await cmd("Page.navigate", { url: URL_GOC });
await choTrangSan();
const tran = await js(`
  const d = document.documentElement;
  return { scroll: d.scrollWidth, client: d.clientWidth, the: document.querySelectorAll('[data-so-mon] > li').length };
`);
ghi("390px: không tràn ngang", tran.scroll <= tran.client, `${tran.scroll}/${tran.client}px`);
ghi("390px: vẫn đủ 207 thẻ", tran.the === 207, `${tran.the} thẻ`);

ghi("không có lỗi console", loiConsole.length === 0, loiConsole.slice(0, 3).join(" | "));

console.log("");
let hong = 0;
for (const k of ketQua) {
  if (!k.dat) hong++;
  console.log(
    `${k.dat ? "  ĐẠT " : "  HỎNG"}  ${k.ten.padEnd(42)} ${k.chiTiet}`
  );
}
console.log(`\n${ketQua.length - hong}/${ketQua.length} đạt` + (hong ? ` — ${hong} HỎNG` : ""));

ws.close();
chrome.kill();
process.exit(hong ? 1 : 0);
