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
 * ⚠⚠ BÀI NÀY GHI ĐÈ `data/restaurant-info.json` — TỆP DỮ LIỆU THẬT CỦA QUÁN.
 *
 * Hỏng tệp đó không dừng ở chuyện bài kiểm sai. Ai chạy bài này, máy tắt giữa
 * chừng, hôm sau `git add` rồi deploy, thì **web của một nhà hàng có thật sẽ
 * hiện email bịa và số WhatsApp bịa**. Luật Sếp cấm bịa số điện thoại — mà
 * thứ phá luật lại chính là bộ kiểm của mình. Máy này hay tắt đột ngột (nghi
 * nguồn), nên đây là sự cố CÓ THẬT, không phải giả định.
 *
 * Bốn lớp chặn, xếp từ ngoài vào:
 *   1. chỉ chạy với máy chủ localhost — tên miền thật là THOÁT NGAY;
 *   2. **tự phục hồi lúc khởi động**: thấy `.sao-luu-kiem` còn sót tức lần
 *      trước chết giữa đường -> chép ngược về và in cảnh báo to;
 *   3. **trả tệp trong `process.once("exit")`** — chạy cả khi `process.exit()`
 *      hay Ctrl-C, không chỉ khi script kết thúc đẹp. `SIGINT`/`SIGTERM` được
 *      bắt và chuyển thành `process.exit(3)` để lọt vào đó;
 *   4. `finally` trả lần nữa rồi **so từng byte** và soát trang xem còn vết
 *      dữ liệu thử không — lớp này báo cáo, ba lớp trên mới là lớp chặn.
 *
 * Giá trị thử cố tình vô nghĩa (`KIEM-THU-…`, `example.invalid`) để nếu có
 * sót lại thì nhìn một giây là biết, không ai nhầm là dữ liệu thật.
 *
 * Lớp 2 và 3 thêm ngày 05/10 vì bản đầu chỉ có `finally` — tức chỉ bảo vệ
 * đường chạy suôn sẻ. Ctrl-C là tệp nằm lại với số giả, và chú thích thì dặn
 * người ta tự chép tay, trong khi người đọc chú thích đó chính là người đã
 * không có mặt lúc máy sập.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { dungKhung, soKetQua, cho } from "./lib/trinh-duyet.mjs";

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

/*
 * LỚP 2 — tự phục hồi. Chạy TRƯỚC mọi thứ khác.
 *
 * Còn `.sao-luu-kiem` nghĩa là lượt trước chết giữa đường (Ctrl-C, mất điện,
 * tiến trình bị giết) và `restaurant-info.json` đang mang dữ liệu thử. Chép
 * ngược về ngay, đừng đợi ai đọc chú thích rồi chép tay.
 */
if (fs.existsSync(SAO_LUU)) {
  const cuu = fs.readFileSync(SAO_LUU, "utf8");
  const dangCo = fs.existsSync(TEP) ? fs.readFileSync(TEP, "utf8") : "";
  if (dangCo !== cuu) {
    fs.writeFileSync(TEP, cuu, "utf8");
    console.error(
      "\n  ════════════════════════════════════════════════════════════════\n" +
        "   ĐÃ TỰ PHỤC HỒI `data/restaurant-info.json`\n" +
        "   Lượt chạy TRƯỚC chết giữa đường và để tệp dữ liệu thật nằm lại\n" +
        "   với dữ liệu thử (email + WhatsApp giả). Đã chép ngược bản sao lưu.\n" +
        "   Kiểm cho chắc:  git diff data/restaurant-info.json\n" +
        "  ════════════════════════════════════════════════════════════════\n"
    );
  }
  fs.rmSync(SAO_LUU, { force: true });
}

/* Giá trị thử. Số WhatsApp lấy đúng dạng wa.me (chỉ chữ số) nhưng là dãy
   không tồn tại; email/instagram mang chữ KIEM-THU để không thể nhầm.

   `banDoDaXacNhan` là CÔNG TẮC (boolean), KHÔNG phải URL — đổi ngày 05/10.
   Hai trường cũ `googleMapsUrl` + `googleMapsPlaceUrl` đã bỏ vì mỗi cái mang
   sẵn một bản địa chỉ gõ tay (`Rheinbrückstraße 24` viết đầy đủ) sống song
   song với `address.street` = `Rheinbrückstr. 24` — đúng loại hai-nguồn-sự-thật
   đã làm hỏng prop `chu`. Chuỗi tìm cho iframe giờ dựng tại chỗ từ `address`.
   Nên ở đây KHÔNG đặt URL giả nữa, chỉ bật công tắc. */
