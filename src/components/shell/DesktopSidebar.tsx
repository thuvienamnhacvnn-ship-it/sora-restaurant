"use client";

/*
 * Sidebar trái cố định.
 *  >=1200px: 256px đầy đủ (KIT `sidebar.desktop`)
 *  768-1199px: 88px, chỉ icon (KIT "compact sidebar 88px icon-first")
 *  <768px: không có, nhường cho top bar + bottom nav
 *
 * Mục đang chọn KHÔNG phải pill đặc: dùng vệt cọ đỏ `decor/red_brush.svg`
 * làm nền, đúng mẫu. Đỏ chỉ xuất hiện ở đúng một mục -> giữ tỉ lệ đỏ <=7%.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SoRaLogo } from "./SoRaLogo";
import {
  BrushPill,
  CornerSakura,
  SeigaihaWash,
} from "@/components/decor/Decor";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NAV, LEGAL_NAV, type NavKey } from "@/data/site";
import { href, type Locale, LOCALES } from "@/lib/i18n";

const NAV_ICON: Record<NavKey, IconName> = {
  home: "home",
  menu: "utensils",
  reservation: "calendar",
  gallery: "images",
  // Soi 1:1 mẫu `_w-agent/mau/01_home.png` ngày 05/10: "Über uns" là icon NHÓM
  // NGƯỜI (không phải ngôi sao lấp lánh) và "Kontakt" là ỐNG NGHE ĐIỆN THOẠI
  // (không phải phong bì). Hai cái này trước đặt sai.
  about: "users",
  contact: "phone",
};

export function DesktopSidebar({
  locale,
  labels,
  legalLabels,
  navLabel,
  languageLabel,
}: {
  locale: Locale;
  labels: Record<NavKey, string>;
  legalLabels: Record<string, string>;
  navLabel: string;
  languageLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-w)] flex-col border-r border-gold/25 bg-elevated md:flex"
      aria-label={navLabel}
    >
      {/*
       * ---- LỚP HOẠ TIẾT (sở hữu: components/decor) ----
       * Mẫu (soi 1:1 cả 6 ảnh, sidebar giống hệt nhau): trường sóng seigaiha
       * rất nhạt trên nền + cành hoa đào góc TRÊN-TRÁI (rộng ~44% bề ngang
       * sidebar, sâu ~66px) + cành hoa đào góc DƯỚI-TRÁI to hơn (~51% bề
       * ngang, bắt đầu ở ~70% chiều cao). Bộ SVG cũ mảnh như nét vẽ, không
       * giống mẫu -> đổi sang bộ WebP Sếp gửi.
       */}
      {/*
       * Đo lại 04/10 trên dải mép trái x 0..59 (bỏ logo ra khỏi phép đo, vì
       * logo có mặt trời đỏ + hoa đỏ sẽ lẫn vào), so `mau/01_home.png`:
       *
       * | | mẫu | trước khi sửa |
       * |---|---|---|
       * | cành trên | hoa bám mép liên tục tới **y=215** | hết ở y=42 |
       * | cành dưới | y 700–768 | y 753–819 (thấp hơn 53px, đậm hơn 57%) |
       *
       * Cành trên thiếu vì `CornerSakura` chỉ cao `width/ratio` = 330/3,0 =
       * 110px, hộp nằm ở y −42..68 nên không thể với tới y=215. Mẫu không
       * phải một cành góc đơn độc mà là **cành góc + dải hoa chạy dọc mép** —
       * đúng thứ `PageHero` đã dùng. Thêm `SakuraEdge` nối tiếp xuống.
       */}
      <SeigaihaWash size={44} opacity={0.042} className="z-0" />
      {/*
       * MỘT cành liền, không phải cành góc + dải chạy dọc.
       *
       * Thử `SakuraEdge` trước (18:58) — số khớp mẫu (lệch −6%) nhưng NHÌN thì
       * sai: nó lát ảnh theo kiểu lật chéo nên ra một vệt xám nhoè dọc mép,
       * không ra hoa. Mẫu là một cành duy nhất từ góc trên chảy xuống, nhìn rõ
       * từng bông. Nên phóng to chính cành góc cho nó với tới y≈215 thay vì
       * chắp thêm lớp thứ hai.
       *
       * Cao = width/ratio (ratio 3,0). Muốn đáy ở y≈215 với top −45 thì cần
       * cao ≈ 260 → width ≈ 780. Phần dày của tệp `wide` nằm ở MÉP TRÁI nên
       * đẩy `offsetX` âm sâu: hoa bám mép sidebar, phần thưa tràn ra ngoài.
       */}
      <CornerSakura
        corner="tl"
        art="wide"
        width={780}
        offsetX={-312}
        offsetY={-45}
        opacity={0.8}
        className="z-0 max-xl:hidden"
      />
      {/*
       * Cành dưới: GIỮ NGUYÊN cỡ và tệp của trưởng nhóm, chỉ dời lên 51px.
       *
       * Đo trên mẫu (dải mép trái x 0..59): cụm hoa ở **y 700–768**; bản cũ
       * `offsetY={122}` đặt nó ở y 753–819 — **thấp hơn 53px**. `corner="bl"`
       * tính từ đáy nên tăng offsetY là dời LÊN: 122 → 173.
       *
       * Đã thử phóng to (`wide`, width 420) cho giống "cành có thân" như mẫu —
       * HỎNG: cành chạy chéo hết bề ngang sidebar, phạm đúng mục Never của KIT
       * (*"Sakura phủ kín mọi section"*). Mẫu là một cụm GỌN ở góc dưới-trái.
       * Khác biệt còn lại so với mẫu là hình dáng cành, không sửa được bằng
       * tham số — cần đúng tệp cành mà mockup đã dùng.
       */}
      {/*
       * Soi `05_ASSETS/mockups/01_home.png` + `06_kontakt.png` ở ĐỘ PHÂN GIẢI
       * GỐC (hai trang giống hệt nhau): cành vào từ MÉP TRÁI, có thân gỗ chạy
       * chéo lên, hoa chỉ chiếm **x 0–115, y 666–786**, KHÔNG chạm dòng DE|VI,
       * và tan dần chứ không có cạnh cắt.
       *
       * Phải dùng `wide`, không phải `branch`: theo chính bảng `CORNER_ART`,
       * `wide` dày ở mép TRÁI và TRỐNG ở mép phải — tức cành vào từ trái, phần
       * còn lại trong suốt nên không có vết cắt. `branch` thì dày ở mép PHẢI
       * (đo lại: hoa đặc nhất ở 60–70% bề ngang tệp), đặt ở góc dưới-trái là
       * hoa dồn sai phía rồi bị xén.
       *
       * Cao = width/3,0 = 110px; đáy hộp đặt ở y≈786 → offsetY = 941−786 = 155.
       */}
      <span
        aria-hidden="true"
        data-decor=""
        className="pointer-events-none absolute left-0 z-0 select-none max-xl:hidden"
        style={{
          bottom: 90,
          width: 210,
          height: 215,
          backgroundImage: "url(/decor/sakura-sidebar-bottom.webp)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          // Tệp này cắt thẳng từ ảnh mẫu nên NỀN TỐI đi kèm, không có alpha.
          // `lighten` lấy giá trị sáng hơn giữa nền và ảnh: nền tối của ảnh
          // thua nền tối của sidebar nên biến mất, chỉ còn hoa. Nhờ vậy không
          // phải tách nền — mà tách nền thì thân gỗ nâu sẫm sẽ mất theo.
          mixBlendMode: "lighten",
        }}
      />

      <Link
        href={href("/", locale)}
        className="relative mt-10 flex justify-center px-4 xl:mt-10"
        aria-label="SoRa — Home"
      >
        <span className="hidden xl:block">
          <SoRaLogo size={160} priority />
        </span>
        <span className="xl:hidden">
          <SoRaLogo size={52} priority />
        </span>
      </Link>

      <nav className="relative mt-9 flex flex-1 flex-col gap-1.5 xl:mt-10" aria-label={navLabel}>
        {NAV.map((item) => {
          const target = href(item.path, locale);
          const active =
            item.path === "/" ? pathname === target : pathname.startsWith(target);
          return (
            <Link
              key={item.key}
              href={target}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-11 items-center gap-3.5 px-7 text-[17px] transition-colors xl:px-7 ${
                active ? "text-text" : "text-muted hover:text-gold-bright"
              } max-xl:justify-center max-xl:px-0`}
              title={item.key}
            >
              {/*
               * decor: vệt cọ đỏ nền mục đang chọn. Mẫu cho thấy vệt chạy
               * ~85% bề ngang sidebar và mép phải TƯỚP như cọ thật — chỉ bản
               * WebP có cái đuôi tướp đó, SVG cũ là một hình đặc cắt ngọt.
               */}
              {active && <BrushPill />}
              <Icon
                name={NAV_ICON[item.key]}
                size={24}
                className={`relative shrink-0 ${active ? "text-gold-bright" : ""}`}
              />
              <span className="relative max-xl:sr-only">{labels[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto px-5 pb-6 max-xl:px-2">
        {/* DE | VI */}
        <div
          className="flex items-center justify-center gap-2 border-b border-gold/25 pb-3 text-[13px] tracking-[.1em]"
          aria-label={languageLabel}
        >
          {LOCALES.map((code, i) => (
            <span key={code} className="flex items-center gap-2">
              {i > 0 && <span className="text-gold/40">|</span>}
              <Link
                href={switchLocale(pathname, code)}
                hrefLang={code}
                aria-current={code === locale ? "true" : undefined}
                className={
                  code === locale
                    ? "text-gold-bright"
                    : "text-muted hover:text-gold-bright"
                }
              >
                {code.toUpperCase()}
              </Link>
            </span>
          ))}
        </div>

        {/*
          4 icon mạng xã hội của mẫu CHƯA dựng được: Sếp chưa gửi tài khoản
          Instagram / Facebook / TikTok / số WhatsApp. Luật: trường null thì
          ẩn khối, không để icon chết không bấm được.
        */}

        <div className="mt-3 flex flex-col items-center gap-1 text-[12px] text-muted/70 max-xl:hidden">
          {LEGAL_NAV.map((l) => (
            <Link
              key={l.key}
              href={href(l.path, locale)}
              className="hover:text-gold-bright"
            >
              {legalLabels[l.key]}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

/** Đổi tiền tố ngôn ngữ nhưng giữ nguyên trang đang xem. */
function switchLocale(pathname: string, next: Locale): string {
  const rest = pathname.replace(/^\/(de|vi)(?=\/|$)/, "");
  return `/${next}${rest}`;
}
