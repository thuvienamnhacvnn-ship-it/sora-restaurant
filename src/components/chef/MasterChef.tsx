"use client";

/*
 * Master Chef Assistant — giao diện đầy đủ theo KIT 04_AI_MASTER_CHEF.
 * Desktop: drawer phải 440px. Điện thoại: bottom sheet.
 *
 * CHƯA NỐI API. Theo đúng lệnh:
 *  - chip gợi ý nhanh lọc THẲNG trên data/menu-items.json (dữ liệu thật),
 *    lý do gợi ý ghép từ trường có sẵn — không có câu văn nào do máy bịa.
 *  - gõ chữ tự do -> trả câu dự phòng nguyên văn của KIT.
 * Khi có nhà cung cấp AI, thay đúng hàm `answer()` bên dưới.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import {
  categoryById,
  displayPrice,
  itemDescription,
  itemName,
  menuItems,
  type MenuItem,
} from "@/data/menu";
import { pick, type Locale } from "@/lib/i18n";

export type ChefStrings = {
  eyebrow: string;
  title: string;
  question: string;
  inputPlaceholder: string;
  send: string;
  chips: Record<"light" | "hearty" | "sushi" | "vegetarian" | "surprise", string>;
  viewDish: string;
  otherSuggestions: string;
  fallback: string;
  notConnected: string;
  close: string;
  menuHref: string;
};

type ChefContext = {
  /** `category` = id nhóm đang mở ở Speisekarte -> gợi ý bó trong nhóm đó. */
  open: (seed?: ChipKey, category?: string | null) => void;
  isOpen: boolean;
};
const Ctx = createContext<ChefContext | null>(null);

export function useMasterChef(): ChefContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMasterChef phải nằm trong <MasterChefProvider>");
  return ctx;
}

type ChipKey = keyof ChefStrings["chips"];
const CHIP_ORDER: ChipKey[] = ["light", "hearty", "sushi", "vegetarian", "surprise"];

/** Lọc món cho từng chip — chỉ dùng trường có thật trong dataset.
 *  `nonce` tăng mỗi lần bấm "Andere Vorschläge" để ra bộ khác. */
function suggest(
  chip: ChipKey,
  nonce: number,
  category?: string | null
): MenuItem[] {
  // Mở drawer từ trang Speisekarte thì chỉ gợi ý trong nhóm đang xem.
  const pool = menuItems.filter(
    (i) => i.available && (!category || i.category === category)
  );
  let hits: MenuItem[];
  switch (chip) {
    case "light":
      hits = pool.filter((i) => ["suppen", "salate", "vorspeisen"].includes(i.category));
      break;
    case "hearty":
      hits = pool.filter((i) => ["hauptgerichte", "vietnamese-classics"].includes(i.category));
      break;
    case "sushi":
      hits = pool.filter((i) => i.category === "sushi");
      break;
    case "vegetarian":
      hits = pool.filter((i) => i.dietary.includes("vegetarian"));
      break;
    case "surprise":
      hits = pool;
      break;
  }
  // Nhóm đang mở không có món khớp chip -> thà gợi ý cả nhóm còn hơn trả rỗng.
  if (hits.length === 0 && category) hits = pool;
  // tối đa 3 thẻ (KIT). Rải đều theo danh sách để không ra 3 món liền nhau.
  if (hits.length <= 3) return hits;
  const step = Math.max(1, Math.floor(hits.length / 3));
  const offset = nonce % step;
  return [0, 1, 2].map((k) => hits[(k * step + offset) % hits.length]);
}

