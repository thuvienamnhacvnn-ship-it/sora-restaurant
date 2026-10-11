/*
 * Kiểm CHẠY THẬT bốn trang chưa có bài kiểm nào: Reservierung, Kontakt,
 * Galerie, Über uns. Bổ sung cho `kiem-speisekarte.mjs` (trang thứ năm).
 *
 * Chạy:  node scripts/kiem-trang.mjs [goc] [ten-trang...]
 *   node scripts/kiem-trang.mjs
 *   node scripts/kiem-trang.mjs https://sora.57-129-45-199.sslip.io
 *   node scripts/kiem-trang.mjs http://localhost:3160 galerie
 *
 * Vì sao phải BẤM chứ không đọc HTML: cả bốn trang này đều có trạng thái phía
 * client. Reservierung giữ sáu bước trong `useState` và vẽ bảng tóm tắt từ
 * đó; Galerie lọc + mở lightbox; Kontakt bật/tắt nút gửi theo dữ liệu. HTML
 * lần dựng đầu đúng không nói gì về chuyện bấm vào có chạy không — đúng kiểu
 * lỗi `useSearchParams()` làm 207 thẻ món biến mất chỉ ở bản production.
 *
 * HAI NHÓM MỤC KIỂM:
 *  a) chức năng — bấm vào có đổi trạng thái đúng không;
 *  b) TOÀN VẸN DỮ LIỆU — trang có đang bịa ra thứ chưa ai gửi không. Nhóm này
 *     quan trọng hơn: lỗi chức năng thì nhìn thấy, còn một địa chỉ email bịa
 *     thì trông như trang hoàn chỉnh. Nên có cả mục kiểm dạng "PHẢI KHÔNG CÓ".
 */
import { dungKhung, soKetQua, cho } from "./lib/trinh-duyet.mjs";

