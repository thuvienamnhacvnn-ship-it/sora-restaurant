/*
 * Sitemap 6 route × 2 ngôn ngữ (spec §15). Trang pháp lý để ngoài sitemap
 * (đã `robots: { index: false }` vì nội dung còn trống).
 */
import type { MetadataRoute } from "next";
import { NAV, SITE_URL } from "@/data/site";
import { LOCALES } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((lang) =>
    NAV.map((item) => {
      const path = item.path === "/" ? "" : item.path;
      return {
        url: `${SITE_URL}/${lang}${path}`,
        changeFrequency: "monthly" as const,
        priority: item.path === "/" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
        },
      };
    })
  );
}
