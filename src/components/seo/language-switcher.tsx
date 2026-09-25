"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";

export type Locale = "uz" | "ru" | "en";

interface LanguageOption {
  code: Locale;
  label: string;
  shortLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "uz", label: "O'zbekcha", shortLabel: "UZ", flag: "🇺🇿" },
  { code: "ru", label: "Русский", shortLabel: "RU", flag: "🇷🇺" },
  { code: "en", label: "English", shortLabel: "EN", flag: "🇬🇧" },
];

function getEquivalentPath(pathname: string, targetLocale: Locale): string {
  // Normalize pathname
  const cleanPath = pathname.replace(/\/$/, "") || "/";

  // Check current locale
  let currentLocale: Locale = "uz";
  let basePath = cleanPath;

  if (cleanPath === "/ru" || cleanPath.startsWith("/ru/")) {
    currentLocale = "ru";
    basePath = cleanPath.slice(3) || "/";
  } else if (cleanPath === "/en" || cleanPath.startsWith("/en/")) {
    currentLocale = "en";
    basePath = cleanPath.slice(3) || "/";
  }

  if (targetLocale === currentLocale) {
    return cleanPath;
  }

  // Cross-language route mapping
  const routeMap: Record<string, { uz: string; ru: string; en: string }> = {
    "/": {
      uz: "/",
      ru: "/ru",
      en: "/en",
    },
    "/tekshirish": {
      uz: "/tekshirish",
      ru: "/ru/tekshirish",
      en: "/en/tools/product-checker",
    },
    "/kalkulyator/uzum-komissiya": {
      uz: "/kalkulyator/uzum-komissiya",
      ru: "/ru/kalkulyator/uzum-komissiya",
      en: "/en/tools/commission-calculator",
    },
    "/kalkulyator/unit-iqtisodiyot": {
      uz: "/kalkulyator/unit-iqtisodiyot",
      ru: "/ru/kalkulyator/unit-iqtisodiyot",
      en: "/en/tools/commission-calculator",
    },
    "/bozorlar/wildberries": {
      uz: "/bozorlar/wildberries",
      ru: "/ru/bozorlar/wildberries",
      en: "/en/solutions/marketplace-analytics",
    },
    "/bozorlar/yandex-market": {
      uz: "/bozorlar/yandex-market",
      ru: "/ru/bozorlar/yandex-market",
      en: "/en/solutions/marketplace-analytics",
    },
    "/bozorlar/ozon": {
      uz: "/bozorlar/ozon",
      ru: "/ru/bozorlar/ozon",
      en: "/en/solutions/marketplace-analytics",
    },
    "/muqobil/zoomselling": {
      uz: "/muqobil/zoomselling",
      ru: "/ru/muqobil/zoomselling",
      en: "/en/alternatives/zoomselling",
    },
    "/muqobil/1c": {
      uz: "/muqobil/1c",
      ru: "/ru/muqobil/1c",
      en: "/en/solutions/inventory-management",
    },
    "/yechimlar/ombor": {
      uz: "/yechimlar/ombor",
      ru: "/ru/yechimlar/ombor",
      en: "/en/solutions/inventory-management",
    },
    "/yechimlar/tovar-seo": {
      uz: "/yechimlar/tovar-seo",
      ru: "/ru/yechimlar/tovar-seo",
      en: "/en/solutions/ai-seo",
    },
    "/yechimlar/moliya": {
      uz: "/yechimlar/moliya",
      ru: "/ru/yechimlar/moliya",
      en: "/en/solutions/marketplace-analytics",
    },
  };

  // Check known mapped route
  const currentKey = Object.keys(routeMap).find(
    (key) => key === basePath || (basePath === "/" && key === "/")
  );

  if (currentKey && routeMap[currentKey]) {
    return routeMap[currentKey][targetLocale];
  }

  // Fallback translation strategy
  if (targetLocale === "uz") {
    return basePath || "/";
  } else if (targetLocale === "ru") {
    return `/ru${basePath === "/" ? "" : basePath}`;
  } else {
    return `/en${basePath === "/" ? "" : basePath}`;
  }
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Determine current active locale
  let currentLocale: Locale = "uz";
  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    currentLocale = "ru";
  } else if (pathname === "/en" || pathname.startsWith("/en/")) {
    currentLocale = "en";
  }

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

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-36 origin-top-right rounded-2xl border border-border/80 bg-card p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
          <div className="py-0.5" role="menu">
            {LANGUAGES.map((lang) => {
              const targetUrl = getEquivalentPath(pathname, lang.code);
              const isActive = lang.code === currentLocale;

              return (
                <Link
                  key={lang.code}
                  href={targetUrl}
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
      )}
    </div>
  );
}
