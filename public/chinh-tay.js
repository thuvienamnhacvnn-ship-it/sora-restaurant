/*
 * ============================================================================
 *  KHOANH VÙNG & GHI CHÚ — v5
 * ============================================================================
 *
 * Sếp chốt cách làm 05/10:
 *   *"tao sẽ dùng chuột khoanh vùng cần sửa và note trực tiếp vào đó rồi ấn
 *   DONE để Claude sửa"*
 * Sếp chê bản v4 ngày 07/10:
 *   *"để tao dùng chuột kẻ ô khoanh vùng hoặc chọn đối tượng, cứ cái tool của
 *   mày nó cứ dính các vùng vào nhau"*
 *
 * Vì sao v4 dính vùng (đừng lặp lại):
 *   - khung đã khoanh đặt `position:fixed` -> cuộn trang thì khung ĐỨNG YÊN trên
 *     màn hình, trôi khỏi chỗ đã khoanh và chồng lên vùng khoanh ở đoạn khác
 *   - toạ độ gửi đi cộng `scrollY` lúc bấm DONE chứ không phải lúc khoanh -> sai
 *   - nhãn ghi chú thò xuống dưới khung, đè lên vùng kế bên
 *   - ô ghi chú mở bao nhiêu cũng được, chồng lên nhau
 * v5: mọi khung nằm theo toạ độ TRANG (cuộn là đi theo), mỗi lúc chỉ một ô ghi
 * chú, nhãn gọn một dòng phía trên khung.
 *
 * Hai cách đánh dấu, dùng lẫn được:
 *   - KÉO chuột  -> kẻ một ô tự do
 *   - BẤM một cái -> chọn đúng đối tượng đang sáng viền xanh dưới con trỏ
 *                    (phím ↑ lấy cái lớn hơn kế tiếp, ↓ nhỏ lại)
 * Rồi gõ ghi chú, Enter. Bấm DONE -> ghi `_w-agent/chinh-tay.json` cho Claude.
 *
 * Mỗi vùng lưu kèm DANH SÁCH PHẦN TỬ bên trong (thẻ, class, chữ): toạ độ suông
 * thì Claude không biết sửa tệp nào; có class và chữ thì tìm ra ngay.
 *
 * Không kéo thả, không co giãn, không đổi gì trên trang (Sếp: "thủ công quá").
 * Chỉ nhúng ở máy dev (xem layout). Không đụng vào mã nguồn trang.
 */
