/*
 * Đo ba TRỤ trên ảnh bệ: tâm ngang, bề ngang, và TRỤC NGANG của bầu dục mặt
 * bệ (chỗ đáy đĩa phải chạm). Ghi ra `data/be-tru.json` — nguồn số DUY NHẤT
 * cho `BeMonAn.tsx`, `page.tsx` và `do-khop-dia-be.mjs`.
 *
 * ── LỊCH SỬ HAI LẦN VIẾT LẠI TRONG MỘT NGÀY (06/10), đọc kẻo lặp lại ──
 *
 * (1) Bệ ĐẦU 1920×209: ba trụ rời nhau, cùng cao độ -> quét theo CỘT là đủ.
 *
 * (2) Bệ THỨ HAI 2161×342: ba trụ chồng nhau theo chiều ngang, ba cao độ khác
 *     nhau -> quét cột ra đúng MỘT khối. Tôi chuyển sang **khớp bình phương
 *     tối thiểu một cung bầu dục** vào đường viền trên.
 *
 * (3) Bệ THỨ BA 2172×724 (bản Sếp chốt): phép khớp cung **SAI**, và sai kiểu
 *     nguy hiểm — nó cho ra `rong` 19,6% trong khi trụ thật rộng 16,4%, tức
 *     đĩa to hơn trụ gần 20% và **ba đĩa chồng lên nhau** (Sếp nhìn màn hình
 *     và gắt "sao chồng chéo lên nhau vậy"). Lý do: `a` được tự do lớn hơn
 *     nửa bề ngang đoạn, và một bầu dục to hơn khớp khúc giữa cung khít hơn
 *     chút, nên trình tối ưu chọn nó. Sai số khớp 3,3px — **con số vẫn đẹp**.
 *
 * ── CÁCH ĐO HIỆN TẠI: không mô hình, đọc thẳng bóng dáng ──
 *
 * Thân hình trụ rộng đúng bằng TRỤC LỚN của bầu dục mặt, và mép trái/phải của
 * bầu dục nằm đúng TRÊN trục ngang. Nên chỉ cần:
 *   - bề ngang trụ   = bề ngang lớn nhất của thân trong đoạn;
 *   - trục ngang mặt = hàng ĐẦU TIÊN đạt bề ngang đó;
 *   - tâm            = tâm của chính hàng đó.
 * Ba số đọc trực tiếp từ alpha, không qua phép khớp nào, nên không có chỗ cho
 * "số đẹp mà hình sai". Đối chiếu với số trưởng nhóm đo tay: khớp cả ba trụ
 * trong vòng 0,3 điểm phần trăm.
 *
 * ⚠ Phải KẸP dải liền mạch vào trong đoạn của từng trụ. Không kẹp thì trụ #2
 * và #3 (chạm nhau) đo ra chung một dải rộng 30,6% và tâm 83,1% — một con số
 * không ứng với trụ nào cả.
 *
 * Chạy:  node scripts/do-mat-be.mjs [đường/dẫn/ảnh.webp]
 */
import sharp from "sharp";
import fs from "node:fs";

const ANH = process.argv[2] || "public/decor/be-trung-bay-v6.webp";

/*
 * Bề ngang Ô ĐĨA so với bề ngang trụ.
 *
 * Để 1,0 thì cặp trụ #2–#3 đã chạm nhau (nửa bề ngang cộng lại 15,3% trong
 * khi tâm cách nhau 15,2%). 0,85 cho khe thở và vẫn phủ kín mặt bệ.
 *
 * ⚠ ĐỪNG đổi thành "chuẩn hoá bề ngang ĐÁY đĩa cho bằng nhau". Đã thử và
 * hỏng: đáy các món dao động 40–83% bề ngang ảnh, nên ép chân bằng nhau thì
 * món đáy hẹp bị phóng to gấp đôi và trèo khỏi khung.
 */
const HE_DIA = 0.85;

const { data, info } = await sharp(ANH).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const C = info.channels;
const duc = (x, y) => data[(y * W + x) * C + 3] > 24;

/* ---- 1. Đường viền trên: hàng đục đầu tiên của mỗi cột ---- */
const vien = new Array(W).fill(H);
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) {
    if (duc(x, y)) {
      vien[x] = y;
      break;
    }
  }
}

