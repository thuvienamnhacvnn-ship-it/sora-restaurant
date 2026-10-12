"use client";

/*
 * HIỆU ỨNG CHUYỂN TRANG — cánh hoa đào đỏ toả ra từ đúng chỗ bấm chuột.
 *
 * Sếp 11/10: "chuột click ở đâu mà có chuyển trang thì tại chỗ click đó sẽ
 * toả ra hoa … Hoa đào đỏ các cánh bay từ giữa trung tâm của chuột dày đặc
 * rồi lan toả mỏng dần". Cơ chế lấy từ `PetalTransition.tsx` của HPHUONG Spa:
 * một canvas phủ màn, một vòng rAF chỉ chạy trong lúc chuyển trang, link vẫn
 * để next/link xử lý — trang đổi NGAY, cánh hoa chỉ bay kèm.
 *
 * Sếp 12/10 bảo thêm đủ như HPHUONG: *"thêm lớp phủ tối màu, mờ nhạt dần và
 * đường line như dự án HPhuong"*. Nên có lớp màn TỐI hiện nhanh rồi tan dần
 * (`MAN`, không bao giờ che kín trang) và nét vẽ bông hoa màu vàng mở ra từ
 * chỗ bấm (`NET`). Bản đầu 11/10 cố ý bỏ hai thứ này vì luật cấm phủ lớp —
 * lệnh 12/10 là ngoại lệ Sếp cho riêng hiệu ứng chuyển trang.
 *
 * Khác bản HPHUONG, có chủ ý:
 *   - Cánh KHÔNG rải đều khắp màn. Phần lớn dừng gần chỗ bấm, càng ra xa càng
 *     thưa (`TAP_TRUNG`), và cánh được nhả dần trong `NHA` ms nên tâm vẫn dày
 *     trong lúc lớp ngoài đã loãng.
 *
 * Cánh cắt từ `public/decor/sakura-petals-do.webp` — cùng tấm sprite đỏ mà
 * `Decor.tsx` dùng cho cánh rơi trên banner, nên màu khớp hoa đào của quán.
 * Người bật "giảm chuyển động", bấm kèm Ctrl/Shift, link ngoài, link cùng
 * trang (bộ lọc thực đơn) đều không kích hoạt.
 */
import { useEffect, useRef } from "react";

const THOI_LUONG = 2600; // ms, cả lượt
const NHA = 1000; // ms, khoảng thời gian tâm còn nhả cánh
const MO_TU = 1500; // ms, cánh bắt đầu mờ dần
const TAP_TRUNG = 2.2; // số mũ càng lớn cánh càng dồn về tâm
const MAN = 0.5; // độ đậm lớn nhất của lớp màn tối — Sếp chốt 50% (12/10)
const MAN_GIU = 900; // ms, màn giữ nguyên 50% tới lúc này rồi mới tan
const MAN_MAU = "#0a0605";
const MAN_TAN = 2000; // ms, lúc màn tan hết
const NET = [7, 8, 9]; // số cánh mỗi vòng của bông hoa nét vẽ
const NET_MAU = "#e6c38a";
const NET_LAU = 1500; // ms, một vòng nét mở từ tâm ra tới mép
const DIEM_ANH_TOI_DA = 3.2e6; // trần bộ đệm canvas, giữ màn 4K mượt
const TAM = "/decor/sakura-petals-do.webp";

/* Toạ độ từng cánh trong sprite 900×900 — chép từ `PETAL_SPRITE` (Decor.tsx). */
const CANH = [
  { x: 473, y: 335, w: 150, h: 114 },
  { x: 660, y: 425, w: 127, h: 90 },
  { x: 317, y: 400, w: 137, h: 80 },
  { x: 567, y: 507, w: 91, h: 70 },
  { x: 517, y: 184, w: 80, h: 90 },
  { x: 204, y: 705, w: 111, h: 84 },
  { x: 42, y: 377, w: 89, h: 117 },
  { x: 433, y: 474, w: 68, h: 56 },
] as const;

const kep01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const raBac3 = (t: number) => 1 - Math.pow(1 - t, 3);

