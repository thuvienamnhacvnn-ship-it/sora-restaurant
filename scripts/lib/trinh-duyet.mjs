/*
 * Khung điều khiển Chrome dùng chung cho các script kiểm CHẠY THẬT.
 *
 * Rút ra từ `kiem-speisekarte.mjs` vì script thứ hai cần y nguyên 130 dòng đó.
 * `kiem-speisekarte.mjs` CỐ Ý không đổi sang dùng lib này: nó đang 21/21, đổi
 * đi là đặt cược một bài kiểm đang chạy được vào một lần refactor không ai
 * yêu cầu. Khi nào có việc phải sửa nó thật thì chuyển luôn.
 *
 * Các bẫy đã dính trên máy này, đừng gỡ:
 *  - `captureScreenshot` TREO khi `deviceScaleFactor: 2`, khung quá to, hoặc
 *    có `clip.scale`. Giữ dsf = 1.
 *  - `/json/list` phần tử đầu có thể là background page của extension (đo ra
 *    980px, chụp thì treo) -> phải lọc `type === "page"`.
 *  - Điền input bằng `el.value = x` thì React không thấy. Phải gọi setter
 *    nguyên bản của prototype rồi `dispatchEvent(new Event('input'))`.
 */
import http from "node:http";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

/*
 * Tự tìm trình duyệt. Bài kiểm này chạy ở HAI nơi — máy Windows của Sếp và
 * VPS Ubuntu (để nghiệm thu ngay trên bản live) — nên không ghim được một
 * đường dẫn. Ghim `C:/Program Files/...` thì trên VPS ra ENOENT, và
 * `process.env.TEMP` trên Linux là rỗng -> `--user-data-dir=undefined/...`.
 * Đặt `CHROME_BIN` để chỉ định tay.
 */
const UNG_VIEN = [
  process.env.CHROME_BIN,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/snap/bin/chromium",
].filter(Boolean);

const CHROME = UNG_VIEN.find((p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
});

export const cho = (ms) => new Promise((r) => setTimeout(r, ms));

/*
 * Hạn chờ mặc định cho mọi phép `choTới`.
 *
 * 60 giây nghe như nhiều, nhưng đây KHÔNG phải thời gian chờ — chờ theo điều
 * kiện thì trang sẵn sàng lúc nào là đi tiếp lúc đó, thường dưới 3 giây. Đây
 * là hạn để BÁO HỎNG. Đặt chặt (25s) thì trên máy 4 nhân đang mở sẵn ~67 tiến
 * trình Chrome, bài kiểm chết vì máy chậm chứ không vì web sai — đã gặp thật:
 * "trang không tải xong trong 25000ms". Báo hỏng vì máy chậm cũng là báo sai.
 * Nới bằng `KIEM_HAN_MS=120000` nếu máy đang dựng gì nặng.
 */
const HAN_MAC_DINH = Number(process.env.KIEM_HAN_MS) || 60000;

