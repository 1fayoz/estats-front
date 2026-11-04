import type { MetadataRoute } from "next";

import { AUTH_PREFIX, DASHBOARD_PREFIX } from "@/config/private-routes";
import { siteConfig } from "@/config/site";

/**
 * Kabinet sahifalari indekslanmaydi: ular sotuvchining shaxsiy hisoboti va
 * qidiruvda umuman ko'rinmasligi kerak. Ochiq qismi — landing, kalkulyator,
 * qo'llanma va huquqiy sahifalar.
 *
 * Yopiq yo'llar — ikkita prefiks (kabinet va kirish), barcha botlar uchun
 * bir xil. Eski manzillar (`/market` va h.k.) shu prefikslarga 301 bilan
 * o'tadi, ya'ni ular ham yopiq qoladi.
 */
const PRIVATE_PATHS = [`${DASHBOARD_PREFIX}/`, `${AUTH_PREFIX}/`, "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "Bytespider",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
