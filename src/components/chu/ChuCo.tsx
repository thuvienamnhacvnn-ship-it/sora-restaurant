/*
 * ============================================================================
 *  CHỮ NÉT CỌ VÀNG — hệ chữ bằng ẢNH, cắt từ bộ font Sếp gửi 04/10/2026
 * ============================================================================
 *
 * Nguồn gốc: 14 tệp PNG trong `E:\Works\Sora\SORA_WEBSITE_CLAUDE_KIT\Font`
 * (1122×1402, nền trong suốt thật). Bảng tra đầy đủ: `_w-agent/06_chu.md`.
 *
 * VÌ SAO LÀ ẢNH CHỨ KHÔNG PHẢI WEBFONT
 * Nét cọ này đẹp vì có chuyển sắc vàng + vân sơn trong từng nét. Webfont chỉ
 * mang được HÌNH DÁNG, không mang được vân — dựng font từ mấy ảnh này là vứt
 * đi đúng thứ Sếp khen. Nên giữ nguyên ảnh trong suốt.
 *
 * BA LUẬT CỨNG, cài sẵn trong component nên không ai quên được:
 *   1. CHỮ BẰNG ẢNH VẪN PHẢI ĐỌC ĐƯỢC BẰNG MÁY. Mặc định ảnh mang `alt` đúng
 *      nội dung. Cần chữ thật nằm trong DOM (tiêu đề, SEO) thì bật `chuThat`:
 *      chữ thật ẩn bằng kỹ thuật, ảnh `aria-hidden`.
 *   2. CẢ BỘ CÙNG MỘT CỠ NÉT. Mọi nhãn cắt ra từ cùng một cỡ chữ gốc, nên
 *      KHÔNG được ép từng nhãn về cùng chiều cao (chữ có dấu/có đuôi sẽ bị
 *      teo lại). Cỡ đi qua `tiLe` hoặc `caoChuHoa`, áp chung cho cả bộ.
 *   3. KHÔNG TRÀN NGANG. `width: min(100%, …)` trong `chu.module.css`.
 *
 * Mỗi nhãn có 2 tệp: `<tên>.webp` (@1x) và `<tên>@2x.webp`. Trình duyệt tự
 * chọn qua `srcSet`.
 */
import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import { CHU_KHO, type ChuTep } from "./chu-kho";
import { CHU_NHOM, type ChuNhom } from "./chu-nhom";
import styles from "./chu.module.css";

/*
 * Tên tệp chữ KHÔNG mang mã băm, nên đường dẫn phải mang SỐ PHIÊN BẢN —
 * nhờ đó nginx đặt được `immutable` dài hạn mà khách cũ vẫn thấy bộ mới
 * ngay khi ta cắt lại.
 *
 * Cắt bộ mới thì **tăng số này và đổ vào thư mục mới**, ĐỪNG ghi đè
 * `v1/`: khách đang mở trang cũ vẫn trỏ về `v1`, ghi đè là họ thấy chữ
 * nửa cũ nửa mới. Quy trình đầy đủ: `_w-agent/06_chu.md` §6.
 */
/*
 * v2 (11/10/2026): CẮT LẠI 20 nhãn `nav-de-*` / `nav-vi-*`. Bản v1 cắt theo
 * dải ngang nên chém cụt nét vươn lên/thả xuống (các dòng trong tấm gốc chồng
 * lấn nhau) — phóng lên banner trang con là lộ "cụt chân chữ". v2 tách theo
 * mực nối liền, chừa lề trong suốt 8px quanh mọi nét: không điểm đục nào chạm
 * mép tệp. Dụng cụ: `_w-agent/lam-lai/v2/chu/cat-lai.mjs`. Các tệp khác chép
 * nguyên từ v1.
 */
const PHIEN_BAN = "v2";
const BASE = `/chu/${PHIEN_BAN}`;

/**
 * Chiều cao CHỮ HOA (không tính dấu, không tính đuôi) của tệp @1x, tính bằng
 * px. Đo trên chữ `H` của nhãn `Home`. Dùng để quy `caoChuHoa` ra `tiLe`.
 */
export const CAO_CHU_HOA_1X = 60;

/* -------------------------------------------------------------------------
 * Bảng tra nhãn điều hướng / tiêu đề trang
 *
 * Khoá trùng khoá `nav.*` trong `src/i18n/de.json` để cắm thẳng vào menu.
 * Tiếng Việt là CHỮ CỦA SẾP (Sếp tự đặt trong bộ font), không phải AI dịch.
 * ---------------------------------------------------------------------- */

