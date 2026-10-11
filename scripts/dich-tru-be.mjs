/*
 * Dời BA TRỤ sang trái BÊN TRONG ảnh bệ, giữ nguyên khổ 2172×724.
 *
 * ── VÌ SAO KHÔNG DỜI BẰNG CSS ──
 *
 * Cách hiển nhiên là `transform: translateX(-82px)` cho cả khối bệ. Đã làm,
 * đo thì sạch (đĩa #3 hở rail 8–28px ở mọi cỡ màn) **nhưng nhìn thì hỏng**:
 * ảnh bệ rời khỏi mép phải màn và để lại một **vệt cắt dọc rất rõ** — mặt bàn
 * vàng đang sáng thì đứt phựt vào nền tối. Chỉ thấy khi phóng 6× ảnh chụp.
 *
 * Và KHÔNG chữa được bằng mặt nạ mờ dần: trong ảnh gốc, bên phải trụ #3 chỉ
 * còn **35px mặt bàn** (trụ #3 hết ở x=2137, ảnh hết ở 2172). Vùng mờ nào đủ
 * dài để không lộ cũng ăn vào chính cái trụ.
 *
 * Nên phải dời trụ TRONG ảnh: mặt bàn vẫn trải hết bề ngang màn, chỉ cụm trụ
 * lùi vào. Hai mối nối sinh ra đều được làm LIỀN MẠCH DO CÁCH DỰNG, không
 * phải do khéo chọn chỗ vá — xem bước 1 và bước 2.
 *
 * ── DỜI BAO NHIÊU ──
 *
 * Rail tiện ích bám mép phải MÀN HÌNH bằng px cố định, còn đĩa bám phần trăm
 * bề ngang KHỐI, nên màn HẸP là chỗ chật nhất. Tính ở 1280 (khối rộng 1024,
 * bắt đầu ở x=256, rail chiếm từ 1178):
 *
 *   mép phải đĩa #3 = tâm#3 + bề ngang#3 × heDia / 2 = 90,8 + 6,46 = 97,26%
 *   cần ≤ (1170 − 256) / 1024 = 89,26%
 *   => tâm#3 phải lùi 8,0 điểm phần trăm = 8,0% × 2172 ≈ 174px
 *
 * Thực tế chốt 196px, không phải 174. Lý do: sau khi vá, dải mặt bàn giãn nằm
 * SÁT trụ #3 nên phép tách đoạn ăn thêm vài px của nó — bề ngang trụ #3 đo ra
 * 15,5% thay vì 15,2%, đủ để đĩa #3 chỉ còn hở rail 5px ở 1280. Dời thêm 22px
 * cho đủ khoảng thở. Con số cuối LẤY TỪ PHÉP ĐO (`scripts/do-ho-rail.mjs`),
 * không suy từ công thức — công thức chỉ cho điểm xuất phát.
 *
 * Chạy:  node scripts/dich-tru-be.mjs
 * Sau đó BẮT BUỘC chạy lại:  node scripts/do-mat-be.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const VAO = "E:/Works/Sora/SORA_WEBSITE_CLAUDE_KIT/Food run/Food run new/Golden Marble Podium Trio.png";
const RA = "public/decor/be-trung-bay-v5.webp";

/** Dời bao nhiêu px trong hệ toạ độ ảnh gốc. */
const DICH = 196;
/** Cụm trụ nằm trong khoảng này (do `do-mat-be.mjs` tách ra). */
const TRU_TRAI = 1090;
const TRU_PHAI = 2137;

const goc = sharp(VAO);
const m = await goc.metadata();
const W = m.width;
const H = m.height;
const nguyen = await goc.ensureAlpha().png().toBuffer();

/*
 * ---- 1. Mặt bàn bên TRÁI: ép hẹp lại, không dán lệch ----
 *
 * ⚠ LẦN ĐẦU TÔI DÁN NGUYÊN phần trái ảnh ở chỗ cũ rồi dán cụm trụ đè lên,
 * tưởng mối nối sẽ nằm khuất dưới trụ. SAI: sau khi lùi, trụ #1 bắt đầu
 * ở x=TRU_TRAI−DICH+11 còn mối nối ở x=TRU_TRAI−DICH — hở ra 11px, và nó hiện thành một **đường dọc
 * rõ mồn một** ở 42% bề ngang, chỗ mặt bàn xanh của ảnh nền gặp mặt bàn vàng
 * của ảnh bệ. Lại là lỗi chỉ mắt bắt được, mọi số đo vẫn sạch.
 *
 * Cách đúng: ÉP dải mặt bàn trái từ TRU_TRAI px xuống TRU_TRAI−DICH px. Mép phải của dải sau
 * khi ép vẫn là đúng cột x=1090 của ảnh gốc — tức đúng cột mà cụm trụ bắt
 * đầu. **Liền mạch do cách dựng, không phải do khéo chọn chỗ vá.**
 *
 * Ép ngang 16% một mặt bàn phản chiếu mờ thì không ai nhận ra, vì vân sáng
 * của nó chạy ngang và không có chi tiết cứng nào để so.
 */
const nenTrai = await sharp(nguyen)
  .extract({ left: 0, top: 0, width: TRU_TRAI, height: H })
  .resize({ width: TRU_TRAI - DICH, height: H, fit: "fill" })
  .png()
  .toBuffer();

