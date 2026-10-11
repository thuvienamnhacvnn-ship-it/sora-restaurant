/*
 * Chữ riêng trang Kontakt — nhãn giao diện không có trong src/i18n/de.json
 * (file đó do agent khác giữ). Chỉ nhãn thao tác, không có câu quảng cáo.
 * Bản VI điền 05/10: đây là NHÃN THAO TÁC (nút, câu báo trạng thái), không
 * phải câu quảng cáo — nên dịch được mà không đụng luật "chưa ai được tự dịch
 * nội dung". Câu quảng cáo của trang vẫn nằm trong <ChoSep/> chờ Sếp.
 */

export type Txt = { de: string; vi: string | null };

export const CT = {
  map: { de: "Karte", vi: "Bản đồ" },
  /* Thẻ Master Chef trang này đổi sang ngữ cảnh customer care
     (KIT 06_KONTAKT.md: "opening hours, reservation navigation, menu
     questions"). Câu chung "Was möchtest du heute genießen?" là ngữ cảnh gợi
     ý MÓN, sai chỗ ở trang liên hệ. */
  chefQuestion: {
    de: "Fragen zu Öffnungszeiten, Reservierung oder Speisekarte?",
    vi: "Cần hỏi về giờ mở cửa, đặt bàn hay thực đơn?",
  },
  /* Nhãn nút WhatsApp — spec §13 xếp vào nhóm "nhãn nút UI chung, dùng tạm
     được". Tiêu đề quảng cáo của mockup (`LIEBER DIREKT ÜBER WHATSAPP?`)
     KHÔNG lấy. Khối này đang ẩn vì chưa có số. */
  whatsappCta: { de: "Jetzt auf WhatsApp schreiben", vi: "Nhắn WhatsApp ngay" },
  /* Khối bản đồ nạp theo kiểu "hai cú bấm" (xem MapBlock.tsx). Câu dưới là
     cách diễn đạt quen thuộc ở Đức: nói rõ bấm vào là nối sang Google và dữ
     liệu chạy sang đó, không hứa hẹn gì thêm. */
  mapLoad: { de: "Interaktive Karte laden", vi: "Tải bản đồ tương tác" },
  /* Link mở hồ sơ quán trên Google Maps ở tab mới (Sếp gửi link 07/10). */
  mapOpen: { de: "In Google Maps öffnen", vi: "Mở trong Google Maps" },
  /* Ghi công ảnh bản đồ tĩnh — BẮT BUỘC theo giấy phép ODbL. Tên riêng của
     dự án nên bản VI giữ nguyên tên, chỉ dịch chữ "người đóng góp". */
  mapAttribution: {
    de: "© OpenStreetMap-Mitwirkende",
    vi: "© Người đóng góp OpenStreetMap",
  },
  mapPrivacy: {
    de: "Beim Laden der interaktiven Karte werden Daten an Google übertragen.",
    vi: "Khi tải bản đồ tương tác, dữ liệu sẽ được gửi sang Google.",
  },
} satisfies Record<string, Txt>;