export async function moTrinhDuyet({ port = 9440, rong = 1440, cao = 900 } = {}) {
  if (!CHROME)
    throw new Error(
      "không tìm thấy Chrome/Chromium. Đặt CHROME_BIN=/đường/dẫn rồi chạy lại.\n" +
        "  đã thử: " + UNG_VIEN.join(", ")
    );

  const docJson = (p) =>
    new Promise((r, j) =>
      http
        .get({ host: "127.0.0.1", port, path: p }, (s) => {
          let b = "";
          s.on("data", (d) => (b += d));
          s.on("end", () => r(JSON.parse(b)));
        })
        .on("error", j)
    );

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--remote-debugging-port=" + port,
      "--remote-allow-origins=*",
      "--hide-scrollbars",
      // Trên VPS chạy bằng root trong container không có sandbox -> Chrome
      // không lên. Chỉ thêm cờ này ngoài Windows, không nới lỏng máy của Sếp.
      ...(process.platform === "win32" ? [] : ["--no-sandbox", "--disable-dev-shm-usage"]),
      "--user-data-dir=" + path.join(os.tmpdir(), "sora-kiem-" + Date.now()),
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let ver = null;
  for (let i = 0; i < 200 && !ver; i++) {
    try {
      ver = await docJson("/json/version");
    } catch {
      await cho(300);
    }
  }
  if (!ver) {
    chrome.kill();
    throw new Error("Chrome không lên");
  }

  // Phải là `type === "page"`: phần tử đầu danh sách có thể là trang nền của
  // tiện ích mở rộng, nối vào đó thì mọi phép đo đều sai.
  const tab = (await docJson("/json/list")).find((t) => t.type === "page");
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pend = new Map();
  /** Lỗi console gom theo trang đang mở; `go()` tự xoá đầu mỗi trang. */
  let loiConsole = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      loiConsole.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
    if (m.method === "Runtime.exceptionThrown") {
      /* `exceptionDetails.text` thường chỉ là chữ "Uncaught" — vô dụng khi đi
         tìm nguyên nhân. Thông tin thật nằm ở `exception.description` (có cả
         vết gọi) hoặc `exception.value`. Đã mất một lượt dò vì chỗ này. */
      const d = m.params.exceptionDetails;
      const chiTiet =
        d.exception?.description ??
        (d.exception?.value != null ? String(d.exception.value) : null) ??
        d.text;
      const o = d.url ? " @" + d.url + ":" + (d.lineNumber ?? "?") : "";
      loiConsole.push(String(chiTiet).split("\n").slice(0, 3).join(" ⏎ ") + o);
    }
    if (pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    }
  };

  const cmd = (ten, tham = {}, ms = 90000) =>
    new Promise((r, j) => {
      const i = ++id;
      const h = setTimeout(() => {
        pend.delete(i);
        j(new Error(ten + " quá giờ"));
      }, ms);
      pend.set(i, (m) => {
        clearTimeout(h);
        if (m.error) j(new Error(ten + ": " + m.error.message));
        else r(m.result);
      });
      ws.send(JSON.stringify({ id: i, method: ten, params: tham }));
    });

  await cmd("Page.enable");
  await cmd("Runtime.enable");
  await khoKhung(1440, 900);

  async function khoKhung(w, h, dienThoai = false) {
    await cmd("Emulation.setDeviceMetricsOverride", {
      width: w,
      height: h,
      deviceScaleFactor: 1, // 2 là treo captureScreenshot trên máy này
      mobile: dienThoai,
      ...(dienThoai
        ? {
            screenWidth: w,
            screenHeight: h,
            screenOrientation: { type: "portraitPrimary", angle: 0 },
          }
        : {}),
    });
  }

  const js = async (bieuThuc) => {
    const r = await cmd("Runtime.evaluate", {
      expression: "(() => { " + bieuThuc + " })()",
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  /**
   * Chờ tới khi `bieuThuc` trả về giá trị thật, trả `null` nếu quá giờ.
   * Thay cho `cho(ms)` cố định — xem ghi chú ở `go()`.
   */
  const choTới = async (bieuThuc, hanMs = HAN_MAC_DINH, nhipMs = 250) => {
    const hetHan = Date.now() + hanMs;
    for (;;) {
      let v = null;
      try {
        v = await js(bieuThuc);
      } catch {
        v = null; // trang đang điều hướng -> thử lại
      }
      if (v) return v;
      if (Date.now() > hetHan) return null;
      await cho(nhipMs);
    }
  };

  /*
   * Mở một trang rồi CHỜ THEO ĐIỀU KIỆN, không chờ theo đồng hồ.
   *
   * Trước đây hàm này `cho(9000)` rồi chạy tiếp. Trên máy rảnh thì đủ, nhưng
   * máy này 4 nhân và Sếp thường mở sẵn ~67 tiến trình Chrome — lúc đó React
   * chưa gắn xong trong 9 giây, cú bấm rơi vào HTML tĩnh và không có gì xảy
   * ra. Hậu quả đã thấy thật: cùng một code, một lượt ra 51/55, lượt sau ra
   * 55/55. **Bộ kiểm chập chờn còn tệ hơn không có bộ kiểm**, vì không ai
   * biết lượt nào nói thật.
   *
   * Nay chờ ba mốc: `readyState` xong → React đã gắn (có handler cho sự kiện)
   * → thêm `san` do người gọi khai nếu trang đó có mốc riêng.
   *
   * Dò React đã gắn bằng `__reactFiber$`/`__reactProps$`: React 19 vẫn gắn
   * hai khoá này lên chính phần tử DOM khi hydrate xong. Không có khoá nào
   * tức mới chỉ là HTML từ máy chủ.
   */
  const REACT_DA_GAN =
    "const g=document.querySelector('main') || document.body;" +
    "return [...document.querySelectorAll('button,a,input,select')].some(e=>" +
    "  Object.keys(e).some(k=>k.startsWith('__reactProps$')||k.startsWith('__reactFiber$'))" +
    ") || Object.keys(g).some(k=>k.startsWith('__reactContainer$'));";

  const go = async (url, tuyChon = {}) => {
    // Vẫn nhận tham số thứ hai là SỐ cho mấy chỗ gọi kiểu cũ.
    const { san = null, hanMs = HAN_MAC_DINH } =
      typeof tuyChon === "number" ? { hanMs: HAN_MAC_DINH } : tuyChon;

    loiConsole = [];
    await cmd("Page.navigate", { url });

    const xong = await choTới("return document.readyState === 'complete';", hanMs);
    if (!xong) throw new Error("trang không tải xong trong " + hanMs + "ms: " + url);

    const ganRoi = await choTới(REACT_DA_GAN, hanMs);
    if (!ganRoi) throw new Error("React không gắn xong trong " + hanMs + "ms: " + url);

    if (san) {
      const co = await choTới(san, hanMs);
      if (!co) throw new Error("điều kiện `san` không đạt trong " + hanMs + "ms: " + url);
    }
    // Một nhịp ngắn cho effect chạy nốt sau khi gắn.
    await cho(350);
  };

  /*
   * Bấm bằng chính sự kiện của trình duyệt, không gọi hàm React trực tiếp.
   * CHỜ phần tử xuất hiện thay vì bấm ngay rồi báo "KHÔNG THẤY": phần lớn lần
   * hỏng chập chờn là bấm sớm vài trăm ms, không phải thiếu phần tử thật.
   */
  const bam = async (chon, ms = 1000) => {
    const co = await choTới(
      "return document.querySelectorAll(" + JSON.stringify(chon) + ").length > 0;",
      8000
    );
    if (!co) return "KHÔNG THẤY " + chon;
    const v = await js(
      "const el = [...document.querySelectorAll(" +
        JSON.stringify(chon) +
        ")][0];" +
        "if (!el) return 'KHÔNG THẤY ' + " +
        JSON.stringify(chon) +
        "; el.click(); return 'ok';"
    );
    await cho(ms);
    return v;
  };

  const bamChu = async (the, chu, ms = 1000) => {
    const timThay =
      "return [...document.querySelectorAll(" +
      JSON.stringify(the) +
      ")].some((e) => e.textContent.trim().startsWith(" +
      JSON.stringify(chu) +
      "));";
    // Chờ như `bam()`, cùng lý do: bấm sớm là nguồn gốc của lần hỏng chập chờn.
    const co = await choTới(timThay, 8000);
    if (!co) return "KHÔNG THẤY nút có chữ " + chu;
    const v = await js(
      "const el = [...document.querySelectorAll(" +
        JSON.stringify(the) +
        ")].find((e) => e.textContent.trim().startsWith(" +
        JSON.stringify(chu) +
        "));" +
        "if (!el) return 'KHÔNG THẤY nút có chữ ' + " +
        JSON.stringify(chu) +
        "; el.click(); return 'ok';"
    );
    await cho(ms);
    return v;
  };

  const nhapO = async (chon, giaTri, ms = 900) => {
    const v = await js(
      "const o = document.querySelector(" +
        JSON.stringify(chon) +
        ");" +
        "if (!o) return 'KHÔNG THẤY ' + " +
        JSON.stringify(chon) +
        ";" +
        // React không thấy `o.value = x`; phải qua setter nguyên bản
        "const proto = o.tagName === 'SELECT' ? window.HTMLSelectElement.prototype" +
        " : o.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype" +
        " : window.HTMLInputElement.prototype;" +
        "Object.getOwnPropertyDescriptor(proto, 'value').set.call(o, " +
        JSON.stringify(String(giaTri)) +
        ");" +
        "o.dispatchEvent(new Event(o.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));" +
        "return 'ok';"
    );
    await cho(ms);
    return v;
  };

  const bamPhim = async (key, ms = 800) => {
    const ma = { Escape: 27, ArrowRight: 39, ArrowLeft: 37 }[key] ?? 0;
    await cmd("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code: key,
      windowsVirtualKeyCode: ma,
    });
    await cmd("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code: key,
      windowsVirtualKeyCode: ma,
    });
    await cho(ms);
  };

  /** Tràn ngang: so scrollWidth với clientWidth của <html>. */
  const doTran = () =>
    js(
      "const d = document.documentElement;" +
        "return { scroll: d.scrollWidth, client: d.clientWidth };"
    );

  const dong = () => {
    ws.close();
    chrome.kill();
  };

  return {
    cmd,
    js,
    go,
    choTới,
    bam,
    bamChu,
    nhapO,
    bamPhim,
    doTran,
    khoKhung,
    dong,
    loiConsole: () => loiConsole,
  };
}

