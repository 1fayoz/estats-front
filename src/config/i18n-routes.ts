/**
 * Ochiq sahifalarning tillararo xaritasi — YAGONA manba.
 *
 * Har guruh — bitta sahifaning HAQIQIY tarjimalari (1:1). Faqat mazmuni
 * bir xil bo'lgan sahifalar bitta guruhga tushadi: "yaqin mavzu"
 * yetarli emas. Aks holda Google hreflang'ni o'zaro emas deb topadi va
 * butun guruhni e'tiborsiz qoldiradi (masalan, uchta bozor sahifasi
 * bitta inglizcha sahifaga ko'rsatsa — bu ko'pdan-birga, xato).
 *
 * Shu xaritadan uch joy foydalanadi: sahifa `alternates.languages`
 * (`buildMetadata`), `sitemap.ts` va til almashtirgich. Yangi tarjima
 * qo'shilsa — faqat shu yerga yoziladi.
 */

export type Locale = "uz" | "ru" | "en";

export const LOCALES: readonly Locale[] = ["uz", "ru", "en"];

type RouteGroup = Partial<Record<Locale, string>>;

/** Bir xil slug'li UZ/RU juftlar (RU versiyasi `/ru` + UZ yo'li). */
const UZ_RU = (path: string, en?: string): RouteGroup =>
  en ? { uz: path, ru: `/ru${path}`, en } : { uz: path, ru: `/ru${path}` };

export const I18N_ROUTES: readonly RouteGroup[] = [
  { uz: "/", ru: "/ru", en: "/en" },

  // Kalkulyatorlar
  UZ_RU("/kalkulyator", "/en/tools"),
  UZ_RU("/kalkulyator/uzum-komissiya", "/en/tools/commission-calculator"),
  UZ_RU("/kalkulyator/abc-tahlil", "/en/tools/abc-analysis"),
  UZ_RU("/kalkulyator/shtrix-kod", "/en/tools/barcode-generator"),
  UZ_RU("/tekshirish", "/en/tools/product-checker"),
  UZ_RU("/kalkulyator/unit-iqtisodiyot"),
  UZ_RU("/kalkulyator/rasm-talablari"),
  UZ_RU("/kalkulyator/kargo"),
  UZ_RU("/kalkulyator/soliq"),
  UZ_RU("/kalkulyator/fbo-akt"),
  UZ_RU("/kalkulyator/vozvrat-zarari"),
  UZ_RU("/kalkulyator/chegirma-narx"),
  UZ_RU("/kalkulyator/ombor-zaxirasi"),
  UZ_RU("/kalkulyator/drr"),

  // Toifalar
  UZ_RU("/kategoriya/elektronika", "/en/categories/electronics"),
  UZ_RU("/kategoriya/kiyim-va-poyabzal"),
  UZ_RU("/kategoriya/gozallik-va-parvarish"),
  UZ_RU("/kategoriya/uy-rozgor"),
  UZ_RU("/kategoriya/avtotovarlar"),
  UZ_RU("/kategoriya/bolalar-tovarlari"),

  // Qo'llanmalar
  UZ_RU("/qollanma", "/en/guides"),
  UZ_RU("/qollanma/uzumda-dokon-ochish", "/en/guides/how-to-sell-on-uzum-market"),
  UZ_RU("/qollanma/kartochka-toldirish"),
  UZ_RU("/qollanma/fbo-fbs-farqi"),
  UZ_RU("/qollanma/boost-top-sozlash"),
  UZ_RU("/qollanma/top-nishalar"),

  // Bozorlar — inglizcha tarjimasi YO'Q (marketplace-analytics umumiy sahifa).
  UZ_RU("/bozorlar/wildberries"),
  UZ_RU("/bozorlar/yandex-market"),
  UZ_RU("/bozorlar/ozon"),

  // Muqobillar
  UZ_RU("/muqobil/zoomselling", "/en/alternatives/zoomselling"),
  UZ_RU("/muqobil/1c"),
  UZ_RU("/muqobil/mpstats"),
  UZ_RU("/muqobil/huntersales"),
  UZ_RU("/muqobil/sellerfox"),

  // Yechimlar
  UZ_RU("/yechimlar/ombor", "/en/solutions/inventory-management"),
  UZ_RU("/yechimlar/tovar-seo", "/en/solutions/ai-seo"),
  UZ_RU("/yechimlar/moliya"),
  { uz: "/yechimlar/bozor" },
  { uz: "/yechimlar/marketing" },
  { uz: "/yechimlar/multi-market" },
  { uz: "/yechimlar/telegram-instagram" },
  { uz: "/yechimlar/uzum-lens" },
  // Ko'p bozorli umumiy sharh — UZ/RU da aynan tarjimasi yo'q.
  { en: "/en/solutions/marketplace-analytics" },

  UZ_RU("/lugat"),

  // Huquqiy sahifalar — faqat o'zbekcha.
  { uz: "/lens" },
  { uz: "/lens/privacy" },
  { uz: "/privacy" },
  { uz: "/terms" },
];

/** Yo'lning tili: `/ru...` → ru, `/en...` → en, qolgani — uz. */
export function localeOfPath(path: string): Locale {
  if (path === "/ru" || path.startsWith("/ru/")) return "ru";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "uz";
}

function normalize(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/** Yo'l qaysi guruhga tegishli — topilmasa `undefined`. */
export function routeGroupOf(path: string): RouteGroup | undefined {
  const p = normalize(path);
  return I18N_ROUTES.find((g) => LOCALES.some((l) => g[l] === p));
}

/**
 * `alternates.languages` uchun: faqat haqiqiy tarjima bor tillar.
 * Bitta tilli sahifa uchun hreflang berilmaydi — o'z-o'ziga ko'rsatish
 * ma'nosiz. `x-default` o'zbekcha versiyaga (u bo'lsa).
 */
export function languageAlternates(path: string): Record<string, string> | undefined {
  const group = routeGroupOf(path);
  if (!group) return undefined;
  const langs: Record<string, string> = {};
  for (const l of LOCALES) if (group[l]) langs[l] = group[l]!;
  if (Object.keys(langs).length < 2) return undefined;
  if (group.uz) langs["x-default"] = group.uz;
  return langs;
}

/** Til almashtirgich uchun: shu sahifaning boshqa tildagi manzili. */
export function translatedPath(path: string, target: Locale): string | undefined {
  return routeGroupOf(path)?.[target];
}
