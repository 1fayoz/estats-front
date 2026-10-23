import type { Locale } from "@/config/i18n-routes";
import { ArticleSchema } from "@/components/seo/structured-data";

const LABELS: Record<Locale, { published: string; modified: string; intl: string }> = {
  uz: { published: "Chop etilgan", modified: "Yangilangan", intl: "uz-UZ" },
  ru: { published: "Опубликовано", modified: "Обновлено", intl: "ru-RU" },
  en: { published: "Published", modified: "Updated", intl: "en-US" },
};

/** `2026-09-25` → "25.09.2026" — Intl'ga bog'lanmaymiz: Node'da `uz` lokali to'liq emas. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Qo'llanma sanasi: sahifada ko'rinadigan qator + `Article` JSON-LD.
 * Ikkalasi bitta joydan olinadi — sxemadagi sana matndagidan farq qilmasin.
 * Sana — mazmun haqiqatda o'zgargan kun (git tarixi), deploy kuni emas.
 */
export function ArticleMeta({
  headline,
  description,
  url,
  datePublished,
  dateModified = datePublished,
  locale = "uz",
}: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  locale?: Locale;
}) {
  const t = LABELS[locale];
  return (
    <>
      <ArticleSchema
        headline={headline}
        description={description}
        url={url}
        datePublished={datePublished}
        dateModified={dateModified}
        inLanguage={locale}
      />
      <p className="text-xs text-muted-foreground">
        {t.published}: <time dateTime={datePublished}>{formatDate(datePublished)}</time>
        {dateModified !== datePublished && (
          <>
            {" · "}
            {t.modified}: <time dateTime={dateModified}>{formatDate(dateModified)}</time>
          </>
        )}
      </p>
    </>
  );
}
