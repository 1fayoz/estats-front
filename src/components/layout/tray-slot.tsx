"use client";

/*
 * Burchakdagi YAGONA fon ishlari paneli uchun slot (2026-09-30, sotuvchi:
 * «ikkita panel bir-birining ustiga tushib qolgan, UI ham har xil»).
 *
 * Ilgari uchta mustaqil `fixed` panel bor edi — fon ishlari (layout), AI
 * qoralamalar va operatorga yozish (sahifalar) — har biri o'z joyi va o'z
 * uslubida, bir-birini yopib qo'yardi. Endi joy BITTA: `BroadcastTray`
 * (layout) slot elementini beradi, sahifalardagi bo'limlar unga `TraySection`
 * bilan PORTAL orqali qo'shiladi. Portal React daraxtida sahifa ichida qoladi
 * (hodisalar, kontekst, unmount — o'zi), faqat DOM'da panelda chiziladi —
 * `TopbarSlot` (§9.5) bilan bir xil naqsh. Yig'ish tugmasi ham bitta.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

import { cn } from "@/lib/utils";

/** Paneldagi har bir kartaning YAGONA ko'rinishi. */
export const TRAY_CARD = "pointer-events-auto w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg";

type TrayState = {
  node: HTMLElement | null;
  sections: number;
  open: boolean;
  setNode: (node: HTMLElement | null) => void;
  add: () => void;
  remove: () => void;
  setOpen: (open: boolean) => void;
};

export const useTrayStore = create<TrayState>((set) => ({
  node: null,
  sections: 0,
  open: true,
  setNode: (node) => set({ node }),
  add: () => set((s) => ({ sections: s.sections + 1 })),
  remove: () => set((s) => ({ sections: Math.max(0, s.sections - 1) })),
  setOpen: (open) => set({ open }),
}));

/** Sahifadagi bo'lim — burchakdagi panelga karta bo'lib qo'shiladi. */
export function TraySection({ children, className }: { children: React.ReactNode; className?: string }) {
  const node = useTrayStore((s) => s.node);
  const open = useTrayStore((s) => s.open);
  const add = useTrayStore((s) => s.add);
  const remove = useTrayStore((s) => s.remove);
  React.useEffect(() => {
    add();
    return remove;
  }, [add, remove]);
  if (!node || !open) return null;
  return createPortal(<div className={cn(TRAY_CARD, className)}>{children}</div>, node);
}
