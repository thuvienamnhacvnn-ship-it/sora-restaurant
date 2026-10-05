/*
 * Trang chủ + khổ điện thoại 390 + `robots.txt`.
 *
 * Chạy:  node scripts/kiem-trang-chu.mjs [goc]
 *
 * BA PHẦN, ba lý do khác nhau:
 *
 * 1. TRANG CHỦ — chưa có bài kiểm nào, mà nó là trang nhiều người xem nhất và
 *    là chỗ duy nhất có dải danh mục + bệ 360.
 *
 * 2. KHỔ 390 — `kiem-trang.mjs` chỉ hỏi "có tràn ngang không". Câu đó quá
 *    rộng: `documentElement.scrollWidth` không bắt được một khối nhô ra mà
 *    tổ tiên của nó `overflow:hidden`, cũng không phân biệt được chỗ tràn
 *    THẬT với dải lọc CỐ Ý cho cuộn ngang. Nên ở đây dò theo từng phần tử và
 *    tự loại các khối nằm trong vùng cuộn có chủ ý.
 *
 * 3. `robots.txt` — trưởng nhóm yêu cầu, và đúng chỗ đáng lo: site đang công
 *    khai với chữ `[chờ Sếp gửi]` hiện ra. Dòng `Disallow: /` là thứ DUY NHẤT
 *    đang ngăn Google lập chỉ mục một trang dở dang của một nhà hàng có thật.
 *    Nó phụ thuộc biến môi trường `SITE_PUBLIC`, tức một lần deploy lỡ tay
 *    đặt biến đó là mất chốt chặn mà KHÔNG có dấu hiệu gì trên màn hình.
 */
import { moTrinhDuyet, soKetQua } from "./lib/trinh-duyet.mjs";

const GOC = (process.argv[2] || "http://localhost:3160").replace(/\/$/, "");

/* Dải danh mục trang chủ: 5 thẻ, số món đếm từ thực đơn in. Khai lại để nếu
   ai sửa `data/categories.json` thì bài kiểm HỎNG chứ không chạy theo. */
const DAI_DANH_MUC = [
  ["sushi", 109],
  ["vietnamese-classics", 4],
  ["suppen", 3],
  ["hauptgerichte", 13],
  ["getraenke", 63],
];

const b = await moTrinhDuyet({ port: 9453 });
const s = soKetQua();

/* ====================================================================== */
/* 1. TRANG CHỦ — khổ máy tính                                             */
/* ====================================================================== */
/*
 * MỐC từng trang — xem ghi chú dài trong `kiem-trang.mjs`. Tóm lại: chạy
 * nhiều trang một lượt thì `next dev` biên dịch route sau NGAY LÚC bài kiểm
 * đã đo, và kết quả là một loạt HỎNG GIẢ. Mốc phải là thứ cụ thể của trang,
 * không phải "có <main>" chung chung.
 */
const MOC = {
  "/de":
    "return document.querySelectorAll('a[href*=\"kategorie=\"]').length === 5 &&" +
    " !!document.querySelector('h1 img');",
  "/de/speisekarte": "return document.querySelectorAll('[data-so-mon] > li').length === 207;",
  "/de/impressum": "return !!document.querySelector('meta[name=robots]') && !!document.querySelector('h1');",
};

/** Mở trang kèm mốc. Trả `false` và ghi LỖI-K thay vì ném cho cả bộ chết. */
async function moTrang(duongDan, tenMuc) {
  try {
    await b.go(GOC + duongDan, { san: MOC[duongDan] ?? null });
    return true;
  } catch (e) {
    s.ghiLoiKiem(tenMuc ?? "mở " + duongDan, e.message.slice(0, 85));
    return false;
  }
}

s.muc("01 trang chủ · 1440");
/* Khối có NHÃN + `break`: không mở được thì bỏ qua cả mục chứ không chạy tiếp
   rồi báo một loạt HỎNG giả. `moTrang` đã ghi LỖI-K. */
