"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Building2, Check, LogOut, Moon, Settings, Store, Sun } from "lucide-react";
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
import { SurfaceToggle } from "./surface-toggle";

export function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);
  const setWorkspace = useUserStore((s) => s.setWorkspace);
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
    <header className="air-topbar sticky top-0 z-30 flex h-16 items-center gap-4 px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Magazin almashtirgich — butun ilova qaysi magazinni ko'rsatayotgani
            har doim ko'rinib tursin. Har sahifaning o'z sarlavhasi
            (PageHeader) allaqachon bor — bu yerda "Bo'lim / <nom>" ni
            takrorlash keraksiz va sahifa sarlavhasidan farqli nom
            ko'rsatib chalkashtirardi (masalan "Tovarlar" vs "Ombor"). */}
        <div className="ml-auto">
          <ShopSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SurfaceToggle />

        <Button
          variant="ghost"
          size="icon"
          className="air-control text-white hover:text-white"
          aria-label="Theme toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="air-control relative text-white hover:text-white" aria-label="Bildirishnomalar">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff5752] ring-2 ring-[#3b37a0]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="air-control flex items-center gap-2 rounded-full p-1 pr-3 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-info text-[10px] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-none sm:flex">
                <span className="max-w-[140px] truncate text-xs font-semibold">{displayName}</span>
                <span className="max-w-[140px] truncate text-[10px] text-white/55">
                  {user && user.isOwner === false
                    ? `${user.workspace?.name ?? ""} hisobida`
                    : `${user?.shops.length ?? 0} ta magazin`}
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
            {(user?.workspaces?.length ?? 0) > 1 ? (
              <>
                <DropdownMenuSeparator />
                {/* Odam bir vaqtda o'z do'koniga ega bo'lib, boshqa
                    hisobga ham taklif qilingan bo'lishi mumkin —
                    almashtirgichsiz ikkinchisiga umuman yetib
                    bo'lmasdi. */}
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Hisob
                </DropdownMenuLabel>
                {user?.workspaces?.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      if (ws.id === user?.workspace?.id) return;
                      setWorkspace(ws.id);
                      // To'liq qayta yuklash: har sahifadagi
                      // ma'lumot eski hisobniki va uni birma-bir
                      // tozalashdan ko'ra shu ishonchliroq.
                      //
                      // Manzil "/" EMAS — u landing sahifasi va
                      // kirgan odamni tashqariga chiqarib yuborardi.
                      // Kabinet ichidagi sahifa berilsa, `AuthGuard`
                      // yangi hisobning ruxsatiga qarab kerakli
                      // joyga o'zi yo'naltiradi.
                      window.location.assign("/warehouse");
                    }}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{ws.name}</span>
                    {ws.id === user?.workspace?.id ? (
                      <Check className="ml-auto h-3.5 w-3.5" />
                    ) : !ws.isOwner ? (
                      <Badge variant="outline" className="ml-auto text-[9px]">
                        mehmon
                      </Badge>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}
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
