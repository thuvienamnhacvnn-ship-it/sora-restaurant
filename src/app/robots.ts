import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/*
 * Bản xem thử (VPS, chưa có tên miền) phải CHẶN máy tìm kiếm.
 * Chỉ khi đặt `SITE_PUBLIC=1` mới cho lập chỉ mục — tức lúc nhà hàng đã
 * duyệt nội dung và site đã có tên miền thật.
 */
const CONG_KHAI = process.env.SITE_PUBLIC === "1";

export default function robots(): MetadataRoute.Robots {
  if (!CONG_KHAI) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
