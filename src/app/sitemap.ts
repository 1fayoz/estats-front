import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Faqat ochiq sahifalar. Kabinet ichidagi yo'llar bu yerga tushmaydi —
 * ular sessiyaga bog'liq va qidiruv uchun ma'nosiz.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    // Muqobillar (Competitor conquesting)
    { url: `${siteConfig.url}/muqobil/zoomselling`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/muqobil/mpstats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    // Yechimlar (SEO domain pages)
    { url: `${siteConfig.url}/yechimlar/ombor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/moliya`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/bozor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/marketing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // Huquqiy va boshqa sahifalar
    { url: `${siteConfig.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/lens`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/lens/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
