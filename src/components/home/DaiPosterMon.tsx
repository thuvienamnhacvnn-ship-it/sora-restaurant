/*
 * Dải 6 poster món ở CHÂN BANNER trang chủ.
 *
 * Sếp 05/10/2026 gửi đúng 6 tệp và nói: "cho 6 ảnh này vào chân banner giữ
 * nguyên kích thước chỉ làm khung bo viền vàng như trước".
 *
 * Đọc kỹ chữ "CHỈ": khung viền vàng, hết. KHÔNG nhãn đè lên ảnh, không tên
 * nhóm, không đếm số món, không mũi tên. Bản `CategoryStrip variant="o-vuong"`
 * đứng ở chỗ này trước đó có một dải tối + chữ ôm sát chân thẻ — bỏ hẳn, vì
 * MỖI POSTER ĐÃ IN SẴN CHỮ trong ảnh (tên món + tên nhóm + mô tả). Thêm nhãn
 * là hai lớp chữ chồng nhau.
 *
 * "Giữ nguyên kích thước" = không cắt. Cả 9 tệp gốc đều VUÔNG 1254×1254, nên
 * khung cũng phải vuông; ảnh vuông đặt vào khung vuông thì `cover` không cắt
 * một pixel nào. Đừng đổi khung sang 4:3 hay 16:9 — là cắt mất chữ in trong
 * ảnh, đúng cái Sếp đã bác hai lần.
 *
 * Thứ tự dưới đây là THỨ TỰ SẾP GỬI, không phải thứ tự số tệp. Giữ nguyên.
 *
 * Không bọc thẻ <Link>: Sếp chỉ bảo đặt ảnh vào khung. Lối vào thực đơn vẫn
 * còn ở nút "Speisekarte entdecken" trên hero và ở thanh bên.
 */
import Image from "next/image";

/*
 * `ten` dùng cho `alt` — chữ in TRONG ảnh thì máy đọc màn hình không đọc được,
 * nên phải chép ra đây. Lấy đúng tên in trên poster, không tự đặt tên khác.
 */
const POSTER = [
  { tep: "a4", ten: "Pho Ha Noi" },
  { tep: "a6", ten: "Xoi Xoai Nep Than" },
  { tep: "a8", ten: "Rotes Curry" },
  { tep: "a9", ten: "Sashimi Mix" },
  { tep: "a1", ten: "Nem Hai San" },
  { tep: "a3", ten: "Flying Singapore" },
];

export function DaiPosterMon() {
  return (
    /*
     * 6 cột từ `xl`. Số học của khung: hàng rộng 1184 chia 6 thẻ với 5 khe
     * 12px thì mỗi thẻ vuông cao (1184 − 5×12)/6 = 187px — thấp hơn bản 5 thẻ
     * (227px), nên trang chủ khoá-một-màn-hình càng dư chỗ, không lo tràn.
     * `minmax(0,1fr)` đã nằm sẵn trong `grid-cols-N` của Tailwind.
     */
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {POSTER.map((p) => (
        <li key={p.tep}>
          {/* Khung bo viền vàng — giữ ĐÚNG `rounded-[var(--radius-card)]` và
              `border-gold/45` của thẻ cũ để cả trang cùng một kiểu viền. */}
          <span className="relative block aspect-square overflow-hidden rounded-[var(--radius-card)] border border-gold/45 bg-elevated">
            <Image
              src={`/anh/nhiem-vu/${p.tep}.webp`}
              alt={p.ten}
              fill
              /* Đo thật trên màn 1568: mỗi ô ra 245px, không phải 187px như
                 tính nhẩm (hàng rộng hơn vì SectionFrame nới ở khổ lớn). Khai
                 thiếu thì Next lấy bản nhỏ hơn cần và ảnh bị mờ — khai 260px
                 cho dư một nhịp. */
              sizes="(max-width: 639px) 50vw, (max-width: 1199px) 33vw, 260px"
              style={{ objectFit: "cover" }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
