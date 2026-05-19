export const siteConfig = {
  name: "MyStats",
  tagline: "Uzum Market uchun professional analitika",
  description:
    "Mahsulotlar, sotuvlar, raqobatchilar va kalit so'zlar bo'yicha to'liq analitika. Uzum komissiyalarini hisoblang, foydani kuzating.",
  url: "https://mystats.uz",
  locale: "uz",
} as const;

export type SiteConfig = typeof siteConfig;
