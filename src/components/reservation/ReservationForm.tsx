"use client";

/*
 * 03 RESERVIERUNG — luồng Date -> Time -> Guests -> Area -> Occasion -> Notes.
 * Desktop 60/40 (KIT thắng mockup 57/43 — spec §11-D).
 *
 * HAI CHỖ CỐ Ý KHÁC MOCKUP:
 *  1. Sơ đồ bàn: mockup hiện bàn 1-21 trống/đã đặt theo thời gian thực.
 *     `liveTableInventory: false` -> đây chỉ là CHỌN KHU VỰC. Không hứa bàn nào
 *     còn trống khi chưa có hệ thống đặt bàn thật (§11-G).
 *  2. Khung giờ KHÔNG lấy từ mockup (mockup bịa 11:30-20:00). Sinh từ giờ mở
 *     cửa THẬT in trên thực đơn: 11:00-22:30, bước 30 phút, chốt sớm 30 phút
 *     trước giờ đóng.
 *
 * Trạng thái không bao giờ chỉ phân biệt bằng màu — luôn kèm icon + chữ (a11y).
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { restaurant, telHref } from "@/data/restaurant";
import { getT, pick, type Locale } from "@/lib/i18n";
import { CornerSakura, SakuraEdge } from "@/components/decor/Decor";

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

/** Sinh khung giờ từ giờ mở cửa thật. */
function timeSlots(open: string, close: string): string[] {
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  // chốt chỗ cuối sớm hơn giờ đóng 30 phút
  for (let t = toMin(open); t <= toMin(close) - 30; t += 30) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

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

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);

  const selectedArea = s.areas.find((a) => a.id === area);

  return (
    <div className="grid grid-cols-1 gap-4 xl:[grid-template-columns:minmax(0,60fr)_minmax(0,40fr)]">
      {/* ------------------------------ Cột trái: form ----------------------- */}
      <form
        className="sora-card relative isolate overflow-hidden p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <CornerSakura corner="tr" width={174} offsetX={-1} offsetY={-1} opacity={1} className="-z-10" />

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="flex items-center gap-2 font-serif text-[24px] tracking-[.04em] text-gold-bright">
            <Icon name="calendar" size={22} />
            {s.title}
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
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

          {/* 2. Uhrzeit */}
          <fieldset className="min-w-0">
            <StepLegend>{s.steps[1]}</StepLegend>
            <div className="mt-3 grid grid-cols-3 gap-[7px]">
              {slots.map((slot) => {
                const on = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTime(slot)}
                    className={`h-[26px] rounded-[var(--radius-btn)] border text-[12px] ${
                      on
                        ? "border-gold/70 bg-red text-white"
                        : "border-gold/45 text-muted hover:text-gold-bright"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 3. Gäste */}
          <fieldset className="min-w-0">
            <StepLegend>{s.steps[2]}</StepLegend>
            <label className="relative mt-3 block">
              <span className="sr-only">{s.guests}</span>
              <Icon
                name="users"
                size={18}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gold"
              />
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="sora-field h-[38px] appearance-none pl-10"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? s.guest : s.guests}
                  </option>
                ))}
              </select>
              <Icon
                name="chevron-down"
                size={16}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gold"
              />
            </label>
          </fieldset>
        </div>

        {/* 4. Bereich */}
        <fieldset className="mt-7">
          <StepLegend>{s.steps[3]}</StepLegend>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {s.areas.map((a) => {
              const on = area === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setArea(on ? null : a.id)}
                  className={`overflow-hidden rounded-[var(--radius-card)] border text-left transition-colors ${
                    on ? "border-gold/80" : "border-gold/35 hover:border-gold/60"
                  }`}
                >
                  <span className="relative block h-[70px]">
                    <Image
                      src={a.photo}
                      alt={a.alt}
                      fill
                      sizes="180px"
                      style={{ objectFit: "cover" }}
                    />
                  </span>
                  <span className="flex items-center gap-2 px-2.5 py-2">
                    {/* Trạng thái có icon + chữ, không chỉ bằng màu */}
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                        on ? "border-gold bg-gold/25 text-gold-bright" : "border-gold/45"
                      }`}
                    >
                      {on && <Icon name="check" size={10} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-text">
                      {a.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-muted/80">{s.areasNote}</p>
        </fieldset>

        {/* 5. Anlass + 6. Anmerkungen */}
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
          <fieldset className="min-w-0">
            <StepLegend>{s.steps[4]}</StepLegend>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.occasions.map((o) => {
                const on = occasion === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setOccasion(on ? null : o.id)}
                    className={`inline-flex h-[30px] items-center gap-1.5 rounded-[var(--radius-btn)] border px-3 text-[13px] ${
                      on
                        ? "border-gold/80 bg-gold/15 text-gold-bright"
                        : "border-gold/45 text-muted hover:text-gold-bright"
                    }`}
                  >
                    <Icon
                      name={o.icon}
                      size={14}
                      className={o.icon === "heart" ? "text-red" : "text-gold"}
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
                className="sora-field"
              />
            </label>
            <p className="mt-1 text-right text-[12px] text-muted/70">
              {notes.length}/500
            </p>
          </fieldset>
        </div>

        {/* Nút VÔ HIỆU SẴN. Chưa có hệ thống đặt bàn và chưa có hộp thư nhận
            -> để nút sống rồi bấm vào mới báo "không gửi được" là gài người
            dùng. Lời giải thích + hai số thật nằm ngay dưới, thấy trước khi
            bấm. (Trưởng nhóm chốt 04/10.) */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled
            aria-describedby="res-submit-hint"
            className="sora-btn-primary w-full max-w-[330px] justify-center opacity-45 hover:translate-y-0 disabled:cursor-not-allowed disabled:hover:filter-none"
          >
            <Icon name="calendar" size={18} />
            {s.submit}
            <Icon name="arrow-right" size={16} />
          </button>

          <p
            id="res-submit-hint"
            className="text-center text-[13px] leading-relaxed text-muted"
          >
            {getT(locale)("reservation.submitHint")}
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-2">
            {restaurant.phones.map((p) => (
              <li key={p.number}>
                <a href={telHref(p)} className="sora-btn-outline">
                  <Icon name="phone" size={14} />
                  {p.number}
                  <span className="ml-1 text-[11px] normal-case opacity-70">
                    {p.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </form>

      {/* ---------------------- Cột phải: khu vực + giờ + tóm tắt ------------- */}
      <div className="flex min-w-0 flex-col gap-4">
        <section className="sora-card relative isolate overflow-hidden p-5">
          {/* Chỉ góc trên-phải: đáy thẻ là dòng chú thích, dán hoa xuống đó
              thì chữ nằm trên nền hồng, đọc không ra. */}
          <CornerSakura corner="tr" width={156} offsetX={-1} offsetY={-1} opacity={1} className="-z-10" />
          <h2 className="relative font-serif text-[18px] tracking-[.04em] text-gold-bright">
            {s.tablePlan}
          </h2>
          <p className="mt-1 text-[13px] text-muted">{s.areaHintTitle}</p>

          {/* Sơ đồ khu vực — VẼ SẴN cả hai khu ngay từ đầu, chọn khu nào
              thì khu đó sáng lên. Không để khung trống chờ người dùng chọn.
              `liveTableInventory: false` -> KHÔNG đánh số bàn, KHÔNG nói bàn
              nào trống. Đây là sơ đồ ƯỚC LỆ, không phải mặt bằng thật của
              quán — không vẽ tường, cửa, lối đi để khỏi bịa kiến trúc. */}
          <ul className="mt-3 grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-2">
            {s.areas.map((a, i) => {
              const on = area === a.id;
              return (
                <li key={a.id} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setArea(on ? null : a.id)}
                    className={`flex h-[220px] w-full flex-col justify-between rounded-[var(--radius-card)] border-2 p-3 text-left transition-colors ${
                      on
                        ? "border-gold bg-gold/10"
                        : "border-gold/30 bg-elevated hover:border-gold/60"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {/* trạng thái có viền + nhãn chữ, không chỉ đổi màu */}
                      <span
                        className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                          on ? "border-gold bg-gold/25 text-gold-bright" : "border-gold/45"
                        }`}
                      >
                        {on && <Icon name="check" size={10} />}
                      </span>
                      <span className="min-w-0 truncate text-[13px] tracking-[.06em] text-gold-bright uppercase">
                        {a.name}
                      </span>
                    </span>

                    <ZoneGlyphs kind={i === 0 ? "tables" : "counter"} active={on} />

                    <span
                      className={`text-[11px] tracking-[.06em] uppercase ${
                        on ? "text-gold-bright" : "invisible"
                      }`}
                    >
                      {getT(locale)("reservation.selected")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-[13px] leading-relaxed text-muted">{s.areaHint}</p>
        </section>

        <section className="sora-card relative isolate overflow-hidden p-5">
          <CornerSakura corner="tr" width={114} offsetX={-1} offsetY={-1} opacity={1} className="-z-10" />
          <h2 className="flex items-center gap-2 font-serif text-[16px] tracking-[.04em] text-gold-bright">
            <Icon name="clock" size={17} />
            {s.openingHours}
          </h2>
          <p className="mt-2 text-[15px] text-text">
            {pick(restaurant.openingHours.text, locale)}
          </p>
        </section>

        <section className="sora-card relative isolate overflow-hidden p-5">
          <CornerSakura corner="tr" width={126} offsetX={-1} offsetY={-1} opacity={1} className="-z-10" />
          {/* Mẫu 03 còn một CỘT hoa chạy dọc mép phải đúng thẻ này
              (đo 1:1: x 1607→1672, y 771→quá đáy khung 941). Thẻ
              `overflow-hidden` nên cột bị cắt gọn ở mép thẻ. */}
          <SakuraEdge
            side="right"
            run={320}
            depth={34}
            tile={440}
            opacity={0.62}
            className="-z-10 hidden xl:block"
          />
          <h2 className="font-serif text-[16px] tracking-[.04em] text-gold-bright">
            {s.summary}
          </h2>
          {/* Cột giá trị căn phải, mà `SakuraEdge` ở trên chiếm 46px sát mép
              phải thẻ -> chừa chỗ cho nó, không thì "—" và "2 Gäste" nằm đè
              lên hoa, đọc không ra. Chỉ ở xl vì dải hoa cũng chỉ bật ở xl. */}
          <dl className="mt-3 divide-y divide-gold/15 text-[14px] xl:pr-[44px]">
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
        </section>
      </div>
    </div>
  );
}

/*
 * Hình ước lệ trong ô khu vực. Cố ý trừu tượng: chấm tròn = chỗ ngồi, hình
 * chữ nhật = mặt bàn / mặt quầy. KHÔNG đánh số, KHÔNG tô xanh-đỏ trạng thái —
 * `liveTableInventory: false`, và mẫu vẽ bàn 1–21 kèm "Verfügbar/Reserviert"
 * là đúng cái KIT cấm.
 */
function ZoneGlyphs({ kind, active }: { kind: "tables" | "counter"; active: boolean }) {
  const stroke = active ? "var(--color-gold-bright)" : "var(--color-gold)";
  const dim = active ? 0.95 : 0.45;
  return (
    <svg
      viewBox="0 0 120 96"
      aria-hidden="true"
      focusable="false"
      className="my-2 w-full"
      style={{ opacity: dim }}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "tables" ? (
        <>
          {[0, 1, 2].map((col) =>
            [0, 1, 2].map((row) => {
              const x = 14 + col * 40;
              const y = 12 + row * 30;
              return (
                <g key={`${col}-${row}`}>
                  <rect x={x} y={y} width={20} height={14} rx={3} />
                  <circle cx={x - 5} cy={y + 7} r={3} />
                  <circle cx={x + 25} cy={y + 7} r={3} />
                </g>
              );
            })
          )}
        </>
      ) : (
        <>
          <path d="M18 14h84a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H18Z" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx={28 + i * 22} cy={48} r={5} />
              <path d={`M${28 + i * 22} 53v10`} />
            </g>
          ))}
          <path d="M14 78h92" />
        </>
      )}
    </svg>
  );
}

/** Nhãn một bước. Mẫu để chữ trơn — nét cọ đỏ trong mẫu chỉ nằm sau mục nav
 *  đang chọn ở sidebar, không gạch chân các bước. */
function StepLegend({ children }: { children: React.ReactNode }) {
  return <legend className="font-serif text-[15px] text-gold">{children}</legend>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
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
    <div className="mt-3 rounded-[var(--radius-btn)] border border-gold/30 p-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={!canGoBack}
          aria-label={s.prevMonth}
          onClick={() => setMonth(new Date(year, m - 1, 1))}
          className="grid size-7 place-items-center rounded-[4px] text-gold disabled:opacity-30"
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <span className="font-serif text-[14px] text-ivory">
          {s.months[m]} {year}
        </span>
        <button
          type="button"
          aria-label={s.nextMonth}
          onClick={() => setMonth(new Date(year, m + 1, 1))}
          className="grid size-7 place-items-center rounded-[4px] text-gold"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted/70">
        {s.weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-0.5">
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
              className={`h-[26px] rounded-[4px] text-[12px] ${
                on
                  ? "border border-red bg-red/25 text-text"
                  : past
                    ? "text-muted/25"
                    : "text-muted hover:text-gold-bright"
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
