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
import net from "node:net";
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
 * Đây KHÔNG phải thời gian chờ — chờ theo điều kiện thì trang sẵn sàng lúc nào
 * là đi tiếp lúc đó. Đây là hạn để BÁO HỎNG.
 *
 * 120 giây là con số ĐO RA, không phải đoán. Đo thời gian React gắn xong trên
 * máy này lúc đang tải (`next dev` + ~67 tiến trình Chrome của Sếp):
 *
 *     /de/ueber-uns   35,2 s     /de             18,7 s
 *     /de/impressum   17,3 s     /vi/ueber-uns   15,0 s
 *
 * Worst case 35 s, nên hạn 60 s chỉ gấp 1,7 lần — quá sát, và đã hỏng thật ba
 * lần: `kiem-chu-song-ngu` lượt 3 ra LỖI-K ở `/de/ueber-uns`, `kiem-trang-chu`
 * ra 3 LỖI-K ở `/de`. **Báo hỏng vì máy chậm cũng là báo sai.** 120 s cho hệ
 * số 3,4 lần. Nới thêm bằng `KIEM_HAN_MS=240000` khi máy đang dựng gì nặng.
 */
const HAN_MAC_DINH = Number(process.env.KIEM_HAN_MS) || 120000;

/*
 * Xin hệ điều hành một cổng TRỐNG thay vì ghim số cố định.
 *
 * Ghim cổng là tài nguyên DÙNG CHUNG giữa các lượt chạy: một tiến trình Chrome
 * của lượt trước còn giữ cổng thì lượt sau mở không được, và lỗi rơi ra ở chỗ
 * khởi tạo — ngoài mọi vùng bắt lỗi. Triệu chứng đã thấy: `kiem-trang.mjs`
 * chết ở dòng `moTrinhDuyet(...)`, mã thoát 1, trong khi chẳng kiểm được gì;
 * và cả tôi lẫn `sora-dev-datban` đều phải đi dọn Chrome kẹt bằng tay.
 *
 * `listen(0)` để hệ điều hành chọn, đọc số rồi nhả ra. Vẫn còn một khe hở lý
 * thuyết giữa lúc nhả và lúc Chrome chiếm, nhưng khe đó cỡ milli-giây và
 * không dùng chung giữa các lượt — khác hẳn một con số ghim cứng.
 */
export async function congTrong() {
  return new Promise((ok, loi) => {
    const sv = net.createServer();
    sv.unref();
    sv.on("error", loi);
    sv.listen(0, "127.0.0.1", () => {
      const p = sv.address().port;
      sv.close(() => ok(p));
    });
  });
}

/*
 * ⚠ KHÔNG nhận `rong`/`cao` ở đây. Trước đây có, với mặc định 1440×900, nhưng
 * **không dòng nào dùng tới** — cỡ cửa sổ do `khoKhung(rộng, cao)` đặt sau.
 * Tham số nhận vào rồi bỏ qua còn tệ hơn không có: người gọi truyền 1280×720
 * và yên trí mình đang kiểm ở cỡ đó, trong khi trình duyệt vẫn 1440×900. Đúng
 * họ với lỗi 06/10 — kiểm ở một cỡ rồi tưởng đã kiểm đủ.
 *
 * Cỡ màn lấy từ `lib/co-man.mjs`, đặt bằng `khoKhung`.
 */
