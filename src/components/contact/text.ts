/*
 * Chữ riêng trang Kontakt — nhãn giao diện không có trong src/i18n/de.json
 * (file đó do agent khác giữ). Chỉ nhãn thao tác, không có câu quảng cáo.
 * `vi: null` -> pick() tự rơi về DE cho tới khi Sếp duyệt bản dịch.
 */

export type Txt = { de: string; vi: string | null };

export const CT = {
  map: { de: "Karte", vi: null },
  /* Thẻ Master Chef trang này đổi sang ngữ cảnh customer care
     (KIT 06_KONTAKT.md: "opening hours, reservation navigation, menu
     questions"). Câu chung "Was möchtest du heute genießen?" là ngữ cảnh gợi
     ý MÓN, sai chỗ ở trang liên hệ. */
  chefQuestion: {
    de: "Fragen zu Öffnungszeiten, Reservierung oder Speisekarte?",
    vi: null,
  },
  /* Nhãn nút WhatsApp — spec §13 xếp vào nhóm "nhãn nút UI chung, dùng tạm
     được". Tiêu đề quảng cáo của mockup (`LIEBER DIREKT ÜBER WHATSAPP?`)
     KHÔNG lấy. Khối này đang ẩn vì chưa có số. */
  whatsappCta: { de: "Jetzt auf WhatsApp schreiben", vi: null },
} satisfies Record<string, Txt>;
