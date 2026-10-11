/*
 * Đĩa có đứng đúng trên bệ không — đo CẢ HAI VẾ từ ĐIỂM ẢNH, cùng một trang,
 * cùng một lúc.
 *
 * Không tin ghi chú, không tin hằng số trong code: vị trí trụ đọc từ ảnh bệ
 * đang hiển thị, tâm đáy đĩa đọc từ ảnh món đang hiển thị. Đã có lần so số
 * trong ghi chú với số trên màn và kết luận lệch 8,4% trong khi thực tế 0%.
 *
 * ⚠ KHÔNG đo tâm HỘP của đĩa. Hộp đã bị `translateX(-cx)` dịch đi để tâm ĐÁY
 * trùng tâm bệ, nên tâm hộp lệch là ĐÚNG — đo nhầm vế là báo hỏng oan.
 *
 * ⚠ VẾ BỆ KHÔNG CÒN TỰ DÒ NỮA (sửa 06/10). Bản cũ quét theo CỘT để tách trụ:
 * đúng với bệ cũ (ba trụ rời nhau, cùng cao độ) nhưng **vô dụng với bệ mới**
 * (ba trụ chồng nhau theo chiều ngang, ba cao độ khác nhau) — nó chỉ thấy 2
 * khối và báo 12 đĩa sai trong khi đĩa không sai. Giờ đọc `data/be-tru.json`,
 * đúng tệp mà `BeMonAn.tsx` dùng để đặt đĩa.
 *
 * Nghe như "tự kiểm bằng chính số của mình", nhưng không: tệp JSON chỉ cho
 * TOẠ ĐỘ TRONG ẢNH, còn phép kiểm đo vị trí THỰC TẾ trên màn — nó bắt được
 * mọi lỗi ở khâu CSS (phần trăm sai gốc, hộp lệch ảnh, `fill` co theo chiều
 * cao, `translateX` sai dấu), tức đúng những lỗi đã dính. Vế "số đo trụ có
 * khớp ảnh không" là việc của `do-mat-be.mjs` (nó in sai số khớp).
 *
 * Chạy:  node scripts/do-khop-dia-be.mjs [1440]
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import fs from "node:fs";

const CO = process.argv[2] ? [Number(process.argv[2])] : [1280, 1440, 1920];

const BE_TRU = JSON.parse(fs.readFileSync("data/be-tru.json", "utf8"));
const DAY = JSON.parse(fs.readFileSync("data/day-dia.json", "utf8"));

const DO = `
  const ra = { be: null, mon: [] };

  /* ---- 1. Trụ bệ: toạ độ trong ảnh lấy từ data/be-tru.json, đổi sang px
          màn theo hộp THỰC TẾ của ảnh đang hiển thị ---- */
  const be = document.querySelector('img[src*="be-trung-bay"]');
  if (!be) return { loi: 'không thấy ảnh bệ' };
  if (!be.complete || !be.naturalWidth) return { loi: 'ảnh bệ chưa tải' };

  /*
   * ---- 0. ĐANG RENDER ĐÚNG TỆP MÀ be-tru.json NÓI KHÔNG? ----
   *
   * Chốt này sinh ra từ lỗi 06/10: be-tru.json đã trỏ bệ v3 với số đo đúng,
   * nhưng src trong page.tsx còn ghi cứng v2 — tức ẢNH CŨ chạy với TOẠ ĐỘ
   * MỚI, và ba đĩa chồng lên nhau. Sếp nhìn thấy trước công cụ.
   *
   * Vì sao mọi phép đo khác bỏ lọt: chúng đo qua DOM, mà cả hai tệp đều là
   * ảnh hợp lệ, cùng tải được, cùng có hộp. Tâm đáy đĩa vẫn khớp tâm trụ
   * TÍNH TỪ JSON, nên mọi con số vẫn xanh. Không có phép so TỆP thì không
   * phép đo nào bắt được "dùng nhầm ảnh".
   */
  const tepPhaiDung = ${JSON.stringify(BE_TRU.anh.replace(/^public\//, "/"))};
  const tepThat = new URL(be.currentSrc || be.src, location.href).pathname
    .replace(/^\\/_next\\/image.*/, '');
  const tepGon = decodeURIComponent(
    (be.currentSrc || be.src).includes('/_next/image')
      ? new URL(be.currentSrc || be.src, location.href).searchParams.get('url') || tepThat
      : tepThat
  );
  if (tepGon !== tepPhaiDung) {
    return { loi: 'đang render ' + tepGon + ' nhưng data/be-tru.json đo trên ' +
      tepPhaiDung + ' — ảnh và toạ độ lệch nhau' };
  }

  const rb = be.getBoundingClientRect();
  /*
   * So TỈ LỆ, không so số px.
   *
   * Bản đầu tôi so \`naturalWidth === 2161\` và nó báo hỏng ở cả ba cỡ màn:
   * ảnh bệ đi qua bộ tối ưu của Next (nó KHÔNG mang \`unoptimized\`, khác ảnh
   * món), nên \`naturalWidth\` là bề ngang Next PHỤC VỤ (1280/1440/1920), không
   * phải bề ngang tệp gốc. Phần trăm vẫn đúng vì tỉ lệ được giữ — nên thứ
   * phải kiểm là tỉ lệ.
   */
  const tlMan = be.naturalWidth / be.naturalHeight;
  const tlGoc = ${BE_TRU.w} / ${BE_TRU.h};
  if (Math.abs(tlMan - tlGoc) / tlGoc > 0.01) {
    return { loi: 'ảnh bệ trên màn tỉ lệ ' + tlMan.toFixed(3) +
      ' nhưng data/be-tru.json đo trên tỉ lệ ' + tlGoc.toFixed(3) +
      ' — chạy lại do-mat-be.mjs' };
  }

  ra.be = ${JSON.stringify(BE_TRU.tru)}.map((t) => ({
    tamPx: Math.round(rb.left + rb.width * (t.tam / 100)),
    trucPx: Math.round(rb.top + rb.height * (t.mat / 100)),
  }));

  /* ---- 2. Đĩa: tâm ĐÁY và mép đáy, cũng dò từ điểm ảnh ---- */
  for (const im of [...document.querySelectorAll('img')].filter((e) => /mon-be/.test(e.src))) {
    const r = im.getBoundingClientRect();
    const w2 = im.naturalWidth, h2 = im.naturalHeight;
    if (!w2) { ra.mon.push({ loi: 'ảnh chưa tải' }); continue; }
    const c2 = document.createElement('canvas');
    c2.width = w2; c2.height = h2;
    const g = c2.getContext('2d');
    g.drawImage(im, 0, 0, w2, h2);
    const p = g.getImageData(0, 0, w2, h2).data;
    const duc2 = (x, y) => p[((y * w2 + x) * 4) + 3] > 24;

    let day = h2 - 1;
    while (day > 0) {
      let co = false;
      for (let x = 0; x < w2 && !co; x++) if (duc2(x, day)) co = true;
      if (co) break;
      day--;
    }
    /* tâm đáy: lấy dải 12% chiều cao tính từ hàng đáy lên */
    const dai = Math.max(2, Math.round(h2 * 0.12));
    let tr = w2, ph = 0;
    for (let y = Math.max(0, day - dai); y <= day; y++) {
      for (let x = 0; x < w2; x++) if (duc2(x, y)) { if (x < tr) tr = x; if (x > ph) ph = x; }
    }
    ra.mon.push({
      ten: (im.src.match(/([^/]+)\\.webp/) || [, '?'])[1],
      tamDayPx: Math.round(r.left + r.width * (((tr + ph) / 2) / w2)),
      mepDayPx: Math.round(r.top + r.height * ((day + 1) / h2)),
      rongDay: +(((ph - tr) / w2)).toFixed(3),
      /* để quy nua (đo trên ảnh gốc) sang px trên màn — KHÔNG đặt dấu nháy
         ngược trong khối này, nó nằm trong một template literal */
      rongPx: r.width,
      rongGoc: w2,
    });
  }
  return ra;
`;

const b = await dungKhung();
let hong = 0;

for (const W of CO) {
  await b.khoKhung(W, 900);
  await b.go("http://localhost:3160/de");
  await b.choTới(
    "const d=[...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src));" +
      "return d.length === 3 && d.every(e => e.complete && getComputedStyle(e).opacity === '1');",
    9000
  );
  await cho(400);

  console.log("\n══ " + W + "px");
  /* Lặp 4 BỘ để soi đủ 12 đĩa, không chỉ bộ đang hiện. Chờ `opacity === 1`
     trước mỗi lượt — chụp/đo giữa lúc animation chạy là ra số rác. */
  for (let v = 0; v < 4; v++) {
  if (v > 0) {
    /* CHỜ TỚI KHI TÊN MÓN ĐỔI, không chờ theo đồng hồ. Chờ 2,6s trong khi
       chu kỳ đổi bộ là 5,2s thì bắt trùng bộ — lần đầu chỉ soi được 9/12 món
       mà vẫn tưởng đã soi đủ. */
    const truoc = await b.js(
      "return [...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src))" +
        ".map(e=>e.src).join('|');"
    );
    await b.choTới(
      "const d=[...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src));" +
        "return d.length === 3 && d.map(e=>e.src).join('|') !== " + JSON.stringify(truoc) +
        " && d.every(e => e.complete && getComputedStyle(e).opacity === '1');",
      12000
    );
    await cho(300);
  }
  const r = await b.js(DO);
  /* `hong++` bắt buộc: bản đầu chỉ `continue`, nên 12 lượt lỗi liền mà dòng
     cuối vẫn in "cả ba bệ đạt ở mọi cỡ đã đo". Lỗi phải làm phép kiểm ĐỎ. */
  if (r.loi) { console.log("  " + W + ": " + r.loi); hong += 3; continue; }

  for (let i = 0; i < 3; i++) {
    const be = r.be[i], m = r.mon[i];
    if (!be || !m || m.loi) { console.log("   #" + (i + 1) + "  " + (m?.loi ?? "thiếu dữ liệu")); hong++; continue; }
    const lechX = m.tamDayPx - be.tamPx;
    const lechY = m.mepDayPx - be.trucPx;

    /*
     * Mép đáy ảnh phải nằm THẤP HƠN trục ngang đúng NỬA BẦU DỤC ĐÁY của món
     * đó — đó là cách đĩa "chìm" vào mặt bệ thay vì treo trên vành.
     *
     * ⚠ ĐỪNG đặt ngưỡng px tuyệt đối (bản cũ: 0..+28px). Phần chìm là một tỉ
     * lệ của bề ngang đĩa, nên nó LỚN THEO CỠ MÀN: cùng một đĩa ra 13px ở
     * 1280, 15px ở 1440, 22px ở 1920. Ngưỡng cố định làm đúng-7-đĩa-sai ở
     * 1920 trong khi hình không hề đổi — báo hỏng oan, và che mất lỗi thật.
     *
     * Nên so với SỐ PHẢI RA: `nua` đo trên ảnh gốc, quy sang px theo đúng tỉ
     * lệ ảnh đang vẽ. Phép này kiểm cả chuỗi (công thức `haXuong`, gốc phần
     * trăm, `bottom`, co ảnh) chứ không chỉ kiểm một con số nằm trong dải.
     */
    const so = DAY[m.ten];
    const canChim = so ? (so.nua * m.rongPx) / (so.w || m.rongGoc) : null;
    const lech = canChim === null ? null : lechY - canChim;

    const okX = Math.abs(lechX) <= 4;
    const okY = lech !== null && Math.abs(lech) <= 3;
    if (!okX || !okY) hong++;
    console.log(
      "   #" + (i + 1) + "  " + (m.ten ?? "?").padEnd(20) +
        " tâm đáy lệch " + String(lechX).padStart(4) + "px " + (okX ? "ok " : "SAI") +
        " | chìm " + String(lechY).padStart(3) + "px / cần " +
        (canChim === null ? "  ?" : canChim.toFixed(1).padStart(5)) +
        " -> lệch " + (lech === null ? "?" : lech.toFixed(1).padStart(5)) + "px " +
        (okY ? "ok" : "SAI")
    );
  }
  }
}

console.log(hong ? "\n  CÒN " + hong + " đĩa chưa đạt" : "\n  cả ba bệ đạt ở mọi cỡ đã đo");
b.dong();
process.exit(hong ? 1 : 0);