/*
 * Sổ kết quả. Có BA trạng thái, không phải hai:
 *
 *   ĐẠT   — trang làm đúng.
 *   HỎNG  — trang làm sai. Có người phải đi sửa web.
 *   LỖI-K — **bài kiểm** không chạy được tới chỗ cần kiểm (chưa thấy mốc của
 *           trang, hết hạn chờ, thiếu phần tử để bấm). KHÔNG kết luận gì về
 *           trang. Không ai phải đi sửa web.
 *
 * Vì sao phải tách: gộp LỖI-K vào HỎNG thì người đọc báo cáo đi sửa thứ không
 * hỏng. Đã xảy ra thật — Kontakt báo 5 HỎNG (`undefined ô`, mục 390px in
 * `1440/1440px`) chỉ vì `next dev` chưa biên dịch xong route đó, còn chạy
 * riêng thì 14/14 đạt và HTML máy chủ vẫn đủ form.
 *
 * Mặt ngược lại cũng đã xảy ra: mục "bệ 360" từng ĐẠT với 0 vật thể, tức đạt
 * RỖNG. Hai mặt của cùng một thiếu sót — **bài kiểm không tự chứng minh là nó
 * đã kiểm đúng thứ cần kiểm.** `ghi()` vì thế từ chối một mục không có bằng
 * chứng, và `ghiRong()` dùng khi cố ý ghi nhận "chưa kiểm được".
 */