const THU = {
  email: "kiem-thu@example.invalid",
  whatsapp: "490000000000",
  instagram: "https://instagram.com/KIEM-THU-khong-ton-tai",
  banDoDaXacNhan: true,
};

/*
 * MỐC của trang Kontakt. Phải là thứ ĐÚNG CẢ HAI VÒNG của bài kiểm: vòng 1
 * (dữ liệu null) và vòng 2 (đã vá dữ liệu thử).
 *
 * Làm lại 07/10: cột phải trang Kontakt là THẺ GỌI ĐIỆN khi chưa có e-mail
 * và là FORM khi đã có — hai vòng ra hai thứ khác nhau, nên mốc là "một
 * trong hai đã dựng xong" + khối địa chỉ (có ở cả hai vòng). Nút WhatsApp hay
 * iframe thì CHỈ có ở một vòng, lấy làm mốc là bài kiểm tự treo.
 *
 * Không có mốc thì chạy nhiều bộ một lượt sẽ đo lúc `next dev` còn đang biên
 * dịch route — Kontakt từng báo 5 HỎNG giả (`undefined ô`) đúng vì chuyện này.
 */
const MOC_KONTAKT =
  "const f=document.querySelector('form');" +
  "const duForm = !!f && f.querySelectorAll('input').length === 4 &&" +
  " !!f.querySelector('textarea') && !!f.querySelector('button[type=submit]');" +
  "const duThe = document.querySelectorAll('[data-the-goi-dien] a[href^=\"tel:\"]').length === 2;" +
  "return (duForm || duThe) && document.querySelectorAll('address').length >= 1;";

/*
 * KHOÁ ĐỘC QUYỀN. Bài này là bài DUY NHẤT ghi vào `data/restaurant-info.json`,
 * mà mọi bài khác lại đọc cùng một máy chủ dev. Chạy song song thì bài kia đo
 * trang trong lúc dữ liệu đang bị vá — ví dụ `kiem-trang` khẳng định trang
 * Liên hệ KHÔNG có `mailto`/`wa.me`/iframe, trong khi vòng 2 ở đây vừa bật cả
 * ba. Kết quả nhiễm, và nhiễm theo kiểu trông như trang hỏng.
 *
 * Tôi tự đạp vào đúng bẫy này: chạy `kiem-khoi-an` và `kiem-trang` cùng lúc
 * cho nhanh. Cùng họ lỗi "tài nguyên dùng chung giữa các lượt chạy" đã làm
 * hỏng chuyện cổng Chrome cố định. Nên chặn bằng mã chứ không bằng cách nhớ.
 *
 * `wx` = tạo mới, thất bại nếu đã tồn tại. Khoá cũ quá 10 phút thì coi là rác
 * của một lượt bị giết giữa đường và chiếm lại.
 */
/* Khoá để trong thư mục TẠM của hệ điều hành, không để trong `data/`: lượt nào
   bị giết giữa đường mà khoá còn sót thì nó không hiện ra trong `git status`
   của repo sẽ giao khách. */
const KHOA = path.join(os.tmpdir(), "sora-kiem-khoi-an.khoa");

/* Tiến trình ghi khoá còn sống không? `kill(pid, 0)` không gửi tín hiệu nào,
   chỉ hỏi "có tiến trình này không" — chạy được cả trên Windows. */
const conSong = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM"; // tồn tại nhưng của người dùng khác
  }
};

try {
  fs.writeFileSync(KHOA, String(process.pid), { flag: "wx" });
} catch {
  /*
   * Hỏi TIẾN TRÌNH còn sống không, đừng chỉ nhìn tuổi của khoá.
   * Bản đầu chặn theo tuổi 10 phút — thử tay 05/10 thì thấy ngay chỗ dở: bị
   * giết cứng một phát là khoá rác nằm đó và CHẶN MỌI LƯỢT SAU suốt 10 phút,
   * dù chẳng còn ai chạy. Hỏi hệ điều hành thì biết chính xác.
   */
  let chu = NaN;
  try {
    chu = Number(fs.readFileSync(KHOA, "utf8").trim());
  } catch {
    /* khoá vừa bị xoá giữa hai lệnh -> coi như rác */
  }
  if (conSong(chu)) {
    console.error(
      "\n  THOÁT: một lượt `kiem-khoi-an` khác ĐANG CHẠY (pid " + chu + ")\n" +
        "  và đang VÁ tệp dữ liệu. Bài này phải chạy MỘT MÌNH.\n" +
        "  Đợi nó xong rồi chạy lại.  (Khoá: " + KHOA + ")\n"
    );
    process.exit(3);
  }
  fs.writeFileSync(KHOA, String(process.pid), "utf8"); // chiếm lại khoá rác
}
const gocJson = fs.readFileSync(TEP, "utf8");
fs.writeFileSync(SAO_LUU, gocJson, "utf8");

