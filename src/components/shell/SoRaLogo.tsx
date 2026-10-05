import Image from "next/image";

/*
 * Logo tròn. Dùng bản đã trim + xuất nhẹ trong public/logo.
 * CẤM dùng `05_ASSETS/logo/sora_logo_3d_transparent.png` (2,9 MB) trực tiếp.
 *   logo-320.webp  47 KB — sidebar Ø160 @2×
 *   logo-96.webp    7 KB — top bar điện thoại Ø48 @2×
 */
export function SoRaLogo({
  size,
  priority = false,
  className = "",
}: {
  size: number;
  priority?: boolean;
  className?: string;
}) {
  const src = size <= 56 ? "/logo/logo-96.webp" : "/logo/logo-320.webp";
  return (
    <Image
      src={src}
      alt="SoRa"
      width={size}
      height={size}
      priority={priority}
      className={className}
      sizes={`${size}px`}
    />
  );
}
