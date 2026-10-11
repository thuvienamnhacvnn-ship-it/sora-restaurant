/*
 * Đo ĐÁY từng ảnh món trong `public/mon-be/` — MỘT script duy nhất cho mọi
 * số đo mà `components/home/BeMonAn.tsx` cần.
 *
 * Trước đây việc này nằm ở HAI tệp (một đo nửa bầu dục đáy, một đo tâm ngang
 * + bề ngang đáy) và hai agent đè nhầm lên nhau. Gộp lại để lần sau không
 * còn chuyện đó, và để thêm ảnh món mới thì chỉ phải chạy một lệnh.
 *
 * Vì sao phải đo TỪNG ảnh: mỗi món một kiểu đĩa — bát sâu, khay dài, đĩa
 * nông. Tâm ngang của ĐÁY không trùng tâm ảnh (`rainbow-maki` lệch tận
 * 35,5% trong khi 11 món kia ~50%), và bề ngang đáy dao động 40–83% bề ngang
 * ảnh. Dùng chung một công thức cho cả 12 là đĩa lệch, tràn ra khỏi bệ.
 *
 * Ghi ra `data/day-dia.json`, mỗi món:
 *   cx     tâm ngang của ĐÁY, theo tỉ lệ bề ngang ảnh (0..1)
 *   rong   bề ngang của ĐÁY, theo tỉ lệ bề ngang ảnh (0..1)
 *   day    mép dưới cùng của phần đục, theo tỉ lệ chiều cao ảnh (0..1)
 *   nua    NỬA CHIỀU CAO BẦU DỤC ĐÁY, tính bằng px trên ảnh gốc
 *   w, h   cỡ ảnh gốc (px)
 *
 * Chạy:  node scripts/do-day-dia.mjs
 */
import sharp from "sharp";
import fs from "node:fs";

const THU_MUC = process.argv[2] || "public/mon-be/v2";
const NGUONG = 24; // alpha trên mức này coi là đục
/** Độ dẹt bầu dục, ĐO TỪ ẢNH BỆ ĐANG DÙNG (b/a). Bệ cũ 0,197; bệ mới 06/10
    là 0,244 — đổi ảnh bệ thì chạy do-mat-be.mjs rồi cập nhật số này. */
const DEP = Number(process.argv[3] || 0.244);

const ra = {};
for (const f of fs.readdirSync(THU_MUC).filter((x) => x.endsWith(".webp")).sort()) {
  const ten = f.replace(".webp", "");
  const { data, info } = await sharp(`${THU_MUC}/${f}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const duc = (x, y) => data[(y * W + x) * 4 + 3] > NGUONG;

  /* Bề ngang phần đục theo từng hàng — dùng lại cho cả hai phép đo. */
  const rong = [];
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (duc(x, y)) n++;
    rong.push(n);
  }

  /* Hàng cuối cùng còn điểm đục = đáy thật của vật. */
  let day = H - 1;
  while (day > 0 && rong[day] === 0) day--;

  /* ---- Tâm ngang + bề ngang ĐÁY ----
     Lấy một DẢI 12% chiều cao tính từ hàng đáy lên, chứ không lấy một hàng:
     hàng cuối thường chỉ là vài điểm mờ của chân đĩa. */
  const dai = Math.max(2, Math.round(H * 0.12));
  let tr = W;
  let ph = 0;
  for (let y = Math.max(0, day - dai); y <= day; y++) {
    for (let x = 0; x < W; x++) {
      if (duc(x, y)) {
        if (x < tr) tr = x;
        if (x > ph) ph = x;
      }
    }
  }

  /*
   * ---- Nửa chiều cao bầu dục đáy ----
   *
   * Đáy đĩa là một BẦU DỤC, không phải một điểm. Đĩa đặt giữa mặt bệ thì TÂM
   * bầu dục đáy trùng tâm mặt bệ, nên điểm thấp nhất của đĩa nằm THẤP HƠN
   * tâm mặt bệ đúng nửa bầu dục đó. Thiếu số này là đĩa treo lên vành sau.
   *
   * GIẢI ĐỒNG THỜI, không đo một hàng cố định — đã thử hai cách sai:
   *   - "hàng rộng nhất ở nửa dưới ảnh": với bát thì đó là VÀNH BÁT (bát loe
   *     lên trên), ra 130px trên ảnh cao 290px;
   *   - "bề ngang ở hàng sát đáy": với khay dẹt thì điểm thấp nhất chỉ là một
   *     góc, bề ngang ở đó rất hẹp (`rainbow-maki` ra 89px dù khay rộng gần
   *     470px).
   * Bầu dục đáy thoả hai điều cùng lúc: vành trước của nó là hàng thấp nhất
   * `day`, và trục ngang nằm cao hơn `day` đúng `b`, tại đó bề ngang là `2a`
   * với `b = DEP · a`. Nên tìm `b` sao cho `DEP · rong[day − b] / 2 ≈ b`.
   */
  let nua = 1;
  for (let b = 1; b < H * 0.5; b++) {
    nua = b;
    if ((DEP * rong[Math.max(0, day - b)]) / 2 <= b) break;
  }

  ra[ten] = {
    cx: +((tr + ph) / 2 / W).toFixed(4),
    rong: +((ph - tr) / W).toFixed(4),
    day: +((day + 1) / H).toFixed(4),
    nua,
    w: W,
    h: H,
  };

  console.log(
    ten.padEnd(21) +
      `tâm đáy ${(ra[ten].cx * 100).toFixed(1)}%`.padEnd(16) +
      `ngang đáy ${(ra[ten].rong * 100).toFixed(1)}%`.padEnd(19) +
      `nửa bầu dục ${String(nua).padStart(3)}px`
  );
}

fs.writeFileSync("data/day-dia.json", JSON.stringify(ra, null, 2) + "\n");
console.log("\n-> data/day-dia.json  (" + Object.keys(ra).length + " món)");
console.log("   Component đọc thẳng tệp này; KHÔNG còn bảng hằng số nào phải chép tay.");
