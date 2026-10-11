/*
 * Nhãn nét cọ: ẢNH và CHỮ THẬT phải cùng một ngôn ngữ, trên cả 12 tuyến.
 *
 * Chạy:  node scripts/kiem-chu-song-ngu.mjs [goc]
 *
 * VÌ SAO CÓ BÀI NÀY — đã hỏng thật ngày 04/10: `/vi/speisekarte` hiện ảnh
 * nét cọ "Thực đơn" nhưng chữ thật ẩn bên trong lại là "Speisekarte". Người
 * nhìn thấy đúng, máy đọc màn hình và máy tìm kiếm đọc ra tiếng Đức. Nguyên
 * nhân: `PageHero` truyền `chu={t("nav.*")}` — mà `vi.json` đang rỗng nên
 * `t()` rơi về DE, trong khi tên tệp ảnh thì `ChuCo` tự tra theo `locale`.
 * Hai nguồn sự thật cho cùng một nhãn, lệch nhau mà KHÔNG AI THẤY ĐƯỢC trên
 * màn hình. Đúng loại lỗi chỉ bài kiểm bắt được.
 *
 * Nên bài này so BA thứ với nhau, không phải hai:
 *   1. ngôn ngữ trong TÊN TỆP ảnh   (nav-de-… / nav-vi-…)
 *   2. CHỮ THẬT ẩn trong DOM
 *   3. ngôn ngữ của chính TUYẾN đang mở
 * Khớp hai cái bất kỳ mà lệch cái thứ ba thì vẫn HỎNG.
 *
 * Lưu ý về chuỗi rơi về DE: `vi.json` CỐ Ý còn rỗng (chưa ai được tự dịch nội
 * dung), nên phần CÂU CHỮ trên trang VI đang là tiếng Đức — đó là đúng thiết
 * kế. Bài này chỉ xét NHÃN nét cọ, thứ đã có đủ cả hai bản.
 */
import { dungKhung, soKetQua } from "./lib/trinh-duyet.mjs";

const GOC = (process.argv[2] || "http://localhost:3160").replace(/\/$/, "");

/* Bản sao của `CHU_NHAN` trong `src/components/chu/ChuCo.tsx`, chỉ phần nhãn
   dùng làm tiêu đề trang. Khai lại ở đây là CÓ Ý: bài kiểm phải biết câu trả
   lời đúng một cách độc lập. Nhập chính module kia thì nếu ai sửa sai trong
   đó, bài kiểm sẽ sai y hệt và báo ĐẠT. */
const NHAN = {
  menu: { de: ["nav-de-speisekarte", "Speisekarte"], vi: ["nav-vi-thuc-don", "Thực đơn"] },
  reservation: { de: ["nav-de-reservierung", "Reservierung"], vi: ["nav-vi-dat-ban", "Đặt bàn"] },
  gallery: { de: ["nav-de-galerie", "Galerie"], vi: ["nav-vi-bo-suu-tap", "Bộ sưu tập"] },
  about: { de: ["nav-de-ueber-uns", "Über uns"], vi: ["nav-vi-ve-chung-toi", "Về chúng tôi"] },
  contact: { de: ["nav-de-kontakt", "Kontakt"], vi: ["nav-vi-lien-he", "Liên hệ"] },
};

const TUYEN = [
  ["speisekarte", "menu"],
  ["reservierung", "reservation"],
  ["galerie", "gallery"],
  ["ueber-uns", "about"],
  ["kontakt", "contact"],
];

const b = await dungKhung();
const s = soKetQua();

