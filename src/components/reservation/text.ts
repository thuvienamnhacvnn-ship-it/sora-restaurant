/*
 * Chữ riêng trang Reservierung — nhãn giao diện không có trong
 * src/i18n/de.json (file đó do agent khác giữ, không được sửa).
 * Chỉ nhãn thao tác, không có câu quảng cáo.
 * `vi: null` -> pick() tự rơi về DE cho tới khi Sếp duyệt bản dịch.
 */

export type Txt = { de: string; vi: string | null };

export const RT = {
  /* Thẻ Master Chef trên trang này đổi sang ngữ cảnh Service Assistant
     (KIT 03_RESERVIERUNG.md: "table area, allergy note, birthday, family
     seating, group size"). Câu dưới chỉ liệt kê đúng 4 chủ đề đó, không phải
     câu quảng cáo. Câu chung "Was möchtest du heute genießen?" là ngữ cảnh
     gợi ý MÓN, sai chỗ ở trang đặt bàn. */
  chefQuestion: {
    de: "Fragen zu Tischbereich, Allergien, Geburtstag oder großen Gruppen?",
    vi: null,
  },
  /* Dòng giải thích ngay dưới nút gửi đang bị khoá. Trưởng nhóm chốt nguyên
     văn ngày 04/10: người dùng phải thấy đường đi TRƯỚC khi bấm, chứ không
     bấm một nút sống rồi mới biết nó không gửi được. */
  submitHint: {
    de: "Online-Reservierung in Kürze verfügbar — bitte telefonisch reservieren",
    vi: null,
  },
  /* Nhãn trạng thái cho khu vực đang chọn. KIT accessibility: trạng thái
     không bao giờ chỉ phân biệt bằng màu — phải có cả icon và chữ. */
  selected: { de: "Ausgewählt", vi: null },
} satisfies Record<string, Txt>;
