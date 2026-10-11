/*
 * HERO TRANG CHỦ v2 — BA LỚP, không phải một ảnh.
 *
 * Vì sao ba lớp chứ không cắt một miếng từ ảnh mẫu (02_chot §4): trong
 * `mau-1.png` mặt bàn marble bắt đầu ở y≈560 còn hero chỉ cao 558px tính từ
 * đỉnh — hai thứ đó không cùng nằm trong một khung cắt nào. Và mục 2 lời Sếp
 * cấm nướng chữ vào ảnh, nên cột chữ bắt buộc phải là HTML.
 *
 *   lớp 0  ảnh nhà hàng `mau-1` (hoa đào mép trên + lòng quán + marble đáy)
 *   lớp 1  đĩa sushi `mau-2` — PNG nền trong, góc phải dưới, tràn nhẹ
 *   lớp 2  cột chữ bên trái + dải chữ dọc mép phải
 *
 * KHÔNG PHỦ LỚP MÀU LÊN ẢNH. Đã đo vùng đặt chữ trên chính ảnh gốc: trung vị
 * lum 23, chỉ 11,6% điểm ảnh vượt lum 120 (`01_spec.md` §4). Chữ đọc được nhờ
 * bóng đổ của chính nó (`.sora-on-photo-block`), đúng luật Sếp.
 *
 * Mọi số đo nằm ở `globals.css` khối "TRANG CHỦ v2", kèm toạ độ đo trên ảnh
 * mẫu — đừng rải số vào đây.
 */
import Image from "next/image";
import { SoRaLogo } from "@/components/shell/SoRaLogo";
import { restaurant } from "@/data/restaurant";
import { RestaurantBrushName } from "./RestaurantBrushName";
import { SidebarSocial } from "@/components/shell/SidebarSocial";
import { HeroDishes } from "./HomeDishes";
import { TableSetting } from "./TableSetting";
import Link from "next/link";
import { WordmarkSora } from "@/components/chu/ChuCo";
import {
  FallingPetals,
  NE_CHU_HERO,
  PetalsSettled,
} from "@/components/decor/Decor";
import { MasterChefCard } from "@/components/shell/MasterChefCard";
import { Icon } from "@/components/ui/Icon";
import { href, type Locale } from "@/lib/i18n";

/** Ảnh nhà hàng, xuất từ `mau-1.png` (1672×941) — xem `02_dev.md`. */
const NEN = "/hero/warm-oriental-interior-v1.png";
/** Đĩa sushi nền trong, xuất từ `mau-2.png`, đã cắt đúng hộp alpha. */

