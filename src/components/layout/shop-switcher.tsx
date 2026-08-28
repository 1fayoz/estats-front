"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveShop, useShops, useUserStore } from "@/stores/user-store";
import { cn } from "@/lib/utils";

/**
 * Switches which shop the whole app is showing.
 *
 * Changing shops changes the `X-Shop-Id` on every subsequent request, so the page
 * is reloaded rather than patched: every in-memory store (goods, P&L, intakes)
 * holds the previous shop's numbers, and showing one shop's costs under another
 * shop's name would be worse than a blink.
 */
export function ShopSwitcher() {
  const router = useRouter();
  const shops = useShops();
  const active = useActiveShop();
  const setActiveShop = useUserStore((s) => s.setActiveShop);

  const onSelect = (shopId: number) => {
    if (active?.id === shopId) return;
    setActiveShop(shopId);
    // Butun ilova holatini yangi magazin bilan qaytadan yuklaymiz.
    window.location.reload();
  };

  if (!shops.length) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/integrations")}>
        <Plus className="h-3.5 w-3.5" /> Magazin qo'shish
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="air-control max-w-[220px] justify-between gap-2 text-white hover:text-white">
          <span className="flex min-w-0 items-center gap-2">
            <Store className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate">{active?.name ?? "Magazin tanlang"}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Magazinlar ({shops.length})
        </DropdownMenuLabel>
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => onSelect(shop.id)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm">{shop.name}</span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                #{shop.shopId}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {!shop.hasToken && (
                <Badge variant="secondary" className="text-[10px]">
                  token yo&apos;q
                </Badge>
              )}
              <Check
                className={cn(
                  "h-4 w-4",
                  active?.id === shop.id ? "opacity-100 text-primary" : "opacity-0"
                )}
              />
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/integrations")}>
          <Plus className="h-3.5 w-3.5" /> Yangi magazin qo&apos;shish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
