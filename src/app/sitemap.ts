import type { MetadataRoute } from "next";

import { I18N_ROUTES, LOCALES, languageAlternates } from "@/config/i18n-routes";
import { siteConfig } from "@/config/site";

/**
 * Faqat ochiq sahifalar. Kabinet ichidagi yo'llar bu yerga tushmaydi —
 * ular sessiyaga bog'liq va qidiruv uchun ma'nosiz.
 *
 * Ro'yxat `I18N_ROUTES` dan yasaladi — hreflang sahifadagi bilan bir xil
 * bo'lishi uchun. `lastModified` — mazmun haqiqatda o'zgargan kun
 * (doimiy sana): ilgari har so'rovda `new Date()` berilardi va Google
 * bunday lastmod'ga ishonmay qo'yadi. Sahifa mazmuni jiddiy o'zgarsa —
 * shu yerdagi sana yangilanadi.
 */
const DEFAULT_LAST_MODIFIED = "2026-09-25";
const LAST_MODIFIED: Record<string, string> = {
  "/lens/privacy": "2026-09-18",
};

type Entry = Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">;

/** Bo'lim bo'yicha ustuvorlik — hamma sahifa 1.0 bo'lsa, belgi ma'nosiz. */
function rankOf(path: string): Entry {
  const p = path.replace(/^\/(ru|en)(?=\/|$)/, "") || "/";
  if (p === "/") return { changeFrequency: "weekly", priority: 1.0 };
  if (["/kalkulyator", "/tools", "/qollanma", "/guides", "/tekshirish"].includes(p))
    return { changeFrequency: "weekly", priority: 0.9 };
  if (/^\/(kalkulyator|tools)\//.test(p)) return { changeFrequency: "monthly", priority: 0.8 };
  if (/^\/(yechimlar|solutions|bozorlar|muqobil|alternatives)\//.test(p))
    return { changeFrequency: "monthly", priority: 0.7 };
  if (/^\/(qollanma|guides|kategoriya|categories)\//.test(p))
    return { changeFrequency: "monthly", priority: 0.7 };
  if (p === "/lugat") return { changeFrequency: "monthly", priority: 0.6 };
  if (p === "/lens") return { changeFrequency: "monthly", priority: 0.5 };
  // Huquqiy sahifalar
  return { changeFrequency: "yearly", priority: 0.3 };
}

const abs = (path: string) => (path === "/" ? siteConfig.url : `${siteConfig.url}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const group of I18N_ROUTES) {
    for (const locale of LOCALES) {
      const path = group[locale];
      if (!path) continue;
      const languages = languageAlternates(path);
      entries.push({
        url: abs(path),
        lastModified: LAST_MODIFIED[path] ?? DEFAULT_LAST_MODIFIED,
        ...rankOf(path),
        ...(languages
          ? {
              alternates: {
                languages: Object.fromEntries(
                  Object.entries(languages).map(([lang, href]) => [lang, abs(href)]),
                ),
              },
            }
          : {}),
      });
    }
  }
  return entries;
}
