/*
 * Khối phụ thuộc dữ liệu: `null` thì PHẢI ẨN, có dữ liệu thì PHẢI HIỆN.
 *
 * Chạy (chỉ cục bộ, cần `next dev` đang chạy):
 *   node scripts/kiem-khoi-an.mjs
 *   node scripts/kiem-khoi-an.mjs http://localhost:3160
 *
 * VÌ SAO CẦN BÀI RIÊNG. Chiều "null -> ẩn" thì `kiem-trang.mjs` kiểm được
 * ngay trên bản live, vì mọi trường đang `null` thật. Chiều "có dữ liệu ->
 * hiện" thì KHÔNG kiểm được bằng cách nhìn: chưa ai gửi email/WhatsApp/
 * Instagram/Google Maps nên không có gì để hiện. Mà đó mới là chiều nguy
 * hiểm — hôm Sếp gửi số WhatsApp, không ai đi dựng lại cả site để xem nút có
 * mọc ra đúng chỗ không, và `WhatsAppCta` còn có luật riêng của KIT: vỏ nút
 * phải đen/vàng, CHỈ hình WhatsApp được xanh. Không kiểm thì lỗi đó chỉ lộ
 * khi nhà hàng đã xem.
 *
 * ⚠ BÀI NÀY GHI VÀO `data/restaurant-info.json`. Cách giữ an toàn:
 *   - chỉ chạy với máy chủ localhost, chạy với tên miền thật là THOÁT NGAY;
 *   - sao lưu ra `<tệp>.sao-luu-kiem` trước khi ghi;
 *   - trả lại trong `finally`, tức có lỗi giữa đường cũng trả;
 *   - CUỐI BÀI tự kiểm là đã trả đúng (so nội dung, không chỉ so có tệp);
 *   - giá trị thử cố tình vô nghĩa (`KIEM-THU-…`) để nếu có sót lại thì nhìn
 *     một giây là biết, không ai nhầm là dữ liệu thật.
 * Nếu bài chết giữa đường mà vẫn còn `.sao-luu-kiem`: chép ngược tệp đó về.
 */
import fs from "node:fs";
import { moTrinhDuyet, soKetQua, cho } from "./lib/trinh-duyet.mjs";

const GOC = (process.argv[2] || "http://localhost:3160").replace(/\/$/, "");
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(GOC)) {
  console.error(
    "\n  THOÁT: bài này VÁ TỆP DỮ LIỆU nên chỉ chạy với máy chủ cục bộ.\n" +
      "  Nhận được: " + GOC + "\n"
  );
  process.exit(2);
}

const TEP = new URL("../data/restaurant-info.json", import.meta.url);
const SAO_LUU = new URL("../data/restaurant-info.json.sao-luu-kiem", import.meta.url);

/* Giá trị thử. Số WhatsApp lấy đúng dạng wa.me (chỉ chữ số) nhưng là dãy
   không tồn tại; email/instagram mang chữ KIEM-THU để không thể nhầm. */
const THU = {
  email: "kiem-thu@example.invalid",
  whatsapp: "490000000000",
  instagram: "https://instagram.com/KIEM-THU-khong-ton-tai",
  googleMapsUrl: "https://www.google.com/maps/embed?pb=KIEM-THU",
};

/*
 * MỐC của trang Kontakt. Phải là thứ ĐÚNG CẢ HAI VÒNG của bài kiểm: vòng 1
 * (dữ liệu null) và vòng 2 (đã vá dữ liệu thử). Form 4 ô + vùng nhập dài +
 * nút gửi tồn tại trong cả hai vòng; còn khối giải thích, nút WhatsApp hay
 * iframe thì CHỈ có ở một vòng, lấy làm mốc là bài kiểm tự treo.
 *
 * Không có mốc thì chạy nhiều bộ một lượt sẽ đo lúc `next dev` còn đang biên
 * dịch route — Kontakt từng báo 5 HỎNG giả (`undefined ô`) đúng vì chuyện này.
 */
const MOC_KONTAKT =
  "const f=document.querySelector('form');" +
  "return !!f && f.querySelectorAll('input').length === 4 &&" +
  " !!f.querySelector('textarea') && !!f.querySelector('button[type=submit]');";

const gocJson = fs.readFileSync(TEP, "utf8");
fs.writeFileSync(SAO_LUU, gocJson, "utf8");

const s = soKetQua();
let b;