/** Đường viền một bông hoa: hai vòng cánh nhọn quanh tâm (chép từ HPHUONG). */
function netHoa(ctx: CanvasRenderingContext2D, ox: number, oy: number, dai: number, n: number, quay: number) {
  ctx.beginPath();
  for (let vong = 0; vong < 2; vong++) {
    const l = dai * (vong ? 0.82 : 1);
    const c = l * Math.tan(Math.PI / n) * 1.7;
    for (let i = 0; i < n; i++) {
      const a = quay + ((i + vong * 0.5) / n) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const tai = (x: number, y: number): [number, number] => [ox + x * cos - y * sin, oy + x * sin + y * cos];
      ctx.moveTo(ox, oy);
      ctx.bezierCurveTo(...tai(l * 0.18, -c), ...tai(l * 0.72, -c * 0.82), ...tai(l, 0));
      ctx.bezierCurveTo(...tai(l * 0.72, c * 0.82), ...tai(l * 0.18, c), ox, oy);
    }
  }
}

type Canh = {
  hinh: number;
  goc: number; // hướng bay từ tâm
  xa: number; // quãng đường tới chỗ dừng
  tre: number; // ms, lúc rời tâm
  bay: number; // ms, thời gian bay
  rong: number; // px
  sau: number; // 0 xa … 1 gần
  xoay: number;
  xoayTocDo: number; // rad/s
  lat: number;
  latTocDo: number; // rad/s, cánh lật
  dao: number; // px, lắc ngang
  daoTocDo: number;
  roi: number; // px/s
};

let tam: HTMLImageElement | null = null;
function napTam() {
  if (tam) return tam;
  tam = new Image();
  tam.decoding = "async";
  tam.src = TAM;
  return tam;
}

function laChuyenTrang(a: HTMLAnchorElement, e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (!/^\/(de|vi)(\/|$)/.test(url.pathname)) return false;
  // Cùng trang: bộ lọc `?kategorie=`, neo `#…` — không phải chuyển trang.
  if (url.pathname === window.location.pathname) return false;
  return true;
}

