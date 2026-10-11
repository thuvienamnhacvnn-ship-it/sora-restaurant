/*
 * Chỗ giữ cho nội dung Sếp chưa gửi.
 *
 * Luật: câu quảng cáo trong 7 ảnh mockup là chữ AI viết, CẤM chép vào web
 * (spec §13). Thà để lộ chỗ trống còn hơn ship chữ bịa.
 *
 * HAI DÁNG, khác nhau ở chỗ dùng:
 *  - trong THÂN TRANG: nhạt, nghiêng — trông đúng là chỗ trống.
 *  - trong HERO: chữ mô tả sáng rõ, đúng cỡ/đậm/bóng của chữ thật sẽ có.
 *    Lý do: Sếp duyệt thiết kế bằng mắt trên trang thật. Giữ chỗ mà mờ hơn
 *    thành phẩm thì Sếp đang duyệt một thứ không tồn tại. Chỉ cụm
 *    `[chờ Sếp gửi]` để nhạt làm dấu.
 *
 * ⚠ Mọi kiểu chữ/màu của khối này nằm trong `globals.css`, KHÔNG đặt class
 *   Tailwind ở đây. Tailwind xếp `utilities` SAU `components`, mà thứ tự lớp
 *   thắng cả độ ưu tiên chọn — nên một class `text-[13px]` trên thẻ này sẽ đè
 *   luôn luật hero dù luật hero chọn cụ thể hơn. Đã dính đúng bẫy đó một lần.
 *
 * Mỗi chỗ đều có `note` để QA và Sếp biết chính xác đang thiếu đoạn nào.
 * Đếm nhanh số chỗ còn thiếu: grep -rn "<ChoSep" src/
 */
/**
 * Dấu giữ chỗ ẨN — dùng ở các trang con từ đợt làm lại 07/10.
 *
 * Sếp chê trang trông như bản nháp vì dòng "[chờ Sếp gửi]" + thanh xám lộ ra
 * cho khách. Bố cục mới phải đẹp khi chữ còn trống, nên chỗ chờ KHÔNG vẽ gì
 * ra trang. Cơ chế đếm giữ nguyên: thẻ vẫn mang `data-cho-sep` trong DOM
 * (grep "<ChoSep" và `querySelectorAll("[data-cho-sep]")` vẫn ra đủ), chỉ
 * là `hidden`. Có chữ thật thì thay thẻ này bằng đoạn văn.
 */
export function ChoSepAn({ note }: { note: string }) {
  return <span hidden data-cho-sep={note} data-cho-sep-an="" />;
}

export function ChoSep({
  note,
  lines = 1,
  className = "",
}: {
  note: string;
  lines?: number;
  className?: string;
}) {
  return (
    <p className={className} data-cho-sep={note}>
      <span data-cho-sep-nhan>[chờ Sếp gửi]</span>{" "}
      <span data-cho-sep-chu>{note}</span>
      {lines > 1 && (
        <span data-cho-sep-thanh-boc aria-hidden="true">
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <span
              key={i}
              data-cho-sep-thanh
              style={{ width: `${88 - i * 11}%` }}
            />
          ))}
        </span>
      )}
    </p>
  );
}
