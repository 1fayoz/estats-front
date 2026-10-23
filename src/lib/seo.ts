import type { Metadata } from "next";

import { languageAlternates, localeOfPath, type Locale } from "@/config/i18n-routes";
import { siteConfig } from "@/config/site";

/** Ulashish rasmi. Shaffof EMAS — har xizmat uni o'z foniga qo'yadi. */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: siteConfig.name } as const;

const OG_LOCALE: Record<Locale, string> = { uz: "uz_UZ", ru: "ru_RU", en: "en_US" };

type BuildMetadataInput = {
  /** Brendsiz sarlavha: " · eStats" ni ildiz `title.template` o'zi qo'shadi. */
  title: string;
  description: string;
  /** Sahifaning o'z yo'li — kanonik va hreflang shundan yasaladi. */
  path: string;
  /** Berilmasa yo'ldan aniqlanadi (`/ru` → ru, `/en` → en). */
  locale?: Locale;
  keywords?: string[];
  /** Ijtimoiy tarmoq uchun alohida sarlavha/tavsif (bo'lmasa asosiysi). */
  ogTitle?: string;
  ogDescription?: string;
  type?: "website" | "article";
  /** Bosh sahifalar uchun: sarlavha brendni o'zi o'z ichiga oladi, shablon qo'llanmaydi. */
  absoluteTitle?: boolean;
};

/**
 * Ochiq sahifa metadata'si — bitta joyda.
 *
 * Nega kerak: Next bola sahifadagi `openGraph`/`twitter` ni ota bilan
 * BIRLASHTIRMAYDI, butunlay almashtiradi. Sahifa faqat `openGraph.title`
 * bersa, `og:image` yo'qolardi, `twitter:title` esa bosh sahifaniki
 * bo'lib qolardi. Shu yordamchi har safar to'liq to'plamni beradi.
 */
export function buildMetadata({
  title,
  description,
  path,
  locale = localeOfPath(path),
  keywords,
  ogTitle,
  ogDescription,
  type = "website",
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const socialTitle = ogTitle ?? (absoluteTitle ? title : `${title} · ${siteConfig.name}`);
  const socialDescription = ogDescription ?? description;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: path,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      locale: OG_LOCALE[locale],
      url: path,
      siteName: siteConfig.name,
      title: socialTitle,
      description: socialDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [OG_IMAGE.url],
    },
  };
}
