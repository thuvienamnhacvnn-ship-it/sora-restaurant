/*
 * Theo annotation Über uns: bỏ lớp phủ, chuyển triết lý thành banner ảnh.
 * Ảnh nguyên bản 16:9 nằm trên dải tiêu đề riêng; không mask/gradient.
 * 1920: 4 cột, 1440: 2 cột, điện thoại: 1 cột để ảnh và chữ không bị ép.
 * Nội dung thân chưa có giữ dấu ẩn ChoSepAn, không tự viết lịch sử quán.
 */
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ChoSepAn } from "@/components/ui/ChoSep";

type Card = {
  key: string;
  title: string;
  icon: IconName;
  /** Ảnh banner — `alt=""` vì nội dung nằm ở phần chữ. */
  image: { src: string; position?: string };
  /** Chữ thân thật (Sếp gửi). Chưa có thì bỏ trống. */
  body?: string;
};

export function PhilosophyCards({ cards }: { cards: Card[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:[grid-template-columns:repeat(2,minmax(0,1fr))] 2xl:[grid-template-columns:repeat(4,minmax(0,1fr))]">
      {cards.map((c) => (
        <li
          key={c.key}
          className="sora-card flex min-w-0 flex-col overflow-hidden"
        >
          {/* `@container` trên CỘT CHỮ: cỡ tiêu đề co theo đúng bề ngang chỗ
              nó nằm, không theo bề ngang màn hay bề ngang thẻ. */}
          <div className="@container order-2 flex min-w-0 flex-col justify-center gap-2.5 p-4 md:p-5">
            <Icon name={c.icon} size={26} className="shrink-0 text-gold" />
            {/*
             * `HANDWERKSKUNST` — tiêu đề dài nhất — cần 10,355px bề ngang cho
             * mỗi 1px cỡ chữ (đo: 207,1px ở 20px, tracking .04em). `cqw` đo
             * HỘP NỘI DUNG của cột (đã trừ đệm), chừa 2px:
             *     cỡ = (100cqw − 2px) / 10,355     trần 20px (cỡ mẫu)
             * 390: cột 206px -> 19,7px · 1280: 209px -> 20px · ≥1440 chạm trần.
             * `break-words` là lưới chót nếu sau này có nhãn dài hơn.
             */}
            <h3
              lang="de"
              className="font-serif text-[min(20px,calc((100cqw-2px)/10.355))] leading-tight tracking-[.04em] break-words text-gold-bright uppercase"
            >
              {c.title}
            </h3>
            {c.body ? (
              <p className="text-[14px] leading-relaxed text-text">{c.body}</p>
            ) : (
              <ChoSepAn note={`Text „${c.title}“ (4–5 Zeilen)`} />
            )}
          </div>

          <div
            aria-hidden="true"
            className="relative order-1 aspect-[16/9] min-w-0 border-b border-gold/25"
          >
            <Image
              src={c.image.src}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 40vw, 40vw"
              loading="lazy"
              style={{
                objectFit: "cover",
                objectPosition: c.image.position ?? "center 42%",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