/* Làm trơn nhẹ để nhiễu một vài điểm ảnh không sinh ranh giới giả. */
const tron = vien.map((_, x) => {
  let s = 0;
  let n = 0;
  for (let k = -6; k <= 6; k++) {
    const i = x + k;
    if (i >= 0 && i < W) {
      s += vien[i];
      n++;
    }
  }
  return s / n;
});

/*
 * ---- 2. Tách ba trụ: cắt theo BẬC NHẢY, không theo chỗ lồi ----
 *
 * Ba cung không phải ba cái bướu rời nhau trên nền phẳng: chúng chồng nhau và
 * ở ba cao độ khác nhau, nên "cực tiểu địa phương nhô cao hơn hai bên" ra
 * đúng một trụ trong khi mắt thấy ba. Ranh giới thật là **bậc nhảy dựng
 * đứng** trong đường viền trên.
 */
const MUC_BAN = (() => {
  const dem = new Map();
  for (let x = 0; x < W / 3; x++) dem.set(vien[x], (dem.get(vien[x]) ?? 0) + 1);
  return [...dem.entries()].sort((a, b) => b[1] - a[1])[0][0];
})();

const KHE = Math.round(H * 0.045);
const doanh = [];
let dau = null;
for (let x = 0; x < W; x++) {
  const laTru = tron[x] < MUC_BAN - H * 0.025;
  const nhay = x > 0 && Math.abs(tron[x] - tron[x - 1]) > KHE / 8;
  if (laTru && dau === null) dau = x;
  if (dau !== null && (!laTru || (nhay && x - dau > W * 0.03))) {
    if (x - dau > W * 0.05) doanh.push([dau, x - 1]);
    dau = laTru ? x : null;
  }
}
if (dau !== null && W - dau > W * 0.05) doanh.push([dau, W - 1]);

console.log("  ảnh " + W + "x" + H + "  (tỉ lệ " + (W / H).toFixed(2) + ")");
console.log("  mặt bàn ở y=" + MUC_BAN + "  (" + ((100 * MUC_BAN) / H).toFixed(1) + "%)");
console.log("  tách được " + doanh.length + " trụ: " +
  doanh.map(([a, b]) => a + "–" + b).join("  |  ") + "\n");

/*
 * ---- 2b. BÀN PHẲNG, không trụ (bản v6, Sếp 07/10) ----
 *
 * Sếp thay bàn có trụ bằng một tấm đá phẳng. Không còn trụ để đo, nên ba đĩa
 * đứng thẳng trên MẶT BÀN:
 *   - `mat`  = GIỮA mặt trên, đo từ ảnh: từ mép sau (hàng đục đầu tiên) tới
 *              mép trước (chỗ độ sáng tụt mạnh nhất — viền vàng của cạnh bàn);
 *   - `tam`/`rong` = ba chỗ đứng của bộ trụ v5, giữ nguyên để ba đĩa không
 *              đổi chỗ, không chồng nhau và không lấn sang hai nút hero;
 *   - `dep`  = độ dẹt v5 nhân tỉ lệ độ sâu mặt bàn mới/cũ (mặt mới nhìn
 *              nghiêng hơn nên bóng phải dẹt hơn).
 */
const CHO_PHANG = [
  { tam: 49.8, rong: 16.3 },
  { tam: 66.6, rong: 15.4 },
  { tam: 81.9, rong: 15.4 },
];
/** Bản v5: mặt bàn sâu 149px trên khung 2172, độ dẹt mặt trụ 0,216. */
const SAU_V5 = 149;
const DEP_V5 = 0.216;

