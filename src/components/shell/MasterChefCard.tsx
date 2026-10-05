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
}: {
  eyebrow: string;
  question: string;
  cta: string;
}) {
  return (
    <div className="sora-card pointer-events-auto flex w-[360px] max-w-full overflow-hidden bg-bg/90 backdrop-blur-[10px]">
      <div className="grid w-[95px] shrink-0 place-items-center border-r border-gold/25 bg-elevated">
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
        <MasterChefTrigger className="sora-btn-gold mt-2.5 h-[30px] text-[12px]">
          {cta}
          <Icon name="arrow-right" size={14} />
        </MasterChefTrigger>
      </div>
    </div>
  );
}
