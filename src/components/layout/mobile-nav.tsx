"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Boxes, Calculator, LayoutGrid, SearchCheck, Share2, X } from "lucide-react";

import { visibleNav } from "@/config/nav";
import { useActions } from "@/stores/user-store";
import { cn } from "@/lib/utils";

/**
 * Telefondagi pastki menyu.
 *
 * Ilgari bu yerda `NAV_GROUPS[0]` — ya'ni faqat "Ombor" guruhi turardi
 * va u ikkitagina bo'limdan iborat. Natijada telefondan Moliya, SEO,
 * Reja va qolgan hamma bo'limga UMUMAN kirib bo'lmasdi: yon panel
 * `lg:` dan pastda yashiringan.
 *
 * Endi pastda eng ko'p ochiladigan to'rttasi turadi, beshinchi tugma
 * esa qolganini to'liq ro'yxat bilan ochadi.
 */
const QUICK: {
  label: string;
  href: Route;
  icon: typeof Boxes;
  action: string;
}[] = [
  { label: "Tovarlar", href: "/warehouse" as Route, icon: Boxes, action: "warehouse.view" },
  { label: "Foyda", href: "/pnl" as Route, icon: Calculator, action: "pnl.view" },
  { label: "SEO", href: "/seo" as Route, icon: SearchCheck, action: "seo.view" },
  { label: "Tarmoq", href: "/socials" as Route, icon: Share2, action: "socials.view" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const actions = useActions();
  const groups = visibleNav(actions);
  // Ruxsati yo'q tugma pastdan olib tashlanadi. Qatorda bo'sh joy
  // qolmasin uchun o'rniga to'liq ro'yxatdagi keyingisi keladi.
  const allowed = new Set(actions);
  const quick = QUICK.filter((item) => allowed.has(item.action));
  const extra = groups
    .flatMap((group) => group.items)
    .filter((item) => !QUICK.some((q) => q.href === item.href));
  const bottom = [...quick, ...extra].slice(0, 4);

  // Sahifa almashsa ro'yxat yopilsin — aks holda yangi sahifa
  // ustida osilib qoladi.
  React.useEffect(() => setOpen(false), [pathname]);

  // Ro'yxat ochiq turganda orqa fon surilmasin.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const quickActive = bottom.some((item) => isActive(item.href));

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Yopish"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto rounded-t-2xl border-t bg-background pb-[calc(env(safe-area-inset-bottom)+5rem)]">
            <div className="sticky top-0 flex items-center justify-between border-b bg-background px-5 py-3.5">
              <span className="text-sm font-semibold">Bo&apos;limlar</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="-mr-2 rounded-lg p-2 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 py-2">
              {groups.map((group) => (
                <div key={group.title} className="py-2">
                  <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {group.title}
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-start gap-3 rounded-xl px-2 py-2.5",
                        isActive(item.href) ? "bg-primary/10 text-primary" : "text-foreground"
                      )}
                    >
                      <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                          {item.label}
                          {item.badge ? (
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] uppercase text-primary">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {bottom.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors",
              isActive(item.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate px-1">{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors",
            open || !quickActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="truncate px-1">Yana</span>
        </button>
      </nav>
    </>
  );
}