/*
 * LỚP 3 — lưới đỡ cuối. Chạy cả khi `process.exit()` được gọi giữa chừng.
 *
 * `writeFileSync` là ĐỒNG BỘ nên dùng được trong handler `exit` (handler đó
 * không chờ việc bất đồng bộ). Trả tệp TRƯỚC rồi mới xoá khoá: lỡ bước nào
 * ném lỗi thì thứ quan trọng hơn đã xong.
 */
process.once("exit", () => {
  try {
    if (fs.readFileSync(TEP, "utf8") !== gocJson) {
      fs.writeFileSync(TEP, gocJson, "utf8");
    }
    fs.rmSync(SAO_LUU, { force: true });
  } catch {
    /* Không đọc/ghi được thì `.sao-luu-kiem` còn đó, lượt sau tự phục hồi. */
  }
  try {
    fs.rmSync(KHOA, { force: true });
  } catch {
    /* đã xoá */
  }
});

/* Ctrl-C và `kill` KHÔNG chắc chắn đi qua handler `exit`, nên bắt lại rồi
   chuyển thành `process.exit(3)` — mã 3 = "bài kiểm không chạy tới nơi",
   không phải mã 1 = "trang sai". */
for (const tin of ["SIGINT", "SIGTERM"]) {
  process.once(tin, () => {
    console.error("\n  Dừng giữa chừng (" + tin + ") — đang trả lại tệp dữ liệu…");
    process.exit(3);
  });
}

const s = soKetQua();
let b;