export function ChuyenTrangHoaDao() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const giam = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    // Nạp sprite sau khi trang đã yên, để cú bấm đầu tiên có sẵn hình.
    const lamNong = window.setTimeout(napTam, 1200);

    const toa = (ox: number, oy: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      cancelAnimationFrame(raf);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const nho = W < 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(DIEM_ANH_TOI_DA / (W * H)));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.display = "block";

      // Góc màn xa chỗ bấm nhất: cánh xa nhất bay tới đó.
      const xaNhat = Math.max(
        Math.hypot(ox, oy),
        Math.hypot(W - ox, oy),
        Math.hypot(ox, H - oy),
        Math.hypot(W - ox, H - oy),
      );

      const hinh = napTam();
      const soCanh = nho ? 300 : 720;
      const ds: Canh[] = [];
      for (let i = 0; i < soCanh; i++) {
        const sau = Math.random();
        const u = Math.random();
        ds.push({
          hinh: i % CANH.length,
          goc: Math.random() * Math.PI * 2,
          xa: xaNhat * (0.02 + 0.98 * Math.pow(u, TAP_TRUNG)),
          tre: Math.random() * NHA,
          bay: 1300 + Math.random() * 700,
          rong: (nho ? 20 : 26) + sau * sau * (nho ? 44 : 78),
          sau,
          xoay: Math.random() * Math.PI * 2,
          xoayTocDo: (Math.random() - 0.5) * 2.4,
          lat: Math.random() * Math.PI * 2,
          latTocDo: 1.2 + Math.random() * 2.2,
          dao: 4 + Math.random() * 12,
          daoTocDo: 0.8 + Math.random() * 1.2,
          roi: 10 + Math.random() * 22,
        });
      }
      ds.sort((a, b) => a.sau - b.sau);
      const quayGoc = Math.random() * Math.PI * 2;

      let batDau = 0;
      const khung = (luc: number) => {
        if (!batDau) batDau = luc;
        const t = luc - batDau;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (t >= THOI_LUONG) {
          canvas.style.display = "none";
          return;
        }
        const rp = kep01((t - MO_TU) / (THOI_LUONG - MO_TU));
        const mo = 1 - Math.pow(rp, 1.6);

        // Màn tối: lên trong 1/4 giây đầu, giữ 50%, rồi tan dần.
        const man = MAN * Math.min(kep01(t / 240), 1 - kep01((t - MAN_GIU) / (MAN_TAN - MAN_GIU)));
        if (man > 0.005) {
          ctx.globalAlpha = man;
          ctx.fillStyle = MAN_MAU;
          ctx.fillRect(0, 0, W, H);
        }
        // Nét bông hoa mở từ chỗ bấm, mảnh dần khi ra tới mép.
        ctx.strokeStyle = NET_MAU;
        ctx.lineWidth = 1.2;
        NET.forEach((n, k) => {
          const p = kep01((t - k * 110) / NET_LAU);
          if (p <= 0 || p >= 1) return;
          const e = raBac3(p);
          netHoa(ctx, ox, oy, (xaNhat / 0.6) * e, n, quayGoc + (k % 2 ? -0.4 : 0.5) * e);
          ctx.globalAlpha = 0.55 * Math.min(kep01(p * 6), 1 - p);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

        for (const p of ds) {
          const lt = t - p.tre;
          if (lt <= 0) continue;
          const s = lt / 1000;
          const ra = p.xa * raBac3(kep01(lt / p.bay));
          const lac = Math.sin(s * p.daoTocDo + p.lat) * p.dao;
          const x = ox + Math.cos(p.goc) * ra - Math.sin(p.goc) * lac;
          const y = oy + Math.sin(p.goc) * ra + Math.cos(p.goc) * lac + p.roi * s * s;
          const w = p.rong * (0.45 + 0.55 * raBac3(kep01(lt / 380)));
          if (x < -w || x > W + w || y < -w || y > H + w) continue;
          let lat = Math.cos(p.lat + s * p.latTocDo);
          if (Math.abs(lat) < 0.25) lat = lat < 0 ? -0.25 : 0.25;
          const c = CANH[p.hinh];
          const h = (w * c.h) / c.w;
          ctx.save();
          // Càng xa tâm càng nhạt: lớp ngoài mỏng dần, tâm vẫn đậm.
          ctx.globalAlpha = kep01(lt / 90) * mo * (0.86 + 0.14 * p.sau) * (1 - 0.45 * (ra / xaNhat));
          ctx.translate(x, y);
          ctx.rotate(p.xoay + p.xoayTocDo * s);
          ctx.scale(1, lat);
          if (hinh.complete && hinh.naturalWidth) {
            ctx.drawImage(hinh, c.x, c.y, c.w, c.h, -w / 2, -h / 2, w, h);
          } else {
            // Sprite chưa về kịp (bấm ngay khi vừa mở trang): vẽ cánh trơn.
            ctx.fillStyle = "#b3202a";
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.bezierCurveTo(-w / 6, -w / 2.6, w / 3, -w / 3.2, w / 2, 0);
            ctx.bezierCurveTo(w / 3, w / 3.2, -w / 6, w / 2.6, -w / 2, 0);
            ctx.fill();
          }
          ctx.restore();
        }
        raf = requestAnimationFrame(khung);
      };
      raf = requestAnimationFrame(khung);
    };

    const khiBam = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || giam.matches || !laChuyenTrang(a, e)) return;
      // Bấm bằng bàn phím không có toạ độ chuột: toả từ giữa chính link đó.
      let x = e.clientX;
      let y = e.clientY;
      if (!e.detail || (x === 0 && y === 0)) {
        const r = a.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      toa(x, y);
    };

    document.addEventListener("click", khiBam, true);
    return () => {
      document.removeEventListener("click", khiBam, true);
      cancelAnimationFrame(raf);
      window.clearTimeout(lamNong);
      canvas.style.display = "none";
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-chuyen-trang
      className="pointer-events-none fixed inset-0 z-[2000] h-dvh w-screen"
      style={{ display: "none" }}
    />
  );
}