try {
  b = await moTrinhDuyet({ port: 9449 });

  /* ---------------- vòng 1: dữ liệu null -> mọi khối phải ẨN ------------- */
  s.muc("null -> ẩn");
  const an = await doKhoi();
  s.ghi("không có nút WhatsApp", an.wa === 0, an.wa + " liên kết");
  s.ghi("không có nút Instagram", an.insta === 0, an.insta + " liên kết");
  s.ghi("không có email", an.mailto === 0, an.mailto + " liên kết");
  s.ghi("không nhúng bản đồ", an.iframe === 0, an.iframe + " iframe");
  s.ghi("nút gửi form bị vô hiệu", an.nutTat === true);
  s.ghi("có khối giải thích vì sao không gửi được", an.coGiaiThich === true);

  /* ---------------- vòng 2: có dữ liệu -> mọi khối phải HIỆN ------------- */
  const vaJson = JSON.parse(gocJson);
  Object.assign(vaJson, THU);
  fs.writeFileSync(TEP, JSON.stringify(vaJson, null, 2) + "\n", "utf8");
  // `next dev` phải biên dịch lại; JSON nằm trong chuỗi import nên cần vài giây.
  await cho(6000);

  s.muc("có dữ liệu -> hiện");
  const hien = await doKhoi();
  s.ghi("nút WhatsApp mọc ra", hien.wa > 0, hien.wa + " liên kết");
  s.ghi("nút WhatsApp trỏ đúng số", hien.waHref.includes(THU.whatsapp), hien.waHref || "—");
  s.ghi("nút Instagram mọc ra", hien.insta > 0, hien.insta + " liên kết");
  s.ghi("email mọc ra", hien.mailto > 0, hien.mailto + " liên kết");
  s.ghi("bản đồ chuyển sang iframe nhúng", hien.iframe === 1, hien.iframe + " iframe");
  s.ghi("iframe có title cho máy đọc", hien.iframeTitle.length > 0, hien.iframeTitle || "THIẾU");
  s.ghi("nút gửi form BẬT trở lại", hien.nutTat === false);
  s.ghi("khối giải thích biến mất", hien.coGiaiThich === false);

  /* KIT nói thẳng: "Never use full green/pink panels for social buttons.
     Keep the brand color only inside the icon; the button shell stays SoRa
     black/gold." Mockup vẽ một panel XANH ĐẶC — đúng cái bị cấm. Nên khi nút
     mọc ra thì phải kiểm luôn màu, không chỉ kiểm nó có tồn tại. */
  const mau = await b.js(
    "const a=[...document.querySelectorAll('a[href*=\"wa.me\"]')][0];" +
      "if(!a) return { co:false };" +
      "const nen=getComputedStyle(a).backgroundColor;" +
      "const sv=a.querySelector('svg');" +
      "return { co:true, nen, mauIcon: sv ? getComputedStyle(sv).color : '' };"
  );
  const xanhWa = /37,\s*211,\s*102/; // #25D366
  s.ghi("vỏ nút WhatsApp KHÔNG phủ xanh đặc",
    mau.co && !xanhWa.test(mau.nen), "nền=" + (mau.nen || "—"));
  s.ghi("chỉ hình WhatsApp giữ màu xanh",
    mau.co && xanhWa.test(mau.mauIcon), "icon=" + (mau.mauIcon || "—"));
} finally {
  // Trả lại NGUYÊN TRẠNG dù trên có hỏng chỗ nào.
  fs.writeFileSync(TEP, gocJson, "utf8");
  await cho(1500);

  const daTra = fs.readFileSync(TEP, "utf8") === gocJson;
  s.muc("trả lại tệp dữ liệu");
  s.ghi("restaurant-info.json về đúng nguyên bản", daTra,
    daTra ? "khớp từng byte" : "LỆCH — chép lại từ " + SAO_LUU.pathname);
  if (daTra) fs.rmSync(SAO_LUU, { force: true });

  if (b) {
    // Soát lần cuối trên trang thật: không còn vết dữ liệu thử nào.
    await b.go(GOC + "/de/kontakt", { san: MOC_KONTAKT });
    const vet = await b.js(
      "return /KIEM-THU|example\\.invalid|490000000000/.test(document.documentElement.outerHTML);"
    );
    s.ghi("trang không còn vết dữ liệu thử", vet === false, vet ? "CÒN VẾT" : "sạch");
  }

  const kq = s.in();
  console.log("\n  gốc: " + GOC);
  if (b) b.dong();
  process.exit(kq.ma);
}

/** Đo một lượt tất cả khối phụ thuộc dữ liệu trên trang Kontakt. */
async function doKhoi() {
  await b.go(GOC + "/de/kontakt", { san: MOC_KONTAKT });
  return b.js(
    "const f=document.querySelector('form');" +
      "const n=f && f.querySelector('button[type=submit]');" +
      "const id=f && f.getAttribute('aria-describedby');" +
      "const wa=[...document.querySelectorAll('a[href*=\"wa.me\"]')];" +
      "const ifr=document.querySelector('iframe');" +
      "return {" +
      " wa: wa.length, waHref: wa[0] ? wa[0].getAttribute('href') : ''," +
      " insta: document.querySelectorAll('a[href*=instagram]').length," +
      " mailto: document.querySelectorAll('a[href^=mailto]').length," +
      " iframe: document.querySelectorAll('iframe').length," +
      " iframeTitle: ifr ? (ifr.getAttribute('title')||'') : ''," +
      " nutTat: !!n && n.disabled," +
      " coGiaiThich: !!(id && document.getElementById(id)) };"
  );
}
