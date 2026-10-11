/*
 * Kiểm CHẠY THẬT trang Speisekarte — bấm như khách, không phải đọc HTML.
 * Chạy: node scripts/kiem-speisekarte.mjs [url]
 *
 * Đếm HTML server trả về chỉ chứng minh lần dựng ĐẦU đúng. Mọi thứ còn lại
 * của trang này là trạng thái phía client: tab, thẻ danh mục, nhóm con, chip
 * lọc, ô tìm, sắp xếp, hộp chi tiết, drawer, nút Back. Chưa bấm thì chưa biết
 * chúng có chạy không. Chạy cả /de lẫn /vi (bản /vi suy từ URL /de/).
 */
import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { congTrong, luoiMa3, veMa3 } from "./lib/trinh-duyet.mjs";

/* Mọi ngoại lệ lọt ra ngoài phải mang mã 3 (bài kiểm không chạy được), KHÔNG
   mang mã 1 (trang sai). Trước đây khâu mở trình duyệt nằm ngoài mọi vùng bắt
   lỗi: Chrome không mở được là script chết mang mã 1, tức tự khai web sai
   trong khi chưa đo một thứ gì. */
luoiMa3();

const URL_GOC = process.argv[2] || "http://localhost:3160/de/speisekarte";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

/* KHÔNG ghim cổng. Cổng cố định là tài nguyên dùng chung giữa các lượt chạy:
   Chrome của lượt trước còn giữ cổng thì lượt sau mở không được. Đã phải dọn
   Chrome kẹt bằng tay vì chuyện này. */
const PORT = await congTrong().catch(veMa3("không xin được cổng trống"));

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

/* Hồ sơ RIÊNG mỗi lượt. `Date.now()` một mình là chưa đủ — hai lượt khởi động
   trong cùng một milli-giây sẽ dùng chung hồ sơ, và Chrome dùng chung hồ sơ
   thì phục vụ bản đã đệm. `process.env.TEMP` cũng rỗng trên Linux. */
const HO_SO = path.join(
  os.tmpdir(),
  "sora-kiem-mon-" + Date.now() + "-" + process.pid + "-" + Math.random().toString(36).slice(2, 8)
);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=" + PORT,
    "--remote-allow-origins=*",
    "--hide-scrollbars",
    "--user-data-dir=" + HO_SO,
    "about:blank",
  ],
  { stdio: "ignore" }
);

/* Đóng Chrome kể cả khi ném lỗi hoặc thoát giữa đường. */
process.once("exit", () => {
  try {
    chrome.kill();
  } catch {
    /* đã chết */
  }
  try {
    fs.rmSync(HO_SO, { recursive: true, force: true });
  } catch {
    /* Chrome còn giữ tệp -> để hệ điều hành dọn thư mục tạm */
  }
});

let ver = null;
for (let i = 0; i < 200 && !ver; i++) {
  try {
    ver = await get("/json/version");
  } catch {
    await cho(300);
  }
}
if (!ver) veMa3("Chrome không lên")(new Error("không nối được CDP ở cổng " + PORT));

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
      " document.querySelectorAll('[data-so-mon] li[data-mon]').length === 207 &&" +
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

/*
 * ---- CẤU TRÚC TRANG TỪ 07/10 (làm lại theo lời Sếp) ----
 * Trang chia ba chế độ: TỔNG QUAN (tab Alle) · MỘT NHÓM · TÌM/LỌC.
 * Lệnh "đủ 207 món" giữ bằng cách dựng SẴN cả 8 bảng nhóm trong DOM, bảng
 * không xem thì `hidden`. Nên có HAI phép đếm khác nghĩa, đừng lẫn:
 *   demDom()   mọi `li[data-mon]` trong DOM  -> luôn phải 207
 *   demHien()  `li[data-mon]` đang THẤY      -> số món của bảng đang mở
 * Thẻ nổi bật và kết quả tìm là bản hiển thị thứ hai của một món, mang
 * `data-mon-phu`, không tính vào 207.
 */
