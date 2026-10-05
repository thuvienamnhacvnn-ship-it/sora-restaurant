/*
 * Master Chef AI — route phía MÁY CHỦ.
 *
 * Khoá API không bao giờ ra tới trình duyệt: drawer gọi `POST /api/chef`,
 * route này mới gọi Gemini.
 *
 * CHƯA CÓ KHOÁ trên máy này thì route vẫn chạy: trả `{ nguon: "menu" }` và
 * để client tự lọc trên dữ liệu thật + câu dự phòng của KIT. Cắm khoá vào
 * `.env.local` là tự chuyển sang Gemini, không phải sửa dòng code nào.
 *
 * Luật KIT `04_AI_MASTER_CHEF/MASTER_CHEF_SYSTEM_PROMPT.md` được ép bằng
 * HAI lớp, không chỉ bằng lời dặn trong prompt:
 *  1. prompt chỉ đưa danh sách món CÓ THẬT (id + tên + giá + nhãn), và bắt
 *     model trả về `menuItemId`.
 *  2. route LỌC LẠI id model trả về; id nào không có trong dataset thì VỨT.
 *     Model có bịa tên món cũng không lọt ra giao diện được.
 *
 * Model: alias `-latest` để khỏi 404 khi Google gỡ phiên bản (bẫy đã gặp ở
 * openmus 15/09/2026).
 */
import { NextResponse } from "next/server";
import { menuItems, type MenuItem } from "@/data/menu";
import { isLocale, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";

const MODEL = process.env.GENAI_DEFAULT_MODEL || "gemini-flash-latest";
const KEY = process.env.GOOGLE_GENAI_API_KEY;

/** Câu dự phòng — nguyên văn KIT, không diễn đạt lại. */
const DU_PHONG: Record<Locale, string> = {
  de: "Ich kann dazu keine sichere Empfehlung aus den vorhandenen Menüdaten ableiten. Soll ich dich mit unserem Service verbinden?",
  vi: "Ich kann dazu keine sichere Empfehlung aus den vorhandenen Menüdaten ableiten. Soll ich dich mit unserem Service verbinden?",
};

type KetQua = {
  /** `gemini` = model trả lời · `menu` = chưa có khoá, client tự lọc. */
  nguon: "gemini" | "menu";
  cauTraLoi: string | null;
  monIds: string[];
  canHoiNhanVien: boolean;
};

/** Gửi cho model bản RÚT GỌN, không phải cả 163 KB dataset. */
function tomTatMon(item: MenuItem) {
  const gia = [
    typeof item.price === "number" ? item.price : null,
    ...(item.variants ?? []).map((v) => v.price),
    ...(item.sizes ?? []).map((s) => s.price),
  ].filter((n): n is number => typeof n === "number");
  return {
    id: item.id,
    nr: item.nr,
    ten: item.name.de,
    nhom: item.category,
    nhomCon: item.subcategory,
    giaTu: gia.length ? Math.min(...gia) : null,
    cay: item.spice !== "none",
    an: item.dietary,
    diUng: item.allergens,
    dam: item.proteins,
  };
}

export async function POST(req: Request) {
  let body: { cauHoi?: string; locale?: string; trang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ loi: "body không phải JSON" }, { status: 400 });
  }

  const cauHoi = (body.cauHoi ?? "").trim().slice(0, 500);
  const locale: Locale = isLocale(body.locale ?? "") ? (body.locale as Locale) : "de";

  if (!cauHoi) {
    return NextResponse.json({ loi: "thiếu cauHoi" }, { status: 400 });
  }

  // Chưa cắm khoá -> nói thẳng, để client dùng bộ lọc trên dữ liệu thật.
  if (!KEY) {
    return NextResponse.json<KetQua>({
      nguon: "menu",
      cauTraLoi: null,
      monIds: [],
      canHoiNhanVien: false,
    });
  }

  const dsMon = menuItems.filter((i) => i.available).map(tomTatMon);
  const huongDan = [
    "Bạn là Master Chef Assistant của nhà hàng SoRa (Nhật–Việt).",
    "CHỈ gợi ý món có trong danh sách dưới đây. Tuyệt đối không bịa món, nguyên liệu, giá, mã dị ứng hay cách chế biến.",
    "Tối đa 3 gợi ý.",
    "Nếu khách nhắc tới dị ứng nặng: phải nói rõ cần xác nhận với nhân viên vì có thể lẫn chéo, và KHÔNG hứa an toàn.",
    "Không đưa lời khuyên y tế.",
    "Nếu dữ liệu thực đơn không đủ để trả lời chắc chắn: nói thẳng là không suy ra được và đề nghị nối máy với bộ phận chăm sóc khách.",
    locale === "vi" ? "Trả lời bằng tiếng Việt." : "Antworte auf Deutsch.",
    "Giọng ấm, gọn, sang; không tán gẫu.",
    "",
    'Trả về DUY NHẤT một JSON: {"cauTraLoi": string, "monIds": string[], "canHoiNhanVien": boolean}',
    '"monIds" phải là trường `id` lấy nguyên văn từ danh sách.',
  ].join("\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: huongDan }] },
          contents: [
            {
              parts: [
                { text: `THỰC ĐƠN:\n${JSON.stringify(dsMon)}` },
                { text: `KHÁCH HỎI: ${cauHoi}` },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!res.ok) {
      // 404 = model bị gỡ · 429 = hết quota. Không làm sập giao diện.
      console.error("[chef] Gemini", res.status, await res.text().catch(() => ""));
      return NextResponse.json<KetQua>({
        nguon: "menu",
        cauTraLoi: DU_PHONG[locale],
        monIds: [],
        canHoiNhanVien: true,
      });
    }

    const data = await res.json();
    const tho = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(tho) as Partial<KetQua>;

    // Lọc lại: id nào không có thật thì vứt. Đây là chốt chặn cuối.
    const hopLe = (parsed.monIds ?? [])
      .filter((id) => menuItems.some((m) => m.id === id))
      .slice(0, 3);

    return NextResponse.json<KetQua>({
      nguon: "gemini",
      cauTraLoi: typeof parsed.cauTraLoi === "string" ? parsed.cauTraLoi : null,
      monIds: hopLe,
      canHoiNhanVien: Boolean(parsed.canHoiNhanVien),
    });
  } catch (e) {
    console.error("[chef]", e);
    return NextResponse.json<KetQua>({
      nguon: "menu",
      cauTraLoi: DU_PHONG[locale],
      monIds: [],
      canHoiNhanVien: true,
    });
  }
}
