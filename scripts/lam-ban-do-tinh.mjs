/*
 * Dựng ẢNH BẢN ĐỒ TĨNH cho trang Kontakt từ ô bản đồ OpenStreetMap.
 *
 * Chạy MỘT LẦN (hoặc khi quán đổi địa điểm):  node scripts/lam-ban-do-tinh.mjs
 * Ra:  public/anh/kontakt-karte-z17.webp   (1000×460, ô zoom 17 — màn thường)
 *      public/anh/kontakt-karte-z18.webp   (2000×920, ô zoom 18 — màn nét 2x,
 *                                           CÙNG vùng đất, cùng tâm)
 *
 * VÌ SAO ZOOM 17 Ở CỠ ~1:1 chứ không lấy zoom 18 rồi thu nhỏ cho nét: chữ tên
 * phố nằm SẴN trong ô ảnh. Bản đầu 1400×700 (zoom 18) hiện trong khung 646px
 * là thu còn 0,46 -> tên phố cao ~5px, không đọc nổi. Khung bản đồ rộng
 * 358px (điện thoại) tới ~950px (1920) nên 1000px là cỡ gần 1:1 nhất.
 *
 * VÌ SAO ẢNH TĨNH: quán ở Đức. Nhúng iframe Google ngay lúc tải trang là gửi
 * IP khách sang Google trước khi họ đồng ý (xem `MapBlock.tsx`). Ảnh nằm sẵn
 * trong dự án thì trang hiện bản đồ NGAY mà không gọi máy chủ ngoài nào.
 *
 * Toạ độ đọc từ `data/restaurant-info.json` (`toaDo`) — không gõ lại ở đây.
 * Tâm ảnh = đúng toạ độ quán, nên ghim của trang chỉ việc đặt ở 50% / 50%.
 *
 * GIẤY PHÉP: dữ liệu © OpenStreetMap-Mitwirkende, ODbL — trang PHẢI in dòng
 * ghi công cạnh ảnh (đã có trong `MapBlock.tsx`). Chính sách ô bản đồ của OSM:
 * có User-Agent nhận diện được, không tải hàng loạt — script này tải 12–28 ô,
 * một lần, tuần tự.
 */
import fs from "node:fs";
import sharp from "sharp";

const info = JSON.parse(fs.readFileSync("data/restaurant-info.json", "utf8"));
const { lat, lng } = info.toaDo;
const UA = "sora-website-build/1.0 (statische Karte fuer die Kontaktseite; einmaliger Abruf; Kontakt: Betreiber der Website)";

/** Toạ độ -> vị trí px toàn cục ở mức zoom `z` (Web Mercator, ô 256px). */
function px(z) {
  const n = 256 * 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return { x, y };
}

async function taiO(z, x, y) {
  const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  for (let lan = 1; lan <= 2; lan++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      // Mạng văn phòng có lúc trả trang chặn thay cho ảnh: kiểm chữ ký PNG.
      if (buf.length < 200 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error("không phải PNG");
      return buf;
    } catch (e) {
      if (lan === 2) throw new Error(`${url}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 1500));
    }
  }
}

async function dung(z, W, H, tep) {
  const c = px(z);
  const x0 = Math.round(c.x - W / 2);
  const y0 = Math.round(c.y - H / 2);
  const tx0 = Math.floor(x0 / 256), tx1 = Math.floor((x0 + W - 1) / 256);
  const ty0 = Math.floor(y0 / 256), ty1 = Math.floor((y0 + H - 1) / 256);
  const lop = [];
  for (let ty = ty0; ty <= ty1; ty++)
    for (let tx = tx0; tx <= tx1; tx++)
      lop.push({ input: await taiO(z, tx, ty), left: (tx - tx0) * 256, top: (ty - ty0) * 256 });
  const nen = await sharp({
    create: { width: (tx1 - tx0 + 1) * 256, height: (ty1 - ty0 + 1) * 256, channels: 3, background: "#ddd" },
  })
    .composite(lop)
    .png()
    .toBuffer();
  await sharp(nen)
    .extract({ left: x0 - tx0 * 256, top: y0 - ty0 * 256, width: W, height: H })
    .webp({ quality: 82 })
    .toFile(tep);
  console.log(`${tep}  ${W}×${H}  zoom ${z}  ${lop.length} ô`);
}

await dung(17, 1000, 460, "public/anh/kontakt-karte-z17.webp");
await dung(18, 2000, 920, "public/anh/kontakt-karte-z18.webp");