export function soKetQua() {
  const ds = [];
  return {
    ghi(ten, dat, chiTiet = "") {
      ds.push({ ten, dat: !!dat, chiTiet: String(chiTiet) });
    },
    /** Bài kiểm không tới được chỗ cần kiểm. Không phải lỗi của trang. */
    ghiLoiKiem(ten, chiTiet = "") {
      ds.push({ ten, loiKiem: true, chiTiet: String(chiTiet) });
    },
    muc(ten) {
      ds.push({ muc: ten });
      return this;
    },
    in() {
      let hong = 0;
      let loiKiem = 0;
      let rong = 0;
      for (const k of ds) if (!k.muc) rong = Math.max(rong, k.ten.length);
      console.log("");
      for (const k of ds) {
        if (k.muc) {
          console.log("\n  — " + k.muc);
          continue;
        }
        let nhan;
        if (k.loiKiem) {
          loiKiem++;
          nhan = "LỖI-K";
        } else if (k.dat) {
          nhan = "ĐẠT ";
        } else {
          hong++;
          nhan = "HỎNG";
        }
        console.log("    " + nhan.padEnd(5) + " " + k.ten.padEnd(rong) + "  " + k.chiTiet);
      }

      const tong = ds.filter((k) => !k.muc).length;
      const dat = tong - hong - loiKiem;
      let dong = "\n  " + dat + "/" + tong + " đạt";
      if (hong) dong += " — " + hong + " HỎNG (trang sai, phải sửa web)";
      if (loiKiem)
        dong += " — " + loiKiem + " LỖI-K (bài kiểm không tới được, KHÔNG kết luận gì về trang)";
      console.log(dong);
      if (loiKiem && !hong)
        console.log(
          "  ⚠ Không có mục nào kết luận trang sai. Chạy lại riêng bộ này trước khi đi sửa gì."
        );

      /* Mã thoát phân biệt: 1 = trang sai, 3 = bài kiểm không chạy được.
         Khác nhau vì hai thứ đó đòi hai hành động khác nhau. */
      return { hong, loiKiem, ma: hong ? 1 : loiKiem ? 3 : 0 };
    },
  };
}