if (doanh.length === 0) {
  /* Mép trước = chỗ độ sáng TỤT mạnh nhất (mặt bóng -> cạnh bàn tối).
     KHÔNG lấy "hàng sáng nhất": bản đầu làm thế và nhặt nhầm một vệt đèn
     phản chiếu giữa mặt bàn (y=251 trong khi mép thật ở ~280). */
  const sang = [];
  for (let y = 0; y < H; y++) {
    let s = 0;
    let n = 0;
    for (let x = 0; x < W; x += 3) {
      const i = (y * W + x) * C;
      if (data[i + 3] > 24) {
        s += data[i] + data[i + 1] + data[i + 2];
        n++;
      }
    }
    sang.push(n ? s / n / 3 : 0);
  }
  let mepTruoc = MUC_BAN;
  let tutNhat = -1;
  for (let y = MUC_BAN + 8; y + 6 < H; y++) {
    const tut = sang[y] - sang[y + 6];
    if (tut > tutNhat) {
      tutNhat = tut;
      mepTruoc = y;
    }
  }
  const mat = +((100 * (MUC_BAN + mepTruoc)) / 2 / H).toFixed(1);
  const dep = +((DEP_V5 * (mepTruoc - MUC_BAN)) / SAU_V5).toFixed(3);
  console.log("  BÀN PHẲNG: mép sau y=" + MUC_BAN + ", mép trước y=" + mepTruoc +
    " -> đĩa đứng ở " + mat + "% , độ dẹt bóng " + dep);
  fs.writeFileSync(
    "data/be-tru.json",
    JSON.stringify(
      {
        _nguon: "scripts/do-mat-be.mjs — ĐỪNG sửa tay, chạy lại script",
        anh: ANH,
        w: W,
        h: H,
        heDia: HE_DIA,
        tru: CHO_PHANG.map(({ tam, rong }) => ({ tam, rong, mat, dep })),
      },
      null,
      2
    ) + "\n"
  );
  console.log("  -> data/be-tru.json");
  process.exit(0);
}

/* ---- 3. Đo thẳng từng trụ ---- */
const ra = [];
for (const [xa, xb] of doanh) {
  let dinh = H;
  for (let x = xa; x <= xb; x++) if (vien[x] < dinh) dinh = vien[x];

  /* Dải liền mạch chứa tâm đoạn, KẸP trong [xa, xb] — không kẹp thì hai trụ
     chạm nhau gộp thành một dải và mọi số sau đó vô nghĩa. */
  const giua = Math.round((xa + xb) / 2);
  const hang = [];
  for (let y = dinh; y < MUC_BAN; y++) {
    if (!duc(giua, y)) continue;
    let t = giua;
    let p = giua;
    while (t > xa && duc(t - 1, y)) t--;
    while (p < xb && duc(p + 1, y)) p++;
    hang.push({ y, t, p, w: p - t + 1 });
  }
  /*
   * Trục ngang = hàng ĐẦU TIÊN mà thân đạt bề ngang đầy đủ.
   *
   * ⚠ ĐỪNG lấy ngưỡng theo `max × 0,995`. Bề ngang thân dao động ±2px vì khử
   * răng cưa, nên `max` là một con số NHIỄU và ngưỡng 0,5% hẹp hơn chính cái
   * nhiễu đó. Hậu quả đã gặp: ảnh v3 và v4 có bóng dáng trụ #2 **giống hệt
   * nhau từng hàng một** (đã đối chiếu), chỉ lệch ĐÚNG MỘT điểm ảnh ở hàng
   * cuối — mà kết quả nhảy từ 35,2% sang 46,8%, tức đĩa tụt xuống gần 12% chiều
   * cao bệ. Số cũ đúng chỉ vì may.
   *
   * Nên: lấy bề ngang PHẲNG (trung vị nửa dưới dải quét — chỗ thân trụ đã
   * thẳng đứng) rồi cho dung sai 2px tuyệt đối.
   */
  const nuaDuoi = hang.slice(Math.floor(hang.length / 2)).map((r) => r.w).sort((a, b) => a - b);
  const wPhang = nuaDuoi[Math.floor(nuaDuoi.length / 2)];
  const wMax = Math.max(...hang.map((r) => r.w));
  const truc = hang.find((r) => r.w >= wPhang - 2) ?? hang[hang.length - 1];

  ra.push({
    tam: +((100 * ((truc.t + truc.p) / 2)) / W).toFixed(1),
    rong: +((100 * wMax) / W).toFixed(1),
    mat: +((100 * truc.y) / H).toFixed(1),
    dep: +((truc.y - dinh) / (wMax / 2)).toFixed(3),
    dinh: +((100 * dinh) / H).toFixed(1),
  });
}