(() => {
  if (window.__chinhTay) return;
  window.__chinhTay = true;

  const ID = "chinh-tay-ui";
  const laUI = (el) => !!(el && el.closest && el.closest(`#${ID}`));

  let bat = false;
  /** Các vùng đã chốt: {x, y, w, h (toạ độ TRANG), ghiChu, kieu, el?, doiTuong?, benTrong, hop} */
  const vungs = [];
  /** Ô ghi chú đang mở (mỗi lúc chỉ một). */
  let oGhiChu = null;

  /* ======================= Giao diện ======================= */
  const ui = document.createElement("div");
  ui.id = ID;
  ui.innerHTML = `
    <style>
      #${ID}{position:fixed;inset:auto 16px 16px auto;z-index:2147483600;
        font:13px/1.45 system-ui,sans-serif;color:#f3e9d2}
      @media(max-width:767px){#${ID}{inset:auto auto calc(80px + env(safe-area-inset-bottom)) 16px}}
      #${ID} *{box-sizing:border-box}
      #${ID} .nut{background:#12100d;border:1px solid rgba(216,178,106,.55);color:#f0d49a;
        border-radius:7px;padding:10px 14px;cursor:pointer;font-weight:700;letter-spacing:.06em}
      #${ID} .nut:hover{border-color:#f0d49a}
      #${ID} .nut.on{background:#b3121a;border-color:#b3121a;color:#fff}
      #${ID} .xong{background:#1f7a3d;border-color:#1f7a3d;color:#fff;width:100%;margin-top:8px}
      #${ID} .bang{margin-top:9px;width:270px;background:rgba(9,8,6,.97);
        border:1px solid rgba(216,178,106,.45);border-radius:9px;padding:11px;display:none}
      #${ID} .bang.hien{display:block}
      #${ID} .ds{max-height:190px;overflow:auto;font-size:11.5px;line-height:1.5}
      #${ID} .ds div{padding:5px 0;border-bottom:1px solid rgba(216,178,106,.14);
        display:flex;gap:6px;align-items:flex-start;cursor:pointer}
      #${ID} .ds b{color:#f0d49a;flex:0 0 auto}
      #${ID} .ds span{flex:1;color:#bbae9c;word-break:break-word}
      #${ID} .ds button{background:none;border:0;color:#b3121a;cursor:pointer;font-size:14px;padding:0 2px}
      #${ID} .doc{font-size:10.5px;color:#8e8778;margin-top:8px;line-height:1.5}
    </style>
    <button class="nut" id="ct-bat">KHOANH VÙNG</button>
    <div class="bang" id="ct-bang">
      <div class="ds" id="ct-ds"></div>
      <button class="nut xong" id="ct-xong">DONE — LƯU GHI CHÚ</button>
      <div class="doc"><b>Kéo</b> chuột = kẻ ô · <b>Bấm</b> = chọn đối tượng viền xanh<br>
        ↑ lấy cái lớn hơn · ↓ nhỏ lại · Enter lưu ghi chú · Esc huỷ</div>
    </div>`;
  document.body.appendChild(ui);
  const $ = (id) => document.getElementById(id);

  /**
   * Lớp chứa mọi khung — đặt theo toạ độ TRANG (absolute từ góc trên-trái tài
   * liệu), nên cuộn trang là khung đi theo nội dung. Kích thước 0×0 để không
   * làm trang dài thêm và không chặn chuột.
   */
  const lop = document.createElement("div");
  lop.id = ID + "-lop";
  Object.assign(lop.style, {
    position: "absolute", left: "0", top: "0", width: "0", height: "0",
    pointerEvents: "none", zIndex: "2147483400", display: "none",
  });
  document.documentElement.appendChild(lop);

  const taoKhung = (css) => {
    const k = document.createElement("div");
    Object.assign(k.style, { position: "absolute", display: "none", pointerEvents: "none", boxSizing: "border-box" }, css);
    lop.appendChild(k);
    return k;
  };
  /** Khung đang kéo. */
  const dangVe = taoKhung({ border: "2px dashed #f0d49a", background: "rgba(240,212,154,.12)" });
  /** Viền xanh quanh đối tượng dưới con trỏ. */
  const soi = taoKhung({ border: "2px solid #2f9bff", background: "rgba(47,155,255,.10)" });
  const soiTen = document.createElement("div");
  Object.assign(soiTen.style, {
    position: "absolute", left: "-2px", bottom: "100%", background: "#2f9bff", color: "#fff",
    font: "700 11px system-ui", padding: "1px 6px", whiteSpace: "nowrap",
  });
  soi.appendChild(soiTen);

  const dat = (k, v) => Object.assign(k.style, {
    display: "block", left: v.x + "px", top: v.y + "px", width: v.w + "px", height: v.h + "px",
  });
  /** Hộp của một phần tử theo toạ độ TRANG. */
  const hopTrang = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  };
  const tenThe = (el) => el.tagName.toLowerCase() +
    (el.id ? "#" + el.id : "") +
    (String(el.className?.baseVal ?? el.className ?? "").trim()
      ? "." + String(el.className?.baseVal ?? el.className).trim().split(/\s+/).slice(0, 2).join(".") : "");
  const moTa = (el, r = el.getBoundingClientRect()) => ({
    the: el.tagName.toLowerCase(),
    lop: String(el.className?.baseVal ?? el.className ?? "").slice(0, 120),
    chu: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70),
    anh: el.tagName === "IMG" ? (el.currentSrc || el.src || "").split("/").slice(-1)[0] : undefined,
    o: `${Math.round(r.left + scrollX)},${Math.round(r.top + scrollY)} ${Math.round(r.width)}×${Math.round(r.height)}`,
  });

  /* ======================= Phần tử nằm trong vùng ======================= */
  /**
   * Liệt kê những gì nằm TRỌN trong vùng `v` (toạ độ trang) — thứ giúp Claude
   * tìm ra mã nguồn. Bỏ thẻ bọc chỉ để gom nhóm: giữ ảnh, nút, link, và thẻ có
   * chữ riêng.
   */
  function trongVung(v) {
    const ra = [];
    for (const el of document.querySelectorAll("main *, aside *, header *, footer *")) {
      if (laUI(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;
      const x = r.left + scrollX, y = r.top + scrollY;
      const trumTron = x >= v.x - 2 && y >= v.y - 2 &&
                       x + r.width <= v.x + v.w + 2 && y + r.height <= v.y + v.h + 2;
      if (!trumTron) continue;
      const t = el.tagName;
      const chuRieng = el.childElementCount === 0 && (el.textContent || "").trim();
      if (!(t === "IMG" || t === "BUTTON" || t === "A" || t === "VIDEO" || chuRieng)) continue;
      ra.push(moTa(el, r));
      if (ra.length >= 25) break;
    }
    return ra;
  }

  /**
   * Ảnh/video mà ô CHẠM vào nhưng không nằm trọn trong ô (ảnh to hơn ô). Không
   * có danh sách này thì kẻ ô lên một ảnh lớn là Claude nhận về "0 phần tử".
   * Chỉ tính ảnh có điểm ảnh đặc ở tâm ô hoặc phủ ít nhất nửa ô.
   */
  function anhCham(v) {
    const ra = [];
    const cx = v.x + v.w / 2 - scrollX, cy = v.y + v.h / 2 - scrollY;
    for (const el of document.querySelectorAll("img, video, canvas")) {
      if (cuaToi(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) continue;
      const x = r.left + scrollX, y = r.top + scrollY;
      const gw = Math.min(x + r.width, v.x + v.w) - Math.max(x, v.x), gh = Math.min(y + r.height, v.y + v.h) - Math.max(y, v.y);
      if (gw <= 0 || gh <= 0) continue;
      if (x >= v.x - 2 && y >= v.y - 2 && x + r.width <= v.x + v.w + 2 && y + r.height <= v.y + v.h + 2) continue; // đã có trong benTrong
      const trungTam = el.tagName === "IMG" ? anhDac(el, r, cx, cy) : cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      if (!trungTam && gw * gh < v.w * v.h * 0.5) continue;
      ra.push({ ...moTa(el, r), phuO: Math.round((gw * gh) / (v.w * v.h) * 100) + "%", dacTaiTamO: trungTam });
    }
    return ra.sort((a, b) => (b.dacTaiTamO - a.dacTaiTamO)).slice(0, 8);
  }

  /* ======================= Vẽ một vùng đã chốt ======================= */
  function themVung(v, ghiChu) {
    const hop = taoKhung({
      border: "2px solid #b3121a", borderRadius: "3px", background: "rgba(179,18,26,.08)",
    });
    // Nhãn MỘT dòng nằm phía trên khung: không thò xuống đè vùng kế bên.
    const nhan = document.createElement("div");
    Object.assign(nhan.style, {
      position: "absolute", left: "-2px", bottom: "100%", maxWidth: "260px",
      background: "#b3121a", color: "#fff", font: "700 11px/16px system-ui", padding: "0 6px",
      borderRadius: "3px 3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    });
    hop.appendChild(nhan);
    const vung = { ...v, ghiChu, benTrong: trongVung(v), anhChamVao: v.kieu === "o" ? anhCham(v) : undefined, hop, nhan };
    vungs.push(vung);
    dat(hop, v);
    veDS();
  }

  function veDS() {
    vungs.forEach((v, i) => { v.nhan.textContent = `${i + 1} · ${v.ghiChu}`; });
    const d = $("ct-ds");
    d.innerHTML = "";
    if (!vungs.length) { d.innerHTML = '<div style="color:#8e8778;cursor:default">Chưa khoanh vùng nào.</div>'; return; }
    vungs.forEach((v, i) => {
      const h = document.createElement("div");
      h.title = "bấm để cuộn tới vùng này";
      const b = document.createElement("b"); b.textContent = i + 1 + ".";
      const s = document.createElement("span");
      s.textContent = `${v.ghiChu}  (${v.kieu === "doi-tuong" ? v.doiTuong.ten : "ô tự do"})`;
      const x = document.createElement("button"); x.textContent = "✕"; x.title = "xoá vùng này";
      x.onclick = (e) => {
        e.stopPropagation();
        v.hop.remove();
        vungs.splice(vungs.indexOf(v), 1);
        veDS();
      };
      h.onclick = () => {
        scrollTo({ top: Math.max(0, v.y - innerHeight / 3), behavior: "smooth" });
        v.hop.style.background = "rgba(179,18,26,.35)";
        setTimeout(() => (v.hop.style.background = "rgba(179,18,26,.08)"), 900);
      };
      h.append(b, s, x);
      d.appendChild(h);
    });
  }

  /** Vùng chọn theo đối tượng thì đo lại theo chính phần tử đó (trang đổi khổ, ảnh tải xong, thanh dính). */
  let choDo = 0;
  function doLai() {
    cancelAnimationFrame(choDo);
    choDo = requestAnimationFrame(() => {
      for (const v of vungs) {
        if (v.kieu !== "doi-tuong" || !v.el.isConnected) continue;
        Object.assign(v, hopTrang(v.el));
        dat(v.hop, v);
      }
    });
  }
  addEventListener("resize", doLai);
  addEventListener("scroll", doLai, { passive: true });

  /* ======================= Ô ghi chú (mỗi lúc chỉ một) ======================= */
  function dongGhiChu(luu) {
    if (!oGhiChu) return;
    const { o, v, khung } = oGhiChu;
    const t = o.querySelector("textarea").value.trim();
    oGhiChu = null;
    o.remove();
    khung.remove();
    if (luu && t) themVung(v, t);
  }

  function hoiGhiChu(v) {
    dongGhiChu(true); // còn ô cũ đang mở: có chữ thì lưu, trống thì bỏ
    const khung = taoKhung({ border: "2px dashed #f0d49a", background: "rgba(240,212,154,.12)" });
    dat(khung, v);
    const o = document.createElement("div");
    const RONG = 320, CAO = 150;
    // đặt dưới vùng; hết chỗ thì đặt trên; vùng cao hơn màn hình thì đặt trong vùng
    const duoi = v.y + v.h + 6, tren = v.y - CAO - 6;
    const y = duoi + CAO <= scrollY + innerHeight ? duoi : tren >= scrollY ? tren : scrollY + innerHeight - CAO - 12;
    const x = Math.max(scrollX + 8, Math.min(v.x, scrollX + innerWidth - RONG - 8));
    Object.assign(o.style, {
      position: "absolute", left: x + "px", top: y + "px", pointerEvents: "auto",
      background: "rgba(9,8,6,.98)", border: "1px solid #f0d49a", borderRadius: "7px",
      padding: "8px", width: RONG + "px", boxShadow: "0 8px 28px rgba(0,0,0,.6)", boxSizing: "border-box",
    });
    o.innerHTML = `
      <div style="font:11px system-ui;color:#bbae9c;margin-bottom:5px">
        ${v.kieu === "doi-tuong" ? "Đối tượng <b style='color:#7cc0ff'></b> — cần sửa gì?" : "Cần sửa gì ở ô này?"}</div>
      <textarea rows="3" style="width:100%;box-sizing:border-box;background:#12100d;border:1px solid rgba(216,178,106,.35);
        color:#f3e9d2;border-radius:5px;padding:6px;font:13px system-ui;resize:vertical"
        placeholder="vd: chữ này to quá, cho nhỏ lại và lùi sang trái"></textarea>
      <div style="display:flex;gap:6px;margin-top:6px">
        <button data-huy style="flex:1;background:#12100d;border:1px solid rgba(216,178,106,.4);
          color:#bbae9c;border-radius:5px;padding:6px;cursor:pointer;font:12px system-ui">Huỷ</button>
        <button data-ok style="flex:2;background:#b3121a;border:0;color:#fff;border-radius:5px;
          padding:6px;cursor:pointer;font:700 12px system-ui">LƯU GHI CHÚ</button>
      </div>`;
    if (v.kieu === "doi-tuong") o.querySelector("b").textContent = v.doiTuong.ten;
    o.id = ID + "-ghi-chu";
    lop.appendChild(o);
    oGhiChu = { o, v, khung };
    const ta = o.querySelector("textarea");
    ta.focus({ preventScroll: true });
    o.querySelector("[data-huy]").onclick = () => dongGhiChu(false);
    o.querySelector("[data-ok]").onclick = () => { if (ta.value.trim()) dongGhiChu(true); else ta.focus(); };
    ta.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); o.querySelector("[data-ok]").click(); }
      if (e.key === "Escape") dongGhiChu(false);
    });
  }
  /** Thuộc về công cụ (bảng điều khiển hoặc ô ghi chú) -> không coi là thao tác trên trang. */
  const cuaToi = (el) => laUI(el) || !!(el && el.closest && el.closest(`#${ID}-lop`));

  /* ======================= Soi đối tượng dưới con trỏ ======================= */
  /**
   * KHÔNG dùng `elementFromPoint`: nó bỏ qua mọi thứ `pointer-events:none` và
   * chỉ trả lớp nằm trên cùng. Ở banner trang chủ, bệ trưng bày + ba đĩa thức ăn
   * đều `pointer-events:none` và nằm dưới một lớp bọc z-30 phủ kín hero -> bấm
   * vào cái bàn thì trúng nguyên cả hero (Sếp 07/10: "đéo khoanh được cái bàn
   * để thức ăn PNG ở home banner").
   * Nên tự đo: lấy MỌI phần tử có hộp chứa con trỏ, giữ thứ là "đồ thật" (ảnh có
   * điểm ảnh ĐẶC ngay tại con trỏ, chữ, nút, link), xếp từ nhỏ tới lớn. Nhỏ nhất
   * = thứ Sếp đang chỉ. Phím ↑ nhảy sang cái lớn hơn kế tiếp, ↓ quay lại.
   */
  const vai = document.createElement("canvas");
  vai.width = vai.height = 1;
  const but = vai.getContext("2d", { willReadFrequently: true });
  /** Ảnh có điểm ảnh đặc tại (x,y) màn hình không? PNG/WebP nền trong: chỗ trong suốt coi như không trúng. */
  function anhDac(img, r, x, y) {
    if (!img.naturalWidth) return true;
    const fit = getComputedStyle(img).objectFit;
    let tx = r.width / img.naturalWidth, ty = r.height / img.naturalHeight;
    if (fit === "cover") tx = ty = Math.max(tx, ty);
    else if (fit === "contain" || fit === "scale-down") tx = ty = Math.min(tx, ty);
    else if (fit === "none") tx = ty = 1;
    const px = (x - r.left - (r.width - img.naturalWidth * tx) / 2) / tx;
    const py = (y - r.top - (r.height - img.naturalHeight * ty) / 2) / ty;
    if (px < 0 || py < 0 || px >= img.naturalWidth || py >= img.naturalHeight) return false;
    try {
      but.clearRect(0, 0, 1, 1);
      but.drawImage(img, px, py, 1, 1, 0, 0, 1, 1);
      return but.getImageData(0, 0, 1, 1).data[3] > 24;
    } catch { return true; } // ảnh khác nguồn, không đọc được điểm ảnh -> coi như đặc
  }
  const DO_THAT = new Set(["IMG", "VIDEO", "CANVAS", "SVG", "BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"]);
  function duoiConTro(x, y) {
    const ra = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (cuaToi(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6 || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const t = el.tagName.toUpperCase();
      let doThat = DO_THAT.has(t);
      if (t === "IMG") doThat = anhDac(el, r, x, y);
      else if (!doThat && !el.closest("svg")) {
        // thẻ có chữ riêng, và con trỏ nằm trên đúng dòng chữ đó
        for (const n of el.childNodes) {
          if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const d of rg.getClientRects()) if (x >= d.left && x <= d.right && y >= d.top && y <= d.bottom) doThat = true;
        }
      }
      if (t !== "SVG" && el.closest("svg")) doThat = false; // ruột của icon: lấy cả icon
      ra.push({ el, dt: r.width * r.height, doThat });
    }
    // đồ thật trước (nhỏ -> lớn), rồi tới các thẻ bọc (nhỏ -> lớn) để ↑ nới ra được
    return ra.sort((a, b) => (b.doThat - a.doThat) || (a.dt - b.dt)).map((u) => u.el);
  }

  let chong = [];   // các phần tử dưới con trỏ, [0] = thứ đang chỉ
  let goc = null;   // = chong[0]
  let nacLen = 0;   // đã bấm ↑ mấy nấc
  const dangSoi = () => chong[Math.min(nacLen, chong.length - 1)] || null;
  function veSoi() {
    const el = bat && !keo?.daKeo ? dangSoi() : null;
    if (!el || !el.isConnected) { soi.style.display = "none"; return; }
    const v = hopTrang(el);
    dat(soi, v);
    soiTen.textContent = `${tenThe(el)}  ${Math.round(v.w)}×${Math.round(v.h)}`;
    // nhãn sát mép trên màn hình thì lật vào trong khung
    Object.assign(soiTen.style, v.y - scrollY < 18 ? { bottom: "auto", top: "0" } : { bottom: "100%", top: "auto" });
  }
  function soiTai(x, y) {
    chong = duoiConTro(x, y);
    const moi = chong[0] || null;
    if (moi !== goc) { goc = moi; nacLen = 0; }
    veSoi();
  }

  /* ======================= Bật / tắt ======================= */
  function datBat(v) {
    bat = v;
    $("ct-bat").classList.toggle("on", v);
    $("ct-bat").textContent = v ? "ĐANG KHOANH — bấm để tắt" : "KHOANH VÙNG";
    $("ct-bang").classList.toggle("hien", v);
    lop.style.display = v ? "block" : "none";
    document.documentElement.style.cursor = v ? "crosshair" : "";
    if (v) { veDS(); doLai(); } else { dongGhiChu(true); goc = null; chong = []; veSoi(); }
  }
  $("ct-bat").onclick = () => datBat(!bat);
  addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") { e.preventDefault(); datBat(!bat); }
  });

  /* ======================= Kéo = kẻ ô · Bấm = chọn đối tượng ======================= */
  /** {x0,y0: toạ độ trang lúc nhấn, daKeo} */
  let keo = null;
  const oKeo = (e) => {
    const x = e.clientX + scrollX, y = e.clientY + scrollY;
    return { x: Math.min(keo.x0, x), y: Math.min(keo.y0, y), w: Math.abs(x - keo.x0), h: Math.abs(y - keo.y0) };
  };

  addEventListener("pointerdown", (e) => {
    if (!bat || cuaToi(e.target) || e.button !== 0) return;
    e.preventDefault(); e.stopImmediatePropagation();
    soiTai(e.clientX, e.clientY);
    keo = { x0: e.clientX + scrollX, y0: e.clientY + scrollY, daKeo: false };
  }, true);

  addEventListener("pointermove", (e) => {
    if (!bat) return;
    if (!keo) { if (!cuaToi(e.target)) soiTai(e.clientX, e.clientY); else { goc = null; chong = []; veSoi(); } return; }
    const v = oKeo(e);
    if (!keo.daKeo && v.w < 6 && v.h < 6) return; // tay rung khi bấm, chưa phải kéo
    keo.daKeo = true;
    soi.style.display = "none";
    dat(dangVe, v);
  }, true);

  addEventListener("pointerup", (e) => {
    if (!keo) return;
    const v = oKeo(e), daKeo = keo.daKeo;
    keo = null;
    dangVe.style.display = "none";
    if (daKeo) {
      if (v.w >= 12 && v.h >= 12) hoiGhiChu({ ...v, kieu: "o" });
      return;
    }
    const el = dangSoi();
    if (!el) return;
    soi.style.display = "none";
    hoiGhiChu({ ...hopTrang(el), kieu: "doi-tuong", el, doiTuong: { ten: tenThe(el), ...moTa(el) } });
  }, true);

  // Khi đang bật: chặn mọi cú bấm của TRANG, không thì bấm trúng link là nhảy trang.
  for (const ev of ["click", "auxclick", "dblclick", "mousedown", "mouseup"]) {
    addEventListener(ev, (e) => {
      if (!bat || cuaToi(e.target)) return;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
  }

  addEventListener("keydown", (e) => {
    if (!bat || oGhiChu) return;
    if (e.key === "Escape" && keo) { keo = null; dangVe.style.display = "none"; }
    if (e.key === "ArrowUp" && goc) { e.preventDefault(); nacLen = Math.min(nacLen + 1, chong.length - 1); veSoi(); }
    if (e.key === "ArrowDown" && goc) { e.preventDefault(); nacLen = Math.max(0, nacLen - 1); veSoi(); }
  }, true);

  /* ======================= DONE ======================= */
  $("ct-xong").onclick = async () => {
    dongGhiChu(true);
    if (!vungs.length) { alert("Chưa khoanh vùng nào."); return; }
    const goi = {
      loai: "khoanh-vung",
      trang: location.pathname,
      khoMan: innerWidth + "x" + innerHeight,
      luc: new Date().toISOString(),
      vung: vungs.map((v, i) => ({
        so: i + 1,
        ghiChu: v.ghiChu,
        kieu: v.kieu === "doi-tuong" ? "đối tượng" : "ô tự do",
        doiTuong: v.doiTuong,
        // toạ độ TRANG (tính từ đầu trang, không phụ thuộc đang cuộn tới đâu)
        o: { trai: Math.round(v.x), tren: Math.round(v.y), rong: Math.round(v.w), cao: Math.round(v.h) },
        benTrong: v.benTrong,
        anhChamVao: v.anhChamVao,
      })),
    };
    try {
      const r = await fetch("/api/chinh-tay", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(goi),
      });
      if (!r.ok) throw new Error(await r.text());
      $("ct-xong").textContent = `ĐÃ GỬI ${vungs.length} VÙNG`;
      setTimeout(() => ($("ct-xong").textContent = "DONE — GỬI CHO CLAUDE"), 2600);
    } catch (err) {
      await navigator.clipboard.writeText(JSON.stringify(goi, null, 1)).catch(() => {});
      alert("Không ghi được tệp (" + err.message + "). Đã chép vào clipboard, Sếp dán cho Claude.");
    }
  };

  console.log("[khoanh vùng] Ctrl+Shift+E để bật · kéo = kẻ ô · bấm = chọn đối tượng · ghi chú · DONE");
})();
