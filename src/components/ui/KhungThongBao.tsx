/*
 * Khung thông báo / câu hướng dẫn — MỘT kiểu cho mọi trang con (Sếp 11/10:
 * «các thông báo không để bên ngoài và phải sắp xếp trong khung, có khung
 * viền riêng»).
 *
 * Mọi câu dẫn, lưu ý, ghi chú đứng một mình đều đi qua đây: viền vàng mảnh
 * riêng, icon bên trái, chữ bên phải. Câu nào thuộc về một thẻ thì khung này
 * nằm TRONG thẻ đó, đúng chỗ ngữ cảnh — không trôi giữa banner và nội dung.
 *
 * Cấu trúc lấy từ kho: flowbite `content/components/alerts.md` mục "Bordered
 * alerts" + "Alerts with icon" (`flex items-start p-4 text-sm rounded border`
 * + icon `shrink-0` + khối chữ), kiểu viền của daisyUI `alert-outline`.
 * Đổi sang token SoRa; bỏ màu nền theo mức độ và nút đóng (đây là lời dẫn
 * tĩnh, không phải cảnh báo tắt được).
 *
 * `role="note"` chứ KHÔNG `role="alert"`: `alert` bắt máy đọc màn hình đọc
 * chen ngang ngay khi trang mở — sai với một câu hướng dẫn tĩnh.
 */
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function KhungThongBao({
  icon = "info",
  children,
  className = "",
}: {
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      data-khung-thong-bao=""
      className={`flex items-start gap-2.5 rounded-[var(--radius-btn)] border border-[var(--border-gold)] bg-[#0f0d0a] px-3.5 py-2.5 text-[13px] leading-[1.55] text-[#cfc5b3] ${className}`}
    >
      <Icon name={icon} size={16} className="mt-[2px] shrink-0 text-gold" />
      <div className="min-w-0 [&>p]:m-0">{children}</div>
    </div>
  );
}
