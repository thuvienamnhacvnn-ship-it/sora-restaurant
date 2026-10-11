/*
 * Chuẩn bị BỘ MỚI cho banner trang chủ (Sếp gửi 06/10): 1 ảnh bệ + 12 ảnh món.
 *
 * Nguồn: `E:\Works\Sora\SORA_WEBSITE_CLAUDE_KIT\Food run\Food run new`
 *
 * XUẤT RA TÊN/THƯ MỤC MỚI. Lý do: Next đệm ảnh theo URL — tên tệp không đổi là
 * nó trả bản CŨ, sửa xong trông như code không ăn. Đã dính hai lần.
 *
 * ⚠ KHÔNG còn đường lùi trong dự án: 12 ảnh món CŨ đã bị xoá theo lệnh Sếp
 * 06/10 (*"bỏ hết các đĩa ăn cũ đi"*), `public/mon-be/` giờ chỉ còn `v2`.
 * Bản sao đối chiếu nằm tạm ở `%TEMP%\mon-be-cu` — đừng chép ngược vào dự án.
 *
 * KHÔNG chỉnh màu, KHÔNG làm nét, KHÔNG đổi nền — ảnh Sếp gửi là bản đã duyệt.
 *
 * ĐÃ KIỂM nguồn trước khi dùng:
 *  - 12 ảnh món: alpha thật, **0% màu rác** ở alpha=0. Hai khổ trộn nhau —
 *    9 tệp 1448×1086 và 3 tệp 1254×1254, nên PHẢI đo lại từng ảnh chứ không
 *    chép số của bộ cũ.
 *  - Ảnh bệ `Golden Marble Podium Trio` 2172×724: 68,8% điểm trong suốt,
 *    trong đó **0% mang màu rác** — sạch, không cần soi thêm.
 *
 * Chạy:  node scripts/lam-anh-mon-be.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const NGUON = "E:/Works/Sora/SORA_WEBSITE_CLAUDE_KIT/Food run/Food run new";
const RA_MON = "public/mon-be/v2";
const RA_BE = "public/decor/be-trung-bay-v3.webp";
const CANH = 520;

/*
 * Tên đặt theo thứ NHÌN THẤY trong ảnh, không gán cho mã món nào của thực đơn
 * in — đây là ảnh TRANG TRÍ, không phải ảnh chụp món quán bán.
 */
const TEN = {
  "02_05_28 PM-1": "rotes-curry-huhn",
  "02_05_33 PM-2": "thunfisch-tataki",
  "02_05_38 PM-1": "sushi-sashimi-platte",
  "02_05_38 PM-3": "curry-ente",
  "02_05_45 PM-2": "pho-bo",
  "02_05_45 PM-4": "tempura",
  "02_05_50 PM-3": "wok-nudeln-garnelen",
  "02_05_50 PM-5": "rind-pak-choi",
  "02_05_59 PM-6": "dessert-matcha",
  "02_06_05 PM-7": "garnelen-wok",
  "02_06_09 PM-8": "sommerrollen",
  "02_06_14 PM-9": "ente-pak-choi",
};

fs.mkdirSync(RA_MON, { recursive: true });

/* ---------------------------------------------------------------- BỆ ---- */
/*
 * Ảnh bệ KHÔNG cắt viền trong suốt. Mọi số đo của `BE[]` là PHẦN TRĂM của
 * khung ảnh, nên cắt viền là đổi hệ quy chiếu và mọi hằng số lệch theo.
 * Giữ nguyên 2172×724, chỉ đổi sang WebP.
 */
const beNguon = path.join(NGUON, "Golden Marble Podium Trio.png");
const mBe = await sharp(beNguon).metadata();
await sharp(beNguon).webp({ quality: 92, alphaQuality: 100 }).toFile(RA_BE);
console.log(
  "  bệ:  " + mBe.width + "x" + mBe.height +
    "  tỉ lệ " + (mBe.width / mBe.height).toFixed(2) +
    "  ->  " + RA_BE + "  " + Math.round(fs.statSync(RA_BE).size / 1024) + " KB"
);
console.log("       ⚠ bệ CŨ là 1920x209 (tỉ lệ 9,18) — bệ mới CAO HƠN HẲN theo");
console.log("         tỉ lệ, nên BE_RONG/BE_CAO trong BeMonAn.tsx phải đổi theo.\n");

/* --------------------------------------------------------------- MÓN ---- */
let xong = 0;
for (const f of fs.readdirSync(NGUON).filter((x) => /^ChatGPT/.test(x)).sort()) {
  const khoa = f.replace("ChatGPT Image Oct 6, 2026, ", "").replace(".png", "");
  const ten = TEN[khoa];
  if (!ten) {
    console.error("  BỎ QUA (chưa đặt tên): " + f);
    continue;
  }

  const vao = path.join(NGUON, f);
  /* `trim` theo kênh alpha, `threshold: 1` = chỉ coi điểm HOÀN TOÀN trong
     suốt là viền thừa, nên không ăn mất mép mờ của món. Cắt sát rồi mới co —
     giữ nguyên khung thì món trông bé hơn bệ vì phải thu cả phần rỗng. */
  const buf = await sharp(vao).trim({ threshold: 1 }).toBuffer();
  const m = await sharp(buf).metadata();

  /* CHỈ đặt bề ngang; chiều cao chạy theo tỉ lệ thật. KHÔNG ép khung vuông:
     ép vuông thì món nằm giữa ô và trên bệ sẽ lửng lơ. */
  await sharp(buf)
    .resize({ width: CANH })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(path.join(RA_MON, ten + ".webp"));

  const sau = await sharp(path.join(RA_MON, ten + ".webp")).metadata();
  console.log(
    "  " + ten.padEnd(22) + String(m.width).padStart(5) + "x" + String(m.height).padEnd(5) +
      " ->  " + sau.width + "x" + String(sau.height).padEnd(4) +
      "  " + Math.round(fs.statSync(path.join(RA_MON, ten + ".webp")).size / 1024) + " KB"
  );
  xong++;
}

console.log("\n  xong " + xong + "/12 món -> " + RA_MON);
console.log("  BƯỚC TIẾP: node scripts/do-mat-be.mjs  rồi  node scripts/do-day-dia.mjs");
