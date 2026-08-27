"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Sahifalar orasidagi yengil o'tish.
 *
 * `key={pathname}` — animatsiya har o'tishda qayta ishlashi uchun: kalit
 * o'zgarmasa React elementni saqlab qoladi va CSS animatsiyasi bir marta,
 * faqat birinchi yuklashda ishlaydi.
 *
 * Ataylab faqat `opacity`: `translate` qo'shilsa kontent har bosishda
 * sakraydi va uzun sahifalarda bu tinchsizlik beradi.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="mx-auto w-full max-w-[1400px] animate-fade-in">
      {children}
    </div>
  );
}