export async function moTrinhDuyet({ port } = {}) {
  // Không ghim cổng. Người gọi truyền `port` thì tôn trọng, nhưng không script
  // nào nên truyền — xem ghi chú ở `congTrong()`.
  port = port ?? (await congTrong());
  if (!CHROME)
    throw new Error(
      "không tìm thấy Chrome/Chromium. Đặt CHROME_BIN=/đường/dẫn rồi chạy lại.\n" +
        "  đã thử: " + UNG_VIEN.join(", ")
    );

  const hoSo = path.join(
    os.tmpdir(),
    "sora-kiem-" + Date.now() + "-" + process.pid + "-" + Math.random().toString(36).slice(2, 8)
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
      /* Hồ sơ RIÊNG mỗi lượt: `Date.now()` + pid + một đoạn ngẫu nhiên.
         Chỉ `Date.now()` là chưa đủ — hai lượt khởi động trong cùng một
         milli-giây sẽ dùng chung hồ sơ. Dùng chung hồ sơ thì Chrome phục vụ
         bản đã đệm: trưởng nhóm mất bốn lượt chụp ảnh vì đúng chuyện này. */
      "--user-data-dir=" + hoSo,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  /* Đóng Chrome KỂ CẢ khi ở trên ném lỗi hoặc script thoát giữa đường.
     `process.once('exit')` chạy cả khi `process.exit()` được gọi, nên không
     cần mỗi script tự nhớ `finally`. Dọn luôn thư mục hồ sơ tạm. */
  const donDep = () => {
    try {
      chrome.kill();
    } catch {
      /* đã chết rồi */
    }
    try {
      fs.rmSync(hoSo, { recursive: true, force: true });
    } catch {
      /* Chrome còn giữ tệp -> để hệ điều hành dọn thư mục tạm */
    }
  };
  process.once("exit", donDep);

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
   *
   * ⚠ `__reactContainer$` nằm trên `document`, KHÔNG nằm trên `main` hay
   * `body`. App Router gọi `hydrateRoot(document, …)`, nên gốc là `document`.
   * Bản đầu tôi kiểm trên `main || body` — đo ra CẢ HAI đều 0 trên cả bốn
   * tuyến, tức **nhánh đó chưa bao giờ chạy** và phép nhận biết hydrate suốt
   * thời gian qua đứng trên MỘT chân (chỉ nhánh đếm `__reactProps$`). Trên
   * `/de/ueber-uns` nhánh ấy đúng lúc phát hiện chỉ thấy **1** phần tử, trong
   * khi các tuyến khác 20–30 — mong manh.
   *
   * ĐỪNG DỌN nhánh `document`: nó là nhánh đúng và là nhánh chắc chắn nhất
   * (có trên cả bốn tuyến đo được). Giữ cả hai để một cái hỏng vẫn còn cái kia.
   */
  const DO_HYDRATE =
    "const tuongTac=[...document.querySelectorAll('button,a,input,select')];" +
    "const coProps=tuongTac.filter(e=>Object.keys(e).some(k=>" +
    "  k.startsWith('__reactProps$')||k.startsWith('__reactFiber$'))).length;" +
    "const goc=Object.keys(document).filter(k=>k.startsWith('__reactContainer$')).length;" +
    "return { readyState: document.readyState, soTuongTac: tuongTac.length, coProps, goc };";

  const REACT_DA_GAN =
    "const tuongTac=[...document.querySelectorAll('button,a,input,select')];" +
    "const coProps=tuongTac.some(e=>Object.keys(e).some(k=>" +
    "  k.startsWith('__reactProps$')||k.startsWith('__reactFiber$')));" +
    "const goc=Object.keys(document).some(k=>k.startsWith('__reactContainer$'));" +
    "return coProps || goc;";

  const go = async (url, tuyChon = {}) => {
    // Vẫn nhận tham số thứ hai là SỐ cho mấy chỗ gọi kiểu cũ.
    const { san = null, hanMs = HAN_MAC_DINH } =
      typeof tuyChon === "number" ? { hanMs: HAN_MAC_DINH } : tuyChon;

    loiConsole = [];
    await cmd("Page.navigate", { url });

    /*
     * Quá hạn thì in SỐ ĐO ĐƯỢC, không chỉ in "không đạt trong Nms".
     * "Không đạt trong 120000ms" không phân biệt được web CHẬM với web CHẾT —
     * trưởng nhóm đã phải tự đi đoán một lần. Kèm `readyState`, số phần tử
     * tương tác, bao nhiêu cái đã có `__reactProps$`, và gốc React có chưa:
     *   coProps 0 / soTuongTac 0   -> trang chưa dựng gì (web chết / 404)
     *   coProps 0 / soTuongTac 28  -> HTML có rồi, hydrate chưa tới (web chậm)
     */
    const quaHan = async (viec) => {
      let d = null;
      try {
        d = await js(DO_HYDRATE);
      } catch {
        d = null;
      }
      const soLieu = d
        ? ` [readyState=${d.readyState} tươngTác=${d.soTuongTac} cóProps=${d.coProps} gốcReact=${d.goc}]`
        : " [không đọc được trang — Chrome mất kết nối?]";
      throw new Error(viec + " trong " + hanMs + "ms: " + url + soLieu);
    };

    const xong = await choTới("return document.readyState === 'complete';", hanMs);
    if (!xong) await quaHan("trang không tải xong");

    const ganRoi = await choTới(REACT_DA_GAN, hanMs);
    if (!ganRoi) await quaHan("React không gắn xong");

    if (san) {
      const co = await choTới(san, hanMs);
      if (!co) await quaHan("điều kiện `san` không đạt");
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
    try {
      ws.close();
    } catch {
      /* đã đóng */
    }
    donDep();
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
 * Dựng khung (mở trình duyệt) sao cho KHÔNG BAO GIỜ thoát với mã 1.
 *
 * Mã 1 nghĩa là "trang sai, phải sửa web". Khung chết thì chẳng kiểm được gì,
 * nên nó phải là `LỖI-K` / mã 3. Trước đây `const b = await moTrinhDuyet(...)`
 * nằm NGOÀI mọi vùng bắt lỗi: Chrome không mở được là script chết mang mã 1,
 * tức tự khai là web sai trong khi chưa đo một thứ gì.
 *
 * Gắn luôn hai cái lưới cho mọi ngoại lệ lọt ra sau đó — cũng về mã 3.
 */
export function veMa3(nhan) {
  return (e) => {
    console.error("\n    LỖI-K " + nhan + "\n");
    console.error(String(e && e.stack ? e.stack : e));
    console.error(
      "\n  Bài kiểm KHÔNG chạy được tới chỗ cần kiểm — chưa kết luận gì về trang."
    );
    process.exit(3);
  };
}

/** Hai cái lưới cho mọi ngoại lệ lọt ra ngoài — đều về mã 3, không về mã 1. */
export function luoiMa3() {
  process.on("uncaughtException", veMa3("ngoại lệ không bắt được"));
  process.on("unhandledRejection", veMa3("promise bị bỏ rơi"));
}

export async function dungKhung(tuyChon = {}) {
  luoiMa3();
  try {
    return await moTrinhDuyet(tuyChon);
  } catch (e) {
    veMa3("không dựng được trình duyệt")(e);
  }
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
