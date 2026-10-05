/*
 * ============================================================================
 *  LỚP HOẠ TIẾT TRANG TRÍ DÙNG CHUNG CHO CẢ SITE
 * ============================================================================
 *
 * Nguồn: 9 tệp WebP Sếp gửi 04/10/2026 ở `public/decor/` (bảng mô tả đầy đủ:
 * `_w-agent/05_decor.md`), cộng bộ SVG cũ khi cần VẼ bằng CSS.
 *
 * CHUẨN LÀ ẢNH MẪU `_w-agent/mau/0*.png`, không phải chữ trong KIT. Sếp đã
 * chốt: "làm như mẫu trong KIT" + "ghép decor y hệt mẫu". Hai câu trong KIT —
 * "không phủ hoa đào kín mọi mục" và trần "sakura 2–4%" — KHÔNG áp dụng nữa;
 * mẫu dày tới đâu thì làm tới đó.
 *
 * SÁU LUẬT CỨNG, cài sẵn trong component nên không ai quên được:
 *   1. `aria-hidden="true"
      data-decor=""` — trình đọc màn hình bỏ qua, decor không phải nội dung.
 *   2. `pointer-events: none` — không bao giờ nuốt cú bấm của ô nhập / chip / nút.
 *   3. `user-select: none` — không bị bôi đen khi quét chữ.
 *   4. Mặc định `z-index: 0` và người gọi đặt trong thẻ cha `relative isolate`
 *      còn chữ ở `relative z-10` -> decor LUÔN đứng sau chữ.
 *   5. `prefers-reduced-motion` -> cánh hoa đứng yên (xem decor.module.css).
 *   6. `loading="lazy"` mặc định; chỉ hero trang chủ truyền `eager`.
 *
 * KHÔNG phải "phủ lớp màu lên ảnh": mọi tệp có kênh alpha thật (đã đo 0–255),
 * nó chỉ thêm cánh hoa, không bôi màu lên bức ảnh bên dưới. Luật cấm của Sếp
 * nhắm vào gradient/màn màu che ảnh.
 *
 * Vì sao dùng `background-image` chứ không `next/image`: gần hết hoạ tiết phải
 * CẮT (tán hoa chỉ lấy dải dày ở mép trên), LẶP NGANG, XOAY 90°, hoặc lấy một
 * cánh ra khỏi sprite 900×900. `background-position`/`-size`/`-repeat` làm
 * được cả bốn việc đó trong một thẻ; `next/image` thì không.
 */
import styles from "./decor.module.css";

const BASE = "/decor";

/* -------------------------------------------------------------------------
 * Primitive
 * ---------------------------------------------------------------------- */

type LayerProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Thẻ decor trần. Tự mang 4 luật cứng đầu tiên.
 * Người gọi lo vị trí + kích thước qua `className` (Tailwind) hoặc `style`.
 */
export function DecorLayer({ className = "", style }: LayerProps) {
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute select-none bg-no-repeat ${className}`}
      style={style}
    />
  );
}

/**
 * Mỏ neo cho hoạ tiết đặt GIỮA hai khối của trang.
 *
 * Nhiều hoạ tiết trong mẫu không thuộc về khối nào cả: nó nằm ở máng lề, vắt
 * qua ranh giới hai section. Thả `<DecorAnchor>` vào đúng chỗ đó trong luồng
 * trang là có ngay một gốc toạ độ cao 0px để treo decor, mà không phải sửa
 * một dòng nào trong component của người khác.
 *
 * `top` âm = kéo ngược LÊN khối phía trên.
 */
export function DecorAnchor({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none relative z-0 h-0 w-full select-none ${className}`}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * 1 · Tán hoa đào vắt ngang mép trên — mẫu: cả 6 trang đều có
 * ---------------------------------------------------------------------- */

/**
 * Dải hoa đào dày chạy hết bề ngang, rủ xuống từ mép trên của hero.
 *
 * Đo trên mẫu 1672px: dải dày sâu ~85px, cành lẻ rủ tới ~140px, bông đơn
 * rộng 25–35px. Tệp gốc 1920×640 có bông rộng ~70px và phần dày chiếm 40%
 * chiều cao -> phải thu còn `860px` bề ngang (bông ~31px) rồi LẶP NGANG, và
 * clip thùng chứa ở 120px để chỉ lấy phần dày.
 *
 * `maskImage` làm mép dưới tan dần thay vì cắt ngang một nhát — che chính
 * cánh hoa, không phải phủ màu lên ảnh nền.
 */
const FADE_DOWN =
  "linear-gradient(to bottom, #000 0%, #000 46%, rgba(0,0,0,.55) 74%, transparent 100%)";