type MucChu = {
  /** Tệp + chữ thật cho từng ngôn ngữ. Thiếu `vi` thì rơi về `de`. */
  de: { tep: ChuTep; chu: string };
  vi?: { tep: ChuTep; chu: string };
};

export const CHU_NHAN = {
  home: {
    de: { tep: "nav-de-home", chu: "Home" },
    vi: { tep: "nav-vi-trang-chu", chu: "Trang chủ" },
  },
  sushi: {
    de: { tep: "nav-de-sushi", chu: "Sushi" },
    vi: { tep: "nav-vi-sushi", chu: "Sushi" },
  },
  menu: {
    de: { tep: "nav-de-speisekarte", chu: "Speisekarte" },
    vi: { tep: "nav-vi-thuc-don", chu: "Thực đơn" },
  },
  reservation: {
    de: { tep: "nav-de-reservierung", chu: "Reservierung" },
    vi: { tep: "nav-vi-dat-ban", chu: "Đặt bàn" },
  },
  gallery: {
    de: { tep: "nav-de-galerie", chu: "Galerie" },
    vi: { tep: "nav-vi-bo-suu-tap", chu: "Bộ sưu tập" },
  },
  about: {
    de: { tep: "nav-de-ueber-uns", chu: "Über uns" },
    vi: { tep: "nav-vi-ve-chung-toi", chu: "Về chúng tôi" },
  },
  contact: {
    de: { tep: "nav-de-kontakt", chu: "Kontakt" },
    vi: { tep: "nav-vi-lien-he", chu: "Liên hệ" },
  },
  drinks: {
    de: { tep: "nav-de-getraenke", chu: "Getränke" },
    vi: { tep: "nav-vi-do-uong", chu: "Đồ uống" },
  },
  soups: {
    de: { tep: "nav-de-suppen", chu: "Suppen" },
    vi: { tep: "nav-vi-sup", chu: "Súp" },
  },
  mains: {
    de: { tep: "nav-de-hauptgerichte", chu: "Hauptgerichte" },
    vi: { tep: "nav-vi-mon-chinh", chu: "Món chính" },
  },
} as const satisfies Record<string, MucChu>;

export type ChuNhan = keyof typeof CHU_NHAN;

/** Nhãn nào Sếp đã gửi sẵn nét cọ. Dùng để tránh gọi nhãn chưa có. */
export function coChuNetCo(nhan: string): nhan is ChuNhan {
  return nhan in CHU_NHAN;
}

/* -------------------------------------------------------------------------
 * Primitive: một tệp chữ bất kỳ trong `public/chu/`
 * ---------------------------------------------------------------------- */

/**
 * Một con số = cùng cỡ ở mọi khổ màn.
 * Một cặp = đổi cỡ ở **768px** (đúng ngưỡng site bỏ sidebar, `01_spec.md`).
 *
 *   tiLe={0.8}
 *   tiLe={{ dienThoai: 0.62, mayTinh: 1 }}
 *   caoChuHoa={{ dienThoai: 34, mayTinh: 56 }}
 *
 * Phải dùng cặp chứ không ép `height` bằng media query của người gọi: ép
 * chiều cao thì chữ nhiều dấu ("Bộ sưu tập") teo lại so với chữ bên cạnh.
 */
export type CoChu = number | { dienThoai: number; mayTinh: number };

const tach = (c: CoChu | undefined) =>
  c == null
    ? ([undefined, undefined] as const)
    : typeof c === "number"
      ? ([c, undefined] as const)
      : ([c.dienThoai, c.mayTinh] as const);

type AnhChuProps = {
  tep: ChuTep;
  /** Chữ thật của ảnh. Chuỗi rỗng = ảnh trang trí thuần. */
  chu: string;
  /** Nhân với cỡ tệp @1x. 1 = cỡ gốc (chữ hoa ≈ 60px). Nhận cả cặp. */
  tiLe?: CoChu;
  /** Chiều cao CHỮ HOA tính bằng px. Ghi đè `tiLe`. Nhận cả cặp. */
  caoChuHoa?: CoChu;
  /** Chữ thật nằm trong DOM (ẩn bằng kỹ thuật), ảnh `aria-hidden`. */
  chuThat?: boolean;
  /** Nạp ngay thay vì lazy. Chỉ bật cho thứ nằm trong khung hình đầu. */
  nganGon?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Thẻ bọc. Mặc định `span`; đặt `h1`/`h2` khi ảnh đóng vai tiêu đề. */
  the?: "span" | "div" | "h1" | "h2" | "h3";
};

