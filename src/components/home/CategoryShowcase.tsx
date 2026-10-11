/*
 * KHU DANH MỤC — 1 thẻ lớn SUSHI bên trái + lưới 2×2 bên phải (mục 8).
 *
 * Thay cho `DaiPosterMon` (dải 5 thẻ BẰNG NHAU): mục 23 lời Sếp cấm thẳng
 * *"không tạo 5 card cùng kích thước như catalog cứng nhắc"*.
 *
 * Tỉ lệ cột viết bằng `fr` theo đúng số đo trên ảnh mẫu (713 / 885 ở 1920),
 * nên đúng ở mọi bề ngang màn mà không phải chọn lại số tròn. Chi tiết trong
 * `globals.css` khối "TRANG CHỦ v2".
 *
 * ẢNH THẺ: dùng bản `-inner` (đã xoá chữ + cắt bỏ khung vàng) do khâu làm
 * sạch PNG xuất ra; khung vàng vẽ bằng CSS (02_chot §3-E). Khi chạy mà bản
 * `-inner` chưa có thì tự rơi về bản `-tam` cắt thô từ ảnh mẫu — xem
 * `anhThe()` bên dưới. Không chờ, cũng không im lặng dùng nhầm ảnh.
 */
import fs from "node:fs";
import path from "node:path";
import { CategoryCard } from "./CategoryCard";
import { href, type Locale } from "@/lib/i18n";

type MucDanhMuc = {
  /** Mã nhóm trong `data/categories.json` — dùng cho đường dẫn lọc thực đơn. */
  ma: string;
  /** Tên tệp ảnh (slug theo mục 22 lời Sếp). */
  anh: string;
  han: string;
  tua: { de: string; vi: string };
  /** Dòng phụ = tên món, KHÔNG dịch: khách cầm thực đơn in phải khớp. */
  phu: string;
};

/*
 * Năm nhóm, đúng thứ tự mục 8: SUSHI lớn, rồi hàng 1 `HAUPTGERICHTE |
 * VIETNAMESISCHE KÜCHE`, hàng 2 `DESSERT | GETRÄNKE`.
 *
 * Chữ DE chép đúng ảnh mẫu. Chữ VI lấy NGUYÊN từ `DaiPosterMon` đang chạy —
 * không tự dịch thêm chữ nào, đúng luật ở đầu `src/lib/i18n.ts`.
 *
 * Năm chữ Hán: 寿司 do Sếp cho (mục 9), 甘味 đọc được trong ảnh mẫu `mau-6`,
 * còn 主菜 · 越南 · 飲物 là đề xuất — xem mục CẦN HỎI SẾP trong `02_dev.md`.
 */
const DANH_MUC: MucDanhMuc[] = [
  {
    ma: "sushi",
    anh: "sushi",
    han: "寿司",
    tua: { de: "SUSHI", vi: "SUSHI" },
    phu: "Sashimi Mix | Signature Rolls",
  },
  {
    ma: "hauptgerichte",
    anh: "hauptgerichte",
    han: "主菜",
    tua: { de: "HAUPTGERICHTE", vi: "MÓN CHÍNH" },
    phu: "Rotes Curry | SoRa-Sauce",
  },
  {
    ma: "vietnamese-classics",
    anh: "vietnamesische-kueche",
    han: "越南",
    /* "KÜCHE" chứ không "KLASSIKER": chữ Sếp viết cho thẻ trang chủ là
       *Küche*, còn `data/categories.json` (dịch từ thực đơn in) ghi
       *Klassiker* và trang Speisekarte vẫn dùng bản đó. Hai trang lệch nhau
       một chữ, có chủ ý — xem `01_spec.md` §9-J. */
    tua: { de: "VIETNAMESISCHE KÜCHE", vi: "MÓN VIỆT" },
    phu: "Phở | Bún | Reisnudeln",
  },
  {
    ma: "desserts",
    anh: "dessert",
    han: "甘味",
    tua: { de: "DESSERT", vi: "TRÁNG MIỆNG" },
    phu: "Matcha | Mango | Mochi",
  },
  {
    ma: "getraenke",
    anh: "getraenke",
    han: "飲物",
    tua: { de: "GETRÄNKE", vi: "ĐỒ UỐNG" },
    phu: "Signature Drinks | Cocktails",
  },
];