export function HomeHero({
  locale,
  eyebrow,
  dong1,
  dong2,
  phu,
  ctaChinh,
  ctaPhu,
  chuDoc,
  chef,
}: {
  locale: Locale;
  eyebrow: string;
  dong1: string;
  dong2: string;
  phu: string;
  ctaChinh: string;
  ctaPhu: string;
  /** Dải chữ dọc trang trí mép phải. */
  chuDoc: string;
  chef: { eyebrow: string; question: string; cta: string };
}) {
  return (
    <section className="sora-tc-hero sora-on-photo-block">
      <div className="sora-mobile-home-brand"><SoRaLogo size={132} priority /><RestaurantBrushName /><p>{restaurant.tagline}</p></div>
      <div aria-hidden="true" className="sora-mobile-home-stone"><Image src="/hero/golden-marble-platform.png" alt="" width={2172} height={724} sizes="260vw" priority /></div>
      {/* --- lớp 0: ảnh nhà hàng (chỉ khổ máy tính; điện thoại có khối riêng
          phía dưới, đúng mục 16 "text trước, food sau") --- */}
      <div aria-hidden="true" className="sora-home-backdrop absolute inset-0 z-0 hidden md:block">
        <Image
          src={NEN}
          alt=""
          fill
          /* Trừ sidebar — khối này nằm trong `<main>` có `md:ml-[var(--sidebar-w)]`
             nên chưa bao giờ rộng đúng 100vw ở khổ máy tính. Khai 100vw làm
             Next chọn ảnh to hơn mức cần và in cảnh báo mỗi lần dựng trang. */
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) calc(100vw - 88px), calc(100vw - 250px)"
          className="sora-tc-hero-nen sora-tc-mobile-nen"
        />
        <Image src="/hero/cinematic-dining-room-v1.png" alt="" fill sizes="(max-width: 1199px) calc(100vw - 88px), calc(100vw - 250px)" className="sora-tc-hero-nen sora-tc-desktop-nen" />
      </div>

      <div aria-hidden="true" className="sora-tc-ban-da">
        <Image src="/hero/golden-marble-platform.png" alt="" width={2172} height={724} sizes="100vw" priority />
      </div>

      <div aria-hidden="true" className="sora-tc-hoa-dao">
        <Image src="/hero/cherry-blossoms.png" alt="" width={1672} height={409} sizes="100vw" priority />
      </div>

      {/* Cánh hoa rơi + cánh đã đọng — GIỮ NGUYÊN bộ của dự án (mục 4).
          `neChu` để cánh né cột chữ, đúng như `PageHero` vẫn làm. */}
      <FallingPetals left={0} neChu={NE_CHU_HERO} className="sora-tc-canh-roi hidden md:block" />
      <FallingPetals dense left={0} className="sora-tc-canh-roi md:hidden" />
      <PetalsSettled neChu={NE_CHU_HERO} className="hidden md:block" />

      {/* --- lớp 1: đĩa sushi (khổ máy tính) ---
          Một platter duy nhất, góc phải, scale lớn, có khoảng thở — mục 7.
          KHÔNG cắt đĩa, không bóp méo, không đổi góc nhìn: ảnh giữ nguyên tỉ
          lệ gốc, chỉ đặt bằng `width` + `height:auto`. */}
      <HeroDishes locale={locale} />
      <TableSetting locale={locale} />

      {/* --- lớp 2: cột chữ --- */}
      <div className="sora-tc-hero-chu">
        {/*
         * Wordmark là ẢNH nét cọ Sếp gửi (`public/chu/v1/wordmark-sora.webp`),
         * không phải webfont — mục 6: *"không tự viết lại bằng font nếu đã có
         * logo PNG đẹp"*. `chuThat` đặt chữ "SoRa" thật vào DOM cho máy đọc
         * màn hình và máy tìm kiếm, ảnh thì `aria-hidden`.
         *
         * Cỡ đi qua `--chu-tran` (TRẦN BỀ NGANG, nhận độ dài) chứ không qua
         * `tiLe` (chỉ nhận số): bề ngang phải co theo chiều cao hero bằng
         * `--tc-k`, mà `tiLe` không viết được theo `cqh`. `tiLe={2.4}` chỉ để
         * bề ngang tính từ prop luôn LỚN HƠN trần, nhờ vậy trần mới là thứ
         * quyết định. Xem `chu.module.css` phần "ĐƯỜNG THỨ BA ĐẶT CỠ".
         */}
        <WordmarkSora
          the="h1"
          chuThat
          nganGon
          tiLe={2.4}
          className="sora-tc-wordmark"
          style={{
            "--chu-tran": "calc(351 * var(--tc-k))",
            width: "calc(351 * var(--tc-k))",
            maxWidth: "100%",
          } as React.CSSProperties}
        />

        <p className="sora-tc-eyebrow">{eyebrow}</p>
        <span aria-hidden="true" className="sora-tc-gach-do" />

        <h2 className="sora-tc-tieu-de">
          {dong1}
          <br />
          {dong2}
        </h2>

        <p className="sora-tc-phu">{phu}</p>

        <div className="sora-tc-nut-hang">
          <Link
            href={href("/reservierung", locale)}
            className="sora-tc-nut sora-tc-nut--do"
          >
            <Icon name="calendar" size={15} />
            {ctaChinh}
            <span aria-hidden="true" className="sora-tc-mui-ten">
              →
            </span>
          </Link>
          <Link
            href={href("/speisekarte", locale)}
            className="sora-tc-nut sora-tc-nut--vien"
          >
            <Icon name="book-open" size={15} />
            {ctaPhu}
            <span aria-hidden="true" className="sora-tc-mui-ten">
              →
            </span>
          </Link>
        </div>
        <div className="sora-mobile-home-social" data-home-social>
          <SidebarSocial />
          <Link href={href("/master-chef", locale)} aria-label="Master Chef AI" title="Master Chef AI"><Icon name="chef" size={23}/><span>AI</span></Link>
        </div>
      </div>

      {/* Dải chữ dọc trang trí mép phải — HTML `writing-mode: vertical-rl`,
          không phải ảnh (02_chot §4). */}
      <span aria-hidden="true" className="sora-tc-doc">
        {chuDoc}
      </span>

      {/* --- khổ điện thoại: ảnh ĐẶT SAU chữ (mục 16) --- */}
      <div className="sora-tc-anh-dt md:hidden">
        <Image
          src={NEN}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 1px"
          style={{ objectFit: "contain", objectPosition: "center" }}
        />
        <HeroDishes locale={locale} mobile />
      </div>

      {/* Master Chef — giữ nguyên, dạng nổi nhỏ góc trên phải (mục 14).
          Ảnh mẫu không vẽ thẻ này nhưng mục 14 bảo giữ, nên giữ ở dạng không
          chiếm chỗ trong bố cục. */}
      <div className="pointer-events-none absolute top-5 right-6 z-10 hidden xl:block">
        {/* `gon`: ảnh mẫu toàn trang KHÔNG vẽ thẻ này, mà mục 14 lại bảo giữ
            và dặn *"không cần chiếm diện tích lớn"*. Bản gọn thu cột icon
            95 -> 72px, đủ nhỏ để không tranh chỗ với đèn lồng trong ảnh. */}
        <MasterChefCard {...chef} gon />
      </div>
    </section>
  );
}