const HIEN = "(e) => e.getClientRects().length > 0";

const demDom = () =>
  js(`return document.querySelectorAll('[data-so-mon] li[data-mon]').length;`);

const demHien = () =>
  js(`return [...document.querySelectorAll('[data-so-mon] li[data-mon]')].filter(${HIEN}).length;`);

const demKetQua = () =>
  js(`return [...document.querySelectorAll('[data-ket-qua-ds] li')].filter(${HIEN}).length;`);

/* Bấm phần tử ĐANG THẤY đầu tiên khớp bộ chọn (8 bảng nhóm cùng nằm trong DOM,
   `querySelector` trần sẽ vớ phải nút của bảng đang ẩn). */
const bamHien = (chon, ms = 1000) =>
  js(`
    const el = [...document.querySelectorAll(${JSON.stringify(chon)})].find(${HIEN});
    if (!el) return "KHÔNG THẤY " + ${JSON.stringify(chon)};
    // Chuột thật bấm nút thì nút nhận focus; el.click() thì không. Phải tự
    // focus, không thì phép thử "đóng hộp trả focus về nút" hỏng oan.
    el.focus();
    el.click();
    return "ok";
  `).then(async (v) => {
    await cho(ms);
    return v;
  });

const bamChuHien = (the, chu, ms = 1000) =>
  js(`
    const el = [...document.querySelectorAll(${JSON.stringify(the)})]
      .filter(${HIEN})
      .find((e) => e.textContent.trim().startsWith(${JSON.stringify(chu)}));
    if (!el) return "KHÔNG THẤY nút có chữ " + ${JSON.stringify(chu)};
    el.click();
    return "ok";
  `).then(async (v) => {
    await cho(ms);
    return v;
  });

const go = async (chu, ms = 1100) => {
  await js(`
    const o = document.querySelector('input[type=search]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(o, ${JSON.stringify(chu)});
    o.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok';
  `);
  await cho(ms);
};