/*
 * Chọn tệp ảnh cho một thẻ, kèm DẤU PHIÊN BẢN theo giờ sửa tệp.
 *
 * Chạy ở phía máy chủ, lúc dựng trang — không tốn gì ở trình duyệt.
 *
 * 1. `existsSync` chứ không ghi cứng tên tệp: khâu làm sạch PNG chạy SONG SONG
 *    với khâu dựng giao diện, nên có lúc tệp `-inner` chưa kịp ra. Ghi cứng thì
 *    trang gãy ảnh; `<img onerror>` thì lỗi chỉ hiện ở trình duyệt. Cách này tự
 *    đổi ngay khi tệp thật xuất hiện, không phải sửa dòng nào.
 *
 * 2. `?v=<mtime>` + `unoptimized` (xem `CategoryCard`) là BẮT BUỘC, không phải
 *    cho chắc. Bộ tối ưu ảnh của Next đánh bộ đệm theo (url, w, q, định dạng)
 *    và KHÔNG hỏi lại tệp trên đĩa. Ghi đè tệp cùng tên là nó trả BẢN CŨ mãi
 *    mãi. Đã dính thật hôm nay: khâu làm sạch ghi `sushi-inner.webp` lần đầu
 *    còn nguyên chữ nướng trong ảnh, rồi ghi đè bản sạch — trang vẫn hiện chữ
 *    "Rolls" thò ra bên phải tiêu đề SUSHI.
 *
 *    ĐIỀU ĐÁNG NHỚ NHẤT: tệp trên đĩa sạch, và `curl` lấy về cũng sạch ở phần
 *    lớn biến thể. Chỉ ĐÚNG biến thể trình duyệt dùng (750w + webp) mới là bản
 *    cũ. Tức soi tệp gốc KHÔNG BAO GIỜ phát hiện được lỗi này — phải chụp
 *    trang thật rồi nhìn. (Dự án đã dính hai lần trước đây, cùng một cơ chế,
 *    xem ghi chú trong `DaiPosterMon` và `[lang]/page.tsx` cũ.)
 *
 *    Vì sao KHÔNG chỉ dùng `?v=` mà bỏ `unoptimized`: Next 16 chặn ảnh nội bộ
 *    có chuỗi truy vấn trừ khi khai trước trong `images.localPatterns`, mà
 *    `search` ở đó phải khớp ĐÚNG MỘT chuỗi cố định — không khai được dấu
 *    phiên bản đổi theo giờ sửa tệp. Nên: `unoptimized` để tránh hẳn bộ đệm
 *    của Next, `?v=` để bộ đệm của TRÌNH DUYỆT cũng không giữ bản cũ.
 */
function anhThe(slug: string): string {
  const duong = `/categories/${slug}-inner.webp`;
  try {
    const tep = path.join(process.cwd(), "public", duong.slice(1));
    return `${duong}?v=${Math.round(fs.statSync(tep).mtimeMs)}`;
  } catch {
    // Tệp chưa có -> trả đường dẫn trần. Ảnh gãy là thấy ngay, đúng ý: thà
    // hỏng ồn ào còn hơn im lặng hiện nhầm một ảnh còn chữ nướng trong đó.
    return duong;
  }
}

export function CategoryShowcase({
  locale,
  nhanNut,
}: {
  locale: Locale;
  nhanNut: string;
}) {
  const [sushi, ...nho] = DANH_MUC;
  const duongDan = (ma: string) =>
    `${href("/speisekarte", locale)}?kategorie=${ma}`;

  return (
    <div className="sora-tc-luoi">
      <CategoryCard
        lon
        gach
        uuTien
        to={duongDan(sushi.ma)}
        category={sushi.anh}
        anh={anhThe(sushi.anh)}
        han={sushi.han}
        tua={sushi.tua[locale]}
        phu={sushi.phu}
        nhanNut={nhanNut}
        /* 44,2% vùng nội dung ở máy tính, cả bề ngang ở điện thoại. */
        sizes="(max-width: 767px) 100vw, (max-width: 1199px) calc(100vw - 88px), calc((100vw - 250px) * 0.44)"
      />

      <div className="sora-tc-luoi-nho">
        {nho.map((m) => (
          <CategoryCard
            key={m.ma}
            to={duongDan(m.ma)}
            category={m.anh}
            anh={anhThe(m.anh)}
            han={m.han}
            tua={m.tua[locale]}
            phu={m.phu}
            nhanNut={nhanNut}
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) calc((100vw - 88px) / 2), calc((100vw - 250px) * 0.27)"
          />
        ))}
      </div>
    </div>
  );
}
