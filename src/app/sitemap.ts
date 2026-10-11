/*
 * Sitemap 6 route × 2 ngôn ngữ (spec §15). Trang pháp lý để ngoài sitemap
 * (đã `robots: { index: false }` vì nội dung còn trống).
 */
import type { MetadataRoute } from "next";
import { NAV, SITE_URL } from "@/data/site";
import { LOCALES } from "@/lib/i18n";
import { restaurantOffers } from "@/data/restaurant-updates";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...NAV.map(item=>item.path), '/master-chef', ...['angebote','neuheiten','beliebte','erlebnis'].map(section=>`/ueber-uns/${section}`), ...restaurantOffers.map(offer=>`/ueber-uns/aktion/${offer.id}`)];
  return LOCALES.flatMap((lang) =>
    paths.map((route) => {
      const path = route === "/" ? "" : route;
      return {
        url: `${SITE_URL}/${lang}${path}`,
        changeFrequency: "monthly" as const,
        priority: route === "/" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
        },
      };
    })
  );
}
