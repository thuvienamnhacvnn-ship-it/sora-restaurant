/*
 * Khung chung cả site. Server component — chỉ truyền chữ đã dịch xuống
 * mấy mảnh client (sidebar / mobile nav / rail / drawer).
 */
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileAppNav";
import { MasterChefProvider } from "@/components/chef/MasterChef";
import { CHU_NHAN, coChuNetCo } from "@/components/chu/ChuCo";
import { NAV, type NavKey } from "@/data/site";
import { getT, href, type Locale } from "@/lib/i18n";

export function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const t = getT(locale);

  /*
   * Chữ thanh điều hướng lấy từ `CHU_NHAN` TRƯỚC, `t()` chỉ là đường lùi.
   *
   * `t("nav.menu")` đi qua `src/i18n/vi.json` — tệp đó CỐ Ý còn rỗng (chưa ai
   * được tự dịch nội dung), nên mọi khoá rơi về tiếng Đức. Hậu quả: toàn bộ
   * site `/vi` hiện thanh menu bằng tiếng Đức — "Speisekarte", "Über uns" —
   * trong khi chữ tiếng Việt CHO ĐÚNG MẤY NHÃN NÀY đã có sẵn và đã lên bản
   * live từ lâu dưới dạng ảnh nét cọ (`nav-vi-thuc-don`, `nav-vi-lien-he`…).
   *
   * Nên đây không phải tự dịch thêm nội dung: chỉ là dùng lại đúng bộ chữ đã
   * duyệt, thay vì để hai chỗ trên cùng một trang gọi một mục bằng hai tên.
   * Luật "không tự dịch" vẫn giữ nguyên cho phần CÂU CHỮ của trang.
   */
  const navLabels = Object.fromEntries(
    NAV.map((n) => {
      if (!coChuNetCo(n.key)) return [n.key, t(`nav.${n.key}`)];
      // `MucChu` khai `vi?` là KHÔNG bắt buộc, kèm luật "thiếu `vi` thì rơi về
      // `de`". Hiện mọi mục nav đều có `vi` nên viết `[locale].chu` vẫn chạy,
      // nhưng thế là dựa vào dữ liệu chứ không dựa vào hợp đồng — thêm một
      // nhãn chỉ có tiếng Đức là vỡ. Theo đúng luật đã khai.
      const muc = CHU_NHAN[n.key];
      return [n.key, (muc[locale] ?? muc.de).chu];
    })
  ) as Record<NavKey, string>;

  const legalLabels = {
    imprint: t("nav.imprint"),
    privacy: t("nav.privacy"),
  };

  return (
    <CartProvider locale={locale}>
    <MasterChefProvider
      locale={locale}
      strings={{
        eyebrow: t("chef.eyebrow"),
        title: t("chef.title"),
        question: t("chef.question"),
        inputPlaceholder: t("chef.inputPlaceholder"),
        send: t("chef.send"),
        chips: {
          light: t("chef.chips.light"),
          hearty: t("chef.chips.hearty"),
          sushi: t("chef.chips.sushi"),
          vegetarian: t("chef.chips.vegetarian"),
          surprise: t("chef.chips.surprise"),
        },
        viewDish: t("chef.viewDish"),
        otherSuggestions: t("chef.otherSuggestions"),
        fallback: t("chef.fallback"),
        notConnected: t("chef.notConnected"),
        close: t("common.close"),
        menuHref: href("/speisekarte", locale),
      }}
    >
      <DesktopSidebar
        locale={locale}
        labels={navLabels}
        legalLabels={legalLabels}
        navLabel={t("nav.mainNav")}
        languageLabel={t("nav.language")}
      />

      <MobileNav
        locale={locale}
        labels={{
          nav: navLabels,
          legal: legalLabels,
          more: t("nav.mobileMore"),
          openMenu: t("nav.openMenu"),
          closeMenu: t("nav.closeMenu"),
          reserve: t("home.ctaPrimary"),
          language: t("nav.language"),
        }}
      />

      {/*
       * `flow-root` CHẶN MARGIN COLLAPSING — không phải trang trí.
       *
       * Bệnh (đo 07/10): `/de/impressum` và `/de/datenschutz` có thanh cuộn
       * CHẾT đúng 40px ở mọi cỡ desktop — `scrollHeight = clientHeight + 40`,
       * cuộn xuống chẳng lộ ra gì vì nội dung đã hết từ y≈507 trên trang dài
       * 940px.
       *
       * Cơ chế: ở `md` trở lên khối này KHÔNG có `padding-top` (`md:pt-0`) nên
       * `margin-top: 40px` của con đầu tiên (`LegalPage` mở bằng
       * `SectionFrame !mt-10`) **trượt xuyên qua mép trên** và đẩy chính khối
       * này xuống y=40 — trong khi nó vẫn chiếm đủ `min-h-dvh`. Tổng cao thành
       * 100dvh + 40. Khổ điện thoại không dính vì `pt-14` đã chặn sẵn.
       *
       * `display: flow-root` lập một BFC: lề của con ở lại BÊN TRONG, không
       * đẩy cha. Chữa đúng nguyên nhân cho MỌI trang có con đầu mang lề trên,
       * thay vì trừ bù 40px ở một chỗ khác rồi trang sau lại dính lại.
       */}
      <main
        id="inhalt"
        className="sora-app-main relative flow-root min-h-dvh pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))] md:ml-[var(--sidebar-w)] md:pt-0 md:pb-0"
      >
        {children}
      </main>
    </MasterChefProvider>
    </CartProvider>
  );
}