export function AnhChu({
  tep,
  chu,
  tiLe,
  caoChuHoa,
  chuThat = false,
  nganGon = false,
  className = "",
  style,
  the: The = "span",
}: AnhChuProps) {
  const co = CHU_KHO[tep];
  if (!co) return null;

  // `caoChuHoa` quy ra hệ số; cặp thì quy cả hai vế.
  const [cDt, cMt] = tach(caoChuHoa);
  const [tDt, tMt] = tach(tiLe);
  const dt = cDt != null ? cDt / CAO_CHU_HOA_1X : tDt;
  const mt = cDt != null ? (cMt != null ? cMt / CAO_CHU_HOA_1X : undefined) : tMt;

  const bienCo = {
    "--chu-w": String(co.w),
    "--chu-h": String(co.h),
    // Ghi vào biến RIÊNG của prop, không ghi thẳng `--chu-ti-le`: nhờ vậy
    // class đặt `--chu-ti-le` vẫn thắng được (lối thoát hiểm). Xem đầu
    // `chu.module.css` để biết thứ tự ưu tiên.
    ...(dt != null ? { "--chu-ti-le-prop": String(dt) } : null),
    ...(mt != null ? { "--chu-ti-le-prop-mt": String(mt) } : null),
    ...style,
  } as CSSProperties;

  // Ảnh trang trí thuần thì không bao giờ cần chữ thật.
  const trangTri = chu === "";
  const anAnh = trangTri || chuThat;

  return (
    <The
      className={`${The === "span" ? styles.boc : styles.bocKhoi} ${className}`}
      style={bienCo}
    >
      {chuThat && !trangTri ? <span className={styles.anChu}>{chu}</span> : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- chữ nét cọ là
          ảnh tĩnh cỡ cố định, đã có sẵn @1x/@2x; next/image chỉ thêm một vòng
          tối ưu không cần thiết và làm hỏng `aspect-ratio` theo biến CSS. */}
      <img
        src={`${BASE}/${tep}.webp`}
        srcSet={`${BASE}/${tep}.webp 1x, ${BASE}/${tep}@2x.webp 2x`}
        width={co.w}
        height={co.h}
        alt={anAnh ? "" : chu}
        aria-hidden={anAnh ? true : undefined}
        loading={nganGon ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={styles.anh}
      />
    </The>
  );
}

/* -------------------------------------------------------------------------
 * ChuCo — nhãn điều hướng / tiêu đề trang theo ngôn ngữ
 * ---------------------------------------------------------------------- */

/*
 * KHÔNG có prop ghi đè chữ thật, và đó là CỐ Ý.
 *
 * Bản đầu có `chu?: string` "phòng khi ngữ cảnh đòi câu khác". Chính nó mở
 * cửa cho lỗi thật ngày 04/10: `PageHero` truyền `chu={t("nav.*")}` mà
 * `vi.json` còn rỗng nên `t()` rơi về tiếng Đức, trong khi `ChuCo` tra TỆP
 * theo `locale` — `/vi/speisekarte` hiện ảnh "Thực đơn" còn chữ thật ẩn lại
 * là "Speisekarte". Hai nguồn sự thật cho một nhãn.
 *
 * Loại lỗi này nguy hiểm nhất vì **nhìn bằng mắt thì đúng** — chỉ máy đọc
 * màn hình và máy tìm kiếm thấy sai, nên nó sống sót qua mọi vòng QA bằng
 * ảnh chụp. `scripts/kiem-chu-song-ngu.mjs` canh được nó, nhưng bỏ hẳn prop
 * thì nó **không xảy ra được nữa**.
 *
 * Ảnh và chữ thật giờ chỉ có MỘT nguồn: bảng `CHU_NHAN` ở trên.
 * Thật sự cần ghi đè thì mở lại có chủ đích, kèm lý do — đừng mở lại vì
 * "cho linh hoạt".
 */
type ChuCoProps = Omit<AnhChuProps, "tep" | "chu"> & {
  nhan: ChuNhan;
  locale: Locale;
};

/**
 * Một nhãn nét cọ vàng.
 *
 *   <ChuCo nhan="menu" locale="de" />                      // alt="Speisekarte"
 *   <ChuCo nhan="menu" locale="vi" the="h1" chuThat />     // <h1> có chữ thật
 *   <ChuCo nhan="menu" locale="de" caoChuHoa={28} />       // chữ hoa cao 28px
 *
 * Tiếng Việt chưa có tệp thì tự rơi về tệp tiếng Đức, đúng luật `src/lib/i18n.ts`.
 */
export function ChuCo({ nhan, locale, ...rest }: ChuCoProps) {
  const muc = CHU_NHAN[nhan];
  const chon = locale === "vi" && muc.vi ? muc.vi : muc.de;
  return <AnhChu tep={chon.tep} chu={chon.chu} {...rest} />;
}

/* -------------------------------------------------------------------------
 * ChuNhomMon — tên nhóm món, CHỮ GHÉP
 *
 * Khác `ChuCo` ở gốc gác: nhãn của `ChuCo` là ảnh Sếp vẽ sẵn, còn nhóm món
 * thì Sếp không cho sẵn nên phải ghép từng ký tự từ bảng chữ cái. Ghép rồi
 * cân lại 0,78 để đặt cạnh nhãn Sếp là cùng cỡ mắt nhìn — nên `caoChuHoa`
 * dùng chung được cho cả hai họ.
 * ---------------------------------------------------------------------- */

type NhomProps = Omit<AnhChuProps, "tep" | "chu"> & {
  /** `id` của nhóm / nhóm con trong `data/categories.json`. */
  nhom: ChuNhom;
  locale: Locale;
};

export function ChuNhomMon({ nhom, locale, ...rest }: NhomProps) {
  const m = CHU_NHOM[nhom];
  const chon = locale === "vi" && "vi" in m && m.vi ? m.vi : m.de;
  return <AnhChu tep={chon.tep} chu={chon.chu} {...rest} />;
}

/** Nhóm nào đã có chữ nét cọ. TypeScript chặn khoá sai, hàm này cho lúc chạy. */
export function coChuNhom(id: string): id is ChuNhom {
  return id in CHU_NHOM;
}

export { CHU_NHOM };
export type { ChuNhom };

/* -------------------------------------------------------------------------
 * ChuTieuDe — tiêu đề khối viết bằng nét cọ, không thuộc nav cũng không
 * thuộc nhóm món. Chữ GHÉP, như `ChuNhomMon`.
 * ---------------------------------------------------------------------- */

export const CHU_TIEU_DE = {
  /**
   * Dải số liệu cuối trang Über uns. Mẫu `_w-agent/mau/05_ueber_uns.png`
   * vẽ nguyên câu bằng nét cọ (đo 235×52 trong khung 1672) — đã đặt cạnh
   * mẫu kiểm: hình chữ, chữ `R` hoa của SoRa và dấu `?` đều khớp.
   *
   * CHƯA CÓ BẢN TIẾNG VIỆT — cố ý. Sếp không đặt câu này trong bộ font, mà
   * `src/lib/i18n.ts` cấm tự dịch nội dung quảng cáo. `locale="vi"` sẽ rơi
   * về bản Đức, đúng luật chung của site. Muốn có bản Việt thì phải XIN SẾP
   * chữ, đừng ai tự ghép.
   */
  "warum-sora": { de: { tep: "tu-warum-sora", chu: "Warum SoRa?" } },
} as const satisfies Record<
  string,
  { de: { tep: ChuTep; chu: string }; vi?: { tep: ChuTep; chu: string } }
>;

export type ChuTieuDeNhan = keyof typeof CHU_TIEU_DE;

type TieuDeProps = Omit<AnhChuProps, "tep" | "chu"> & {
  nhan: ChuTieuDeNhan;
  locale: Locale;
};

export function ChuTieuDe({ nhan, locale, ...rest }: TieuDeProps) {
  const m: { de: { tep: ChuTep; chu: string }; vi?: { tep: ChuTep; chu: string } } =
    CHU_TIEU_DE[nhan];
  const chon = locale === "vi" && m.vi ? m.vi : m.de;
  return <AnhChu tep={chon.tep} chu={chon.chu} {...rest} />;
}

/* -------------------------------------------------------------------------
 * Wordmark SoRa
 * ---------------------------------------------------------------------- */

export const WORDMARK = {
  /** Nét cọ trần, bản to nhất — dùng cho hero. */
  chinh: "wordmark-sora",
  /** Có nét cọ đỏ gạch dưới. */
  "gach-do": "wordmark-sora-gach-do",
  /** Có vầng mặt trời đỏ + cổng torii. Bản nhận diện đầy đủ. */
  torii: "wordmark-sora-torii",
  /** Bản gọn, nét mảnh hơn — dùng cho header / footer. */
  gon: "wordmark-sora-gon",
  /** Xếp hai dòng `So` / `Ra` — dùng cho khung vuông, poster dọc. */
  "hai-dong": "wordmark-sora-hai-dong",
} as const satisfies Record<string, ChuTep>;

export type WordmarkBien = keyof typeof WORDMARK;

type WordmarkProps = Omit<AnhChuProps, "tep" | "chu"> & {
  bien?: WordmarkBien;
  /** Logo lặp lại nhiều nơi trên một trang: chỉ CÁI ĐẦU mang chữ thật. */
  trangTri?: boolean;
};

export function WordmarkSora({
  bien = "chinh",
  trangTri = false,
  ...rest
}: WordmarkProps) {
  return <AnhChu tep={WORDMARK[bien]} chu={trangTri ? "" : "SoRa"} {...rest} />;
}

/* -------------------------------------------------------------------------
 * Dải dọc chữ Nhật (nền cọ đỏ)
 * ---------------------------------------------------------------------- */

export const KANJI = {
  sushi: { tep: "kanji-sushi", chu: "寿司", nghia: "Sushi" },
  washoku: { tep: "kanji-washoku", chu: "和食", nghia: "Japanische Küche" },
  "nihon-ryori": {
    tep: "kanji-nihon-ryori",
    chu: "日本料理",
    nghia: "Japanische Küche",
  },
  "vietnam-ryori": {
    tep: "kanji-vietnam-ryori",
    chu: "ベトナム料理",
    nghia: "Vietnamesische Küche",
  },
} as const satisfies Record<string, { tep: ChuTep; chu: string; nghia: string }>;

export type KanjiBien = keyof typeof KANJI;

type KanjiProps = Omit<AnhChuProps, "tep" | "chu"> & {
  bien: KanjiBien;
  /**
   * Mặc định `true`: dải chữ Nhật là TRANG TRÍ, máy đọc màn hình bỏ qua —
   * khách Đức/Việt không đọc được chữ Nhật thì đọc lên cũng vô nghĩa.
   * Đặt `false` khi dải đó là nội dung thật (vd. nhãn một khu vực menu).
   */
  trangTri?: boolean;
};

export function DaiKanji({ bien, trangTri = true, ...rest }: KanjiProps) {
  const k = KANJI[bien];
  return <AnhChu tep={k.tep} chu={trangTri ? "" : k.nghia} {...rest} />;
}

/* -------------------------------------------------------------------------
 * Câu khẩu hiệu — serif vàng chữ hoa nhỏ (KHÁC họ chữ với nhãn nét cọ)
 *
 * Chữ trong bảng dưới là NGUYÊN VĂN Sếp đặt trong bộ font, không ai được
 * sửa/dịch lại. Dòng nào không có bản tiếng Việt thì KHÔNG tự chế — để
 * người gọi tự quyết dùng bản Đức hay bỏ hẳn khối đó.
 * ---------------------------------------------------------------------- */

export const CAU = {
  "japanese-vietnamese-cuisine": {
    tep: "cau-de-cuisine",
    chu: "Japanese & Vietnamese Cuisine",
  },
  "feinste-kreationen": {
    tep: "cau-de-feinste-kreationen",
    chu: "Feinste Kreationen",
  },
  "besonderer-moment": {
    tep: "cau-de-besonderer-moment",
    chu: "Ihr besonderer Moment bei Sora",
  },
  "wir-freuen-uns": {
    tep: "cau-de-wir-freuen-uns",
    chu: "Wir freuen uns auf Ihren Besuch",
  },
  "zwei-kulturen": {
    tep: "cau-de-zwei-kulturen",
    chu: "Zwei Kulturen. Eine Leidenschaft.",
  },
  "unsere-kueche": {
    tep: "cau-de-unsere-kueche",
    chu: "Unsere Küche — Zwei Kulturen, ein Genuss.",
  },
  "khoanh-khac-dac-biet": {
    tep: "cau-vi-khoanh-khac-dac-biet",
    chu: "Khoảnh khắc đặc biệt",
  },
  "huong-vi-tinh-hoa": {
    tep: "cau-vi-huong-vi-tinh-hoa",
    chu: "Hương vị tinh hoa",
  },
  "hai-nen-van-hoa": {
    tep: "cau-vi-hai-nen-van-hoa",
    chu: "Hai nền văn hóa. Một đam mê.",
  },
} as const satisfies Record<string, { tep: ChuTep; chu: string }>;

export type CauNhan = keyof typeof CAU;

type CauProps = Omit<AnhChuProps, "tep" | "chu"> & { nhan: CauNhan };

/**
 * Câu khẩu hiệu bằng ảnh.
 *
 * Lưu ý cho người gọi: họ chữ này là SERIF, không phải nét cọ — đừng đặt
 * cạnh nhãn `<ChuCo>` rồi mong hai bên cùng cỡ. `CAO_CHU_HOA_1X` không áp
 * cho nhóm này; dùng `tiLe` trực tiếp.
 */
export function CauCo({ nhan, ...rest }: CauProps) {
  const c = CAU[nhan];
  return <AnhChu tep={c.tep} chu={c.chu} {...rest} />;
}

/* -------------------------------------------------------------------------
 * Nét cọ gạch chân / gạch nhấn — luôn là trang trí
 * ---------------------------------------------------------------------- */

export const GACH = {
  /* Nét dày, có vân sơn rõ — tệp #13 */
  "vang-thang": "gach-vang-thang",
  "vang-cong": "gach-vang-cong",
  "vang-manh": "gach-vang-manh",
  "vang-song": "gach-vang-song",
  "vang-day": "gach-vang-day",
  "do-thang": "gach-do-thang",
  "do-cong": "gach-do-cong",
  /* Nét mảnh, đuôi vuốt nhọn — tệp #4. Hợp làm gạch chân dưới tiêu đề nhỏ. */
  "vang-manh-2": "gach-vang-manh-2",
  "vang-dai": "gach-vang-dai",
  "vang-song-2": "gach-vang-song-2",
  "do-manh-2": "gach-do-manh-2",
  "do-dai": "gach-do-dai",
  "do-song": "gach-do-song",
} as const satisfies Record<string, ChuTep>;

export type GachBien = keyof typeof GACH;

type GachProps = Omit<AnhChuProps, "tep" | "chu" | "chuThat" | "the"> & {
  bien: GachBien;
};

export function GachCo({ bien, ...rest }: GachProps) {
  return <AnhChu tep={GACH[bien]} chu="" {...rest} />;
}

/* -------------------------------------------------------------------------
 * Nhãn điều hướng bản SERIF (tệp #3)
 *
 * Cùng nội dung với `CHU_NHAN` nhưng là họ serif chữ hoa nhỏ, cùng họ với
 * 9 câu khẩu hiệu. Chỉ có tiếng Đức. Dùng khi một khối cần serif chứ không
 * cần nét cọ; đừng trộn hai họ trong cùng một hàng.
 * ---------------------------------------------------------------------- */

export const CHU_NHAN_SERIF = {
  home: { tep: "nav-serif-de-home", chu: "Home" },
  menu: { tep: "nav-serif-de-speisekarte", chu: "Speisekarte" },
  reservation: { tep: "nav-serif-de-reservierung", chu: "Reservierung" },
  gallery: { tep: "nav-serif-de-galerie", chu: "Galerie" },
  about: { tep: "nav-serif-de-ueber-uns", chu: "Über uns" },
  contact: { tep: "nav-serif-de-kontakt", chu: "Kontakt" },
} as const satisfies Record<string, { tep: ChuTep; chu: string }>;

export type ChuNhanSerif = keyof typeof CHU_NHAN_SERIF;

type SerifProps = Omit<AnhChuProps, "tep" | "chu"> & { nhan: ChuNhanSerif };

export function ChuSerif({ nhan, ...rest }: SerifProps) {
  const n = CHU_NHAN_SERIF[nhan];
  return <AnhChu tep={n.tep} chu={n.chu} {...rest} />;
}

export type { ChuTep };

/** Danh sách mọi tệp đang có — tiện cho trang xem thử / QA. */
export function tatCaTep(): ChuTep[] {
  return Object.keys(CHU_KHO) as ChuTep[];
}