trangChu: {
  if (!(await moTrang("/de", "mở trang chủ"))) break trangChu;

const dai = await b.js(
  "const ds=[...document.querySelectorAll('a[href*=\"kategorie=\"]')];" +
    "return ds.map(a=>({ href:a.getAttribute('href'), chu:a.textContent.replace(/\\s+/g,' ').trim() }));"
);
s.ghi("dải danh mục có 5 thẻ", dai.length === 5, dai.length + " thẻ");

for (const [id, soMon] of DAI_DANH_MUC) {
  const t = dai.find((x) => x.href.includes("kategorie=" + id));
  /* KHÔNG dùng `\b<số>\b`: chữ trong thẻ dính liền nhau không có dấu cách
     ("SushiSushi Selections109 Gerichte"), nên trước con số là một CHỮ CÁI và
     `\b` không khớp -> báo hỏng oan cả 5 thẻ. Bắt theo "<số> <nhãn>" thay vì
     dựa vào biên từ. */
  s.ghi("  " + id + " · link + số món",
    !!t && new RegExp(soMon + "\\s*(Gerichte|món)").test(t.chu),
    t ? t.chu.slice(-24) : "KHÔNG THẤY");
}

const cta = await b.js(
  "const ds=[...document.querySelectorAll('main a')].filter(a=>/sora-btn/.test(a.className));" +
    "return ds.slice(0,4).map(a=>({ href:a.getAttribute('href'), chu:a.textContent.trim() }));"
);
s.ghi("hai nút chính trỏ đúng trang",
  cta.some((x) => x.href.endsWith("/de/reservierung")) &&
    cta.some((x) => x.href.endsWith("/de/speisekarte")),
  cta.map((x) => x.href).join(" · "));

/* Wordmark là ảnh nét cọ, chữ thật ẩn bên trong. Trang chủ không nằm trong
   `kiem-chu-song-ngu.mjs` vì nó dùng wordmark thương hiệu chứ không dùng nhãn
   điều hướng — nhưng luật thì y nguyên: ảnh phải ẩn khỏi máy đọc, chữ thật
   phải có. */
const wm = await b.js(
  "const h=document.querySelector('h1'); if(!h) return { co:false };" +
    "const im=h.querySelector('img');" +
    "return { co:true, chu:h.textContent.trim(), alt:im?im.getAttribute('alt'):null," +
    " an:im?im.getAttribute('aria-hidden'):null, src:im?(im.getAttribute('src')||''):'' };"
);
s.ghi("h1 có chữ thật", wm.co && wm.chu.length > 0, JSON.stringify(wm.chu));
s.ghi("ảnh wordmark ẩn khỏi máy đọc", wm.alt === "" && wm.an === "true",
  "alt=" + JSON.stringify(wm.alt) + " aria-hidden=" + wm.an);

/* Bệ 360: video chưa có (Sếp gửi sau) -> phải hiện chỗ giữ, KHÔNG được hiện
   khung đen hay thẻ <video> hỏng. */
const be = await b.js(
  "const v=[...document.querySelectorAll('video')];" +
    "return { soVideo: v.length, loi: v.filter(x=>x.error!==null).length," +
    " coChoGiu: document.querySelectorAll('[data-cho-sep]').length };"
);
s.ghi("không có thẻ video lỗi", be.loi === 0, be.loi + " video lỗi / " + be.soVideo + " thẻ");
s.ghi("hero có chỗ giữ nội dung", be.coChoGiu > 0, be.coChoGiu + " chỗ");

s.ghi("không có lỗi console", b.loiConsole().length === 0, b.loiConsole().slice(0, 2).join(" | "));
} // hết khối `trangChu`

/* ====================================================================== */
/* 2. KHỔ 390 — dò theo từng phần tử                                       */
/* ====================================================================== */

/*
 * Vì sao không chỉ dùng `documentElement.scrollWidth`:
 *  - một khối nhô ra mà tổ tiên `overflow:hidden` thì scrollWidth KHÔNG tăng,
 *    nhưng nội dung vẫn bị cắt mất -> lỗi thật mà phép đo cũ báo ĐẠT;
 *  - dải lọc gallery/danh mục CỐ Ý cho cuộn ngang, nếu đếm cả chúng thì báo
 *    hỏng oan.
 * Nên: lấy mọi phần tử có mép phải vượt khung, rồi BỎ những cái nằm trong một
 * tổ tiên `overflow-x: auto|scroll` (vùng cuộn có chủ ý).
 */
const DO_NHO_RA = `
  const W = document.documentElement.clientWidth;
  const trongVungCuon = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  };
  const ra = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right <= W + 1) continue;
    if (trongVungCuon(el)) continue;
    ra.push(el.tagName.toLowerCase() +
      (el.className && typeof el.className === 'string'
        ? '.' + el.className.split(/\\s+/).slice(0, 2).join('.') : '') +
      ' nhô ' + Math.round(r.right - W) + 'px');
  }
  return { W, scroll: document.documentElement.scrollWidth, nhoRa: [...new Set(ra)].slice(0, 6) };
`;

