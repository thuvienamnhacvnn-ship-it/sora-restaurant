/*
 * ẢNH BỆ CÓ ĐÈ LÊN THỨ GÌ KHÔNG — kiểm ở đủ ma trận cỡ màn (bề ngang × chiều
 * cao).
 *
 * Kiểm HAI thứ, vì bệ nằm vắt giữa chúng:
 *   1. nút CTA `Speisekarte entdecken` ở trên bệ;
 *   2. HÀNG THẺ DANH MỤC ở dưới bệ.
 *
 * ── BỐN CÁI BẪY ĐÃ DÍNH, ĐỪNG LẶP ──
 *
 *  1. `elementFromPoint` vô dụng: khối bệ mang `pointer-events:none` nên bị
 *     bỏ qua, phép đo báo "không bị che" dù mắt thấy chữ cụt.
 *  2. Tính mép trái của TRỤ BỆ là sai chỗ. Thứ che nút là **dải mặt bàn**,
 *     trải từ MÉP TRÁI CẢ KHỐI — đo trụ thì báo "hở 153px" trong khi ảnh chụp
 *     ở 1280 vẫn cụt chữ.
 *  3. So HÌNH CHỮ NHẬT của ảnh bệ cũng sai: ảnh bệ phần lớn TRONG SUỐT, nên
 *     hộp bao nói dối. Phải đếm ĐIỂM ẢNH ĐỤC.
 *  4. **CHỈ ĐỔI BỀ NGANG, để chiều cao cố định 900px.** Đây là cái đắt nhất:
 *     bệ đè lên hàng thẻ ở 4/5 cỡ màn thật, mà **1440×900 — đúng cỡ cả đội
 *     vẫn kiểm — lại là cỡ duy nhất sạch**. Sếp phát hiện ra thay cho công cụ.
 *     Ma trận nay nằm ở `lib/co-man.mjs`, có cả chiều cao.
 *
 * Chạy:  node scripts/do-che-nut.mjs [1440 | 1280x720]
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import { doiSoCoMan } from "./lib/co-man.mjs";
import fs from "node:fs";

/** Đục từ alpha bao nhiêu trở lên thì coi là che. */
const NGUONG_ALPHA = 40;
/** Che bao nhiêu phần trăm diện tích đối tượng thì tính là HỎNG. */
const NGUONG_CHE = 0.005;

const CO = doiSoCoMan();
fs.mkdirSync("_w-agent/soat2", { recursive: true });

