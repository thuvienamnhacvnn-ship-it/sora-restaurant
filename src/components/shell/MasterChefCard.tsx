"use client";

/*
 * Thẻ Master Chef góc trên phải — có trên cả 6 trang (spec §3.3).
 * 360×148, nền rgba(9,8,6,.90) + blur, viền gold 1px, bo 8px.
 *
 * Mẫu để ảnh đầu bếp bên trái. KIT không kèm ảnh đó (chỉ có prompt sinh ảnh),
 * nên dùng `icons/master_chef.svg` của KIT. Không bịa ảnh người thật.
 * Chữ nằm hẳn bên phải ảnh -> không bao giờ đè mặt người kể cả khi có ảnh.
 */

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { MasterChefTrigger } from "@/components/chef/MasterChef";

export function MasterChefCard({
  eyebrow,
  question,
  cta,
  gon = false,
  nutCao = false,
}: {
  eyebrow: string;
  question: string;
  cta: string;
  /** Trang con (spec làm lại A4): ô icon 72px thay 95px để chữ rộng hơn.
   *  Trang chủ không truyền -> giữ nguyên 95px. */
  gon?: boolean;
  /**
   * Nút cao 44px (chuẩn vùng chạm) thay 30px. CHỈ `PageHero` của trang con
   * truyền. Là prop RIÊNG chứ không gộp vào `gon`: trang chủ mới (`HomeHero`)
   * cũng dùng `gon`, gộp vào là đổi luôn thẻ ở trang chủ — đã lỡ một lần 07/10.
   */
  nutCao?: boolean;
}) {
  return (
    <div className="sora-card pointer-events-auto flex w-[360px] max-w-full overflow-hidden bg-bg/90 backdrop-blur-[10px]">
      <div
        className={`grid shrink-0 place-items-center border-r border-gold/25 bg-elevated ${
          gon ? "w-[72px]" : "w-[95px]"
        }`}
      >
        <Image
          src="/icons/master_chef.svg"
          alt=""
          width={46}
          height={46}
          className="opacity-85"
        />
      </div>
      <div className="min-w-0 flex-1 px-4 py-3.5">
        <p className="sora-eyebrow text-[12px] tracking-[.14em]">
          <Icon name="star" size={13} className="-mt-0.5 mr-1 inline" />
          {eyebrow}
        </p>
        <p className="mt-1.5 font-serif text-[14px] leading-snug text-text">
          {question}
        </p>
        <MasterChefTrigger
          className={`sora-btn-gold mt-2.5 ${nutCao ? "h-11 text-[13px]" : "h-[30px] text-[12px]"}`}
        >
          {cta}
          <Icon name="arrow-right" size={14} />
        </MasterChefTrigger>
      </div>
    </div>
  );
}