export function SakuraCanopy({
  className = "",
  opacity = 0.92,
  height = 98,
  tile = 640,
  eager = false,
  left = 0,
  right = 0,
  xFade,
}: {
  className?: string;
  opacity?: number;
  /** Chiều sâu dải ở desktop (px). Điện thoại tự rút còn 58%. */
  height?: number;
  /** Bề ngang một lần lặp. Nhỏ hơn = bông hoa nhỏ hơn. */
  tile?: number;
  /** Hero trang chủ: true -> không lazy, vẽ ngay từ khung hình đầu. */
  eager?: boolean;
  left?: number | string;
  right?: number | string;
  /** Gradient ngang để né cột chữ. Xem `HeroDecor`. */
  xFade?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute top-0 select-none ${className}`}
      style={
        {
          left,
          right,
          height: `calc(${height}px * var(--decor-scale, 1))`,
          opacity,
          backgroundImage: `url(${BASE}/sakura-canopy.webp)`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          backgroundSize: `calc(${tile}px * var(--decor-scale, 1)) auto`,
          // Hai lớp mask GIAO nhau: lớp dọc làm mép dưới tan dần, lớp ngang
          // (nếu có) kéo tán hoa ra khỏi cột chữ. `intersect` = chỗ nào CẢ HAI
          // cùng cho hiện thì mới hiện.
          maskImage: xFade ? `${FADE_DOWN}, ${xFade}` : FADE_DOWN,
          WebkitMaskImage: xFade ? `${FADE_DOWN}, ${xFade}` : FADE_DOWN,
          maskComposite: xFade ? "intersect" : undefined,
          WebkitMaskComposite: xFade ? "source-in" : undefined,
          contentVisibility: eager ? "visible" : "auto",
        } as React.CSSProperties
      }
    />
  );
}

/* -------------------------------------------------------------------------
 * 2 · Cột hoa đào chạy dọc mép — mẫu: mép trái hero mọi trang, mép phải Kontakt
 * ---------------------------------------------------------------------- */

/**
 * Cột hoa rủ dọc một mép. Cùng tệp tán hoa nhưng XOAY 90°, nên dải dày nằm
 * sát mép còn phần thưa hướng vào trong — đúng cách mẫu bo góc hero.
 *
 * `transform-origin` + offset đã tính sẵn để sau khi xoay, thẻ nằm gọn trong
 * dải `depth` px tính từ mép, cao `run` px tính từ `top`.
 */
export function SakuraEdge({
  side = "left",
  run = 430,
  depth = 132,
  top = 0,
  opacity = 0.8,
  tile = 760,
  className = "",
}: {
  side?: "left" | "right";
  /** Chiều dài cột chạy dọc (px). */
  run?: number;
  /** Bề dày cột tính từ mép vào trong (px). */
  depth?: number;
  top?: number;
  opacity?: number;
  tile?: number;
  className?: string;
}) {
  const left = side === "left";
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        top,
        [left ? "left" : "right"]: 0,
        width: run,
        height: depth,
        // Phép biến hình là TRANSPOSE (lật qua đường chéo), không phải xoay
        // thuần: xoay thuần đẩy dải dày vào phía trong, còn mẫu để dải dày
        // SÁT MÉP. `scaleX(-1) rotate(±90deg)` cho (x,y) -> (y,x): trục ngang
        // của ảnh (hướng lặp) thành trục dọc của trang, còn mép trên của ảnh
        // (chỗ hoa dày) ép đúng vào mép khung.
        transformOrigin: left ? "top left" : "top right",
        transform: left
          ? "scaleX(-1) rotate(90deg)"
          : "scaleX(-1) rotate(-90deg)",
        opacity,
        backgroundImage: `url(${BASE}/sakura-canopy.webp)`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "top center",
        backgroundSize: `${tile}px auto`,
        maskImage:
          "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)",
      }}
    />
  );
}

/* -------------------------------------------------------------------------
 * 3 · Cành hoa đóng khung một góc thẻ — mẫu: Reservierung, Über uns, Kontakt
 * ---------------------------------------------------------------------- */

const CORNER_ART = {
  /** Cành dày ở mép TRÁI tệp (đo: cột trái 72% alpha, cột phải 0%). */
  wide: { file: "sakura-branch-wide.webp", ratio: 1600 / 533 },
  /** Cành dày ở mép PHẢI tệp (đo: cột trái 0%, cột phải 62%). */
  branch: { file: "sakura-branch.webp", ratio: 1100 / 367 },
} as const;

/**
 * Chùm hoa nép vào một góc thẻ. Mẫu đặt chúng ở góc thẻ và mép lề — KHÔNG
 * bao giờ đè lên ô nhập, chip hay nút, nên `width` mặc định để nhỏ và người
 * gọi phải tự kiểm bằng cách bấm thử.
 *
 * `art`: chọn cành có phần dày nằm đúng phía góc cần đóng.
 */
export function CornerSakura({
  corner,
  width = 190,
  opacity = 0.72,
  art = "branch",
  offsetX = 0,
  offsetY = 0,
  className = "",
}: {
  corner: "tl" | "tr" | "bl" | "br";
  width?: number;
  opacity?: number;
  art?: keyof typeof CORNER_ART;
  /** Đẩy ra ngoài mép thẻ cho hoa "tràn" như mẫu. Số âm = ra ngoài. */
  offsetX?: number;
  offsetY?: number;
  className?: string;
}) {
  const { file, ratio } = CORNER_ART[art];
  const top = corner === "tl" || corner === "tr";
  const left = corner === "tl" || corner === "bl";
  // Cành vẽ sẵn hướng sang phải-xuống; lật cho khớp góc còn lại.
  const flipX = art === "branch" ? left : !left;
  const flipY = !top;

  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute select-none ${className}`}
      style={{
        [top ? "top" : "bottom"]: offsetY,
        [left ? "left" : "right"]: offsetX,
        width,
        height: width / ratio,
        opacity,
        backgroundImage: `url(${BASE}/${file})`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
    />
  );
}

/* -------------------------------------------------------------------------
 * 4 · Cánh hoa rơi — mẫu: rải rác trên hero
 * ---------------------------------------------------------------------- */

/*
 * Toạ độ từng cánh trong sprite 900×900, lấy bằng phân tích vùng liên thông
 * trên kênh alpha (không ước lượng bằng mắt).
 */
const PETAL_SPRITE = [
  { x: 473, y: 335, w: 150, h: 114 },
  { x: 660, y: 425, w: 127, h: 90 },
  { x: 317, y: 400, w: 137, h: 80 },
  { x: 567, y: 507, w: 91, h: 70 },
  { x: 517, y: 184, w: 80, h: 90 },
  { x: 204, y: 705, w: 111, h: 84 },
  { x: 42, y: 377, w: 89, h: 117 },
  { x: 433, y: 474, w: 68, h: 56 },
] as const;

/**
 * Bộ cánh ĐỎ vẽ lại 05/10 (Sếp: "màu chưa đúng với hoa đào ở banner").
 *
 * Màu KHÔNG chọn bằng mắt: lấy mẫu 8.918 điểm hoa trong chính
 * `public/banner/home_hero-1920.webp` → trung vị `#b74521`, đậm `#90280e`,
 * sáng `#ee7043`. Bộ cũ `sakura-petals.webp` là hồng nhạt, đặt lên banner đèn
 * lồng ấm thì lạc hẳn tông.
 *
 * Giữ NGUYÊN toạ độ `PETAL_SPRITE` để không phải sửa chỗ nào khác — chỉ thay
 * nội dung tấm sprite. Nguồn vẽ: `scripts/_ve-canh-tam.mjs`.
 */
const PETAL_SHEET = "sakura-petals-do.webp";

/** Một cánh cắt ra khỏi sprite, bay chậm xuống rồi lặp lại. */
function Petal({
  i,
  left,
  top,
  scale,
  dur,
  delay,
  dx,
  dy,
  spin,
}: {
  i: number;
  left: string;
  top: number;
  scale: number;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  spin: number;
}) {
  const p = PETAL_SPRITE[i % PETAL_SPRITE.length];
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute select-none ${styles.drift}`}
      style={
        {
          left,
          top,
          width: p.w * scale,
          height: p.h * scale,
          backgroundImage: `url(${BASE}/${PETAL_SHEET})`,
          backgroundSize: `${900 * scale}px ${900 * scale}px`,
          backgroundPosition: `-${p.x * scale}px -${p.y * scale}px`,
          backgroundRepeat: "no-repeat",
          "--dur": `${dur}s`,
          "--delay": `${delay}s`,
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--spin": `${spin}deg`,
        } as React.CSSProperties
      }
    />
  );
}

/**
 * Vài cánh rơi trên hero. Mẫu chỉ có lác đác chứ không mưa hoa — giữ 5 cánh.
 * Thẻ cha phải `relative` và chính nó `overflow-hidden` để cánh không trôi ra
 * ngoài làm sinh thanh cuộn ngang.
 */
/**
 * Bảng cánh rơi: [sprite, trái %, top, cỡ, giây/vòng, trễ, lệch ngang, rơi sâu, xoay].
 *
 * Sếp 05/10: "rơi chậm và thưa quá, nhìn không giống". Bản cũ 5 cánh, 17–27
 * giây một vòng — mắt gần như không thấy gì chuyển động. Nay **16 cánh, 6–13
 * giây**, trễ rải đều 0–7s để không bao giờ rơi thành từng đợt cùng lúc.
 *
 * Ba điều giữ cho nó giống thật:
 *  - Cánh NHỎ thì rơi CHẬM hơn và lệch ngang NHIỀU hơn (nhẹ, bị gió đưa);
 *    cánh to rơi nhanh và thẳng hơn. Đảo quy tắc này là ra cảm giác giả ngay.
 *  - `dy` khác nhau nhiều (170–380) nên cánh không cùng dừng ở một độ cao.
 *  - Chiều xoay xen kẽ âm/dương, không cánh nào quay cùng tốc độ.
 */
const MUA_CANH: [number, number, number, number, number, number, number, number, number][] = [
  [0, 3, 8, 0.26, 8, 0.0, 30, 560, 170],
  [3, 9, 40, 0.15, 12, 2.6, -52, 520, -240],
  [5, 15, 2, 0.22, 9, 5.1, 26, 580, 150],
  [1, 21, 54, 0.13, 13, 1.2, -60, 500, -200],
  [2, 27, 14, 0.28, 7, 3.8, 34, 600, 190],
  [6, 33, 30, 0.16, 11, 6.3, -44, 530, -170],
  [4, 39, 1, 0.24, 8, 0.9, 22, 570, 210],
  [7, 45, 46, 0.12, 13, 4.4, -58, 490, -260],
  [0, 51, 20, 0.27, 7, 2.1, 38, 590, 160],
  [2, 57, 60, 0.14, 12, 6.9, -48, 480, -220],
  [5, 63, 6, 0.23, 9, 1.7, 28, 560, 180],
  [3, 69, 36, 0.17, 11, 5.6, -40, 520, -190],
  [1, 75, 12, 0.25, 8, 3.2, 32, 580, 200],
  [6, 81, 50, 0.13, 13, 0.4, -56, 500, -250],
  [4, 87, 4, 0.29, 6, 4.9, 24, 620, 140],
  [7, 93, 32, 0.15, 12, 2.3, -50, 530, -210],
];

export function FallingPetals({
  className = "",
  left = 0,
}: {
  className?: string;
  /** Mép trái vùng được phép rơi — dùng để né hẳn cột chữ. */
  left?: number | string;
}) {
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute inset-y-0 right-0 select-none overflow-hidden ${className}`}
      style={{ left }}
    >
      {MUA_CANH.map((c, k) => (
        <Petal
          key={k}
          i={c[0]}
          left={`${c[1]}%`}
          top={c[2]}
          scale={c[3]}
          dur={c[4]}
          delay={c[5]}
          dx={c[6]}
          dy={c[7]}
          spin={c[8]}
        />
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------
 * 8 · Cụm hoạ tiết hero — dùng chung cả 6 trang
 * ---------------------------------------------------------------------- */

/*
 * HÌNH HỌC Ở ĐÂY LÀ SỐ ĐO THẬT, KHÔNG PHẢI ƯỚC LƯỢNG.
 *
 * Cách đo: chụp hero hai lần — một lần bình thường, một lần ẩn hẳn cột chữ —
 * rồi lấy hiệu hai ảnh. Điểm nào khác nhau chính là chỗ chữ THẬT SỰ tô mực,
 * nên không bị đánh lừa bởi phần trong suốt quanh ảnh wordmark. Kết quả ở
 * khổ 1440 (toạ độ trang):
 *
 *   trang chủ     x 283→751   y   0→605      <-- mực chạm MÉP TRÊN hero
 *   speisekarte   x 287→696   y  44→276
 *   reservierung  x 287→720   y  46→279
 *   galerie       x 284→591   y  39→282
 *   ueber-uns     x 281→692   y  38→286
 *   kontakt       x 286→657   y  53→268
 *
 * Hero bắt đầu ở x 256 (hết sidebar), nên quy về toạ độ trong hero:
 *   mực bắt đầu ở x 25, kết thúc chậm nhất ở x 495; đỉnh mực y 38 (trang con)
 *   và y 0 (trang chủ).
 *
 * Suy ra ba vùng ĐƯỢC PHÉP có hoạ tiết:
 *   A. máng lề trái, x 0→24  — trái hẳn mọi nét chữ, mọi trang.
 *   B. dải mỏng y 0→30 phía trên cột chữ — CHỈ trang con; trang chủ mực
 *      chạm y 0 nên không có dải này.
 *   C. từ x 580 sang phải — phải hẳn cột chữ (cột chữ rộng tối đa 520 + lề
 *      32 = 552; lấy 580 cho dư).
 *
 * Mẫu cũng làm đúng thế: `01_home.png` tán hoa dày ở giữa và bên phải, phía
 * trên cột chữ thì thưa hẳn. Sếp vẽ mẫu đã tránh chữ sẵn.
 *
 * ⚠ Cành hoa dày góc trên-trái của mẫu KHÔNG dựng lại được ở trang chủ:
 * wordmark trang chủ tô mực từ y 0 nên không còn một px nào trống. Trong mẫu
 * wordmark nằm thấp hơn (y ~112 quy về 1440). Nếu sau này wordmark hạ xuống
 * thì mở lại cành đó — xem báo cáo gửi trưởng nhóm.
 */
export function HeroDecor({ big = false }: { big?: boolean }) {
  return (
    <>
      {/* --- Khổ điện thoại: ảnh và chữ tách hẳn hai khối, tán hoa nằm trên
              ảnh nên không có chữ nào để che. Một dải full-width là đủ. --- */}
      <SakuraCanopy
        eager={big}
        height={50}
        tile={330}
        className="md:hidden"
      />

      {/* --- Desktop: vùng C — tán hoa dày, bên phải cột chữ --- */}
      <SakuraCanopy
        eager={big}
        height={104}
        tile={660}
        left={580}
        xFade="linear-gradient(to right, transparent 0px, #000 170px, #000 100%)"
        className="hidden md:block"
      />

      {/* --- Vùng B: dải mỏng phía trên cột chữ, chỉ trang con (đỉnh mực
              y 38). Trang chủ mực chạm y 0 nên bỏ hẳn. --- */}
      {!big && (
        <SakuraCanopy
          height={30}
          tile={470}
          opacity={0.85}
          right="calc(100% - 640px)"
          xFade="linear-gradient(to right, #000 0px, #000 400px, transparent 100%)"
          className="hidden md:block"
        />
      )}

      {/* --- Vùng A: cột hoa trong máng lề trái. Sâu 24px, mà nét chữ sớm
              nhất ở x 25 -> không bao giờ chạm chữ, không cần mask né. --- */}
      <SakuraEdge
        side="left"
        run={big ? 430 : 300}
        depth={24}
        tile={460}
        opacity={0.7}
        className="hidden md:block"
      />

      {/*
       * Cánh rơi thả TRÊN TOÀN BỘ bề ngang banner (Sếp 05/10: "phạm vi mở rộng
       * ra toàn bộ ảnh banner"). Trước đây chặn `left={600}` để né cột chữ.
       * Bỏ chặn được vì cánh nằm ở `z-0` còn khối chữ ở `relative z-10` — cánh
       * bay SAU chữ, không che chữ. Tán hoa thì vẫn phải né (nó dày và đục),
       * chỉ cánh rơi mới được qua.
       */}
      <FallingPetals left={0} className="hidden md:block" />
    </>
  );
}

/* -------------------------------------------------------------------------
 * 5 · Nét cọ đỏ
 * ---------------------------------------------------------------------- */

/**
 * Gạch chân dưới dòng eyebrow của hero: một chỉ vàng mảnh chạy hết bề ngang,
 * GIỮA là một đoạn cọ đỏ đè lên.
 *
 * Đo trên mẫu 01_home: chỉ vàng x 298→702 (404px / 1672 ≈ 24% bề ngang nội
 * dung), đoạn đỏ x 457→562 tức ~26% bề ngang chỉ vàng, dày ~3px, nằm ở y 316
 * — ngay dưới "JAPANESE & VIETNAMESE CUISINE".
 */
export function BrushRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none relative block h-[6px] w-full select-none ${className}`}
    >
      <span className="absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-gold/55" />
      <span
        className="absolute top-1/2 left-1/2 block h-[6px] w-[30%] -translate-x-1/2 -translate-y-1/2"
        style={{
          backgroundImage: `url(${BASE}/red-brush.webp)`,
          // Nét cọ chỉ chiếm 51% chiều cao tệp -> phóng dọc 200%, nếu không
          // ở dải 6px nó nhạt thành vệt hồng chứ không ra đỏ son như mẫu.
          backgroundSize: "100% 200%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </span>
  );
}

/**
 * Nét cọ đỏ gạch chân một tiêu đề mục (mẫu: "Beliebte Gerichte").
 * Kéo giãn `100% 100%` chứ không `contain` — `contain` ở dải cao 7px sẽ co
 * ảnh 1200×400 còn ~21px, nhìn như một chấm.
 */
export function BrushUnderline({
  className = "",
  opacity = 0.62,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <DecorLayer
      className={`-bottom-[7px] left-0 h-[8px] w-full ${className}`}
      style={{
        opacity,
        backgroundImage: `url(${BASE}/red-brush.webp)`,
        backgroundSize: "100% 100%",
      }}
    />
  );
}

/** Vệt cọ đỏ làm nền mục đang chọn ở sidebar — mép phải tướp đúng như mẫu. */
export function BrushPill({ className = "" }: { className?: string }) {
  return (
    <DecorLayer
      className={`inset-y-0 left-0 right-3 ${className}`}
      style={{
        backgroundImage: `url(${BASE}/red-brush.webp)`,
        // Nét cọ chỉ chiếm 21%–72% chiều cao tệp 1200×400; phóng dọc 196% để
        // nó phủ gần kín hàng 44px đúng như mẫu, thay vì nằm một vệt mỏng giữa.
        backgroundSize: "100% 196%",
        backgroundPosition: "left center",
      }}
    />
  );
}

/**
 * Gạch đỏ dọc đứng trước tiêu đề mục (mẫu 02, "Beliebte Gerichte").
 *
 * Đo 1:1 trên `02_speisekarte.png`: thanh đỏ x 275.7→280, y 817.7→843.3 trên
 * khung 1672 — rộng ~4px, cao ~26px, cách chữ ~13px. Quy về 1440: rộng 3.5px,
 * cao 22px, cách chữ 11px. Cao bằng đúng chiều cao chữ hoa của tiêu đề, nên
 * để theo `em` để tiêu đề co giãn thì thanh co giãn theo.
 *
 * Là phần tử TRONG LUỒNG (inline-block) chứ không absolute: tiêu đề nằm
 * trong `flex`, không có gốc toạ độ nào bảo đảm, mà mẫu thì thanh đẩy chữ
 * sang phải thật chứ không nằm đè.
 */
export function SectionTick({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none inline-block h-[0.66em] w-[3.5px] shrink-0 rounded-[1px] bg-red align-baseline select-none ${className}`}
      style={{ marginRight: "0.28em" }}
    />
  );
}

/* -------------------------------------------------------------------------
 * 6 · Hoa văn sóng (seigaiha) rất nhạt làm nền
 * ---------------------------------------------------------------------- */

/**
 * Trường sóng seigaiha mờ. Mẫu có ở nền sidebar (rõ nhất ở khoảng trống giữa
 * menu và khối ngôn ngữ) và ở nền thẻ form Kontakt.
 *
 * VẼ BẰNG CSS, không nạp ảnh: tệp `gold_wave.svg` cũ chỉ có MỘT hàng cung nên
 * lát dọc sẽ hở. Hai `radial-gradient` lệch nửa ô cho ra trường sóng chuẩn.
 */
export function SeigaihaWash({
  size = 64,
  opacity = 0.075,
  color = "#d8b26a",
  className = "",
}: {
  size?: number;
  opacity?: number;
  color?: string;
  className?: string;
}) {
  const ring = `radial-gradient(circle at 50% 100%, transparent 21%, ${color} 22% 28%, transparent 29% 39%, ${color} 40% 46%, transparent 47% 57%, ${color} 58% 64%, transparent 65%)`;
  return (
    <DecorLayer
      className={`inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `${ring}, ${ring}`,
        backgroundSize: `${size}px ${size / 2}px`,
        backgroundPosition: `${size / 2}px ${size / 4}px, 0 0`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

/* -------------------------------------------------------------------------
 * 7 · Hoạ tiết vàng
 * ---------------------------------------------------------------------- */

/**
 * Dải VÀNG DÁT chạy dọc mép thẻ "Chef's Selection" (mẫu 01_home).
 * Đo 1:1: x 273→295 trên khung 1672 (~21px ở 1440), cao hết thẻ, mép TRONG
 * tướp như lá vàng bị rách, có mấy vệt đen ăn vào.
 *
 * Bộ decor không có tệp lá vàng, nên VẼ bằng SVG (lead cho phép dùng SVG khi
 * ảnh WebP không làm được). `preserveAspectRatio="none"` cho dải kéo giãn
 * theo chiều cao thẻ bất kể thẻ cao bao nhiêu — thử mask bằng
 * `red-brush.webp` trước thì hỏng: nét cọ nằm NGANG, ép vào khung dọc 21px
 * chỉ còn một mẩu ở giữa.
 */
export function GoldLeafEdge({
  side = "left",
  width = 21,
  opacity = 0.9,
  className = "",
}: {
  side?: "left" | "right";
  width?: number;
  opacity?: number;
  className?: string;
}) {
  const id = `goldleaf-${side}`;
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute inset-y-0 select-none ${
        side === "left" ? "left-0" : "right-0"
      } ${className}`}
      style={{
        width,
        opacity,
        transform: side === "right" ? "scaleX(-1)" : undefined,
      }}
    >
      <svg
        viewBox="0 0 28 400"
        preserveAspectRatio="none"
        className="h-full w-full"
        focusable="false"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0.45" y2="1">
            <stop offset="0%" stopColor="#e8c88c" />
            <stop offset="18%" stopColor="#b9822f" />
            <stop offset="38%" stopColor="#d9ae63" />
            <stop offset="58%" stopColor="#8a6023" />
            <stop offset="78%" stopColor="#e0b96f" />
            <stop offset="100%" stopColor="#a4762f" />
          </linearGradient>
        </defs>
        {/*
         * Mép trái thẳng (ôm viền thẻ); mép phải là đường RÁCH hữu cơ: phình
         * ở trên, bóp lại quãng giữa, phình lại ở dưới — đúng dáng đo được
         * trên mẫu, không phải răng cưa đều.
         */}
        <path
          fill={`url(#${id})`}
          d="M0 0 H28 C26 26 17 42 20 64 C23 88 10 98 13 122 C16 148 5 158 9 184
             C12 208 20 218 17 242 C14 270 4 280 8 306 C11 330 22 340 19 364
             C17 382 24 392 26 400 H0 Z"
        />
        {/*
         * Mảng tối ăn vào dải vàng. Dùng ELIP NGHIÊNG mờ chứ không dùng đa
         * giác: bản đa giác ra hình thoi đen sắc cạnh, nhìn như răng cưa đồ
         * hoạ chứ không ra chất lá vàng rách của mẫu.
         */}
        <g fill="#0b0906">
          <ellipse
            cx="19"
            cy="70"
            rx="9"
            ry="26"
            opacity=".55"
            transform="rotate(-12 19 70)"
          />
          <ellipse
            cx="15"
            cy="140"
            rx="7"
            ry="22"
            opacity=".45"
            transform="rotate(10 15 140)"
          />
          <ellipse
            cx="20"
            cy="222"
            rx="9"
            ry="30"
            opacity=".5"
            transform="rotate(-8 20 222)"
          />
          <ellipse
            cx="14"
            cy="306"
            rx="7"
            ry="24"
            opacity=".42"
            transform="rotate(14 14 306)"
          />
          <ellipse
            cx="19"
            cy="378"
            rx="8"
            ry="20"
            opacity=".5"
            transform="rotate(-10 19 378)"
          />
        </g>
        {/* Vài đốm sáng lấm tấm — vân lá vàng. */}
        <g fill="#f2dcac" opacity=".5">
          <ellipse cx="6" cy="30" rx="2.4" ry="5" />
          <ellipse cx="4" cy="196" rx="1.8" ry="4" />
          <ellipse cx="7" cy="354" rx="2.2" ry="5" />
        </g>
      </svg>
    </span>
  );
}

/** Góc sóng vàng — dùng cho góc khung thẻ lớn. Mỗi mục CHỈ MỘT họ hoạ tiết. */
export function GoldWaveCorner({
  corner = "br",
  size = 200,
  opacity = 0.3,
  className = "",
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const top = corner === "tl" || corner === "tr";
  const left = corner === "tl" || corner === "bl";
  // Tệp gốc: sóng dồn về góc DƯỚI-PHẢI.
  return (
    <DecorLayer
      className={`${top ? "top-0" : "bottom-0"} ${left ? "left-0" : "right-0"} ${className}`}
      style={{
        width: size,
        height: size,
        opacity,
        backgroundImage: `url(${BASE}/gold-wave-corner.webp)`,
        backgroundSize: "100% 100%",
        transform: `scale(${left ? -1 : 1}, ${top ? -1 : 1})`,
      }}
    />
  );
}

/** Vòng enso vàng — khung tròn quanh ảnh/số liệu. */
export function GoldEnso({
  size = 180,
  opacity = 0.35,
  className = "",
  style,
}: {
  size?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <DecorLayer
      className={className}
      style={{
        width: size,
        height: size,
        opacity,
        backgroundImage: `url(${BASE}/gold-enso.webp)`,
        backgroundSize: "100% 100%",
        ...style,
      }}
    />
  );
}

/** Trúc vàng, dải đứng ở mép một mục. */
export function GoldBamboo({
  height = 300,
  opacity = 0.28,
  flip = false,
  className = "",
  style,
}: {
  height?: number;
  opacity?: number;
  flip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <DecorLayer
      className={className}
      style={{
        width: (height * 520) / 780,
        height,
        opacity,
        backgroundImage: `url(${BASE}/gold-bamboo.webp)`,
        backgroundSize: "100% 100%",
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    />
  );
}

/** Đèn lồng treo thả từ mép trên. */
export function HangingLantern({
  height = 190,
  opacity = 0.8,
  className = "",
  style,
}: {
  height?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <DecorLayer
      className={className}
      style={{
        width: (height * 460) / 690,
        height,
        opacity,
        backgroundImage: `url(${BASE}/lantern-sakura.webp)`,
        backgroundSize: "100% 100%",
        ...style,
      }}
    />
  );
}

/* -------------------------------------------------------------------------
 * Cánh hoa ĐỌNG ở đáy banner (Sếp 05/10)
 * ---------------------------------------------------------------------- */

/**
 * Cánh hoa đào nằm rải rác phủ đáy banner — như cánh đã rơi xuống rồi đọng lại.
 *
 * Khác `FallingPetals`: cái kia là cánh ĐANG rơi (có animation drift), cái này
 * NẰM YÊN. Hai lớp đi cùng nhau thì mới ra câu chuyện "rơi rồi đọng".
 *
 * VÌ SAO BẢN ĐẦU NHÌN NHƯ LƠ LỬNG (Sếp bác 05/10) — và sửa thế nào:
 *  1. Cánh để nguyên hình ĐỨNG. Vật nằm trên mặt phẳng mà mắt nhìn gần như
 *     ngang thì phải BẸT lại → nay `scaleY(.42)`, gốc biến hình đặt ở đáy cánh.
 *  2. Treo cách đáy 20–34px giữa không trung. Nay tất cả bám sát mép dưới
 *     (−6 đến +11px), vài cánh để `bottom` ÂM nên bị mép banner cắt ngang —
 *     chính chỗ bị cắt đó làm mắt tin là cánh nằm trên một mặt phẳng.
 *  3. Không có bóng. Nay mỗi cánh có `drop-shadow` mềm ngay dưới thân.
 *
 * Giữ từ bản đầu: cánh NGHIÊNG NGẢ mỗi cái một kiểu — cánh rơi tự nhiên không
 * bao giờ nằm ngay ngắn.
 *
 * Lần 2 (Sếp: "mở rộng ra toàn bộ ảnh banner", "phủ rải rác"): bỏ chặn
 * 0–34% bề ngang và tăng cỡ cánh gấp ~1,8 lần. Bản trước né cột chữ nên đáy
 * bên trái trống trơn, và cánh chỉ 12–30px nên nhìn như mấy đốm vụn. Trải hết
 * bề ngang được vì lớp này nằm TRƯỚC khối nội dung trong DOM → cánh luôn ở
 * sau chữ và sau nút, không che gì.
 *
 * `pointer-events-none` ở lớp ngoài nên không ăn cú bấm nào.
 */
export function PetalsSettled({ className = "" }: { className?: string }) {
  // [sprite, trái %, cách đáy px, cỡ, xoay độ, độ mờ]
  const canh: [number, number, number, number, number, number][] = [
    [0, 2, 3, 0.46, 24, 0.95],
    [3, 7, 12, 0.30, -38, 0.78],
    [5, 12, -7, 0.52, 72, 0.96],
    [1, 17, 6, 0.28, -14, 0.72],
    [2, 22, -3, 0.44, 128, 0.95],
    [6, 26, 14, 0.26, 46, 0.70],
    [4, 31, 1, 0.40, -96, 0.94],
    [7, 36, 9, 0.24, 18, 0.68],
    [0, 41, -6, 0.50, -52, 0.96],
    [2, 46, 11, 0.27, 84, 0.72],
    [5, 51, 2, 0.43, -22, 0.95],
    [3, 56, 15, 0.25, 56, 0.70],
    [1, 61, -5, 0.48, -70, 0.96],
    [6, 66, 7, 0.29, 112, 0.74],
    [4, 71, 0, 0.42, -30, 0.95],
    [0, 76, 13, 0.26, 64, 0.70],
    [2, 81, -8, 0.54, -84, 0.96],
    [7, 85, 5, 0.23, 36, 0.68],
    [5, 90, 2, 0.45, -58, 0.95],
    [3, 95, 10, 0.31, 96, 0.76],
    [1, 98, -4, 0.41, -18, 0.94],
  ];
  return (
    <span
      aria-hidden="true"
      data-decor=""
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-[120px] select-none overflow-hidden ${className}`}
    >
      {canh.map(([i, trai, day, co, xoay, mo], k) => {
        const p = PETAL_SPRITE[i % PETAL_SPRITE.length];
        return (
          <span
            key={k}
            className="absolute"
            style={{
              left: `${trai}%`,
              bottom: day,
              width: p.w * co,
              height: p.h * co,
              opacity: mo,
              // `scaleY(.42)` là chỗ quan trọng nhất: cánh NẰM thì mắt nhìn
              // gần như từ cạnh bên nên nó BẸT lại. Bản trước để cánh đứng
              // nguyên hình -> trông như đang treo lơ lửng (Sếp 05/10).
              // Bóng đổ mềm ngay dưới cánh để nó "dính" xuống mặt phẳng.
              transform: `rotate(${xoay}deg) scaleY(.42)`,
              transformOrigin: "50% 100%",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,.55))",
              backgroundImage: `url(${BASE}/${PETAL_SHEET})`,
              backgroundSize: `${900 * co}px ${900 * co}px`,
              backgroundPosition: `-${p.x * co}px -${p.y * co}px`,
              backgroundRepeat: "no-repeat",
            }}
          />
        );
      })}
    </span>
  );
}
