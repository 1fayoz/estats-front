import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Faqat ochiq sahifalar. Kabinet ichidagi yo'llar bu yerga tushmaydi —
 * ular sessiyaga bog'liq va qidiruv uchun ma'nosiz.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
