/*
 * Khung chung cả site. Server component — chỉ truyền chữ đã dịch xuống
 * mấy mảnh client (sidebar / mobile nav / rail / drawer).
 */
import type { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileNav } from "./MobileNav";
import { RightUtilityRail } from "./RightUtilityRail";
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

      <main
        id="inhalt"
        className="relative min-h-dvh pt-14 pb-20 md:ml-[var(--sidebar-w)] md:pt-0 md:pb-0"
      >
        {children}
      </main>

      <RightUtilityRail
        locale={locale}
        labels={{
          masterChef: t("rail.masterChef"),
          whatsapp: t("rail.whatsapp"),
          instagram: t("rail.instagram"),
          support: t("rail.support"),
          close: t("common.close"),
          callUs: t("common.callUs"),
        }}
      />
    </MasterChefProvider>
  );
}