const DO = `
  const nut = [...document.querySelectorAll('main a')]
    .filter((a) => /sora-nut-hero/.test(a.className))[1];
  /*
   * Hàng thẻ: lấy theo chính cái class chừa chỗ cho bệ (\`--be-hang\`), nên
   * phép kiểm và bố cục nói về CÙNG MỘT khối. Bám theo tên component hay thứ
   * tự thẻ thì đổi bố cục một cái là phép kiểm im lặng đo nhầm khối khác.
   */
  const hang = document.querySelector('[class*="--be-hang"]');
  const be = document.querySelector('img[src*="be-trung-bay"]');
  if (!be) return { loi: 'không thấy ảnh bệ' };
  if (!be.complete || !be.naturalWidth) return { loi: 'ảnh bệ chưa tải' };
  if (!nut) return { loi: 'không thấy nút CTA' };
  if (!hang) return { loi: 'không thấy hàng thẻ (class chứa --be-hang)' };

  const c = be.getBoundingClientRect();
  const W = be.naturalWidth, H = be.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.drawImage(be, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;

  /* Tỉ lệ điểm ảnh ĐỤC của bệ rơi vào trong hộp đã cho. */
  const deBi = (a) => {
    let tong = 0, duc = 0;
    for (let y = a.top; y < a.bottom; y += 2) {
      for (let x = a.left; x < a.right; x += 2) {
        tong++;
        if (x < c.left || x >= c.right || y < c.top || y >= c.bottom) continue;
        const ix = Math.min(W - 1, Math.floor(((x - c.left) / c.width) * W));
        const iy = Math.min(H - 1, Math.floor(((y - c.top) / c.height) * H));
        if (d[((iy * W + ix) * 4) + 3] >= ${NGUONG_ALPHA}) duc++;
      }
    }
    return tong ? duc / tong : 0;
  };

  /* Đáy ĐỤC của bệ: hàng đục cuối cùng, đổi sang toạ độ màn. Hộp ảnh bệ kéo
     dài quá phần nhìn thấy (viền trong suốt) nên hộp KHÔNG dùng được để tính
     khoảng hở. */
  let hangCuoi = -1;
  for (let iy = H - 1; iy >= 0 && hangCuoi < 0; iy--) {
    for (let ix = 0; ix < W; ix += 3) {
      if (d[((iy * W + ix) * 4) + 3] >= ${NGUONG_ALPHA}) { hangCuoi = iy; break; }
    }
  }
  const dayDuc = c.top + (hangCuoi + 1) / H * c.height;

  const a = nut.getBoundingClientRect();
  const t = hang.getBoundingClientRect();

  /*
   * ĐỈNH THẺ THẬT, không phải đỉnh KHUNG.
   *
   * Khung (lớp chừa --be-hang) chỉ là chỗ chừa; hàng thẻ bên trong còn được flexbox
   * đẩy lên/xuống trong chỗ dư đó. Bản cũ chỉ đo khung nên báo "hở 28px" ở
   * 1440 trong khi mắt thấy một mảng đen 183px — chỗ dư nằm GIỮA khung và thẻ.
   * Hai số dưới đây là thứ người dùng thật sự nhìn thấy.
   */
  const the = [...hang.querySelectorAll('a,li,article')]
    .map((e) => e.getBoundingClientRect())
    .filter((b) => b.width > 40 && b.height > 40)
    .sort((x, y) => x.top - y.top)[0];

  return {
    nut: { y: Math.round(a.top), d: Math.round(a.bottom), tyLe: deBi(a) },
    hang: { y: Math.round(t.top), d: Math.round(t.bottom), tyLe: deBi(t) },
    the: the ? { y: Math.round(the.top), d: Math.round(the.bottom) } : null,
    dayDuc: Math.round(dayDuc),
    ho: Math.round(t.top - dayDuc),
    /* Mảng đen TRỐNG TRƠN: từ đáy đục của bệ tới đỉnh thẻ thật. */
    hoThat: the ? Math.round(the.top - dayDuc) : null,
    /* Chỗ trống còn lại dưới hàng thẻ, để biết trên/dưới có đều nhau không. */
    duoiThe: the ? Math.round(innerHeight - the.bottom) : null,
  };
`;

const b = await dungKhung();
let hong = 0;

for (const [W, H] of CO) {
  await b.khoKhung(W, H);
  await b.go("http://localhost:3160/de");
  await cho(2200);

  const r = await b.js(DO);
  const ten = W + "×" + H;

  if (r.loi) {
    console.log("  " + ten.padEnd(10) + r.loi);
    hong++;
    continue;
  }

  const cheNut = r.nut.tyLe > NGUONG_CHE;
  const cheHang = r.hang.tyLe > NGUONG_CHE;
  if (cheNut || cheHang) hong++;

  console.log(
    "  " + ten.padEnd(10) +
      "nút " + (r.nut.tyLe * 100).toFixed(1).padStart(5) + "% " + (cheNut ? "CHE" : "ok ") +
      " | hàng thẻ " + (r.hang.tyLe * 100).toFixed(1).padStart(5) + "% " + (cheHang ? "CHE" : "ok ") +
      " | đáy bệ " + String(r.dayDuc).padStart(4) +
      " -> khung " + String(r.hang.y).padStart(4) +
      " / thẻ thật " + String(r.the ? r.the.y : "-").padStart(4) +
      "  TRỐNG trên " + String(r.hoThat).padStart(4) +
      " dưới " + String(r.duoiThe).padStart(4) + "px"
  );

  const anh = await b.cmd("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`_w-agent/soat2/nut-${W}x${H}.png`, Buffer.from(anh.data, "base64"));
}

console.log(hong ? "\n  CÒN " + hong + " cỡ màn bị bệ che" : "\n  bệ không che gì ở mọi cỡ đã kiểm");
b.dong();
process.exit(hong ? 1 : 0);
