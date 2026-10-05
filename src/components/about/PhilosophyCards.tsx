/*
 * 4 thẻ triết lý — mockup 05_ueber_uns.png, dải y 449→645.
 * Lưới 4 cột bằng nhau, gap 12px (spec §8: mockup đo 276/285/305/306 lệch nhau
 * do ảnh AI bị ép khung, không phải thiết kế).
 *
 * Tiêu đề 4 thẻ là khối KIT quy định (Philosophy / Freshness & quality /
 * Craftsmanship / Ambience) nên dùng được. PHẦN THÂN trong mockup là chữ AI
 * viết -> <ChoSep/>. KIT nói thẳng: "Do not fabricate founder/team biography
 * unless supplied."
 *
 * Thẻ 2/3/4 có ảnh nền nửa phải như mẫu. Ảnh tự fade (mask) ở mép trái để chữ
 * đọc được — đây là làm mờ CHÍNH BỨC ẢNH, không phải đổ một lớp màu lên trên
 * (luật của Sếp). Ảnh dùng là ảnh THẬT của quán.
 */
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ChoSep } from "@/components/ui/ChoSep";

type Card = {
  key: string;
  title: string;
  icon: IconName;
  /** Ảnh trang trí nửa phải thẻ — `alt=""` vì nội dung nằm ở cột chữ. */
  image?: { src: string };
};

export function PhilosophyCards({ cards }: { cards: Card[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <li
          key={c.key}
          className="sora-card relative flex min-h-[169px] overflow-hidden"
        >
          <div className="relative z-10 flex min-w-0 flex-1 flex-col p-4">
            <Icon name={c.icon} size={38} className="text-gold/85" />
            <h3 className="mt-3 font-serif text-[20px] leading-tight tracking-[.04em] text-gold-bright uppercase">
              {c.title}
            </h3>
            <ChoSep
              note={`Text „${c.title}“ (4–5 Zeilen)`}
              lines={4}
              className="mt-2.5"
            />
          </div>

          {/*
           * Ảnh là một CỘT RIÊNG bên phải, chữ ở cột trái — chữ không bao giờ
           * đè lên ảnh (KIT: "Không đặt chữ lên ảnh").
           * `maskImage` ≠ lớp phủ: mask chỉ chọn phần nào CỦA CHÍNH ẢNH được
           * vẽ, không bôi thêm màu. `#000` ở đây nghĩa là "giữ nguyên ảnh".
           * Fade ăn 30% mép trái để nối vào nền thẻ; 70% ảnh còn lại nguyên
           * bản — luật Sếp 04/10: không bôi đen ảnh, không chạm đen đặc.
           */}
          {c.image && (
            <div
              aria-hidden="true"
              className="relative hidden w-[38%] shrink-0 sm:block"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, #000 30%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, #000 30%)",
              }}
            >
              <Image
                src={c.image.src}
                alt=""
                fill
                sizes="(max-width: 1199px) 25vw, 160px"
                loading="lazy"
                style={{ objectFit: "cover", objectPosition: "center 42%" }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