const phim = async (key, code, vk, ms = 700) => {
  await cmd("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
  await cmd("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
  await cho(ms);
};

const luiLai = async () => {
  await js(`history.back(); return 'ok';`);
  await cho(1200);
};

const diaChi = () => js(`return location.search;`);
const hopMo = () => js(`return !!document.querySelector('dialog[open]');`);

const ketQua = [];
const ghi = (ten, dat, chiTiet = "") => ketQua.push({ ten, dat, chiTiet });

/* ===== 1. TỔNG QUAN ===== */
ghi("HTML/DOM có đủ 207 món", (await demDom()) === 207, `${await demDom()} món`);
const tq = await js(`
  const hien = ${HIEN};
  return {
    chef: [...document.querySelectorAll('[data-chef]')].filter(hien).length,
    danhMuc: [...document.querySelectorAll('[data-danh-muc]')].filter(hien).length,
    noiBat: [...document.querySelectorAll('#bang-alle li[data-mon-phu]')].filter(hien).length,
    chip: [...document.querySelectorAll('[aria-label="Ernährung"] button')].map((e) => e.textContent.trim()),
    select: document.querySelectorAll('select').length,
    tim: document.querySelectorAll('input[type=search]').length,
    tab: document.querySelectorAll('[role=tab]').length,
  };
`);
ghi("tổng quan: có băng Chef Empfehlung", tq.chef === 1);
ghi("tổng quan: 8 thẻ danh mục", tq.danhMuc === 8, `${tq.danhMuc} thẻ`);
ghi("tổng quan: khối Beliebte có món", tq.noiBat >= 3, `${tq.noiBat} thẻ`);
ghi("tổng quan: chưa mở bảng nhóm nào", (await demHien()) === 0, `${await demHien()} món đang thấy`);
ghi("chip chế độ ăn: chỉ chip có món (không Vegan/Glutenfrei)",
  tq.chip.join("|") === "Vegetarisch|Scharf", tq.chip.join("|"));
ghi("một ô tìm, 9 tab, không ô sắp xếp ở tổng quan",
  tq.tim === 1 && tq.tab === 9 && tq.select === 0, JSON.stringify(tq).slice(0, 60));

/* Ảnh không nhỏ và không bị phóng quá cỡ gốc (màn thường, DPR 1). */
/*
 * Cỡ GỐC lấy từ data/menu-image-sizes.json, KHÔNG lấy `img.naturalWidth`:
 * ảnh qua next/image có srcset, `naturalWidth` là cỡ đã chia mật độ của ứng
 * viên được chọn (ảnh 380px khai 640w cho ô 400px -> báo 237), đem so là báo
 * "phóng to" oan cho ảnh đang hiện đúng cỡ.
 */
const CO_GOC = JSON.parse(
  fs.readFileSync(new URL("../data/menu-image-sizes.json", import.meta.url), "utf8")
);
const TEP_ANH =
  "(i) => { try { const u = new URL(i.currentSrc || i.src); return u.searchParams.get('url') || u.pathname; } catch { return ''; } }";
const gocCua = (tep) => (CO_GOC[tep] ? CO_GOC[tep][0] : 0);

const doAnh = async (goc) => {
  const ds = await js(`
    const tep = ${TEP_ANH};
    return [...document.querySelectorAll(${JSON.stringify(goc)} + ' img')].filter(${HIEN})
      .map((i) => ({ w: Math.round(i.getBoundingClientRect().width), tep: tep(i) }));
  `);
  const r = ds.map((x) => ({ w: x.w, n: gocCua(x.tep) }));
  return {
    so: r.length,
    nhoNhat: Math.min(...r.map((x) => x.w)),
    phong: r.filter((x) => x.n > 0 && x.w > x.n + 1).length,
    khongRoGoc: r.filter((x) => x.n === 0).length,
  };
};

/* ===== 2. MỘT NHÓM — món ăn ===== */
const SO_MON = {
  suppen: 3, vorspeisen: 8, salate: 4, hauptgerichte: 13,
  "vietnamese-classics": 4, desserts: 3,
};
for (const [id, so] of Object.entries(SO_MON)) {
  await bam(`#tab-${id}`, 900);
  const n = await demHien();
  ghi(`tab ${id}: thấy ${so} món`, n === so, `${n} món`);
}
ghi("đổi tab ghi lên URL (?kategorie=)", (await diaChi()) === "?kategorie=desserts", await diaChi());

await bam("#tab-hauptgerichte", 1500);
const anhMon = await doAnh("#bang-hauptgerichte li[data-mon]");
ghi("ảnh món LỚN (≥ 190px ở 1440, bản cũ 56px)",
  anhMon.so === 12 && anhMon.khongRoGoc === 0 && anhMon.nhoNhat >= 190, JSON.stringify(anhMon));
ghi("ảnh món không bị phóng quá cỡ gốc", anhMon.phong === 0, `${anhMon.phong} ảnh bị phóng`);
const khongAnh = await js(`
  const li = document.querySelector('li[data-mon="31-tokyo-fly"]');
  return li ? { thay: li.getClientRects().length > 0, anh: li.querySelectorAll('img').length } : null;
`);
ghi("món không ảnh (31 Tokyo Fly) vẫn hiện, không ô ảnh giữ chỗ",
  khongAnh && khongAnh.thay && khongAnh.anh === 0, JSON.stringify(khongAnh));

/* ===== 2b. MỘT NHÓM — sushi / đồ uống ===== */
await bam("#tab-sushi", 1200);
const sushi1 = await js(`
  const hien = ${HIEN};
  return {
    the: [...document.querySelectorAll('#bang-sushi [data-nhom-con]')].filter(hien).length,
    dom: document.querySelectorAll('#bang-sushi li[data-mon]').length,
  };
`);
ghi("Sushi: 14 thẻ nhóm con", sushi1.the === 14, `${sushi1.the} thẻ`);
ghi("Sushi: đủ 109 món trong DOM", sushi1.dom === 109, `${sushi1.dom} món`);
const uong = await js(`return document.querySelectorAll('#bang-getraenke li[data-mon]').length;`);
ghi("Getränke: đủ 63 món trong DOM", uong === 63, `${uong} món`);

await bam("[data-nhom-con=nigiri]", 1200);
ghi("bấm thẻ Nigiri: thấy 10 món", (await demHien()) === 10, `${await demHien()} món`);
ghi("nhóm con ghi lên URL (&gruppe=)",
  (await diaChi()) === "?kategorie=sushi&gruppe=nigiri", await diaChi());
const nhomCon = await js(`
  const hien = ${HIEN};
  const nut = [...document.querySelectorAll('[aria-label="Unterkategorien"] button')].filter(hien);
  const anh = [...document.querySelectorAll('#bang-sushi figure img')].filter(hien);
  const tep = ${TEP_ANH};
  return { nut: nut.length, anh: anh.length, rong: anh[0] ? Math.round(anh[0].getBoundingClientRect().width) : 0, tep: anh[0] ? tep(anh[0]) : '' };
`);
nhomCon.goc = gocCua(nhomCon.tep);
ghi("hàng chip nhóm con: 14 nhóm + nút quay lại", nhomCon.nut === 15, `${nhomCon.nut} nút`);
ghi("ảnh nhóm lớn hiện cạnh bảng, không phóng quá cỡ gốc",
  nhomCon.anh === 1 && nhomCon.goc > 0 && nhomCon.rong >= 300 && nhomCon.rong <= nhomCon.goc + 1, JSON.stringify(nhomCon));

await bamChuHien("[aria-label='Unterkategorien'] button", "Maki", 1200);
ghi("bấm chip Maki: thấy 18 món", (await demHien()) === 18, `${await demHien()} món`);

/* ===== Nút Back ===== */
await luiLai();
ghi("Back: về Nigiri (10 món)", (await demHien()) === 10, `${await demHien()} món · ${await diaChi()}`);
await luiLai();
const veThe = await js(`return [...document.querySelectorAll('#bang-sushi [data-nhom-con]')].filter(${HIEN}).length;`);
ghi("Back: về lưới 14 thẻ nhóm con", veThe === 14, `${veThe} thẻ · ${await diaChi()}`);
await luiLai();
ghi("Back: về tab Hauptgerichte", (await demHien()) === 13, `${await demHien()} món · ${await diaChi()}`);
ghi("Back không tải lại trang (vẫn đủ 207 món, React còn sống)",
  (await demDom()) === 207 && (await bam("#tab-alle", 900)) === "ok");

/* ===== Thẻ danh mục -> đúng tab ===== */
await bam("[data-danh-muc=getraenke]", 1200);
const sauThe = await js(`
  return {
    tab: document.querySelector('#tab-getraenke').getAttribute('aria-selected'),
    the: [...document.querySelectorAll('#bang-getraenke [data-nhom-con]')].filter(${HIEN}).length,
    url: location.search,
  };
`);
ghi("thẻ danh mục Getränke mở đúng tab (13 nhóm con)",
  sauThe.tab === "true" && sauThe.the === 13 && sauThe.url === "?kategorie=getraenke", JSON.stringify(sauThe));

/* ===== 3. TÌM / LỌC ===== */
await bam("#tab-alle", 900);
for (const tu of ["pho", "lachs", "tempura"]) {
  await go(tu);
  const n = await demKetQua();
  ghi(`tìm '${tu}'`, n > 0 && n < 207, `${n} món`);
}
ghi("đang tìm: 207 món vẫn nằm trong DOM", (await demDom()) === 207);

/* sắp theo giá — món không giá (nr 22) phải xuống CUỐI, không biến mất */
await go("bun");
const truocSap = await demKetQua();
await js(`
  const s = document.querySelector('select');
  const ss = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  ss.call(s, 'price');
  s.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok';
`);
await cho(1000);
const sap = await js(`
  const ds = [...document.querySelectorAll('[data-ket-qua-ds] li')];
  return { so: ds.length, cuoi: ds.length ? ds[ds.length - 1].textContent.includes('Preis auf Anfrage') : false };
`);
ghi("sắp theo giá không rụng món", sap.so === truocSap && sap.so > 1, `${truocSap} -> ${sap.so}`);
ghi("món không giá xuống cuối", sap.cuoi === true);

/* không có kết quả -> thông báo + nút xoá lọc */
await go("xyzqq");
const rong = await js(`
  const r = document.querySelector('[role=status]');
  return r ? { thay: r.getClientRects().length > 0, chu: r.textContent.slice(0, 60), nut: r.querySelectorAll('button').length } : null;
`);
ghi("từ không có: hiện thông báo + nút", rong && rong.thay && rong.nut >= 1, JSON.stringify(rong));
await bamChuHien("[role=status] button", "Filter zurücksetzen", 1000);
const sauXoa = await js(`return { o: document.querySelector('input[type=search]').value, chef: document.querySelectorAll('[data-chef]').length };`);
ghi("nút xoá lọc: ô tìm rỗng, về tổng quan", sauXoa.o === "" && sauXoa.chef === 1, JSON.stringify(sauXoa));

/* chip chế độ ăn */
await bamChuHien("[aria-label='Ernährung'] button", "Vegetarisch");
const nVeg = await demKetQua();
ghi("lọc Vegetarisch: 10 món", nVeg === 10, `${nVeg} món`);
await bam("#tab-sushi", 1000);
const nVegSushi = await demKetQua();
ghi("lọc Vegetarisch trong Sushi: ít hơn, > 0", nVegSushi > 0 && nVegSushi < nVeg, `${nVegSushi} món`);
await bamChuHien("[aria-label='Ernährung'] button", "Vegetarisch"); // bỏ lọc

/* tìm trong nhóm không có, nhóm khác có -> mời tìm khắp */
await bam("#tab-desserts", 900);
await go("lachs");
const moi = await bamChuHien("[role=status] button", "In allen Kategorien suchen", 1000);
ghi("0 kết quả trong nhóm: có nút tìm khắp các nhóm", moi === "ok" && (await demKetQua()) > 0, moi);
await go("");

/* ===== Cỡ điều khiển ===== */
const co = await js(`
  const hien = ${HIEN};
  const cao = (q) => [...document.querySelectorAll(q)].filter(hien).map((e) => Math.round(e.getBoundingClientRect().height));
  return {
    tim: cao('input[type=search]')[0],
    tab: Math.min(...cao('[role=tab]')),
    chip: Math.min(...cao('[aria-label="Ernährung"] button')),
  };
`);
ghi("ô tìm ≥ 44px, tab/chip ≥ 40px", co.tim >= 44 && co.tab >= 40 && co.chip >= 40, JSON.stringify(co));

/* ===== Bàn phím ===== */
await js(`document.querySelector('input[type=search]').focus(); return 'ok';`);
await phim("Tab", "Tab", 9, 400);
const f1 = await js(`const a = document.activeElement; return a.getAttribute('role') + ':' + a.textContent.trim();`);
await phim("Tab", "Tab", 9, 400);
const f2 = await js(`
  const a = document.activeElement;
  const k = getComputedStyle(a);
  return { ai: a.getAttribute('role') + ':' + a.textContent.trim(), vien: k.outlineStyle + ' ' + k.outlineWidth };
`);
ghi("phím Tab đi từ ô tìm qua từng tab", f1.startsWith("tab:") && f2.ai.startsWith("tab:") && f1 !== f2.ai, `${f1} -> ${f2.ai}`);
ghi("tab đang focus có vòng focus", /solid/.test(f2.vien) && !/^solid 0/.test(f2.vien), f2.vien);

/* ===== Hộp chi tiết món ===== */
await bam("#tab-suppen", 1000);
await bamHien("#bang-suppen li[data-mon] button", 1400);
const hop = await js(`
  const d = document.querySelector('dialog[open]');
  if (!d) return { mo: false };
  const i = d.querySelector('img');
  return {
    mo: true,
    anh: i ? Math.round(i.getBoundingClientRect().width) : 0,
    tep: i ? (${TEP_ANH})(i) : '',
    coBienThe: /Varianten/.test(d.textContent),
    coNutGioHang: /Warenkorb/i.test(d.textContent),
    coNutHoiChef: /Passt das zu mir/.test(d.textContent),
    focusTrong: d.contains(document.activeElement),
  };
`);
ghi("mở hộp chi tiết món (dialog gốc)", hop.mo === true);
hop.goc = gocCua(hop.tep);
ghi("hộp có ảnh LỚN, không phóng quá cỡ gốc",
  hop.goc > 0 && hop.anh >= 300 && hop.anh <= hop.goc + 1, `${hop.anh}px / gốc ${hop.goc}px`);
ghi("hộp có biến thể + nút hỏi Chef", hop.coBienThe === true && hop.coNutHoiChef === true);
ghi("hộp KHÔNG có nút giỏ hàng", hop.coNutGioHang === false);
ghi("focus nằm trong hộp", hop.focusTrong === true);

await phim("Escape", "Escape", 27, 900);
ghi("Esc đóng hộp", (await hopMo()) === false);
const veNut = await js(`const a = document.activeElement; return !!(a && a.closest('li[data-mon]'));`);
ghi("đóng hộp: focus về lại thẻ món vừa bấm", veNut === true);

/* bấm ra nền */
await bamHien("#bang-suppen li[data-mon] button", 1200);
await cmd("Input.dispatchMouseEvent", { type: "mousePressed", x: 6, y: 6, button: "left", clickCount: 1 });
await cmd("Input.dispatchMouseEvent", { type: "mouseReleased", x: 6, y: 6, button: "left", clickCount: 1 });
await cho(900);
ghi("bấm ra nền đóng hộp", (await hopMo()) === false);

/* món sushi: không ảnh riêng -> hộp không có ô ảnh; mã dị ứng được giải nghĩa */
await bam("#tab-sushi", 900);
await bam("[data-nhom-con=nigiri]", 1000);
await bamHien("#bang-sushi li[data-mon] button", 1300);
const hopSushi = await js(`
  const d = document.querySelector('dialog[open]');
  if (!d) return { mo: false };
  return { mo: true, anh: d.querySelectorAll('img').length, diUng: /Allergene|Zusatzstoffe/.test(d.textContent) };
`);
ghi("món không ảnh: hộp không dựng ô ảnh", hopSushi.mo && hopSushi.anh === 0, JSON.stringify(hopSushi));
ghi("hộp giải nghĩa mã dị ứng", hopSushi.diUng === true);

/* hỏi Chef từ trong hộp: hộp phải đóng, ngăn kéo mở và bấm được */
await bamChuHien("dialog[open] button", "Passt das zu mir", 1600);
const tuHop = await js(`
  return { hop: !!document.querySelector('dialog[open]'), chef: !!document.querySelector('[role=dialog][aria-modal=true]') };
`);
ghi("hỏi Chef từ hộp: hộp đóng, ngăn kéo mở", tuHop.hop === false && tuHop.chef === true, JSON.stringify(tuHop));
await phim("Escape", "Escape", 27, 1000);

/* ===== Master Chef theo nhóm ===== */
await bamChuHien("button", "Master Chef fragen", 1600);
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

/* ===== Link sâu ===== */
await cmd("Page.navigate", { url: URL_GOC + "?kategorie=sushi&gruppe=maki" });
await choTrangSan();
ghi("link ?kategorie=sushi&gruppe=maki mở thẳng Maki (18 món)", (await demHien()) === 18, `${await demHien()} món`);
await cmd("Page.navigate", { url: URL_GOC + "?dish=30-bo-luc-lac" });
await choTrangSan();
await cho(600);
ghi("link ?dish=… mở thẳng hộp chi tiết", (await hopMo()) === true);

/* ===== Điện thoại 390 ===== */
await cmd("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844,
  screenOrientation: { type: "portraitPrimary", angle: 0 },
});
const tran390 = async (nhan, url) => {
  await cmd("Page.navigate", { url });
  await choTrangSan();
  const t = await js(`
    const d = document.documentElement;
    return { scroll: d.scrollWidth, client: d.clientWidth, dom: document.querySelectorAll('[data-so-mon] li[data-mon]').length };
  `);
  ghi(`390px ${nhan}: không tràn ngang`, t.scroll <= t.client, `${t.scroll}/${t.client}px`);
  return t;
};
const t390 = await tran390("tổng quan", URL_GOC);
ghi("390px: vẫn đủ 207 món", t390.dom === 207, `${t390.dom} món`);
const dinh = await js(`
  const o = document.querySelector('input[type=search]').closest('label').parentElement;
  return { cao: Math.round(o.getBoundingClientRect().height), kieu: getComputedStyle(o).position };
`);
ghi("390px: thanh dính gọn (≤ 112px, bản cũ 260px)", dinh.kieu === "sticky" && dinh.cao <= 112, JSON.stringify(dinh));
await tran390("Hauptgerichte", URL_GOC + "?kategorie=hauptgerichte");
const anh390 = await doAnh("#bang-hauptgerichte li[data-mon]");
ghi("390px: ảnh món ≥ 120px (bản cũ 48px)", anh390.nhoNhat >= 120, JSON.stringify(anh390));
await tran390("Sushi", URL_GOC + "?kategorie=sushi");
await tran390("Sushi · Inside Out", URL_GOC + "?kategorie=sushi&gruppe=inside-out");
await tran390("Getränke · Fruchtsäfte", URL_GOC + "?kategorie=getraenke&gruppe=fruchtsaefte");

/* ===== Bản tiếng Việt ===== */
if (URL_GOC.includes("/de/")) {
  const URL_VI = URL_GOC.replace("/de/", "/vi/");
  const tvi = await tran390("/vi tổng quan", URL_VI);
  ghi("/vi: đủ 207 món", tvi.dom === 207, `${tvi.dom} món`);
  await tran390("/vi Món chính", URL_VI + "?kategorie=hauptgerichte");
  const vi = await js(`
    const tab = [...document.querySelectorAll('[role=tab]')].map((e) => e.textContent.trim());
    return {
      tab: tab.join('|'),
      langDe: document.querySelectorAll('[data-so-mon] li[data-mon] [lang=de]').length,
      mienTru: /Giá tính bằng Euro/.test(document.body.textContent),
      mienTruDe: /Alle Preisangaben in Euro/.test(document.body.textContent),
      thieuKhoa: /⟨[a-zA-Z.]+⟩/.test(document.body.textContent),
    };
  `);
  ghi("/vi: nhãn tab tiếng Việt", vi.tab.startsWith("Tất cả|Súp|Khai vị"), vi.tab.slice(0, 60));
  ghi("/vi: tên món không còn bọc lang=de", vi.langDe === 0, `${vi.langDe} thẻ`);
  ghi("/vi: câu miễn trừ theo ngôn ngữ", vi.mienTru === true && vi.mienTruDe === false);
  ghi("/vi: không thiếu khoá i18n", vi.thieuKhoa === false);
  await tran390("/vi Sushi · Set", URL_VI + "?kategorie=sushi&gruppe=sushi-menu-for-one");
}

ghi("không có lỗi console", loiConsole.length === 0, loiConsole.slice(0, 3).join(" | "));

console.log("");
let hong = 0;
for (const k of ketQua) {
  if (!k.dat) hong++;
  console.log(
    `${k.dat ? "  ĐẠT " : "  HỎNG"}  ${k.ten.padEnd(54)} ${k.chiTiet}`
  );
}
console.log(`\n${ketQua.length - hong}/${ketQua.length} đạt` + (hong ? ` — ${hong} HỎNG` : ""));

ws.close();
chrome.kill();
process.exit(hong ? 1 : 0);