for (const ngonNgu of ["de", "vi"]) {
  s.muc(ngonNgu === "de" ? "tiếng Đức" : "tiếng Việt");

  for (const [duongDan, khoa] of TUYEN) {
    const [tepMong, chuMong] = NHAN[khoa][ngonNgu];
    /* Mốc: `h1` đã có ảnh nét cọ BÊN TRONG. Chờ "React đã gắn" chung là không
       đủ — route này có thể còn đang biên dịch khi bài kiểm đã đo, và mốc
       chung thì đạt ngay cả lúc `h1` chưa có gì. */
    const moDuoc = await b
      .go(`${GOC}/${ngonNgu}/${duongDan}`, {
        san: "const h=document.querySelector('h1'); return !!h && !!h.querySelector('img[src*=\"/chu/\"]');",
      })
      .then(() => true)
      .catch((e) => {
        s.ghiLoiKiem(`${ngonNgu}/${duongDan}`, e.message.slice(0, 80));
        return false;
      });
    if (!moDuoc) continue;

    /* Lấy <h1> rồi tách làm hai phần: chữ thật (text node trong h1) và tên
       tệp ảnh nét cọ. `textContent` của h1 CHÍNH LÀ chữ thật, vì ảnh có
       `alt=""` nên không góp chữ nào. */
    const d = await b.js(
      "const h=document.querySelector('h1'); if(!h) return { co:false };" +
        "const im=h.querySelector('img');" +
        "return { co:true, chu:h.textContent.trim(), tep:im?(im.getAttribute('src')||''):''," +
        " alt:im?im.getAttribute('alt'):null, an:im?im.getAttribute('aria-hidden'):null," +
        " srcset:im?(im.getAttribute('srcSet')||im.getAttribute('srcset')||''):'' };"
    );

    const ten = `${ngonNgu}/${duongDan}`;
    if (!d.co) {
      s.ghi(ten, false, "KHÔNG CÓ <h1>");
      continue;
    }

    const tepDung = d.tep.includes(tepMong + ".webp");
    const chuDung = d.chu === chuMong;
    // Tên tệp phải mang ĐÚNG mã ngôn ngữ của tuyến. Bắt riêng để khi hỏng thì
    // biết ngay là lẫn ngôn ngữ, không phải lẫn trang.
    // `(?:v\d+/)?` là CHỦ Ý, đừng dọn cho gọn: đường dẫn chữ có số phiên bản
    // (`/chu/v1/nav-vi-…`) để nginx đặt được cache dài hạn — xem `06_chu.md`
    // §5b. Bỏ nhóm này đi là bài kiểm đỏ trở lại dù site vẫn đúng.
    const maDung = new RegExp("/chu/(?:v\\d+/)?nav-" + ngonNgu + "-").test(d.tep);

    s.ghi(ten + " · ảnh đúng nhãn", tepDung, d.tep.replace("/chu/", ""));
    s.ghi(ten + " · chữ thật đúng ngôn ngữ", chuDung, JSON.stringify(d.chu));
    s.ghi(ten + " · mã ngôn ngữ tệp khớp tuyến", maDung, d.tep.replace("/chu/", ""));
    // Ảnh phải vô hình với máy đọc màn hình, không thì nhãn bị đọc HAI lần.
    s.ghi(ten + " · ảnh ẩn khỏi máy đọc", d.alt === "" && d.an === "true",
      "alt=" + JSON.stringify(d.alt) + " aria-hidden=" + d.an);
    s.ghi(ten + " · có bản @2x", /@2x\.webp 2x/.test(d.srcset), d.srcset ? "có" : "THIẾU");
  }
}

/*
 * Thanh điều hướng — nằm trên MỌI trang, nên lẫn ngôn ngữ ở đây thì lộ khắp
 * site. Khác tiêu đề trang: nav là CHỮ THƯỜNG, không phải ảnh nét cọ, nên
 * phải đo chữ chứ không đo tên tệp. (Lượt đầu tôi tìm `nav img` và ra 0 —
 * mục kiểm sai giả định, không phải web sai.)
 *
 * Chữ mong đợi lấy từ cùng bộ `NHAN` ở trên, tức bộ chữ đã lên bản live dưới
 * dạng ảnh nét cọ. Nav gọi một mục bằng tên khác với tiêu đề trang của chính
 * mục đó là HỎNG, dù chữ đó là tiếng Đức "đúng ngữ pháp".
 */
s.muc("thanh điều hướng");
for (const ngonNgu of ["de", "vi"]) {
  // Mốc: sidebar đã dựng đủ 6 mục nav. Ít hơn 6 là chưa dựng xong.
  const moDuoc = await b
    .go(`${GOC}/${ngonNgu}`, {
      san: "return document.querySelectorAll('aside nav a').length === 6;",
    })
    .then(() => true)
    .catch((e) => {
      s.ghiLoiKiem(ngonNgu + " · chữ nav đúng ngôn ngữ", e.message.slice(0, 80));
      return false;
    });
  if (!moDuoc) continue;
  // `NHAN` không có mục "home" nên chỉ đòi 5 nhãn kia phải có mặt.
  const mong = Object.values(NHAN).map((m) => m[ngonNgu][1]);
  const nav = await b.js(
    "const ds=[...document.querySelectorAll('aside nav a')]" +
      ".map(e=>e.textContent.trim()).filter(Boolean);" +
      "return ds;"
  );
  const thieu = mong.filter((c) => !nav.includes(c));
  s.ghi(ngonNgu + " · chữ nav đúng ngôn ngữ",
    nav.length > 0 && thieu.length === 0,
    nav.join(" · ") + (thieu.length ? "   THIẾU: " + thieu.join(", ") : ""));
}

const kq = s.in();
console.log("\n  gốc: " + GOC);
b.dong();
process.exit(kq.ma);
