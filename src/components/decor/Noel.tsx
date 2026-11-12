import styles from "./noel.module.css";
import { NoelAnim } from "./NoelAnim";

const BASE = "/decor/noel";

/** Số giả ngẫu nhiên cố định, SSR và client ra cùng kết quả. */
const rn = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** Tuyết rơi (thay cánh hoa rơi). Cùng props với FallingPetals. */
export function FallingSnow({
  className = "",
  left = 0,
  dense = false,
}: {
  className?: string;
  dense?: boolean;
  left?: number | string;
  neChu?: number;
}) {
  const n = dense ? 22 : 16;
  return (
    <span aria-hidden="true" data-decor="" className={`${styles.tuyet} ${className}`} style={{ left, right: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const size = 2.5 + rn(i, 1) * 3.5;
        return (
          <i
            key={i}
            className={styles.hat}
            style={
              {
                left: `${(rn(i, 2) * 100).toFixed(1)}%`,
                width: Number(size.toFixed(1)),
                height: Number(size.toFixed(1)),
                "--d": `${(9 + rn(i, 3) * 10).toFixed(1)}s`,
                "--t": `${(-rn(i, 4) * 18).toFixed(1)}s`,
                "--x": `${((rn(i, 5) - 0.5) * 120).toFixed(0)}px`,
                "--o": (0.4 + rn(i, 6) * 0.4).toFixed(2),
                "--y": (rn(i, 7) * 90).toFixed(0),
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

/**
 * Tấm trang trí 2 LỚP lắp từ bộ PNG ChatGPT (public/decor/noel/):
 *   -thong = cành thông + tuyết + nón thông (giữ nguyên màu)
 *   -do    = bóng, quà, nơ, chuông, sao… (web đổi màu được qua --noel-hue / --noel-sat, xem NoelMauSac)
 */
export function NoelTam({
  tam,
  className = "",
  style,
}: {
  tam: "canopy" | "canopy-low" | "corner-wide" | "corner";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span aria-hidden="true" data-decor="" className={`${styles.tam} ${className}`} style={style}>
      <span className={styles.lop} style={{ backgroundImage: `url(${BASE}/${tam}-thong.webp)` }} />
      <span className={`${styles.lop} ${styles.do}`} style={{ backgroundImage: `url(${BASE}/${tam}-do.webp)` }} />
    </span>
  );
}

const CORNER = {
  wide: { tam: "corner-wide", ratio: 1600 / 533 },
  branch: { tam: "corner", ratio: 1100 / 367 },
} as const;

/** Cành thông + quà đóng góc thẻ (thay CornerSakura). Tấm vẽ sẵn: dày bên trái, rủ phải-xuống. */
export function NoelCorner({
  corner,
  width = 190,
  art = "branch",
  offsetX = 0,
  offsetY = 0,
  className = "",
}: {
  corner: "tl" | "tr" | "bl" | "br";
  width?: number;
  opacity?: number;
  art?: keyof typeof CORNER;
  offsetX?: number;
  offsetY?: number;
  className?: string;
}) {
  const { tam, ratio } = CORNER[art];
  const top = corner === "tl" || corner === "tr";
  const left = corner === "tl" || corner === "bl";
  return (
    <NoelTam
      tam={tam}
      className={className}
      style={{
        [top ? "top" : "bottom"]: offsetY,
        [left ? "left" : "right"]: offsetX,
        width,
        height: width / ratio,
        transform: `scale(${left ? 1 : -1}, ${top ? 1 : -1})`,
      }}
    />
  );
}

type Treo = { f: "treo-bong-do" | "treo-bong-vang" | "treo-sao" | "treo-keo"; x: string; h: number; d: number; t: number };
const RATIO = { "treo-bong-do": 196 / 378, "treo-bong-vang": 199 / 378, "treo-sao": 247 / 344, "treo-keo": 313 / 366 } as const;

/** Header Noel kiểu Tây: girlande rủ mép trên + đèn dây nhấp nháy + đồ treo đung đưa (đổi màu được). */
function NoelHeader({ treo, home = false }: { treo: Treo[]; home?: boolean }) {
  return (
    <span aria-hidden="true" data-decor="" className={`${styles.hd} ${home ? styles.hdHome : styles.hdLow}`}>
      <span className={styles.girl} />
      <span className={styles.luz} />
      <span className={`${styles.luz} ${styles.luzB}`} />
      {home && <NoelAnim src={`${BASE}/anim/garland.webm`} className={styles.animGar} />}
      {treo.map((o, i) => (
        <span
          key={i}
          className={styles.treo}
          style={
            {
              left: o.x,
              "--h": o.h,
              "--r": RATIO[o.f].toFixed(3),
              "--d": `${o.d}s`,
              "--t": `${o.t}s`,
              backgroundImage: `url(${BASE}/${o.f}.webp)`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

/** Banner trang con: header + đống tuyết đáy banner. */
export function NoelCanopyLow() {
  return (
    <>
      <NoelHeader
        treo={[
          { f: "treo-bong-vang", x: "20%", h: 80, d: 4.4, t: -1.2 },
          { f: "treo-sao", x: "30%", h: 70, d: 5.2, t: -3 },
          { f: "treo-bong-do", x: "70%", h: 84, d: 4.8, t: -2 },
          { f: "treo-keo", x: "79%", h: 74, d: 5.6, t: -0.6 },
        ]}
      />
      <span aria-hidden="true" data-decor="" className={styles.gocTl} />
      <span aria-hidden="true" data-decor="" className={styles.gocBr} />
      <span aria-hidden="true" data-decor="" className={styles.drift} />
    </>
  );
}

/** Trang chủ: cùng bộ, chừa cột chữ bên trái và thẻ Master Chef bên phải. */
export function NoelCanopyBig() {
  return (
    <NoelHeader
      home
      treo={[
        { f: "treo-sao", x: "6%", h: 76, d: 5, t: -2 },
        { f: "treo-bong-do", x: "24%", h: 86, d: 4.6, t: -1 },
        { f: "treo-keo", x: "36%", h: 74, d: 5.4, t: -3.2 },
        { f: "treo-bong-vang", x: "64%", h: 84, d: 4.2, t: -0.4 },
      ]}
    />
  );
}

/** Mũ ông già Noel đội lên logo tròn (đặt trong .logo, position: relative). */
export function NoelHat() {
  return <span aria-hidden="true" data-decor="" className={styles.mu} />;
}
