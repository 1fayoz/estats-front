import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Faqat ochiq sahifalar. Kabinet ichidagi yo'llar bu yerga tushmaydi —
 * ular sessiyaga bog'liq va qidiruv uchun ma'nosiz.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    // --- 1. O'ZBEKCHA ASOSIY VA BO'LIM SAHIFALARI (Default / UZ) ---
    { url: siteConfig.url, lastModified: now, changeFrequency: "daily", priority: 1.0 },

    // Bepul Kalkulyatorlar va Skanerlar (Eng yuqori qidiruv trafigi)
    { url: `${siteConfig.url}/tekshirish`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/kalkulyator/uzum-komissiya`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/kalkulyator/unit-iqtisodiyot`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kalkulyator/chegirma-narx`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kalkulyator/ombor-zaxirasi`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kalkulyator/drr`, lastModified: now, changeFrequency: "daily", priority: 0.9 },

    // Bozor Kategoriyalari Tahlili (Programmatic Category SEO)
    { url: `${siteConfig.url}/kategoriya/elektronika`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kategoriya/kiyim-va-poyabzal`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kategoriya/gozallik-va-parvarish`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kategoriya/uy-rozgor`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kategoriya/avtotovarlar`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/kategoriya/bolalar-tovarlari`, lastModified: now, changeFrequency: "daily", priority: 0.95 },

    // Amaliy Qo'llanmalar (How-to Guides)
    { url: `${siteConfig.url}/qollanma`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/qollanma/uzumda-dokon-ochish`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/qollanma/kartochka-toldirish`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/qollanma/fbo-fbs-farqi`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/qollanma/boost-top-sozlash`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/qollanma/top-nishalar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // Bozorlar (Marketplace Specific Landing Pages)
    { url: `${siteConfig.url}/bozorlar/wildberries`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/bozorlar/yandex-market`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/bozorlar/ozon`, lastModified: now, changeFrequency: "daily", priority: 0.9 },

    // Muqobillar (Competitor conquesting)
    { url: `${siteConfig.url}/muqobil/zoomselling`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/muqobil/1c`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/muqobil/huntersales`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/muqobil/mpstats`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/muqobil/sellerfox`, lastModified: now, changeFrequency: "daily", priority: 0.85 },

    // Yechimlar (SEO domain pages)
    { url: `${siteConfig.url}/yechimlar/tovar-seo`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/yechimlar/ombor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/moliya`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/bozor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/marketing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/uzum-lens`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/telegram-instagram`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/yechimlar/multi-market`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // Ensiklopediya va Lug'at
    { url: `${siteConfig.url}/lugat`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },

    // --- 2. RUSSIAN LOCALIZED PAGES (/ru) ---
    { url: `${siteConfig.url}/ru`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/ru/tekshirish`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/ru/kalkulyator/uzum-komissiya`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/ru/kalkulyator/unit-iqtisodiyot`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/ru/bozorlar/wildberries`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/ru/bozorlar/yandex-market`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/ru/bozorlar/ozon`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/ru/muqobil/zoomselling`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/ru/muqobil/1c`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteConfig.url}/ru/yechimlar/ombor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/ru/yechimlar/moliya`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/ru/yechimlar/tovar-seo`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },

    // --- 3. ENGLISH LOCALIZED PAGES (/en) ---
    { url: `${siteConfig.url}/en`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/en/tools/product-checker`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/en/tools/commission-calculator`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/en/solutions/marketplace-analytics`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/en/solutions/inventory-management`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/en/solutions/ai-seo`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${siteConfig.url}/en/alternatives/zoomselling`, lastModified: now, changeFrequency: "daily", priority: 0.95 },

    // Huquqiy va boshqa sahifalar
    { url: `${siteConfig.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/lens`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/lens/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
