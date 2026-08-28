"use client";

import * as React from "react";
import { Contrast } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Ish maydoni rejimi: oq yoki sayt rangida (shaffof).
 *
 * Nega mavzu almashtirgichdan ALOHIDA: mavzu (yorug'/qorong'i)
 * butun ilovaga tegishli va tizim sozlamasiga ergashadi; bu esa
 * faqat ish maydonining fonini almashtiradi. Ikkalasini bitta
 * tugmaga qo'shish "qorong'i mavzu + oq jadval" kabi ma'noli
 * juftlikni imkonsiz qilardi.
 *
 * Tanlov `localStorage` da: bu bitta brauzerdagi ko'rish
 * qulayligi, hisobning sozlamasi emas — serverga yozishning
 * ma'nosi yo'q.
 */
const KEY = "estats-surface";
type Surface = "solid" | "tinted";

export function useSurface(): [Surface, (value: Surface) => void] {
  const [surface, setSurface] = React.useState<Surface>("solid");

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "tinted" || saved === "solid") setSurface(saved);
    } catch {
      /* shaxsiy oynada localStorage yopiq bo'lishi mumkin */
    }
  }, []);

  const apply = React.useCallback((value: Surface) => {
    setSurface(value);
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* yozib bo'lmasa ham rejim shu seansda ishlaydi */
    }
    document.querySelector(".air-shell")?.setAttribute("data-surface", value);
  }, []);

  React.useEffect(() => {
    document.querySelector(".air-shell")?.setAttribute("data-surface", surface);
  }, [surface]);

  return [surface, apply];
}

export function SurfaceToggle() {
  const [surface, setSurface] = useSurface();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="air-control text-white hover:text-white"
          aria-label="Ish maydoni rejimi"
        >
          <Contrast className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Ish maydoni
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSurface("solid")}>
          <span className="h-4 w-4 shrink-0 rounded border bg-white" />
          <span className="flex min-w-0 flex-col">
            <span>Oq</span>
            <span className="text-[10px] text-muted-foreground">
              Uzun jadval bilan ishlash uchun
            </span>
          </span>
          {surface === "solid" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSurface("tinted")}>
          <span className="h-4 w-4 shrink-0 rounded border border-white/40 bg-gradient-to-br from-indigo-500 to-sky-400" />
          <span className="flex min-w-0 flex-col">
            <span>Sayt rangida</span>
            <span className="text-[10px] text-muted-foreground">
              Shaffof — fon ko&apos;rinib turadi
            </span>
          </span>
          {surface === "tinted" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
