"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Moon, Search, Settings, Store, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { username, storeName, signOut } = useUserStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const initials = (storeName || username || "MS")
    .split(/[\s_]/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden flex-col md:flex">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {pathname.startsWith("/dashboard") && pathname !== "/dashboard" ? "Bo'lim" : "Dashboard"}
          </span>
          <h1 className="truncate text-lg font-semibold leading-tight">{getPageTitle(pathname)}</h1>
        </div>

        <div className="relative ml-auto hidden w-full max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mahsulot, kalit so'z yoki raqobatchini qidiring..."
            className="h-9 pl-9"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
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
                <span className="text-xs font-semibold">@{username ?? "guest"}</span>
                <span className="text-[10px] text-muted-foreground">Premium seller</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{storeName ?? username}</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  Uzum Market do'koni
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Store className="h-4 w-4" /> Do'kon profili
              <Badge variant="info" className="ml-auto">live</Badge>
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
