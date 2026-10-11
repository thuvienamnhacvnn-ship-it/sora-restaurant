/*
 * API của công cụ "Chỉnh tay" (`public/chinh-tay.js`).
 *
 *   POST /api/chinh-tay            — ghi số đo + ghi chú ra `_w-agent/chinh-tay.json`
 *   GET  /api/chinh-tay?tim=hero   — tra KHO DỮ LIỆU WEB ở E:/Tools/ui-library
 *
 * CHỈ CHẠY Ở MÁY DEV. Bản thật trả 404, và `chinh-tay.js` cũng không được
 * nhúng (xem layout) — không có đường nào để người ngoài ghi tệp lên máy chủ.
 *
 * Ghi THÊM vào mảng chứ không đè: Sếp hay chỉnh vài lượt trên nhiều trang rồi
 * mới gọi Claude; đè là mất các lượt trước.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const GOC = process.cwd();
const TEP = path.join(GOC, "_w-agent", "chinh-tay.json");
/** Kho mẫu giao diện dùng chung cho mọi dự án web của Sếp. */
const KHO = "E:/Tools/ui-library";

const chiDev = () => process.env.NODE_ENV === "development";

export async function POST(req: Request) {
  if (!chiDev()) return new Response("not found", { status: 404 });

  const goi = await req.json().catch(() => null);
  if (!goi || typeof goi !== "object") {
    return new Response("goi khong hop le", { status: 400 });
  }

  let cu: unknown[] = [];
  try {
    const d = JSON.parse(await readFile(TEP, "utf8"));
    if (Array.isArray(d)) cu = d;
  } catch {
    cu = []; // lượt đầu, chưa có tệp
  }

  cu.push(goi);
  await mkdir(path.dirname(TEP), { recursive: true });
  await writeFile(TEP, JSON.stringify(cu, null, 1), "utf8");

  return Response.json({ ok: true, soLuot: cu.length, tep: "_w-agent/chinh-tay.json" });
}

/**
 * Tra kho mẫu. Trả về đường dẫn thư mục khớp từ khoá, KHÔNG đọc nội dung —
 * kho rất nặng, đọc nội dung ở đây là treo máy. Claude tự mở tệp sau.
 */
export async function GET(req: Request) {
  if (!chiDev()) return new Response("not found", { status: 404 });

  const tim = (new URL(req.url).searchParams.get("tim") || "").toLowerCase().trim();
  if (!tim) return Response.json({ ket: [], ghiChu: "thiếu tham số ?tim=" });

  const ket: { duong: string; loai: string }[] = [];
  async function quet(thuMuc: string, sau: number) {
    if (sau > 3 || ket.length > 60) return;
    let muc;
    try {
      muc = await readdir(thuMuc, { withFileTypes: true });
    } catch {
      return; // ổ E: không gắn / không quyền — bỏ qua, không làm hỏng công cụ
    }
    for (const m of muc) {
      if (m.name.startsWith(".") || m.name === "node_modules") continue;
      const duong = path.join(thuMuc, m.name);
      if (m.name.toLowerCase().includes(tim)) {
        ket.push({ duong: duong.replace(/\\/g, "/"), loai: m.isDirectory() ? "thư mục" : "tệp" });
      }
      if (m.isDirectory()) await quet(duong, sau + 1);
    }
  }
  await quet(KHO, 0);

  return Response.json({ kho: KHO, tuKhoa: tim, soKetQua: ket.length, ket: ket.slice(0, 40) });
}
