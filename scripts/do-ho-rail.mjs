/*
 * Khoảng hở giữa ĐĨA #3 và RAIL tiện ích bên phải.
 *
 * Rail (`RightUtilityRail`) là `fixed right-[18px]` nên nó bám mép phải MÀN
 * HÌNH, còn đĩa bám theo phần trăm bề ngang KHỐI NỘI DUNG — hai hệ quy chiếu
 * khác nhau, nên khoảng hở đổi theo từng cỡ màn và không suy ra được từ một
 * cỡ. Phải đo đủ.
 *
 * Đo cả khoảng hở MÉP PHẢI màn luôn, vì dời bệ sang trái thì mép phải ảnh bệ
 * rời khỏi mép màn và để lộ một vạt nền — thứ cần nhìn chứ không chỉ cần biết.
 *
 * Chạy:  node scripts/do-ho-rail.mjs [1440 | 1280x720]
 */
import { dungKhung, cho } from "./lib/trinh-duyet.mjs";
import { doiSoCoMan } from "./lib/co-man.mjs";

const CO = doiSoCoMan();
/** Hở ít hơn bấy nhiêu px thì coi là chạm. */
const TOI_THIEU = 8;

const b = await dungKhung();
let hong = 0;

for (const [W, H] of CO) {
  await b.khoKhung(W, H);
  await b.go("http://localhost:3160/de");
  await cho(2000);

  let truoc = null;
  for (let i = 0; i < 4; i++) {
    const khac = truoc === null ? "true" :
      "d.map(e=>e.src).join('|') !== " + JSON.stringify(truoc);
    await b.choTới(
      "const d=[...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src));" +
        "return d.length === 3 && " + khac +
        " && d.every(e => getComputedStyle(e).opacity === '1' && e.complete);",
      12000
    );
    await cho(200);
    truoc = await b.js(
      "return [...document.querySelectorAll('img')].filter(e=>/mon-be/.test(e.src))" +
        ".map(e=>e.src).join('|');"
    );

    const r = await b.js(`
      const d = [...document.querySelectorAll('img')].filter((e) => /mon-be/.test(e.src));
      const be = document.querySelector('img[src*="be-trung-bay"]');
      /* Rail: khối cố định bên phải chứa nút Master Chef. */
      const rail = [...document.querySelectorAll('div')].find((e) => {
        const cs = getComputedStyle(e);
        return cs.position === 'fixed' && parseFloat(cs.right) < 40 &&
          e.querySelector('button, a') && e.getBoundingClientRect().width < 140 &&
          e.getBoundingClientRect().height > 80;
      });
      if (!rail) return { loi: 'không thấy rail' };
      const rr = rail.getBoundingClientRect();
      const q3 = d[2].getBoundingClientRect();
      const rb = be.getBoundingClientRect();

      /* Hở theo chiều NGANG; chỉ tính là va khi còn chồng theo chiều DỌC. */
      const chongDoc = Math.min(q3.bottom, rr.bottom) - Math.max(q3.top, rr.top);
      return {
        ten: (d[2].src.match(/([^/]+)\\.webp/) || [, '?'])[1],
        hoNgang: Math.round(rr.left - q3.right),
        chongDoc: Math.round(chongDoc),
        beMepPhai: Math.round(window.innerWidth - rb.right),
      };
    `);

    if (r.loi) { console.log("  " + W + "×" + H + "  " + r.loi); hong++; continue; }

    const va = r.chongDoc > 0 && r.hoNgang < TOI_THIEU;
    if (va) hong++;
    console.log(
      "  " + (W + "×" + H).padEnd(10) + "bộ " + (i + 1) + "  " + r.ten.padEnd(22) +
        " hở ngang tới rail " + String(r.hoNgang).padStart(5) + "px" +
        " | chồng dọc " + String(r.chongDoc).padStart(4) + "px  " +
        (va ? "VA" : "ok") +
        " | mép phải bệ cách mép màn " + r.beMepPhai + "px"
    );
  }
}

console.log(hong ? "\n  CÒN " + hong + " lượt đĩa va rail" : "\n  đĩa #3 không va rail ở mọi cỡ đã đo");
b.dong();
process.exit(hong ? 1 : 0);