/*
 * Chữ bị CẮT NGOÀI Ý MUỐN: phần tử `overflow:hidden` mà nội dung cao hơn
 * khung. Phải loại hai thứ CỐ TÌNH bị cắt, không thì báo hỏng oan:
 *
 *  1. `sr-only` — chữ chỉ dành cho máy đọc màn hình, co về 1px và cắt sạch
 *     là ĐÚNG kỹ thuật. Lượt đầu nó báo `"SoRa" cắt 9px` và
 *     `"Kategorien" cắt 25px` — cả hai đều là chữ ẩn hợp lệ.
 *  2. `-webkit-line-clamp` — rút gọn mô tả món về 2 dòng là quyết định thiết
 *     kế, không phải lỗi. Lượt đầu nó báo 4 dòng mô tả món.
 *
 * Phép đo này chỉ bắt chữ bị XÉN. Nó KHÔNG bắt được chữ ngắt giữa từ
 * ("Süßkart/offelpomm/es") — thứ đó phải nhìn ảnh chụp. Đừng tin bài kiểm
 * này là đủ cho chuyện chữ xấu.
 */
const DO_CHU_BI_CAT = `
  const ra = [];
  const anKyThuat = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return true;          // sr-only co về 1px
    const c = getComputedStyle(el);
    if (c.clip === 'rect(0px, 0px, 0px, 0px)') return true;  // sr-only kiểu cũ
    if (/inset\\(50%\\)/.test(c.clipPath)) return true;        // sr-only kiểu mới
    return false;
  };
  for (const el of document.querySelectorAll('main *')) {
    const c = getComputedStyle(el);
    if (c.overflow !== 'hidden' && c.overflowY !== 'hidden') continue;
    if (el.children.length > 0) continue;            // chỉ xét lá mang chữ
    if (!el.textContent.trim()) continue;
    if (anKyThuat(el)) continue;
    // rút gọn số dòng là có chủ ý
    if (c.webkitLineClamp && c.webkitLineClamp !== 'none') continue;
    if (el.closest('[class*="line-clamp"]')) continue;
    if (el.scrollHeight > el.clientHeight + 2) {
      ra.push(JSON.stringify(el.textContent.trim().slice(0, 34)) +
        ' cắt ' + (el.scrollHeight - el.clientHeight) + 'px');
    }
  }
  return [...new Set(ra)].slice(0, 6);
`;

for (const [ten, duongDan] of [
  ["trang chủ", "/de"],
  ["Speisekarte", "/de/speisekarte"],
]) {
  s.muc(ten + " · 390");
  await b.khoKhung(390, 844, true);
  /* Mốc ở khổ 390 KHÁC khổ máy tính: trang chủ ở 390 chuyển dải danh mục
     xuống 2 cột và đưa bệ 360 xuống dưới hero, nên mốc là "có đủ 3 bệ". */
  const moc390 =
    duongDan === "/de"
      ? "return document.querySelectorAll('[data-be-360]').length === 3 &&" +
        " document.querySelectorAll('a[href*=\"kategorie=\"]').length === 5;"
      : MOC[duongDan] ?? null;
  const san390 = await b
    .go(GOC + duongDan, { san: moc390 })
    .then(() => true)
    .catch((e) => {
      s.ghiLoiKiem(ten + " · 390: mở trang", e.message.slice(0, 85));
      return false;
    });
  if (!san390) continue;

  const t = await b.js(DO_NHO_RA);
  s.ghi("không khối nào nhô khỏi khung", t.nhoRa.length === 0,
    t.nhoRa.length ? t.nhoRa.join("  ·  ") : t.scroll + "/" + t.W + "px");

  const cat = await b.js(DO_CHU_BI_CAT);
  s.ghi("không có chữ bị cắt", cat.length === 0, cat.length ? cat.join("  ·  ") : "sạch");

  // Nút bấm phải đủ to cho ngón tay (WCAG 2.5.8: tối thiểu 24×24).
  const nut = await b.js(
    "const ra=[];" +
      "for (const el of document.querySelectorAll('main a, main button, nav a, nav button')) {" +
      "  const r=el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;" +
      "  if (r.width < 24 || r.height < 24) ra.push(el.tagName.toLowerCase()+' '+Math.round(r.width)+'x'+Math.round(r.height)+' '+JSON.stringify((el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,20)));" +
      "}" +
      "return [...new Set(ra)].slice(0,6);"
  );
  s.ghi("nút bấm không nhỏ hơn 24×24", nut.length === 0, nut.length ? nut.join(" · ") : "sạch");

  s.ghi("không có lỗi console", b.loiConsole().length === 0, b.loiConsole().slice(0, 2).join(" | "));
}

/* Khổ 390 riêng của trang chủ: bệ 360 phải CHUYỂN XUỐNG dưới hero (khối
   `md:hidden`), không phải nằm chồng trong hero như khổ máy tính. */
