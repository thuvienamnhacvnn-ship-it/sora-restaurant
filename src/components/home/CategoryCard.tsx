/*
 * MỘT THẺ DANH MỤC — cấu trúc đúng mục 13 lời Sếp:
 *
 *   <article class="the"><div class="visual"/><div class="content"/></article>
 *
 * Ảnh là LỚP NỀN riêng (`.sora-the-dm-anh`), chữ là lớp trên (`…-noi`). Không
 * biến cả thẻ thành một ảnh, không nướng chữ vào bitmap (mục 19) — nhờ vậy
 * đổi DE/VI, hover, máy đọc màn hình và SEO đều chạy.
 *
 * Nút `Entdecken` chỉ là HÌNH, không phải thẻ bấm: cả thẻ đã là một `<Link>`,
 * lồng thẻ bấm trong thẻ bấm là HTML sai và máy đọc màn hình đọc ra hai liên
 * kết cho cùng một chỗ. (Cùng lý do đã ghi trong `DaiPosterMon`.)
 *
 * Mọi số đo nằm ở `globals.css` khối "TRANG CHỦ v2" — thẻ tự co giãn theo
 * `cqw` nên không có con số nào viết tay ở đây.
 */
import Image from "next/image";
import Link from "next/link";
import { CategorySelect } from "./HomeDishes";

export function CategoryCard({
  to,
  anh,
  han,
  tua,
  phu,
  nhanNut,
  lon = false,
  gach = false,
  uuTien = false,
  sizes,
  category,
}: {
  to: string;
  /** Đường dẫn ảnh đã cắt khung (bản `-inner`), khung vàng do CSS vẽ. */
  anh: string;
  /** Chữ Hán nhỏ phía trên tiêu đề (mục 10). */
  han: string;
  tua: string;
  phu: string;
  nhanNut: string;
  /** Thẻ SUSHI: to hơn, chữ bên trái, viền 2px, bo 20px. */
  lon?: boolean;
  /** Gạch vàng dưới chữ phụ — ảnh mẫu CHỈ thẻ SUSHI có (02_chot §3-F). */
  gach?: boolean;
  uuTien?: boolean;
  sizes: string;
  category: string;
}) {
  return (
    <article
      className={`sora-the-dm sora-hien ${lon ? "sora-the-dm--lon" : "sora-the-dm--nho"}`}
    >
      <CategorySelect category={category} title={tua} />

      <div aria-hidden="true" className="sora-the-dm-anh">
        {/* `unoptimized`: bộ đệm ảnh của Next đánh theo URL và không hỏi lại
            tệp trên đĩa, nên khâu làm sạch PNG ghi đè tệp cùng tên là trang
            giữ BẢN CŨ — hôm nay ra đúng cái chữ "Rolls" còn nướng trong ảnh.
            Lý do đầy đủ ở `anhThe()` trong `CategoryShowcase.tsx`. */}
        <Image
          src={anh}
          alt=""
          fill
          sizes={sizes}
          priority={uuTien}
          unoptimized
        />
      </div>

      <div className="sora-the-dm-noi">
        {/* `lang="ja"` để trình duyệt chọn đúng hình chữ Hán kiểu Nhật — cùng
            một mã Unicode nhưng Nhật và Trung vẽ khác nhau. */}
        <span className="sora-the-dm-han" lang="ja">
          {han}
        </span>
        <h3 className="sora-the-dm-tua">{tua}</h3>
        <p className="sora-the-dm-phu">{phu}</p>
        {gach && <span aria-hidden="true" className="sora-the-dm-gach" />}
        <Link href={to} className="sora-the-dm-nut" aria-label={`${nhanNut}: ${tua}`}>
          {nhanNut}
          <span className="sora-tc-mui-ten">→</span>
        </Link>
      </div>
    </article>
  );
}
