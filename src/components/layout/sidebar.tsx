"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { NAV_GROUPS } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <LogoMark size={36} priority className="h-9 w-9" />
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">{siteConfig.name}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            uzum analytics
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-1">
            <div className="px-2 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.title}
            </div>
            {group.items.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(String(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
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

      <div className="mx-3 mb-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-info/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Telegram bot</span>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Hisobotlarni Telegramda oling — har 4 soatda avto yangilanadi.
        </p>
        <button className="mt-3 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          @mystats_bot
        </button>
      </div>
    </aside>
  );
}