try {
  b = await dungKhung();

  /* ---------------- vòng 1: CHƯA CÓ dữ liệu -> mọi khối phải ẨN ----------
   *
   * Vòng này phải TỰ TẮT `banDoDaXacNhan` chứ không dùng nguyên tệp thật.
   * Lý do: từ 05/10 tệp thật có `banDoDaXacNhan: true` (Sếp đã gửi link Maps),
   * nên "dùng nguyên tệp thật" KHÔNG còn là trạng thái chưa-có-dữ-liệu. Lần
   * đầu tôi viết mục này theo tiền đề cũ và nó báo HỎNG đều ba lượt — tiền đề
   * sai, không phải trang sai.
   *
   * `email` / `whatsapp` / `instagram` thì vẫn đang `null` thật nên để nguyên.
   */
  const jsonVong1 = JSON.stringify(
    { ...JSON.parse(gocJson), banDoDaXacNhan: false },
    null,
    2
  );
  fs.writeFileSync(TEP, jsonVong1 + "\n", "utf8");
  await cho(6000); // `next dev` biên dịch lại; JSON nằm trong chuỗi import

  s.muc("chưa có dữ liệu -> ẩn");
  const an = await doKhoi();
  s.ghi("không có nút WhatsApp", an.wa === 0, an.wa + " liên kết");
  s.ghi("không có nút Instagram", an.insta === 0, an.insta + " liên kết");
  s.ghi("không có email", an.mailto === 0, an.mailto + " liên kết");
  /* Chưa xác nhận bản đồ -> `MapBlock` trả về `KhoiTinh`: chỉ địa chỉ + nút chỉ
     đường. Nên phải vắng CẢ HAI: iframe và nút nạp bản đồ. Kiểm thêm cái nút
     vì nếu chỉ kiểm iframe thì một `KhoiTinh` lỡ mọc nút nạp vẫn "đạt". */
  s.ghi("không nhúng bản đồ", an.iframe === 0, an.iframe + " iframe");
  s.ghi("chưa xác nhận -> cũng không có nút nạp bản đồ",
    an.nutBanDo === 0, an.nutBanDo + " nút");
  // Làm lại 07/10: chưa có e-mail thì KHÔNG dựng form (bản cũ dựng form với
  // nút khoá + hộp giải thích) — cột phải là thẻ gọi điện với hai số thật.
  s.ghi("không dựng form khi chưa có e-mail", an.form === false);
  s.ghi("có thẻ gọi điện thay cho form", an.theGoi === true);

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
  s.ghi("form mọc ra, nút gửi BẬT", hien.form === true && hien.nutTat === false);
  s.ghi("thẻ gọi điện nhường chỗ cho form, không còn khối giải thích",
    hien.theGoi === false && hien.coGiaiThich === false);

  /*
   * BẢN ĐỒ SAU CỔNG ĐỒNG Ý — hai cú bấm, không nhúng thẳng.
   *
   * Quán ở Đức, trang có Impressum + Datenschutz. Nhúng iframe Google Maps
   * ngay khi mở trang là gửi IP của khách sang Google TRƯỚC khi khách đồng ý
   * (LG München I, 20.01.2022, 3 O 17493/20). `MapBlock.tsx` vì thế đặt
   * `BAT_BUOC_DONG_Y = true` và chỉ gắn iframe sau khi bấm "Karte laden".
   *
   * Bài kiểm cũ đo iframe NGAY khi mở trang nên báo "0 iframe" + "iframe
   * thiếu title" — **bài kiểm sai, trang đúng**. Và tuyệt đối KHÔNG gỡ cổng
   * đồng ý để bài kiểm xanh: đó là quyết định rủi ro pháp lý của Sếp.
   *
   * Mốc kiểm QUAN TRỌNG NHẤT ở đây là cái ĐẦU TIÊN: có dữ liệu bản đồ mà
   * CHƯA bấm thì phải 0 iframe. Trước đây không bài nào bắt được nếu ai đó lỡ
   * đặt `BAT_BUOC_DONG_Y = false`.
   */
  s.ghi("có dữ liệu bản đồ mà CHƯA bấm -> 0 iframe (không byte nào sang Google)",
    hien.iframe === 0, hien.iframe + " iframe");
  s.ghi("hiện nút nạp bản đồ", hien.nutBanDo === 1, hien.nutBanDo + " nút");

  const daBam = await b.js(
    "const n=[...document.querySelectorAll('button')].find(e=>/Karte laden/i.test(e.textContent));" +
      "if(!n) return 'KHONG THAY NUT'; n.click(); return 'ok';"
  );
  await cho(800);

  if (daBam !== "ok") {
    /* HỎNG, không phải LỖI-K: nút nạp bản đồ là thứ trang PHẢI có khi
       `banDoDaXacNhan` bật. Vắng nó thì khách không có đường nào xem bản đồ —
       đó là trang sai. Và đừng để nó lặng lẽ thành "0 iframe" như trước. */
    s.ghi("bấm được nút nạp bản đồ", false, "không thấy nút nạp bản đồ");
    s.ghi("bản đồ chuyển sang iframe nhúng", false, "chưa bấm được nút");
    s.ghi("iframe có title cho máy đọc", false, "chưa bấm được nút");
  } else {
    const sauBam = await b.js(
      "const ifr=document.querySelector('iframe');" +
        "return { so: document.querySelectorAll('iframe').length," +
        " title: ifr ? (ifr.getAttribute('title')||'') : ''," +
        " lazy: ifr ? ifr.getAttribute('loading') : null," +
        " src: ifr ? (ifr.getAttribute('src')||'').slice(0,120) : '' };"
    );
    s.ghi("bấm được nút nạp bản đồ", true, "ok");
    s.ghi("bản đồ chuyển sang iframe nhúng", sauBam.so === 1, sauBam.so + " iframe");
    s.ghi("iframe có title cho máy đọc", sauBam.title.length > 0, sauBam.title || "THIẾU");
    /* `src` trỏ vào hồ sơ quán bằng `cid` (Sếp gửi link 07/10), hoặc — khi
       dữ liệu chưa có cid — dựng từ `address`. Cả hai đường đều KHÔNG được
       chứa một địa chỉ gõ tay thứ hai (`…straße` viết đầy đủ): đó là chốt
       chặn cho chuyện hai-nguồn-sự-thật gỡ ngày 05/10. */
    const srcGiai = decodeURIComponent(sauBam.src);
    s.ghi("src iframe trỏ hồ sơ quán (cid) hoặc dựng từ địa chỉ thật",
      (/[?&]cid=\d{10,}/.test(srcGiai) || /Rheinbrückstr\./.test(srcGiai)) && !/stra(ß|ss)e/i.test(srcGiai),
      sauBam.src.slice(0, 70) || "RỖNG");
  }

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
      /* Nút nạp bản đồ: đếm riêng. Dùng `textContent` chứ KHÔNG `innerText` —
         nhãn nút in hoa bằng CSS, mà `innerText` trả về chữ ĐÃ biến đổi theo
         `text-transform` nên so "Karte laden" là trượt. */
      " nutBanDo: [...document.querySelectorAll('button')]" +
      "   .filter(e=>/Karte laden/i.test(e.textContent)).length," +
      " form: !!f, theGoi: !!document.querySelector('[data-the-goi-dien]')," +
      " nutTat: !!n && n.disabled," +
      " coGiaiThich: !!(id && document.getElementById(id)) };"
  );
}