/*
 * ---- 2. Vá chỗ trống bên phải ----
 *
 * Sau khi cụm trụ lùi, dải bên phải nó không còn gì.
 *
 * ⚠ LẦN ĐẦU TÔI LẤY MẶT BÀN Ở CHỖ KHÁC (x=820) DÁN VÀO — HỎNG. Mặt bàn trong
 * ảnh này KHÔNG đồng màu: khúc giữa ngả xanh tím vì hắt đèn, khúc phải ngả
 * vàng ấm. Dán vào thì mối nối lộ ra thành một **mảng ám xanh** cạnh vệt vàng,
 * thấy rõ ở ảnh phóng 6×. Số đo vẫn sạch hết — chỉ mắt mới bắt được.
 *
 * Cách dùng: KÉO GIÃN NGANG đúng dải mặt bàn 35px nằm ngay bên phải trụ #3
 * (x 2137..2172 của ảnh gốc) cho đủ bề ngang cần vá.
 *  - Màu khớp tuyệt đối, vì đó CHÍNH LÀ những điểm ảnh liền kề mối nối.
 *  - Không có mối nối nào cả: dải giãn bắt đầu từ đúng cột kế tiếp.
 *  - Giãn NGANG không phá cấu trúc, vì vân sáng của mặt bàn chạy NGANG — kéo
 *    dài một vệt ngang ra thì vẫn là vệt ngang.
 */
const VA_RONG = W - (TRU_PHAI - DICH);
const mieng = await sharp(nguyen)
  .extract({ left: TRU_PHAI, top: 0, width: W - TRU_PHAI, height: H })
  .resize({ width: VA_RONG, height: H, fit: "fill" })
  .png()
  .toBuffer();

/* ---- 3. Cụm trụ, dời sang trái ---- */
const cumTru = await sharp(nguyen)
  .extract({ left: TRU_TRAI, top: 0, width: TRU_PHAI - TRU_TRAI, height: H })
  .png()
  .toBuffer();

const ra = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  /*
   * Ba mảnh, hai mối nối, CẢ HAI liền mạch do cách dựng:
   *   mảnh trái   mặt bàn, ép lại   -> mép phải = cột gốc TRU_TRAI
   *   mảnh giữa   cụm trụ nguyên xi -> bắt đầu đúng cột gốc TRU_TRAI  ✓
   *                                    kết thúc ở cột gốc TRU_PHAI
   *   mảnh phải   mặt bàn, giãn ra  -> bắt đầu đúng cột gốc TRU_PHAI  ✓
   */
  .composite([
    { input: nenTrai, left: 0, top: 0 },
    { input: mieng, left: TRU_PHAI - DICH, top: 0 },
    { input: cumTru, left: TRU_TRAI - DICH, top: 0 },
  ])
  .png()
  .toBuffer();

/*
 * ---- 4. CẮT SÁT NỘI DUNG THEO CHIỀU DỌC ----
 *
 * Ảnh gốc có dải trong suốt ~30% phía trên và ~27% phía dưới; nội dung thật
 * chỉ chiếm 43% chiều cao. Để nguyên thì tỉ lệ 3,00 — bệ trải hết bề ngang sẽ
 * **cao gần bằng cả banner**, đặt đâu cũng che: che nút CTA ở trên hoặc che
 * hàng thẻ danh mục ở dưới. Trưởng nhóm đã chứng minh với bố cục đó thì
 * 1280×720 **vô nghiệm** — không có giá trị `--be-dich` nào đúng cho mọi cỡ.
 *
 * Cắt xong tỉ lệ còn ~6,96, gần bệ đời đầu (9,18), và bài toán có nghiệm.
 *
 * CHỈ cắt theo CHIỀU DỌC. Bề ngang giữ nguyên 2172 vì mặt bàn phải trải hết
 * mép màn — cắt ngang là sinh lại đúng vệt cắt dọc đã mất công chữa.
 *
 * Bước này trước đây làm TAY nên cả dây chuyền không dựng lại được. Giờ một
 * lệnh ra thẳng tệp cuối.
 */
const { data: px, info } = await sharp(ra).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let tren = -1;
let duoi = -1;
for (let y = 0; y < info.height; y++) {
  let co = false;
  for (let x = 0; x < info.width && !co; x += 3) {
    if (px[(y * info.width + x) * info.channels + 3] > 24) co = true;
  }
  if (co) {
    if (tren < 0) tren = y;
    duoi = y;
  }
}

const cuoi = await sharp(ra)
  .extract({ left: 0, top: tren, width: W, height: duoi - tren + 1 })
  .webp({ quality: 92, alphaQuality: 100 })
  .toBuffer();

fs.writeFileSync(RA, cuoi);

const H2 = duoi - tren + 1;
console.log("  " + W + "x" + H + "  dời trụ sang trái " + DICH + "px");
console.log("  cắt dọc " + tren + ".." + duoi + "  ->  " + W + "x" + H2 +
  "  (tỉ lệ " + (W / H2).toFixed(2) + ")  ->  " + RA +
  "  " + Math.round(cuoi.length / 1024) + " KB");
console.log("  mối nối cần soi: x≈" + (TRU_PHAI - DICH) + " (" +
  (((TRU_PHAI - DICH) / W) * 100).toFixed(1) + "% bề ngang)");
console.log("\n  BƯỚC TIẾP BẮT BUỘC: node scripts/do-mat-be.mjs");
