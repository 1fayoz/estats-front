import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Kabinet sahifalari indekslanmaydi: ular sotuvchining shaxsiy hisoboti va
 * qidiruvda umuman ko'rinmasligi kerak. Ochiq qismi — landing va huquqiy
 * sahifalar.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/warehouse",
          "/intakes",
          "/plan",
          "/expenses",
          "/pnl",
          "/finance",
          "/instagram",
          "/socials",
          "/networks",
          "/marketing",
          "/integrations",
          "/settings",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
