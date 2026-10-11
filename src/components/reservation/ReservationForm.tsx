"use client";

/*
 * 03 RESERVIERUNG — luồng Date -> Time -> Guests -> Area -> Occasion -> Notes.
 * Desktop 60/40 (KIT thắng mockup 57/43 — spec §11-D).
 *
 * LÀM LẠI 07/10 (spec `_w-agent/lam-lai/01_spec.md` mục C). Nguồn kho:
 *  - ô chọn dạng thẻ radio (khu vực, dịp, giờ): `hyperui/…/application/
 *    radio-groups/2-dark.html` — `fieldset > legend` + thẻ có viền đổi khi chọn
 *    + dấu chọn riêng, không chỉ đổi màu;
 *  - bộ đếm số khách: flowbite `forms/number-input.md` mục "Counter input"
 *    (`− | số | +`), tự viết onClick thay cho JS của flowbite;
 *  - tab buổi của lưới giờ: `hyperui/…/application/tabs/4-dark.html`
 *    (`role=tablist` / `role=tab` / `role=tabpanel`).
 *
 * BA CHỖ CỐ Ý KHÁC MOCKUP:
 *  1. Sơ đồ bàn: mockup hiện bàn 1-21 trống/đã đặt theo thời gian thực.
 *     `liveTableInventory: false` và quán chưa gửi mặt bằng -> KHÔNG có thẻ
 *     TISCHPLAN. Bản cũ vẽ hai ô nét sơ sài thay mặt bằng; đã gỡ (chờ Sếp gửi
 *     sơ đồ thật). Chọn khu vực nằm ở bước 4, bằng ẢNH THẬT của từng khu.
 *  2. Khung giờ KHÔNG lấy từ mockup (mockup bịa 11:30-20:00). Sinh từ giờ mở
 *     cửa THẬT in trên thực đơn: 11:00-22:30, bước 30 phút, chốt sớm 30 phút
 *     trước giờ đóng -> 23 khung. Chia ba buổi, mỗi lần hiện một buổi: bản cũ
 *     đổ cả 23 ô thành 8 hàng.
 *  3. Chưa có nơi nhận đặt bàn online -> KHÔNG có nút "Reservierung anfragen"
 *     (nút sống bấm không gửi được là gài khách; nút khoá là lời hứa suông).
 *     Hành động chính là GỌI ĐIỆN, hai số thật, nằm ngay dưới bảng tóm tắt.
 *
 * Trạng thái không bao giờ chỉ phân biệt bằng màu — luôn kèm icon + chữ (a11y).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { restaurant, telHref, phoneLabel } from "@/data/restaurant";
import { getT, pick, type Locale } from "@/lib/i18n";
import { CornerSakura } from "@/components/decor/Decor";
import { RT } from "./text";

export type ReservationStrings = {
  title: string;
  steps: [string, string, string, string, string, string];
  guests: string;
  guest: string;
  notesPlaceholder: string;
  submit: string;
  tablePlan: string;
  openingHours: string;
  summary: string;
  labels: {
    date: string;
    time: string;
    guests: string;
    area: string;
    occasion: string;
    notes: string;
  };
  notChosen: string;
  prevMonth: string;
  nextMonth: string;
  weekdays: string[];
  months: string[];
  areas: { id: string; name: string; photo: string; alt: string }[];
  areasNote: string;
  occasions: { id: string; label: string; icon: "gift" | "heart" | "briefcase" | "star" }[];
  areaHintTitle: string;
  areaHint: string;
  noBackendTitle: string;
  noBackend: string;
  callUs: string;
};

const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

/** Sinh khung giờ từ giờ mở cửa thật. */
function timeSlots(open: string, close: string): string[] {
  const out: string[] = [];
  // chốt chỗ cuối sớm hơn giờ đóng 30 phút
  for (let t = toMin(open); t <= toMin(close) - 30; t += 30) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

/*
 * Ba buổi. Mốc 15:00 và 18:00 chỉ là cách CHIA NHÓM các khung giờ đã sinh từ
 * giờ mở cửa thật — không phải giờ nghỉ trưa hay ca bếp của quán (thực đơn in
 * không nói tới, đừng diễn giải thành thế).
 */
const BUOI = [
  { id: "mittag", tu: 0, den: 15 * 60 },
  { id: "nachmittag", tu: 15 * 60, den: 18 * 60 },
  { id: "abend", tu: 18 * 60, den: 24 * 60 },
] as const;
type BuoiId = (typeof BUOI)[number]["id"];

const SO_KHACH_TOI_DA = 12;

export function ReservationForm({
  locale,
  s,
}: {
  locale: Locale;
  s: ReservationStrings;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [area, setArea] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const hours = restaurant.openingHours.schema[0];
  const slots = useMemo(() => timeSlots(hours.open, hours.close), [hours]);
  const nhom = useMemo(
    () =>
      BUOI.map((b) => ({
        id: b.id,
        slots: slots.filter((x) => toMin(x) >= b.tu && toMin(x) < b.den),
      })).filter((b) => b.slots.length > 0),
    [slots]
  );
  const [buoi, setBuoi] = useState<BuoiId>(() => nhom[0]?.id ?? "mittag");
  const buoiDangXem = nhom.find((b) => b.id === buoi) ?? nhom[0];

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);

  const selectedArea = s.areas.find((a) => a.id === area);
  const t = getT(locale);

  /*
   * THANH GỌI DÍNH ĐÁY — chỉ điện thoại (spec làm lại mục C).
   * Hai nút gọi thật nằm cuối trang, dưới bảng tóm tắt; ở 390px đó là sau
   * ~2 500px cuộn. Thanh này đưa số di động lên tầm ngón tay suốt lúc điền.
   * Khi hai nút thật đã vào khung nhìn thì thanh TỰ ẨN — không để hai chỗ
   * gọi cùng hiện một lúc.
   */
  const nutGoiRef = useRef<HTMLUListElement>(null);
  const [nutGoiDangThay, setNutGoiDangThay] = useState(false);
  useEffect(() => {
    const el = nutGoiRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setNutGoiDangThay(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const soChinh = restaurant.phones[0];

  return (
    <div className="grid grid-cols-1 gap-4 xl:[grid-template-columns:minmax(0,60fr)_minmax(0,40fr)]">
      {/* ------------------------------ Cột trái: form ----------------------- */}
      {/* `@container`: hàng lịch | giờ chia cột theo bề ngang CỦA CHÍNH THẺ
          NÀY, không theo bề ngang màn — xem ghi chú ở lưới bên dưới. */}
      <form
        className="@container sora-card relative isolate overflow-hidden p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Cành đào DUY NHẤT của trang (spec A6), góc trên-phải thẻ form như
            mẫu. Tiêu đề nằm bên trái, hàng bước 1–3 bắt đầu dưới đáy cành. */}
        <CornerSakura corner="tr" width={174} offsetX={-1} offsetY={-1} opacity={1} className="-z-10 max-sm:hidden" />

        <h2 className="flex items-center gap-2 font-serif text-[24px] tracking-[.04em] text-gold-bright">
          <Icon name="calendar" size={22} />
          {s.title}
        </h2>

        {/*
         * LỊCH | (GIỜ + SỐ KHÁCH) — chia cột theo bề ngang HỘP TRONG của thẻ.
         *
         * Lịch rộng cố định 336px = 7 ô × 44 + 6 khe × 2 + `p-2` 16 (ô ngày
         * 44px — chuẩn vùng chạm; bản cũ 26px). Cột phải cần ≥ 200px cho lưới
         * giờ 4 cột × 44. Hai cột cần 336 + khe 20 + 200 = 556.
         *
         * ⚠ `@[…]` đo HỘP NỘI DUNG (đã trừ `p-5` hai bên): 1440 = 559 -> hai
         * cột · 1280 = 465, 1366 = 517 -> một cột (lịch trên, giờ dưới, lưới
         * giờ tự lên 6–8 cột) · 1024 = 730, 1920 = 859 -> hai cột · 390 = 318
         * -> một cột.
         */}
        <div className="mt-5 grid grid-cols-1 gap-5 @[556px]:[grid-template-columns:336px_minmax(0,1fr)]">
          {/* 1. Datum */}
          <fieldset className="min-w-0">
            <StepLegend>{s.steps[0]}</StepLegend>
            <Calendar
              month={month}
              setMonth={setMonth}
              today={today}
              value={date}
              onPick={setDate}
              s={s}
              locale={locale}
            />
          </fieldset>

          <div className="flex min-w-0 flex-col gap-5">
            {/* 2. Uhrzeit — tab buổi + lưới giờ của buổi đang xem */}
            <fieldset className="min-w-0">
              <StepLegend>{s.steps[1]}</StepLegend>
              <div
                role="tablist"
                aria-label={s.steps[1]}
                className="mt-3 flex gap-1 rounded-[var(--radius-btn)] border border-gold/45 p-1"
              >
                {nhom.map((b) => {
                  const on = b.id === buoiDangXem?.id;
                  const coGio = time !== null && b.slots.includes(time);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      role="tab"
                      id={`buoi-tab-${b.id}`}
                      aria-selected={on}
                      aria-controls="buoi-panel"
                      onClick={() => setBuoi(b.id)}
                      className={`inline-flex h-11 min-w-0 flex-auto items-center justify-center gap-1 rounded-[4px] px-1.5 text-[13px] whitespace-nowrap transition-colors ${
                        on
                          ? "bg-gold/20 font-semibold text-gold-bright"
                          : "text-muted hover:text-gold-bright"
                      }`}
                    >
                      {/* Buổi đang chứa giờ đã chọn: dấu tích, không chỉ màu */}
                      {coGio && <Icon name="check" size={12} className="shrink-0" />}
                      {pick(RT[`buoi_${b.id}`], locale)}
                    </button>
                  );
                })}
              </div>
              <div
                role="tabpanel"
                id="buoi-panel"
                aria-labelledby={`buoi-tab-${buoiDangXem?.id}`}
                data-luoi-gio=""
                className="mt-2 grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(44px,1fr))]"
              >
                {buoiDangXem?.slots.map((slot) => {
                  const on = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTime(slot)}
                      className={`h-11 rounded-[var(--radius-btn)] border text-[14px] tabular-nums transition-colors ${
                        on
                          ? "border-gold-bright bg-red font-semibold text-white"
                          : "border-gold/45 text-text hover:border-gold/80"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 3. Gäste — bộ đếm − | số | + */}
            <fieldset className="min-w-0">
              <StepLegend>{s.steps[2]}</StepLegend>
              <div className="mt-3 flex h-[46px] items-stretch overflow-hidden rounded-[var(--radius-btn)] border border-gold/45">
                <button
                  type="button"
                  aria-label={pick(RT.guestsLess, locale)}
                  disabled={guests <= 1}
                  onClick={() => setGuests((n) => Math.max(1, n - 1))}
                  className="grid w-11 shrink-0 place-items-center border-r border-gold/45 text-gold-bright transition-colors hover:bg-gold/10 disabled:text-muted/40 disabled:hover:bg-transparent"
                >
                  <Icon name="minus" size={18} />
                </button>
                <output
                  aria-live="polite"
                  data-so-khach={guests}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 text-[16px] text-text"
                >
                  <Icon name="users" size={17} className="shrink-0 text-gold" />
                  <span className="truncate">
                    {guests} {guests === 1 ? s.guest : s.guests}
                  </span>
                </output>
                <button
                  type="button"
                  aria-label={pick(RT.guestsMore, locale)}
                  disabled={guests >= SO_KHACH_TOI_DA}
                  onClick={() => setGuests((n) => Math.min(SO_KHACH_TOI_DA, n + 1))}
                  className="grid w-11 shrink-0 place-items-center border-l border-gold/45 text-gold-bright transition-colors hover:bg-gold/10 disabled:text-muted/40 disabled:hover:bg-transparent"
                >
                  <Icon name="plus" size={18} />
                </button>
              </div>
            </fieldset>
          </div>
        </div>

        {/* 4. Bereich — hai khu THẬT, mỗi khu một ảnh thật 16:9 chia đôi bề
            ngang form (bản cũ 130×70px). Không bịa thêm khu thứ ba, thứ tư. */}
        <fieldset className="mt-7">
          <StepLegend>{s.steps[3]}</StepLegend>
          <div className="mt-3 grid gap-3 [grid-template-columns:repeat(2,minmax(0,1fr))]">
            {s.areas.map((a) => {
              const on = area === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  data-khu-vuc={a.id}
                  onClick={() => setArea(on ? null : a.id)}
                  className={`group overflow-hidden rounded-[var(--radius-card)] border text-left transition-colors ${
                    on ? "border-gold-bright" : "border-gold/45 hover:border-gold/80"
                  }`}
                >
                  <span className="relative block aspect-[16/9] overflow-hidden">
                    <Image
                      src={a.photo}
                      alt={a.alt}
                      fill
                      sizes="(max-width: 767px) 50vw, (max-width: 1199px) 45vw, 30vw"
                      className="transition-transform duration-300 ease-[var(--ease-sora)] group-hover:scale-[1.02]"
                      style={{ objectFit: "cover", objectPosition: "center 55%" }}
                    />
                  </span>
                  {/* Dải tên là nền riêng DƯỚI ảnh — chữ không nằm trên ảnh. */}
                  <span className="flex min-h-11 items-center gap-2.5 bg-surface px-3 py-2">
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        on ? "border-gold-bright bg-gold/25 text-gold-bright" : "border-gold/60"
                      }`}
                    >
                      {on && <Icon name="check" size={12} />}
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] leading-tight text-text">
                      {a.name}
                    </span>
                    <span
                      className={`shrink-0 text-[12px] tracking-[.04em] text-gold-bright max-[479px]:hidden ${
                        on ? "" : "invisible"
                      }`}
                    >
                      {t("reservation.selected")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.areaHint}</p>
        </fieldset>

        {/* 5. Anlass + 6. Anmerkungen */}
        {/* Xếp DỌC, mỗi bước trọn bề ngang form: chia đôi thì cột chip chỉ
            269px, `Geschäftsessen` + `Sonstiges` không cùng hàng được (đo
            07/10: hàng 2 + 1 + 1). Trọn bề ngang: bốn chip một hàng từ hộp
            trong 556px; hẹp hơn thì lưới 2 × 2 đều nhau. */}
        <div className="mt-7 grid grid-cols-1 gap-6">
          <fieldset className="min-w-0">
            <StepLegend>{s.steps[4]}</StepLegend>
            <div className="mt-3 grid gap-2 [grid-template-columns:repeat(2,minmax(0,1fr))] @[556px]:flex @[556px]:flex-wrap">
              {s.occasions.map((o) => {
                const on = occasion === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setOccasion(on ? null : o.id)}
                    className={`inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] border px-2.5 text-[14px] whitespace-nowrap transition-colors @[556px]:px-3 ${
                      on
                        ? "border-gold-bright bg-gold/15 text-gold-bright"
                        : "border-gold/45 text-text hover:border-gold/80"
                    }`}
                  >
                    <Icon
                      name={on ? "check" : o.icon}
                      size={16}
                      className="shrink-0 text-gold"
                    />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <StepLegend>{s.steps[5]}</StepLegend>
            <label className="mt-3 block">
              <span className="sr-only">{s.labels.notes}</span>
              <textarea
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={s.notesPlaceholder}
                className="sora-field min-h-[96px]"
              />
            </label>
            <p className="mt-1 text-right text-[12px] text-muted">
              {notes.length}/500
            </p>
          </fieldset>
        </div>
      </form>

      {/* ---------------------- Cột phải: giờ mở + tóm tắt + gọi điện ---------- */}
      <div className="flex min-w-0 flex-col gap-4">
        <section className="sora-card p-5">
          <h2 className="flex items-center gap-2 font-serif text-[18px] tracking-[.04em] text-gold-bright">
            <Icon name="clock" size={18} />
            {s.openingHours}
          </h2>
          <p className="mt-2 text-[16px] text-text">
            {pick(restaurant.openingHours.text, locale)}
          </p>
        </section>

        {/* `sticky`: form bên trái dài hơn -> bảng tóm tắt + hai nút gọi đi
            theo tầm mắt khi khách cuộn form. */}
        <section className="sora-card p-5 xl:sticky xl:top-3" data-tom-tat="">
          <h2 className="flex items-center gap-2 font-serif text-[18px] tracking-[.04em] text-gold-bright">
            <Icon name="calendar" size={18} />
            {s.summary}
          </h2>
          <dl className="mt-3 divide-y divide-gold/15 text-[15px]">
            <Row label={s.labels.date} value={date ? fmtDate(date) : s.notChosen} />
            <Row label={s.labels.time} value={time ?? s.notChosen} />
            <Row
              label={s.labels.guests}
              value={`${guests} ${guests === 1 ? s.guest : s.guests}`}
            />
            <Row label={s.labels.area} value={selectedArea?.name ?? s.notChosen} />
            <Row
              label={s.labels.occasion}
              value={s.occasions.find((o) => o.id === occasion)?.label ?? s.notChosen}
            />
            <Row label={s.labels.notes} value={notes.trim() || s.notChosen} />
          </dl>

          {/* Hành động chính: GỌI ĐIỆN. Một câu nói rõ vì sao, rồi hai số thật
              in trên bìa thực đơn. */}
          <div className="mt-4 border-t border-gold/25 pt-4">
            <p id="res-goi-hint" className="text-[14px] leading-relaxed text-text">
              {t("reservation.submitHint")}
            </p>
            <ul ref={nutGoiRef} className="mt-3 space-y-2.5" aria-describedby="res-goi-hint">
              {restaurant.phones.map((p) => (
                <li key={p.number}>
                  <a
                    href={telHref(p)}
                    className="sora-btn-primary h-12 w-full justify-between gap-3 px-4 text-[16px] tracking-[.04em]"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon name="phone" size={17} />
                      {p.number}
                    </span>
                    <span className="text-[12px] font-medium tracking-[.06em] normal-case">
                      {phoneLabel(p, locale)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Thanh gọi dính đáy (điện thoại). Nằm TRÊN thanh điều hướng đáy
          (cao 64px) và chừa 84px bên phải cho nút tròn Master Chef
          (`right-4 bottom-[72px] size-14` trong RightUtilityRail) — đo từ
          class của hai khối đó, không ước. `inert` khi ẩn để Tab không rơi
          vào một nút không thấy. */}
      {soChinh && (
        <div
          data-thanh-goi=""
          inert={nutGoiDangThay}
          className={`fixed right-[84px] bottom-[76px] left-4 z-30 transition-opacity duration-200 md:hidden ${
            nutGoiDangThay ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <a
            href={telHref(soChinh)}
            className="sora-btn-primary h-12 w-full justify-center gap-2.5 px-3 text-[15px] tracking-[.04em] shadow-card"
          >
            <Icon name="phone" size={17} />
            {soChinh.number}
          </a>
        </div>
      )}
    </div>
  );
}

/** Nhãn một bước. Mẫu để chữ trơn — nét cọ đỏ trong mẫu chỉ nằm sau mục nav
 *  đang chọn ở sidebar, không gạch chân các bước. */
function StepLegend({ children }: { children: React.ReactNode }) {
  return <legend className="font-serif text-[16px] text-gold">{children}</legend>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right break-words text-text">{value}</dd>
    </div>
  );
}

/** Lịch tháng, tuần bắt đầu thứ Hai, không cho chọn ngày đã qua. */
function Calendar({
  month,
  setMonth,
  today,
  value,
  onPick,
  s,
  locale,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  today: Date;
  value: Date | null;
  onPick: (d: Date) => void;
  s: ReservationStrings;
  locale: Locale;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  // getDay(): 0=CN -> đổi sang tuần bắt đầu thứ Hai
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const canGoBack = new Date(year, m, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    /*
     * Rộng tối đa 336px = 7 ô × 44 + 6 khe × 2 + `p-2` 16. Ô ngày cao 44px cố
     * định; bề ngang ô co theo khung (`minmax(0,1fr)`) nên ở 390px (hộp trong
     * 318) mỗi ô còn ~41×44 — vẫn trên chuẩn bấm 24×24 rất xa. Bản cũ ghim
     * 26px.
     */
    <div
      data-lich=""
      className="mx-auto mt-3 w-full max-w-[336px] rounded-[var(--radius-btn)] border border-gold/45 p-2 @[556px]:mx-0"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={!canGoBack}
          aria-label={s.prevMonth}
          onClick={() => setMonth(new Date(year, m - 1, 1))}
          className="grid size-11 place-items-center rounded-[4px] text-gold hover:bg-gold/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <span className="font-serif text-[16px] text-ivory">
          {s.months[m]} {year}
        </span>
        <button
          type="button"
          aria-label={s.nextMonth}
          onClick={() => setMonth(new Date(year, m + 1, 1))}
          className="grid size-11 place-items-center rounded-[4px] text-gold hover:bg-gold/10"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <div className="mt-1 grid gap-0.5 text-center text-[12px] text-muted [grid-template-columns:repeat(7,minmax(0,1fr))]">
        {s.weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid gap-0.5 [grid-template-columns:repeat(7,minmax(0,1fr))]">
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const d = new Date(year, m, day);
          const past = d < today;
          const on = value ? sameDay(d, value) : false;
          return (
            <button
              key={day}
              type="button"
              disabled={past}
              aria-pressed={on}
              aria-label={d.toLocaleDateString(locale === "vi" ? "vi-VN" : "de-DE")}
              onClick={() => onPick(d)}
              className={`h-11 rounded-[4px] border text-[14px] tabular-nums ${
                on
                  ? "border-gold-bright bg-red font-semibold text-white"
                  : past
                    ? "border-transparent text-muted/30"
                    : "border-transparent text-text hover:border-gold/60"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
