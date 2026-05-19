"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/config/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const items = NAV_GROUPS[0].items.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t bg-background/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(String(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate px-1">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
