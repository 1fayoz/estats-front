"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";

import { localeOfPath, translatedPath, type Locale } from "@/config/i18n-routes";

export type { Locale };

interface LanguageOption {
  code: Locale;
  label: string;
  shortLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "uz", label: "O‘zbekcha", shortLabel: "UZ", flag: "🇺🇿" },
  { code: "ru", label: "Русский", shortLabel: "RU", flag: "🇷🇺" },
  { code: "en", label: "English", shortLabel: "EN", flag: "🇬🇧" },
];

const LOCALE_HOME: Record<Locale, string> = { uz: "/", ru: "/ru", en: "/en" };

/**
 * Shu sahifaning boshqa tildagi manzili — `src/config/i18n-routes.ts`
 * xaritasidan. Tarjimasi yo'q sahifa uchun o'sha tilning bosh sahifasi:
 * ilgari `/en` + UZ yo'li yasalib, 404 ga olib borardi.
 */
function getEquivalentPath(pathname: string, targetLocale: Locale): string {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  if (localeOfPath(cleanPath) === targetLocale) return cleanPath;
  return translatedPath(cleanPath, targetLocale) ?? LOCALE_HOME[targetLocale];
}

/**
 * `variant="inline"` — oddiy havolalar qatori (footer uchun). Ochiladigan
 * menyu ham havolalarini DOM'da doim saqlaydi (`hidden` bilan): ilgari ular
 * faqat ochilganda chizilardi va qidiruv boti tarjimalarni ko'rmasdi.
 */
export function LanguageSwitcher({
  className,
  variant = "dropdown",
}: {
  className?: string;
  variant?: "dropdown" | "inline";
}) {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Determine current active locale
  const currentLocale = localeOfPath(pathname);

  const currentOption =
    LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "inline") {
    return (
      <nav aria-label="Til / Язык / Language" className={`flex items-center gap-2 text-xs ${className || ""}`}>
        {LANGUAGES.map((lang, i) => (
          <React.Fragment key={lang.code}>
            {i > 0 && <span aria-hidden="true" className="text-muted-foreground">|</span>}
            <Link
              href={getEquivalentPath(pathname, lang.code)}
              hrefLang={lang.code}
              lang={lang.code}
              aria-current={lang.code === currentLocale ? "page" : undefined}
              className={lang.code === currentLocale ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}
            >
              {lang.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className || ""}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/80 shadow-xs backdrop-blur-xs transition hover:bg-accent hover:text-foreground focus:outline-hidden"
        aria-label="Tilni tanlash / Выбор языка / Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {currentOption.flag}
        </span>
        <span className="font-semibold tracking-wide uppercase">
          {currentOption.shortLabel}
        </span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        hidden={!isOpen}
        className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-2xl border border-border/80 bg-card p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
      >
        <div className="py-0.5" role="menu">
          {LANGUAGES.map((lang) => {
            const targetUrl = getEquivalentPath(pathname, lang.code);
            const isActive = lang.code === currentLocale;

            return (
              <Link
                key={lang.code}
                href={targetUrl}
                hrefLang={lang.code}
                onClick={() => setIsOpen(false)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
