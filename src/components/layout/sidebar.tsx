"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { visibleNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useActions } from "@/stores/user-store";

export function Sidebar() {
  const pathname = usePathname();
  // Menyu ruxsat bo'yicha yig'iladi: ochib bo'lmaydigan bo'lim
  // ko'rinib turishi — bosib, 403 olib, "buzuq" degan taassurot.
  const groups = visibleNav(useActions());

  // Faol band — ENG UZUN mos kelgan yo'l bo'yicha, hammasi orasidan
  // bittasi. Oddiy `startsWith` bilan "/market" ("Bozor holati")
  // "/market/shops" ("Do'konlar") sahifasida ham faol bo'lib qolardi
  // — ikkalasi baravar yorishardi. Yo'l chegarasi ("/" bilan tugashi
  // yoki teng bo'lishi) ham SHART: aks holda "/market" "/marketing"da
  // ham "mos keladi" deb hisoblanardi.
  const bestHref = React.useMemo(() => {
    const hrefs = groups.flatMap((g) => g.items.map((i) => String(i.href)));
    return hrefs
      .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0];
  }, [groups, pathname]);

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <LogoMark size={36} priority className="h-9 w-9" />
        <span className="text-sm font-bold tracking-tight">{siteConfig.name}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.title} className="mb-1">
            <div className="air-nav-group px-3 pb-1.5 pt-4">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = String(item.href) === bestHref;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-active={active}
                  className="air-nav-item group relative flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <item.icon
                    className="h-[18px] w-[18px] shrink-0 opacity-90"
                  />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="default" className="h-4 px-1.5 text-[9px] font-bold uppercase">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="air-panel mx-3 mb-3 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Telegram bot</span>
        </div>
        <p className="text-[11px] leading-snug text-white/60">
          Buyurtma tushganda va bekor bo&apos;lganda darhol xabar keladi.
        </p>
        <a
          href={siteConfig.botUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="air-btn-accent mt-3 block w-full px-3 py-1.5 text-center text-xs font-medium transition-[filter]"
        >
          @{siteConfig.botUsername}
        </a>
      </div>
    </aside>
  );
}