export function MasterChefProvider({
  locale,
  strings,
  children,
}: {
  locale: Locale;
  strings: ChefStrings;
  children: ReactNode;
}) {
  const [isOpen, setOpen] = useState(false);
  const [chip, setChip] = useState<ChipKey | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [dangHoi, setDangHoi] = useState(false);
  /** Câu trả lời + món do Gemini chọn. Chưa cắm khoá thì luôn null. */
  const [aiTraLoi, setAiTraLoi] = useState<string | null>(null);
  const [aiMonIds, setAiMonIds] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const open = useCallback((seed?: ChipKey, cat?: string | null) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setCategory(cat ?? null);
    if (seed) setChip(seed);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const results = useMemo(
    () => (chip ? suggest(chip, nonce, category) : []),
    [chip, nonce, category]
  );
  /** Món theo id Gemini chọn. Route đã lọc id lạ, đây là chốt thứ hai. */
  const aiMon = useMemo(
    () =>
      aiMonIds
        .map((id) => menuItems.find((m) => m.id === id))
        .filter((m): m is MenuItem => Boolean(m)),
    [aiMonIds]
  );

  const ctx = useMemo(() => ({ open, isOpen }), [open, isOpen]);

  return (
    <Ctx.Provider value={ctx}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label={strings.close}
            onClick={close}
            className="absolute inset-0 bg-black/55"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute right-0 bottom-0 flex max-h-[88vh] w-full flex-col border-t border-gold/45 bg-elevated md:top-0 md:bottom-0 md:max-h-none md:w-[440px] md:border-t-0 md:border-l"
          >
            {/* Đầu drawer */}
            <div className="flex items-start gap-3 border-b border-gold/25 px-5 py-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-gold/45 bg-bg text-gold">
                <Icon name="chef" size={28} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="sora-eyebrow text-[12px]">{strings.eyebrow}</p>
                <h2
                  id={titleId}
                  className="font-serif text-[20px] leading-tight text-ivory"
                >
                  {strings.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={strings.close}
                className="grid size-9 place-items-center rounded-[6px] border border-gold/45 text-muted hover:text-gold"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Thân */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <p className="font-serif text-[19px] leading-snug text-ivory">
                {strings.question}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {CHIP_ORDER.map((key) => (
                  <button
                    key={key}
                    type="button"
                    data-autofocus={key === "light" ? "" : undefined}
                    aria-pressed={chip === key}
                    onClick={() => {
                      setChip(key);
                      setShowFallback(false);
                    }}
                    className={`rounded-[6px] border px-3 py-1.5 text-[13px] transition-colors ${
                      chip === key
                        ? "border-gold/80 bg-gold/15 text-gold-bright"
                        : "border-gold/45 text-muted hover:text-gold-bright"
                    }`}
                  >
                    {strings.chips[key]}
                  </button>
                ))}
              </div>

              {/* Câu trả lời — máy đọc màn hình phải nghe được */}
              <div aria-live="polite" className="mt-5 space-y-3">
                {showFallback && (
                  <p className="rounded-[6px] border border-gold/30 bg-surface px-4 py-3 text-[14px] leading-relaxed text-text">
                    {strings.fallback}
                  </p>
                )}

                {dangHoi && (
                  <p className="text-[14px] text-muted">…</p>
                )}

                {aiTraLoi && (
                  <p className="rounded-[6px] border border-gold/30 bg-surface px-4 py-3 text-[14px] leading-relaxed text-text">
                    {aiTraLoi}
                  </p>
                )}

                {aiMon.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    strings={strings}
                  />
                ))}

                {results.map((item) => (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    strings={strings}
                  />
                ))}

                {chip && results.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNonce((n) => n + 1)}
                    className="sora-btn-outline"
                  >
                    {strings.otherSuggestions}
                  </button>
                )}
              </div>

              <p className="mt-6 border-t border-gold/20 pt-3 text-[12px] leading-relaxed text-muted/80">
                {strings.notConnected}
              </p>
            </div>

            {/* Ô nhập cố định đáy drawer (KIT) */}
            <form
              className="flex items-end gap-2 border-t border-gold/25 bg-bg px-5 py-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const cauHoi = freeText.trim();
                if (!cauHoi || dangHoi) return;
                setChip(null);
                setFreeText("");
                setAiTraLoi(null);
                setAiMonIds([]);
                setDangHoi(true);
                try {
                  const r = await fetch("/api/chef", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cauHoi, locale }),
                  });
                  const d = await r.json();
                  // `nguon: "menu"` = chưa cắm khoá -> dùng câu dự phòng KIT.
                  if (d.nguon === "gemini" && (d.cauTraLoi || d.monIds?.length)) {
                    setAiTraLoi(d.cauTraLoi ?? null);
                    setAiMonIds(Array.isArray(d.monIds) ? d.monIds : []);
                  } else {
                    setShowFallback(true);
                  }
                } catch {
                  setShowFallback(true);
                } finally {
                  setDangHoi(false);
                }
              }}
            >
              <textarea
                rows={1}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={strings.inputPlaceholder}
                className="sora-field min-h-[41px] flex-1"
              />
              <button
                type="submit"
                disabled={dangHoi}
                className="sora-btn-gold h-[41px] shrink-0 disabled:opacity-50"
                aria-label={strings.send}
              >
                <Icon name="send" size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

function RecommendationCard({
  item,
  locale,
  strings,
}: {
  item: MenuItem;
  locale: Locale;
  strings: ChefStrings;
}) {
  const price = displayPrice(item, locale);
  const cat = categoryById(item.category);
  // Lý do khớp ghép từ dữ liệu thật, không phải câu do máy viết.
  const facts = [
    cat ? pick(cat.name, locale) : item.subcategory,
    item.dietary.includes("vegetarian") ? strings.chips.vegetarian : null,
    item.spice !== "none" ? "Scharf" : null,
  ].filter(Boolean);

  return (
    <article className="sora-card flex gap-3 p-3">
      {/* Ảnh món 96x72 — chưa có ảnh thật nào, để ô giữ chỗ chứ không mượn ảnh. */}
      <span className="grid h-[72px] w-24 shrink-0 place-items-center rounded-[6px] border border-gold/25 bg-bg text-gold/35">
        <Icon name="utensils" size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[16px] text-ivory">
          {itemName(item, locale)}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted">
          {itemDescription(item, locale)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {price.text && (
            <span className="text-[14px] font-semibold text-gold-bright">
              {price.from ? "ab " : ""}
              {price.text}
            </span>
          )}
          {facts.slice(0, 2).map((f) => (
            <span
              key={f}
              className="rounded-[4px] border border-gold/30 px-1.5 py-0.5 text-[11px] text-muted"
            >
              {f}
            </span>
          ))}
        </div>
        <Link
          href={`${strings.menuHref}?dish=${item.id}`}
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wider text-gold hover:text-gold-bright"
        >
          {strings.viewDish}
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    </article>
  );
}

/** Nút mở drawer — dùng lại cho rail phải, FAB điện thoại, thẻ Master Chef. */
export function MasterChefTrigger({
  children,
  className,
  seed,
  category,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  seed?: ChipKey;
  /** Trang Speisekarte truyền nhóm đang mở vào đây. */
  category?: string | null;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  const { open } = useMasterChef();
  return (
    <button type="button" className={className} onClick={() => open(seed, category)} {...rest}>
      {children}
    </button>
  );
}
