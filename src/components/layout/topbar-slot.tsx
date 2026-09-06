"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * Yuqori qatorning (Topbar) chap tomoniga sahifa o'z tugmasini
 * qo'ya oladigan joy.
 *
 * Nega portal, nega store emas. Yuqori qator LAYOUT'da turadi
 * (`(dashboard)/layout.tsx`), sahifa esa uning ichida — ya'ni
 * sahifa uni to'g'ridan-to'g'ri to'ldira olmaydi. Zustand orqali
 * ReactNode uzatish ham mumkin edi, lekin u holda tugmaning
 * hodisalari (Link, onClick) sahifaning O'Z daraxtidan uzilib
 * qolardi va tozalash qo'lda qilinishi kerak bo'lardi. Portal
 * esa React daraxtida sahifaning ICHIDA qoladi (kontekst,
 * hodisalar, unmount — hammasi o'zi ishlaydi), faqat DOM'da
 * boshqa joyda chiziladi.
 *
 * Slot BO'SH bo'lsa yuqori qatorda hech nima ko'rinmaydi —
 * `#topbar-slot` bo'sh `div` bo'lib qoladi va joy egallamaydi.
 */
export const TOPBAR_SLOT_ID = "topbar-slot";

export function TopbarSlot({ children }: { children: React.ReactNode }) {
  const [host, setHost] = React.useState<HTMLElement | null>(null);

  // Birinchi renderда `document` yo'q (SSR) va idish hali DOM'ga
  // qo'yilmagan. Effekt esa DOM tayyor bo'lgandan KEYIN ishlaydi:
  // layout (Topbar) sahifadan oldin chiziladi, shuning uchun bu
  // yerda idish albatta topiladi.
  React.useEffect(() => {
    setHost(document.getElementById(TOPBAR_SLOT_ID));
  }, []);

  if (!host) return null;
  return createPortal(children, host);
}