/*
 * ---- 4. Độ dẹt: lấy GIÁ TRỊ NHỎ NHẤT cho cả ba ----
 *
 * `dep` = (trục − đỉnh)/bán kính. Ba trụ cùng một góc nhìn nên độ dẹt phải
 * BẰNG NHAU; chênh nhau là do đo sai, không phải trụ khác nhau.
 *
 * Sai ở đâu: `đỉnh` lấy theo cột cao nhất TRONG ĐOẠN, mà mép đoạn của một trụ
 * lại kề sườn của trụ CAO HƠN bên cạnh — nên nó nhặt nhầm độ cao của hàng
 * xóm. Lỗi này **chỉ có thể kéo `đỉnh` LÊN**, không bao giờ đẩy xuống, nên nó
 * chỉ làm `dep` VỐNG LÊN. Vậy giá trị NHỎ NHẤT là giá trị sạch.
 *
 * Bản trước lấy trung vị và so lệch 25% — hỏng ngay khi 2 trong 3 trụ bị
 * nhiễm: trung vị rơi vào đúng số sai và nó đi "sửa" hai trụ đang đúng.
 *
 * `dep` CHỈ dùng để vẽ bóng đổ cho đúng góc nhìn — `tam`/`rong`/`mat` đọc
 * thẳng từ điểm ảnh nên không bị ảnh hưởng.
 */
const depSach = Math.min(...ra.map((r) => r.dep));
for (const r of ra) {
  if (r.dep !== depSach) {
    console.log("  trụ ở " + r.tam + "% : đỉnh nhiễm của trụ cao bên cạnh, độ dẹt đo ra " +
      r.dep + " -> dùng " + depSach);
    r.dep = depSach;
    r.depMuon = true;
  }
}

ra.sort((p, q) => p.tam - q.tam);

console.log("\n  trụ   tâm     bề ngang   trục ngang   đỉnh    độ dẹt b/a");
ra.forEach((r, i) =>
  console.log(
    "   #" + (i + 1) +
      String(r.tam).padStart(8) + "%" +
      String(r.rong).padStart(10) + "%" +
      String(r.mat).padStart(12) + "%" +
      String(r.dinh).padStart(8) + "%" +
      String(r.dep).padStart(13) + (r.depMuon ? " (mượn)" : "")
  )
);

/*
 * ---- 5. CHỐT CHẶN: đĩa cạnh nhau không được chồng ----
 *
 * Đây là ràng buộc THẬT ở bệ này, không phải lý thuyết: tâm ba trụ cách nhau
 * 16,7 và 15,2 điểm phần trăm, trong khi nửa bề ngang hai trụ cạnh nhau cộng
 * lại đã là 15,9 và 15,3. Để ô đĩa rộng bằng trụ (HE_DIA = 1,0) là cặp #2–#3
 * chồng ngay. Bản trước không có chốt này và **Sếp là người phát hiện ra lỗi
 * thay cho công cụ** — chuyện không được để xảy ra lần nữa.
 */
let chong = 0;
console.log("\n  khe hở giữa hai ô đĩa cạnh nhau (ô rộng = " + HE_DIA + " × bề ngang trụ):");
for (let i = 0; i + 1 < ra.length; i++) {
  const phai = ra[i].tam + (ra[i].rong * HE_DIA) / 2;
  const trai = ra[i + 1].tam - (ra[i + 1].rong * HE_DIA) / 2;
  const khe = +(trai - phai).toFixed(2);
  if (khe <= 0) chong++;
  console.log(
    "   #" + (i + 1) + " ↔ #" + (i + 2) + "   mép phải " + phai.toFixed(2) +
      "%  mép trái " + trai.toFixed(2) + "%  ->  khe " +
      String(khe).padStart(6) + "%  " + (khe > 0 ? "ok" : "CHỒNG")
  );
}

fs.writeFileSync(
  "data/be-tru.json",
  JSON.stringify(
    {
      _nguon: "scripts/do-mat-be.mjs — ĐỪNG sửa tay, chạy lại script",
      anh: ANH,
      w: W,
      h: H,
      heDia: HE_DIA,
      tru: ra.map(({ tam, rong, mat, dep }) => ({ tam, rong, mat, dep })),
    },
    null,
    2
  ) + "\n"
);

console.log("\n  -> data/be-tru.json  (component và phép kiểm đều đọc tệp này)");
if (chong) {
  console.log("  HỎNG: còn " + chong + " cặp đĩa chồng nhau — giảm HE_DIA rồi chạy lại.");
  process.exit(1);
}