await b.khoKhung(390, 844, true);
const san390ChuBe = await b
  .go(GOC + "/de", {
    san: "return document.querySelectorAll('[data-be-360]').length === 3;",
  })
  .then(() => true)
  .catch((e) => {
    s.ghiLoiKiem("390: cả 3 bệ 360 nằm dưới hero", e.message.slice(0, 85));
    s.ghiLoiKiem("390: dải danh mục xuống 2 cột", "không mở được trang");
    return false;
  });
be360: if (san390ChuBe) {
/* Dò theo `[data-be-360]`, KHÔNG theo `video`: chưa có tệp WebM nên component
   không sinh thẻ <video> nào, và lượt đầu mục này "đạt" với 0 vật thể — tức
   không kiểm gì cả. Mục kiểm đạt rỗng còn tệ hơn không có mục kiểm, vì nó làm
   người đọc tin là đã kiểm. */
const be390 = await b.js(
  "const h1=document.querySelector('h1');" +
    "const v=[...document.querySelectorAll('[data-be-360]')].filter(e=>e.getBoundingClientRect().height>0);" +
    "if (!h1) return { so: v.length, duoiHero: null };" +
    "const yH=h1.getBoundingClientRect().bottom;" +
    "return { so: v.length, duoiHero: v.length>0 && v.every(e=>e.getBoundingClientRect().top > yH) };"
);
s.ghi("390: cả 3 bệ 360 nằm dưới hero",
  be390.so === 3 && be390.duoiHero === true,
  be390.so + " vật thể, dướiHero=" + be390.duoiHero);

const dai390 = await b.js(
  "const ul=[...document.querySelectorAll('ul')].find(u=>u.querySelector('a[href*=\"kategorie=\"]'));" +
    "if(!ul) return { co:false };" +
    "return { co:true, cot: getComputedStyle(ul).gridTemplateColumns.split(' ').length };"
);
s.ghi("390: dải danh mục xuống 2 cột", dai390.co && dai390.cot === 2,
  dai390.co ? dai390.cot + " cột" : "KHÔNG THẤY");
} // hết khối `be360`

/* ====================================================================== */
/* 3. robots.txt — chốt chặn duy nhất khi site còn chữ giữ chỗ             */
/* ====================================================================== */
s.muc("robots.txt + sitemap");
await b.khoKhung(1440, 900);

const robots = await b.js(
  "return fetch('/robots.txt').then(r=>r.text().then(t=>({ ma:r.status, noi:t })));"
);
s.ghi("robots.txt trả 200", robots.ma === 200, "HTTP " + robots.ma);
s.ghi("robots.txt CHẶN toàn site",
  /User-?Agent:\s*\*/i.test(robots.noi) && /^\s*Disallow:\s*\/\s*$/im.test(robots.noi),
  JSON.stringify(robots.noi.replace(/\n/g, " ⏎ ").slice(0, 70)));
/* Có `Allow: /` nghĩa là `SITE_PUBLIC=1` đã bị đặt — mất chốt chặn.
   Phải neo đầu dòng: chuỗi "Disallow" CHỨA "allow", nên `/Allow/i` trần luôn
   khớp và dòng chi tiết báo ngược hẳn kết luận. (Lượt đầu nó in "CÓ DÒNG
   ALLOW" ngay cạnh chữ ĐẠT — vô lý mà dễ bỏ qua.) */
const coAllow = /^\s*Allow:\s*\//im.test(robots.noi);
s.ghi("robots.txt KHÔNG mở cho lập chỉ mục", !coAllow,
  coAllow ? "CÓ DÒNG ALLOW — SITE_PUBLIC đã bị đặt?" : "không có dòng Allow");
// Khi còn chặn thì đừng mời bot đọc sitemap.
s.ghi("chưa khai sitemap trong robots.txt",
  !/Sitemap:/i.test(robots.noi),
  /Sitemap:/i.test(robots.noi) ? "CÓ khai sitemap" : "không khai");

/* Trang pháp lý còn rỗng -> phải có `noindex` riêng ở thẻ meta, không chỉ
   dựa vào robots.txt (robots.txt ngăn THU THẬP, không ngăn một URL đã biết
   xuất hiện trong kết quả tìm kiếm). */
if (await moTrang("/de/impressum", "trang Impressum có meta noindex")) {
  const phapLy = await b.js(
    "const m=document.querySelector('meta[name=robots]');" +
      "return m ? m.getAttribute('content') : 'KHÔNG CÓ';"
  );
  s.ghi("trang Impressum có meta noindex", /noindex/i.test(phapLy), phapLy);
}

const kq = s.in();
console.log("\n  gốc: " + GOC);
b.dong();
process.exit(kq.ma);
