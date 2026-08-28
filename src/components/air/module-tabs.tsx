"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Bo'lim ichidagi ko'rinishlar qatori — Bitrix24 dagi
 * «Канбан / Список / Дела / Календарь» naqshi.
 *
 * NEGA YON MENYUDAN TASHQARI YANA BU KERAK. Yon menyu MODULLARNI
 * ajratadi (Ombor, Moliya, Bozor), tab qatori esa bitta modul
 * ichidagi ko'rinishlarni. Ikkalasini yon menyuga yig'ish uni
 * cheksiz cho'zadi va «qayerdaman» degan savolni chalkashtiradi:
 * bozorda olti ko'rinish bor va ular bitta ishning turli
 * kesimlari, alohida bo'limlar emas.
 *
 * Davr tanlovi (`?days=`) havolaga KO'CHIRILADI: foydalanuvchi
 * 90 kunni tanlab boshqa ko'rinishga o'tsa, u yerda ham 90 kun
 * qolishi kerak — aks holda har o'tishda qaytadan tanlash kerak
 * bo'lardi.
 */
export type ModuleTab = { href: string; label: string };

export function ModuleTabs({ tabs }: { tabs: ModuleTab[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const days = params.get("days");
  const query = days ? `?days=${days}` : "";

  return (
    <div className="-mx-1 mb-4 flex flex-wrap items-center gap-1 overflow-x-auto pb-0.5">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          // Ichki sahifa (`/market/products/123`) ham o'z tabini
          // yoqilgan holda ko'rsatadi — foydalanuvchi qayerdan
          // kelganini yo'qotmasin.
          (tab.href !== "/market" && pathname.startsWith(`${tab.href}/`));
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${query}`}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13.5px] transition-colors",
              active
                ? "bg-primary/12 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

/** Bozor moduli ko'rinishlari. */
export const MARKET_TABS: ModuleTab[] = [
  { href: "/market", label: "Bozor holati" },
  { href: "/market/niches", label: "Nishalar" },
  { href: "/market/products", label: "Tovarlar" },
  { href: "/market/shops", label: "Do'konlar" },
  { href: "/market/seo", label: "Qidiruv so'rovlari" },
  { href: "/market/source", label: "Ma'lumot manbai" },
];
