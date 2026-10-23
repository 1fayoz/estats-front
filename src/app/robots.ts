import type { MetadataRoute } from "next";

import { PRIVATE_ROUTE_SEGMENTS } from "@/config/private-routes";
import { siteConfig } from "@/config/site";

/**
 * Kabinet sahifalari indekslanmaydi: ular sotuvchining shaxsiy hisoboti va
 * qidiruvda umuman ko'rinmasligi kerak. Ochiq qismi — landing, kalkulyator,
 * qo'llanma va huquqiy sahifalar.
 *
 * Yopiq yo'llar BITTA ro'yxatda va barcha botlar uchun bir xil. Ilgari AI
 * botlar guruhida alohida ro'yxat va `Allow: /market/*` turardi — `/market`
 * esa kabinet (login ortida), ochiq sahifa emas.
 */
const PRIVATE_PATHS = [...PRIVATE_ROUTE_SEGMENTS.map((s) => `/${s}`), "/api/"];

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
