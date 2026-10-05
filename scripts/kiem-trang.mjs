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
import { moTrinhDuyet, soKetQua, cho } from "./lib/trinh-duyet.mjs";

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

const chiSo = (s) => String(s).replace(/[^\d]/g, "");

const b = await moTrinhDuyet({ port: 9443 });
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
    " !!document.querySelector('button[type=submit]');",
  kontakt:
    "const f=document.querySelector('form');" +
    "return !!f && f.querySelectorAll('input').length === 4 && !!f.querySelector('textarea') &&" +
    " !!document.querySelector('a[href^=\"tel:\"]');",
  galerie:
    "return document.querySelectorAll('[role=group] button').length === 6 &&" +
    " document.querySelectorAll('button[aria-label*=\"vergr\"]').length === 7;",
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
  const gio = await b.js(
    "const ds=[...document.querySelectorAll('button')].map(e=>e.textContent.trim()).filter(x=>/^\\d{2}:\\d{2}$/.test(x));" +
      "return { so: ds.length, dau: ds[0], cuoi: ds[ds.length-1] };"
  );
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

  await b.bamChu("button", "19:30");
  s.ghi("chọn giờ -> tóm tắt đổi", (await docTomTat("Uhrzeit")) === "19:30", await docTomTat("Uhrzeit"));

  await b.nhapO("select", "5");
  s.ghi("đổi số khách -> tóm tắt đổi", (await docTomTat("Gäste")) === "5 Gäste", await docTomTat("Gäste"));

  // Khu vực có HAI nút điều khiển (thẻ ảnh + sơ đồ khu) cùng một trạng thái.
  // Bấm một chỗ thì chỗ kia phải sáng theo, không thì người dùng thấy hai
  // câu trả lời khác nhau cho cùng câu hỏi.
  await b.bamChu("button", "Gastraum");
  const khu = await b.js(
    "const ds=[...document.querySelectorAll('button[aria-pressed]')].filter(e=>/Gastraum/.test(e.textContent));" +
      "return { so: ds.length, bat: ds.filter(e=>e.getAttribute('aria-pressed')==='true').length };"
  );
  s.ghi("chọn khu -> cả hai nút cùng sáng", khu.so === 2 && khu.bat === 2, khu.bat + "/" + khu.so + " nút sáng");
  s.ghi("chọn khu -> tóm tắt đổi", (await docTomTat("Bereich")) === "Gastraum", await docTomTat("Bereich"));

  await b.bamChu("button", "Geburtstag");
  s.ghi("chọn dịp -> tóm tắt đổi", (await docTomTat("Anlass")) === "Geburtstag", await docTomTat("Anlass"));

  await b.nhapO("textarea", "Zwei Kinderstühle bitte");
  const dem = await b.js("return [...document.querySelectorAll('p')].map(e=>e.textContent.trim()).find(x=>/^\\d+\\/500$/.test(x)) || 'KHÔNG THẤY';");
  s.ghi("ô ghi chú có bộ đếm ký tự", dem === "23/500", dem);
  s.ghi("ghi chú -> tóm tắt đổi", (await docTomTat("Anmerkungen")) === "Zwei Kinderstühle bitte", await docTomTat("Anmerkungen"));

  // --- toàn vẹn dữ liệu ---
  const gui = await b.js(
    "const n=document.querySelector('button[type=submit]');" +
      "const id=n && n.getAttribute('aria-describedby');" +
      "const g=id && document.getElementById(id);" +
      "return { tat: !!n && n.disabled, coGiaiThich: !!g && g.textContent.trim().length > 20 };"
  );
  s.ghi("nút gửi VÔ HIỆU (chưa có hệ thống đặt bàn)", gui.tat === true);
  s.ghi("nút gửi có câu giải thích kèm theo", gui.coGiaiThich === true);

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

  const form = await b.js(
    "const f=document.querySelector('form'); if(!f) return { co:false };" +
      "const o=[...f.querySelectorAll('input')]; const n=f.querySelector('button[type=submit]');" +
      "const id=f.getAttribute('aria-describedby'); const g=id && document.getElementById(id);" +
      "return { co:true, soO:o.length, buocPhai:o.filter(e=>e.required).length, coTextarea:!!f.querySelector('textarea')," +
      " nutTat:!!n && n.disabled, coGiaiThich:!!g && /E-Mail-Adresse/.test(g.textContent) };"
  );
  s.ghi("có form 4 ô + vùng nhập dài", form.co && form.soO === 4 && form.coTextarea, form.soO + " ô");
  s.ghi("ô bắt buộc được đánh dấu required", form.buocPhai === 3, form.buocPhai + "/4 ô bắt buộc");
  s.ghi("nút gửi VÔ HIỆU (chưa có hộp thư nhận)", form.nutTat === true);
  s.ghi("nói rõ lý do không gửi được", form.coGiaiThich === true);

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
  s.ghi("nút chỉ đường tìm theo địa chỉ thật",
    chiDuong.includes(PHO_THAT) && !/place_id|cid=/.test(chiDuong), chiDuong.slice(0, 90));

  const dtK = await kiemDienThoai();
  s.ghi("hiện số điện thoại thật", dtK.duSo, dtK.chuoiHien || "KHÔNG CÓ");
  s.ghi("nút gọi dùng dạng quốc tế +49 hợp lệ", dtK.duE164, dtK.chuoiHref || "KHÔNG CÓ");

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

  s.ghi("Alle: 7 ảnh thật + 1 ô video", (await demAnh()) === 7 && (await demVideo()) === 1,
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
  s.ghi("lọc Speisen: 0 ảnh, nói thẳng là chưa có",
    speisen.anh === 0 && speisen.bao === true, JSON.stringify(speisen));

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

  /* Chỗ giữ nội dung: PHẢI còn thấy được. Câu quảng cáo trong mockup là chữ
     AI (spec §13) — nếu số này về 0 mà `vi.json`/`de.json` không có chữ mới
     thì nghĩa là ai đó đã chép chữ bịa vào. */
  const cho_ = await b.js(
    "const ds=[...document.querySelectorAll('[data-cho-sep]')];" +
      "return { so: ds.length, cst: getComputedStyle(ds[0]||document.body).fontSize," +
      " moTa: ds.map(e=>e.getAttribute('data-cho-sep')).slice(0,3) };"
  );
  s.ghi("chỗ giữ nội dung còn hiện, có mô tả",
    cho_.so >= 5 && cho_.moTa.every((x) => x && x.length > 3),
    cho_.so + " chỗ · " + cho_.moTa.join(" | ").slice(0, 60));

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