const GOC = (process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3160").replace(/\/$/, "");
const CHON = process.argv.slice(process.argv[2]?.startsWith("http") ? 3 : 2);
const lam = (ten) => CHON.length === 0 || CHON.includes(ten);

/* Dữ liệu THẬT, đọc từ bìa thực đơn in. Script tự khai lại để nếu ai sửa
   `restaurant-info.json` thành số khác thì bài kiểm HỎNG chứ không im lặng
   chạy theo. Đây là chốt chặn, không phải bản sao cho tiện.
   Bìa in nhóm số bằng gạch chéo (`01622/979999`), web nhóm bằng dấu cách —
   nên so bằng CHỮ SỐ, bỏ hết dấu phân cách, chứ không so nguyên chuỗi. */
const DIEN_THOAI_THAT = ["01622979999", "077619982504"];
const E164_THAT = ["+491622979999", "+4977619982504"];
const PHO_THAT = "Rheinbrückstr. 24";
const THANH_PHO_THAT = "79713 Bad Säckingen";
/* Mã hồ sơ Google của quán (Sếp gửi link 07/10): nửa sau của
   `0x479049f0aef4b16b:0x3a0b3ebdcecff2bc` đổi sang thập phân. Khai lại ở đây
   làm chốt chặn — link bản đồ trỏ sang một hồ sơ khác là bài kiểm HỎNG. */
const CID_THAT = "4182505663883113148";

const chiSo = (s) => String(s).replace(/[^\d]/g, "");

const b = await dungKhung();
const s = soKetQua();

/*
 * Số điện thoại, kiểm HAI tầng:
 *  - chữ HIỆN RA phải là hai số thật (so theo chữ số, bỏ dấu phân cách);
 *  - `href` phải là E.164 hợp lệ: `+49` rồi toàn chữ số, KHÔNG dấu cách.
 * Tầng thứ hai là vì đã dính thật: `restaurant-info.json` từng lưu
 * `+4916229799 99` — có một dấu cách lọt vào giữa. Số đó trông đúng trong
 * tệp JSON mà bấm vào là máy không gọi được, và khách sát biên Thuỵ Sĩ bấm
 * số nội địa `0162…` cũng không nối được.
 */
async function kiemDienThoai() {
  const ds = await b.js(
    "return [...document.querySelectorAll('a[href^=\"tel:\"]')].map(e=>" +
      "({ hien: e.textContent.replace(/\\s+/g,' ').trim(), href: e.getAttribute('href') }));"
  );
  const hien = ds.map((x) => x.hien);
  const href = [...new Set(ds.map((x) => x.href))];
  return {
    duSo: DIEN_THOAI_THAT.every((n) => hien.some((x) => chiSo(x).includes(n))),
    duE164:
      href.length > 0 &&
      href.every((h) => /^tel:\+\d{8,15}$/.test(h)) &&
      E164_THAT.every((e) => href.includes("tel:" + e)),
    chuoiHien: hien.join(" · "),
    chuoiHref: href.join(" · "),
  };
}

/*
 * MỐC của từng trang: một biểu thức trả về `true` khi trang ĐÃ DỰNG XONG đúng
 * thứ mà bài kiểm sắp đo.
 *
 * Vì sao bắt buộc: chạy nhiều trang một lượt thì `next dev` biên dịch route
 * thứ hai NGAY LÚC bài kiểm đã bắt đầu đo. Hậu quả đo được: Kontakt báo 5
 * HỎNG (`undefined ô`, không thấy nút chỉ đường, mục 390px in `1440/1440px`)
 * trong khi chạy riêng thì 14/14 đạt và HTML máy chủ vẫn đủ form. Một lần
 * khác ném thẳng `Uncaught` vì lịch đặt bàn chưa mount.
 *
 * Mốc phải là thứ CỤ THỂ của trang đó, không phải "có <main>" chung chung —
 * mốc chung thì đạt ngay cả khi trang chưa dựng gì, tức lại là mốc rỗng.
 */
const MOC = {
  reservierung:
    "return document.querySelectorAll('button[aria-pressed]').length > 20 &&" +
    " document.querySelectorAll('dt').length >= 6 &&" +
    " !!document.querySelector('[data-tom-tat] a[href^=\"tel:\"]');",
  kontakt:
    "return !!document.querySelector('[data-the-goi-dien] a[href^=\"tel:\"]') &&" +
    " document.querySelectorAll('address').length >= 1;",
  galerie:
    "return document.querySelectorAll('[role=group] button').length === 6 &&" +
    " document.querySelectorAll('button[aria-label*=\"vergr\"]').length === 13;",
  "ueber-uns":
    "return document.querySelectorAll('h3').length >= 4 &&" +
    " document.querySelectorAll('[data-cho-sep]').length >= 5;",
};

/*
 * Mở một trang và chờ đúng mốc của nó. Trả `true` nếu tới được.
 * KHÔNG ném lỗi: ném thì cả bộ chết và không ai biết mấy trang kia thế nào.
 */
async function moTrang(khoa, duongDan) {
  try {
    await b.go(GOC + duongDan, { san: MOC[khoa] });
    return true;
  } catch (e) {
    s.ghiLoiKiem("mở " + duongDan, e.message.slice(0, 90));
    return false;
  }
}

/** Mục kiểm chung cho mọi trang: lỗi console + tràn ngang ở 390px. */
async function kiemChung(khoa, duongDan) {
  s.ghi("không có lỗi console", b.loiConsole().length === 0, b.loiConsole().slice(0, 2).join(" | "));
  await b.khoKhung(390, 844, true);
  if (await moTrang(khoa, duongDan)) {
    const t = await b.doTran();
    s.ghi("390px: không tràn ngang", t.scroll <= t.client, t.scroll + "/" + t.client + "px");
  } else {
    s.ghiLoiKiem("390px: không tràn ngang", "không mở được trang ở khổ 390");
  }
  await b.khoKhung(1440, 900);
}

/* ====================================================================== */
/* 03 RESERVIERUNG                                                         */
/* ====================================================================== */
/* Khối có NHÃN + `break`: không mở được trang thì bỏ qua cả mục chứ không
   chạy tiếp rồi báo một loạt HỎNG giả. Dùng nhãn thay vì lồng thêm một tầng
   `if` để khỏi thụt lại toàn bộ thân mục. */
if (lam("reservierung")) reservierung: {
  s.muc("03 Reservierung");
  if (!(await moTrang("reservierung", "/de/reservierung"))) break reservierung;

  // Khung giờ sinh từ giờ mở cửa THẬT 11:00–22:30, bước 30', chốt sớm 30'
  // => 11:00…22:00 = 23 ô. Con số này là hệ quả của dữ liệu thật, nên nó đổi
  // tức là ai đó sửa giờ mở cửa.
  // Làm lại 07/10: 23 khung chia BA TAB BUỔI, mỗi lần hiện một buổi -> bấm
  // lần lượt từng tab rồi gom lại. Tổng vẫn phải đúng 23.
  const soTab = await b.js("return document.querySelectorAll('[role=tab]').length;");
  const gomGio = [];
  for (let i = 0; i < soTab; i++) {
    await b.js("document.querySelectorAll('[role=tab]')[" + i + "].click(); return 1;");
    await cho(350);
    gomGio.push(
      ...(await b.js(
        "return [...document.querySelectorAll('[data-luoi-gio] button')].map(e=>e.textContent.trim()).filter(x=>/^\\d{2}:\\d{2}$/.test(x));"
      ))
    );
  }
  const gio = { so: gomGio.length, dau: gomGio[0], cuoi: gomGio[gomGio.length - 1] };
  s.ghi("lưới giờ chia 3 buổi, mỗi buổi ≤ 9 ô", soTab === 3, soTab + " tab");
  s.ghi("khung giờ sinh từ giờ mở cửa thật", gio.so === 23 && gio.dau === "11:00" && gio.cuoi === "22:00",
    gio.so + " ô, " + gio.dau + "→" + gio.cuoi);

  // Lịch: đủ số ngày trong tháng, ngày đã qua bị vô hiệu, không lùi quá tháng này
  const lich = await b.js(
    "const ds=[...document.querySelectorAll('button[aria-pressed]')].filter(e=>/^\\d{1,2}$/.test(e.textContent.trim()));" +
      "const d=new Date(); const trongThang=new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();" +
      "const lui=[...document.querySelectorAll('button[aria-label]')].find(e=>e.getAttribute('aria-label')==='Voriger Monat');" +
      "return { so: ds.length, trongThang, daQuaBiTat: ds.filter(e=>e.disabled).length, homNay: d.getDate(), luiBiTat: !!lui && lui.disabled };"
  );
  s.ghi("lịch đủ ngày của tháng này", lich.so === lich.trongThang, lich.so + "/" + lich.trongThang + " ngày");
  s.ghi("ngày đã qua bị vô hiệu", lich.daQuaBiTat === lich.homNay - 1, lich.daQuaBiTat + " ngày tắt, hôm nay " + lich.homNay);
  s.ghi("không lùi được quá tháng này", lich.luiBiTat === true);

  /* Chọn một ngày còn chọn được -> bảng tóm tắt phải đổi.
     Bản cũ gọi thẳng `ds[ds.length-1].click()`: lịch chưa mount thì `ds` rỗng
     và nó ném `Uncaught`, làm CHẾT cả bộ kiểm — mất luôn kết quả ba trang
     còn lại. Giờ trả về chuỗi trạng thái rồi phân loại. */
  const chonNgay = await b.js(
    "const ds=[...document.querySelectorAll('button[aria-pressed]')].filter(e=>/^\\d{1,2}$/.test(e.textContent.trim()) && !e.disabled);" +
      "if (ds.length === 0) return 'LICH CHUA DUNG';" +
      "ds[ds.length-1].click(); return 'ok';"
  );
  if (chonNgay !== "ok") {
    s.ghiLoiKiem("chọn ngày trong lịch", chonNgay);
  }
  await cho(900);
  const docTomTat = (nhan) =>
    b.js(
      "const dt=[...document.querySelectorAll('dt')].find(e=>e.textContent.trim()===" + JSON.stringify(nhan) + ");" +
        "return dt ? dt.nextElementSibling.textContent.trim() : 'KHÔNG THẤY DÒNG';"
    );
  const ngay = await docTomTat("Datum");
  s.ghi("chọn ngày -> tóm tắt đổi", ngay !== "—" && ngay !== "KHÔNG THẤY DÒNG", ngay);

  await b.bamChu("[role=tab]", "Abend");
  await b.bamChu("button", "19:30");
  s.ghi("chọn giờ -> tóm tắt đổi", (await docTomTat("Uhrzeit")) === "19:30", await docTomTat("Uhrzeit"));

  // Bộ đếm − | số | + (trước là <select>): 2 -> 5 là ba cú bấm "+".
  for (let i = 0; i < 3; i++) await b.bam("button[aria-label='Mehr Gäste']", 250);
  const khoaDuoi = await b.js(
    "const t=document.querySelector(\"button[aria-label='Weniger Gäste']\"); return !!t && !t.disabled;"
  );
  s.ghi("bộ đếm khách có nút bớt", khoaDuoi === true);
  s.ghi("đổi số khách -> tóm tắt đổi", (await docTomTat("Gäste")) === "5 Gäste", await docTomTat("Gäste"));

  // Làm lại 07/10: khu vực chỉ còn MỘT chỗ chọn (thẻ ảnh thật ở bước 4);
  // sơ đồ vẽ nét đã gỡ vì chưa có mặt bằng thật.
  await b.bamChu("button", "Gastraum");
  const khu = await b.js(
    "const ds=[...document.querySelectorAll('button[aria-pressed]')].filter(e=>/Gastraum/.test(e.textContent));" +
      "return { so: ds.length, bat: ds.filter(e=>e.getAttribute('aria-pressed')==='true').length };"
  );
  s.ghi("chọn khu -> thẻ ảnh sáng (một chỗ chọn duy nhất)", khu.so === 1 && khu.bat === 1, khu.bat + "/" + khu.so + " nút sáng");
  const anhKhu = await b.js(
    "return [...document.querySelectorAll('[data-khu-vuc] img')].map(e=>Math.round(e.getBoundingClientRect().width));"
  );
  s.ghi("ảnh khu vực đủ lớn (≥ 150px ở khổ này)", anhKhu.length === 2 && anhKhu.every((w) => w >= 150), anhKhu.join(" / ") + "px");
  s.ghi("chọn khu -> tóm tắt đổi", (await docTomTat("Bereich")) === "Gastraum", await docTomTat("Bereich"));

  await b.bamChu("button", "Geburtstag");
  s.ghi("chọn dịp -> tóm tắt đổi", (await docTomTat("Anlass")) === "Geburtstag", await docTomTat("Anlass"));

  await b.nhapO("textarea", "Zwei Kinderstühle bitte");
  const dem = await b.js("return [...document.querySelectorAll('p')].map(e=>e.textContent.trim()).find(x=>/^\\d+\\/500$/.test(x)) || 'KHÔNG THẤY';");
  s.ghi("ô ghi chú có bộ đếm ký tự", dem === "23/500", dem);
  s.ghi("ghi chú -> tóm tắt đổi", (await docTomTat("Anmerkungen")) === "Zwei Kinderstühle bitte", await docTomTat("Anmerkungen"));

  // --- toàn vẹn dữ liệu ---
  // Làm lại 07/10: chưa có nơi nhận -> KHÔNG có nút gửi nào (kể cả nút khoá);
  // hành động chính là hai nút gọi ngay dưới bảng tóm tắt, kèm câu giải thích.
  const gui = await b.js(
    "const g=document.getElementById('res-goi-hint');" +
      "return { nutGui: document.querySelectorAll('button[type=submit]').length," +
      " coGiaiThich: !!g && g.textContent.trim().length > 20," +
      " nutGoi: document.querySelectorAll('[data-tom-tat] a[href^=\"tel:\"]').length };"
  );
  s.ghi("KHÔNG có nút gửi giả (chưa có hệ thống đặt bàn)", gui.nutGui === 0, gui.nutGui + " nút submit");
  s.ghi("có câu giải thích + 2 nút gọi dưới bảng tóm tắt", gui.coGiaiThich === true && gui.nutGoi === 2, JSON.stringify(gui));

  const dt = await kiemDienThoai();
  s.ghi("hiện đủ hai số điện thoại THẬT", dt.duSo, dt.chuoiHien || "KHÔNG CÓ");
  s.ghi("nút gọi dùng dạng quốc tế +49 hợp lệ", dt.duE164, dt.chuoiHref || "KHÔNG CÓ");

  // KIT cấm thẳng: không đánh số bàn, không hứa bàn nào còn trống khi chưa
  // có hệ thống đặt bàn thật (`liveTableInventory: false`).
  const hua = await b.js(
    "const t=document.body.innerText;" +
      "return { verfugbar: /Verf[üu]gbar/.test(t), reserviert: /Reserviert\\b/.test(t), soBan: /Tisch\\s*\\d+/.test(t) };"
  );
  s.ghi("KHÔNG hứa bàn trống / đánh số bàn",
    !hua.verfugbar && !hua.reserviert && !hua.soBan,
    JSON.stringify(hua));

  await kiemChung("reservierung", "/de/reservierung");
}

/* ====================================================================== */
/* 06 KONTAKT                                                              */
/* ====================================================================== */
if (lam("kontakt")) kontakt: {
  s.muc("06 Kontakt");
  if (!(await moTrang("kontakt", "/de/kontakt"))) break kontakt;

  // Làm lại 07/10: chưa có e-mail -> KHÔNG dựng form chết; cột phải là thẻ
  // gọi điện. (Chiều "có e-mail -> hiện form" do `kiem-khoi-an.mjs` giữ.)
  const the = await b.js(
    "const c=document.querySelector('[data-the-goi-dien]'); if(!c) return { co:false };" +
      "const tr=document.querySelector('ul.grid'); " +
      "const cot=c.parentElement.firstElementChild;" +
      "return { co:true, form: document.querySelectorAll('form').length," +
      " goi: c.querySelectorAll('a[href^=\"tel:\"]').length," +
      " caoNut: Math.min(...[...c.querySelectorAll('a')].map(e=>Math.round(e.getBoundingClientRect().height)))," +
      " datBan: !!c.querySelector('a[href$=\"/reservierung\"]')," +
      " lechDay: Math.round(Math.abs(c.getBoundingClientRect().bottom - cot.getBoundingClientRect().bottom)) };"
  );
  s.ghi("KHÔNG có form chết khi chưa có e-mail", the.co && the.form === 0, the.form + " form");
  s.ghi("thẻ gọi điện: 2 nút gọi + link đặt bàn", the.co && the.goi === 2 && the.datBan === true, JSON.stringify(the));
  s.ghi("nút trong thẻ gọi điện cao ≥ 44px", the.co && the.caoNut >= 44, the.caoNut + "px");
  s.ghi("hai cột cao bằng nhau (trước lệch 373px)", the.co && the.lechDay <= 1, "lệch " + the.lechDay + "px");

  // --- toàn vẹn dữ liệu: ba thứ PHẢI KHÔNG CÓ ---
  const bia = await b.js(
    "return { mailto: [...document.querySelectorAll('a[href^=mailto]')].map(e=>e.getAttribute('href'))," +
      " iframe: document.querySelectorAll('iframe').length," +
      " wa: document.querySelectorAll('a[href*=\"wa.me\"]').length," +
      " insta: document.querySelectorAll('a[href*=instagram]').length };"
  );
  s.ghi("KHÔNG có email bịa", bia.mailto.length === 0, bia.mailto.join(" "));
  s.ghi("KHÔNG nhúng bản đồ đoán", bia.iframe === 0, bia.iframe + " iframe");
  s.ghi("KHÔNG có nút WhatsApp trỏ số đoán", bia.wa === 0, bia.wa + " liên kết");
  s.ghi("KHÔNG có Instagram bịa", bia.insta === 0, bia.insta + " liên kết");

  const diaChi = await b.js("return document.querySelector('address') ? document.querySelector('address').innerText.replace(/\\s+/g,' ').trim() : 'KHÔNG THẤY';");
  s.ghi("địa chỉ đúng bản đã xác minh",
    diaChi.includes(PHO_THAT) && diaChi.includes(THANH_PHO_THAT), diaChi);

  const chiDuong = await b.js(
    "const a=[...document.querySelectorAll('a[href*=\"google.com/maps\"]')][0];" +
      "return a ? decodeURIComponent(a.getAttribute('href')) : 'KHÔNG THẤY';"
  );
  s.ghi("link Google Maps trỏ đúng hồ sơ quán, không tham số theo dõi",
    chiDuong.includes("cid=" + CID_THAT) && !/entry=|g_ep=/.test(chiDuong), chiDuong.slice(0, 90));

  // Bản đồ phải THẤY NGAY (Sếp 07/10) mà chưa gọi Google: ảnh tĩnh trong dự
  // án + ghim + dòng ghi công OpenStreetMap (bắt buộc theo ODbL).
  const tinh = await b.js(
    "const k=document.querySelector('[data-ban-do]'); if(!k) return { co:false };" +
      "const im=k.querySelector('img[src*=\"kontakt-karte\"]');" +
      "const q=im ? im.getBoundingClientRect() : { width:0, height:0 };" +
      "return { co:true, kieu:k.getAttribute('data-ban-do'), daTai: !!im && im.complete && im.naturalWidth > 0," +
      " rong: Math.round(q.width), cao: Math.round(q.height)," +
      " ghiCong: /OpenStreetMap/.test(k.textContent)," +
      " ngoai: performance.getEntriesByType('resource').filter(r=>/google|openstreetmap|gstatic/.test(r.name)).length };"
  );
  s.ghi("bản đồ tĩnh hiện sẵn khi mở trang", tinh.co && tinh.kieu === "tinh" && tinh.daTai && tinh.cao >= 200,
    JSON.stringify(tinh));
  s.ghi("có dòng ghi công OpenStreetMap", tinh.ghiCong === true);
  s.ghi("mở trang KHÔNG gọi Google / máy chủ bản đồ ngoài", tinh.ngoai === 0, tinh.ngoai + " yêu cầu");

  const dtK = await kiemDienThoai();
  s.ghi("hiện số điện thoại thật", dtK.duSo, dtK.chuoiHien || "KHÔNG CÓ");
  s.ghi("nút gọi dùng dạng quốc tế +49 hợp lệ", dtK.duE164, dtK.chuoiHref || "KHÔNG CÓ");

  // Bản đồ "hai cú bấm": bấm rồi mới được có iframe, và phải trỏ đúng địa chỉ.
  await b.bamChu("button", "Interaktive Karte laden");
  const banDo = await b.js(
    "const i=document.querySelector('iframe'); return i ? decodeURIComponent(i.getAttribute('src')) : 'KHÔNG THẤY';"
  );
  s.ghi("bấm 'Interaktive Karte laden' -> iframe Google của đúng hồ sơ quán",
    /maps\.google\.com/.test(banDo) && banDo.includes("cid=" + CID_THAT), banDo.slice(0, 80));

  await kiemChung("kontakt", "/de/kontakt");
}

/* ====================================================================== */
/* 04 GALERIE                                                              */
/* ====================================================================== */
if (lam("galerie")) galerie: {
  s.muc("04 Galerie");
  if (!(await moTrang("galerie", "/de/galerie"))) break galerie;

  /* Đếm ô ảnh qua chính tệp ảnh, không qua aria-label — nhãn đổi theo ngôn
     ngữ còn tên tệp thì không. Next viết lại src thành
     `/_next/image?url=%2Fanh%2Frestaurant-01-thumb.webp`, nên vẫn chứa
     "restaurant-". Ảnh poster video không khớp mẫu này. */
  /*
   * Đếm theo Ô trong DOM, KHÔNG theo ảnh đã tải xong.
   *
   * Bản cũ lọc `img` theo `currentSrc` khớp `restaurant-NN-thumb`. Nó đúng
   * trên máy rảnh nhưng phụ thuộc MẠNG: ảnh chưa tải thì `currentSrc` rỗng,
   * nên khi chạy 5 bộ liên tiếp trên máy đang tải nặng, phép đếm ra 0 và báo
   * hỏng oan — trong khi bộ lọc của web chạy đúng (đã đo riêng: 7/3/4/2/0/0/7
   * ô, khớp hoàn toàn).
   *
   * `PhotoTile` dựng một `<button aria-label="<nhãn zoom>: <mô tả ảnh>">` cho
   * mỗi ảnh, có mặt trong DOM ngay cả khi ảnh chưa tải. `VideoTile` thì có
   * nhãn riêng. Đếm nút là đo đúng thứ cần đo: web lọc ra bao nhiêu ô.
   */
  const demAnh = () =>
    b.js("return document.querySelectorAll('button[aria-label*=\"vergr\"]').length;");
  const demVideo = () =>
    b.js("return document.querySelectorAll('button[aria-label*=\"abspielen\"]').length;");

  const loc = await b.js("return document.querySelectorAll('[role=group][aria-label*=filter] button, [role=group][aria-label*=Galerie] button').length;");
  s.ghi("có đủ 6 bộ lọc (KIT, mockup chỉ vẽ 5)", loc === 6, loc + " nút");

  // Làm lại 07/10: "Alle" = 7 ảnh quán + 6 ảnh món thật (public/mon) + video.
  s.ghi("Alle: 13 ảnh thật (7 quán + 6 món) + 1 ô video", (await demAnh()) === 13 && (await demVideo()) === 1,
    (await demAnh()) + " ảnh, " + (await demVideo()) + " video");

  for (const [nhan, mong] of [["Restaurant", 3], ["Bar", 4], ["Details", 2]]) {
    await b.bamChu("[role=group] button", nhan);
    const n = await demAnh();
    s.ghi("lọc " + nhan, n === mong, n + "/" + mong + " ảnh");
  }

  await b.bamChu("[role=group] button", "Speisen");
  // Cũng đếm theo ô, cùng lý do như `demAnh()` ở trên.
  const speisen = await b.js(
    "return { anh: document.querySelectorAll('button[aria-label*=\"vergr\"]').length," +
      " bao: /noch keine eigenen Fotos/.test(document.body.innerText) };"
  );
  // 10 ảnh món 560×420 + 6 ảnh nhóm, đều là ảnh in trên thực đơn của quán.
  const nguon = await b.js(
    "return [...document.querySelectorAll('button[aria-label*=\"vergr\"] img')].every(e=>/%2Fmon%2F|\\/mon\\//.test(e.getAttribute('src')||''));"
  );
  s.ghi("lọc Speisen: 16 ảnh món thật từ /mon, không câu báo rỗng",
    speisen.anh === 16 && speisen.bao === false && nguon === true, JSON.stringify(speisen) + " nguon=" + nguon);

  await b.bamChu("[role=group] button", "Video");
  s.ghi("lọc Video: chỉ còn ô video", (await demAnh()) === 0 && (await demVideo()) === 1,
    (await demAnh()) + " ảnh, " + (await demVideo()) + " video");

  // Lightbox
  await b.bamChu("[role=group] button", "Alle");
  const moLb = await b.bam("button[aria-label*='vergrößern']", 1400);
  s.ghi("ô ảnh có nút mở lightbox", moLb === "ok", moLb);
  /* Lightbox là `<dialog>` NGUYÊN BẢN mở bằng `showModal()`. Vai `dialog` của
     nó là NGẦM ĐỊNH trong cây trợ năng, còn `[role=dialog]` là bộ chọn CSS
     theo thuộc tính — không khớp thẻ không tự ghi `role`. Phải chọn
     `dialog[open]`. (Modal món ăn ở `kiem-speisekarte.mjs` thì ghi `role` rõ
     ràng nên bộ chọn kia đúng ở đó — đừng sửa bài kiểm ấy theo cái này.) */
  const lb = await b.js(
    "const d=document.querySelector('dialog[open]'); if(!d) return { mo:false, nhan:'' };" +
      "return { mo:true, nhan:d.getAttribute('aria-label')||'', coDong:!!d.querySelector('button[aria-label*=Schließen]')," +
      " coTruoc:!!d.querySelector('button[aria-label*=Vorheriges]'), coSau:!!d.querySelector('button[aria-label*=\"Nächstes\"]') };"
  );
  s.ghi("mở lightbox", lb.mo === true);
  s.ghi("lightbox có aria-label tả ảnh", lb.mo && lb.nhan.length > 10, lb.nhan.slice(0, 48));
  s.ghi("lightbox có nút đóng + trước + sau", lb.coDong && lb.coTruoc && lb.coSau, JSON.stringify(lb).slice(0, 70));

  if (lb.mo) {
    const truoc = lb.nhan;
    await b.bamPhim("ArrowRight", 1000);
    const sau = await b.js("const d=document.querySelector('dialog[open]'); return d ? (d.getAttribute('aria-label')||'') : 'ĐÃ ĐÓNG';");
    s.ghi("mũi tên phải đổi sang ảnh khác", sau !== truoc && sau !== "ĐÃ ĐÓNG", sau.slice(0, 48));
    await b.bamPhim("Escape", 900);
    s.ghi("Esc đóng lightbox", (await b.js("return !document.querySelector('dialog[open]');")) === true);
  }

  await kiemChung("galerie", "/de/galerie");
}

/* ====================================================================== */
/* 05 ÜBER UNS                                                             */
/* ====================================================================== */
if (lam("ueber-uns")) ueberUns: {
  s.muc("05 Über uns");
  if (!(await moTrang("ueber-uns", "/de/ueber-uns"))) break ueberUns;

  const the = await b.js(
    "const ds=[...document.querySelectorAll('h3')].map(e=>e.textContent.trim());" +
      "return ds;"
  );
  s.ghi("đủ 4 thẻ triết lý",
    ["UNSERE PHILOSOPHIE", "FRISCHE & QUALITÄT", "HANDWERKSKUNST", "UNSER AMBIENTE"].every((x) => the.includes(x)),
    the.join(" · ").slice(0, 90));

  /* Dải số liệu phải là SỐ ĐẾM THẬT từ thực đơn, không phải con số tròn
     trĩnh cho đẹp. 207 món / 109 sushi / 63 đồ uống trùng với
     `kiem-speisekarte.mjs`, nên nếu ai sửa data thì hai bài cùng hỏng. */
  const so = await b.js("return document.body.innerText;").then((t) => ({
    mon: /\b207\b/.test(t),
    sushi: /\b109\b/.test(t),
    uong: /\b63\b/.test(t),
    // Nhãn dải số liệu in HOA bằng CSS, mà `innerText` trả về chữ ĐÃ biến đổi
    // theo `text-transform` -> so chữ thường là trượt. Phải bỏ phân biệt hoa
    // thường ở mọi phép so chữ lấy từ `innerText`.
    pho: new RegExp(PHO_THAT.replace(".", "\\."), "i").test(t),
  }));
  s.ghi("dải số liệu là số đếm thật 207/109/63",
    so.mon && so.sushi && so.uong, JSON.stringify(so));
  s.ghi("dải số liệu ghi địa chỉ đã xác minh", so.pho === true);

  /* Chỗ giữ nội dung: dấu PHẢI còn trong DOM nhưng KHÔNG vẽ ra trang (làm
     lại 07/10 — Sếp chê dòng "[chờ Sếp gửi]" + thanh xám lộ cho khách). Câu
     quảng cáo trong mockup là chữ AI (spec §13) — nếu số dấu về 0 mà
     `vi.json`/`de.json` không có chữ mới thì ai đó đã chép chữ bịa vào. */
  const cho_ = await b.js(
    "const ds=[...document.querySelectorAll('[data-cho-sep]')];" +
      "return { so: ds.length, cst: getComputedStyle(ds[0]||document.body).fontSize," +
      " moTa: ds.map(e=>e.getAttribute('data-cho-sep')).slice(0,3) };"
  );
  s.ghi("chỗ giữ nội dung còn dấu trong DOM, có mô tả",
    cho_.so >= 5 && cho_.moTa.every((x) => x && x.length > 3),
    cho_.so + " chỗ · " + cho_.moTa.join(" | ").slice(0, 60));
  const loCho = await b.js(
    "return { chu: /chờ Sếp gửi/.test(document.body.innerText)," +
      " hien: [...document.querySelectorAll('[data-cho-sep]')].filter(e=>e.getBoundingClientRect().height>0).length };"
  );
  s.ghi("KHÔNG lộ chữ giữ chỗ ra cho khách", loCho.chu === false && loCho.hien === 0, JSON.stringify(loCho));

  // Luật Sếp: không phủ màu lên ảnh, không dán chữ lên mặt người.
  const anh = await b.js(
    "const ra=[];" +
      "for (const im of document.querySelectorAll('img')) {" +
      "  const r=im.getBoundingClientRect(); if (r.width < 120) continue;" +
      "  const p=im.parentElement; const sau=p && getComputedStyle(p, '::after');" +
      "  const nen=sau && sau.backgroundImage && sau.backgroundImage !== 'none' && /gradient/.test(sau.backgroundImage);" +
      "  if (nen) ra.push((im.currentSrc||im.src).slice(-40));" +
      "}" +
      "return ra;"
  );
  s.ghi("KHÔNG phủ lớp màu lên ảnh", anh.length === 0, anh.join(" ") || "sạch");

  await kiemChung("ueber-uns", "/de/ueber-uns");
}

const kq = s.in();
console.log("\n  gốc: " + GOC + (CHON.length ? "   trang: " + CHON.join(", ") : ""));
b.dong();
process.exit(kq.ma);
