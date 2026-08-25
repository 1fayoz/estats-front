"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Moon, Settings, Store, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/stores/user-store";
import { ShopSwitcher } from "./shop-switcher";
import { ALL_NAV_ITEMS } from "@/config/nav";

function getPageTitle(pathname: string): string {
  const match = ALL_NAV_ITEMS.find((n) =>
    n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(String(n.href))
  );
  return match?.label ?? "Dashboard";
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const displayName = user?.fullName || user?.email || "eStats";
  const initials = displayName
    .split(/[\s_@.]/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden min-w-0 flex-col md:flex">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Bo&apos;lim
          </span>
          <h1 className="truncate text-lg font-semibold leading-tight">{getPageTitle(pathname)}</h1>
        </div>

        {/* Magazin almashtirgich — butun ilova qaysi magazinni ko'rsatayotgani
            har doim ko'rinib tursin. */}
        <div className="ml-auto">
          <ShopSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Theme toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative" aria-label="Bildirishnomalar">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border bg-card p-1 pr-3 transition-colors hover:bg-accent">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-info text-[10px] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-none sm:flex">
                <span className="max-w-[140px] truncate text-xs font-semibold">{displayName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {user?.shops.length ?? 0} ta magazin
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="truncate">{displayName}</span>
                <span className="truncate text-[10px] font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/integrations")}>
              <Store className="h-4 w-4" /> Magazinlar
              <Badge variant="info" className="ml-auto">{user?.shops.length ?? 0}</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4" /> Sozlamalar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" /> Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
