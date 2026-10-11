/*
 * 5 thẻ danh mục ở CHÂN BANNER trang chủ — Sếp gửi 06/10/2026.
 *
 * Nguồn: `E:\Works\Sora\SORA_WEBSITE_CLAUDE_KIT\Menu Bar`.
 * Sếp gửi 10 tệp: 5 tệp CÓ CHỮ + nút là MẪU phải làm theo, 5 tệp KHÔNG CHỮ
 * là thứ đem lên web.
 *
 * ---- VẤN ĐỀ VÀ CÁCH GIẢI ----
 * Mẫu: MỘT khung vàng bọc cả ảnh + tiêu đề + dòng phụ + nút, món tràn lên
 * trên khỏi khung.
 * Nhưng tệp KHÔNG CHỮ vẽ đĩa TO HƠN và THẤP HƠN tệp mẫu — đáy đĩa xuống tới
 * ~78% chiều cao, chỗ trống trong khung chỉ còn ~15%, không đủ đặt chữ.
 *
 * Hai cách đã loại:
 *   - Cắt bỏ khung vàng rồi dựng khung bằng CSS: KHÔNG được, vì phần món tràn
 *     ra tới x 4,1%–95,9% — RỘNG HƠN khung (9%–91%). Cắt theo khung là cắt
 *     mất món.
 *   - Đặt chữ xuống dưới ảnh, ngoài khung: Sếp bác, sai mẫu.
 *
 * Cách dùng: KÉO DÀI KHUNG XUỐNG (kiểu 9-slice). Cắt ảnh làm ba, nhân bản một
 * HÀNG ở đoạn thân thẳng rồi chèn thêm vào giữa. Hai cạnh vàng là đường thẳng
 * đứng ở đoạn đó nên kéo dài ra vẫn liền, bốn góc bo giữ nguyên không méo.
 * Kết quả: khung vàng cao thêm, dư chỗ tối ở đáy để đặt chữ NGAY TRONG KHUNG,
 * đúng mẫu. Món và nền không bị co kéo một pixel nào.
 *
 * Chữ vẫn vẽ bằng HTML (xem `DaiPosterMon.tsx`) để dịch được sang tiếng Việt
 * và máy đọc màn hình đọc được — tệp mẫu là chữ Đức nướng cứng vào ảnh.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const NGUON = "E:/Works/Sora/SORA_WEBSITE_CLAUDE_KIT/Menu Bar";
const RA = "public/danh-muc";

/** Hàng đem nhân bản — nằm dưới đáy đĩa (78%) và trên góc bo đáy. */
const HANG_KEO = 952;
/** Thêm bao nhiêu pixel chiều cao (thang ảnh gốc 1448×1086). */
const THEM = 250;

const MAP = {
  "ChatGPT Image Oct 6, 2026, 12_49_17 PM-4.png": "sushi",
  "ChatGPT Image Oct 6, 2026, 12_49_16 PM-3.png": "vietnamese-classics",
  "ChatGPT Image Oct 6, 2026, 12_49_15 PM-2.png": "hauptgerichte",
  "ChatGPT Image Oct 6, 2026, 12_49_14 PM-1.png": "desserts",
  "ChatGPT Image Oct 6, 2026, 12_49_18 PM-5.png": "getraenke",
};

fs.mkdirSync(RA, { recursive: true });

for (const [tep, ma] of Object.entries(MAP)) {
  const vao = path.join(NGUON, tep);
  if (!fs.existsSync(vao)) {
    console.error("  THIẾU: " + tep);
    continue;
  }
  const { width: W, height: H } = await sharp(vao).metadata();

  const tren = await sharp(vao).extract({ left: 0, top: 0, width: W, height: HANG_KEO }).png().toBuffer();
  /* Một hàng duy nhất, kéo cao ra. `kernel: nearest` để không nội suy mờ
     cạnh vàng; `fit: fill` vì cố ý kéo méo theo chiều dọc. */
  const giua = await sharp(vao)
    .extract({ left: 0, top: HANG_KEO, width: W, height: 1 })
    .resize({ width: W, height: THEM, fit: "fill", kernel: "nearest" })
    .png().toBuffer();
  const duoi = await sharp(vao)
    .extract({ left: 0, top: HANG_KEO, width: W, height: H - HANG_KEO }).png().toBuffer();

  const cao = H + THEM;
  const ghep = await sharp({
    create: { width: W, height: cao, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: tren, left: 0, top: 0 },
      { input: giua, left: 0, top: HANG_KEO },
      { input: duoi, left: 0, top: HANG_KEO + THEM },
    ])
    .png().toBuffer();

  /* 1448 -> 724: thẻ rộng ~224px trên màn 1440, 724 là vừa đủ gấp đôi cho
     màn Retina. `alphaQuality: 100` để mép khung vàng không răng cưa. */
  await sharp(ghep)
    .resize({ width: 724 })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(RA, ma + ".webp"));

  const sau = await sharp(path.join(RA, ma + ".webp")).metadata();
  const kb = Math.round(fs.statSync(path.join(RA, ma + ".webp")).size / 1024);
  console.log(`  ${ma.padEnd(21)} ${W}x${H} -> ${W}x${cao} -> ${sau.width}x${sau.height}  ${kb} KB  ${sau.hasAlpha ? "alpha giữ" : "MẤT ALPHA"}`);
}

/* Mốc cho `DaiPosterMon.tsx`, quy ra % CHIỀU CAO ảnh MỚI (1086+250 = 1336):
 *   khung vàng   y  237 -> 17,7%   ..  1263 -> 94,5%
 *   đáy đĩa      y  847 -> 63,4%
 *   tiêu đề  tâm y  866 -> 64,8%     (mẫu: 61,3% chiều cao khung)
 *   dòng phụ tâm y  989 -> 74,0%     (mẫu: 73,3%)
 *   nút      tâm y 1143 -> 85,5%     (mẫu: 88,3%)
 */
console.log("\n  xong -> " + RA);
