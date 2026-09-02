"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Katta oyna — Bitrix24 dagi «side panel» naqshi.
 *
 * Namuna: «Создание сделки». Qiymatlar o'sha sahifada brauzerda
 * O'LCHANGAN (`globals.css` dagi "BITRIX24 SIDE PANEL" izohida
 * ro'yxati bor):
 *
 *   · yon menyudan keyin boshlanadi, o'ng chetgacha cho'ziladi;
 *   · tepadan 16px, pastga TEGIB turadi — markazda suzmaydi;
 *   · faqat yuqori burchaklari yumaloq (18px), soya yo'q;
 *   · ichi KULRANG kanvas, uning ustida OQ kartalar;
 *   · yopish tugmasi sarlavhada emas, panelning CHAP chetida,
 *     tashqarida turgan yorliqda.
 *
 * NEGA MARKAZDAGI KICHIK OYNA EMAS. Bu yerda uzun forma, tablar
 * va yon ustun bor. Markazdagi oyna ularni ikki barobar tor
 * joyga siqadi va foydalanuvchi ichkarida ham, tashqarida ham
 * aylantirishga majbur bo'ladi — ikkita aylantirish maydoni esa
 * eng bezovta qiladigan holat.
 *
 * `AirModal` (kichik markazdagi oyna) O'RNINI BOSMAYDI: sozlamalar
 * kabi ikki qatorli savol uchun butun ekranni egallash ortiqcha.
 */
export function AirSlider({
  open,
  onClose,
  title,
  subheader,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Sarlavha ostidagi qatlam: bosqichlar chizig'i va tablar. */
  subheader?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Ostidagi sahifa aylanmasin: panel ochiq turganda orqadagi
    // uzun jadval aylanib ketsa, yopilgandan keyin foydalanuvchi
    // boshqa joyda qolib ketadi.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[#1a1550]/35"
        onClick={onClose}
        aria-hidden
      />

      {/* Yopish yorlig'i panelning TASHQARISIDA, chap chetida —
          namunadagi kabi. Sarlavhada × yo'q: u yerda faqat sarlavha
          turadi va ko'z uni bir qarashda o'qiydi.

          ATAYLAB panel <div>ning TASHQARISIDA (shu darajada, uning
          birodari): panel `overflow-hidden` tashiydi (ichidagi
          aylantiruvchi bo'limlarni kesish uchun kerak) va manfiy
          joylashuv (`-left-11` — panelning O'Z chetidan tashqarida)
          o'sha overflow tomonidan KESIB tashlanardi — tugma kodda
          bor edi-yu, hech qachon ko'rinmasdi, sotuvchi faqat
          pastdagi "Yopish" tugmasini ko'rardi. Endi koordinata
          panelga NISBATAN emas, ekranga nisbatan: `lg:left-64`
          (panelning chap cheti) minus tugma kengligi. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Yopish"
        className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-[color:var(--air-head)] transition-colors hover:bg-black/5 lg:left-[13.25rem] lg:right-auto lg:top-4 lg:bg-white/15 lg:text-white lg:hover:bg-white/25"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Panel: yon menyudan keyin, pastga tegib turadi. */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "air-slider absolute inset-x-0 bottom-0 top-3 flex flex-col overflow-hidden",
          "rounded-t-[18px] lg:left-64 lg:top-4",
        )}
      >
        <div className="px-5 pt-5">
          <div className="text-[25px] font-medium leading-tight tracking-tight">
            {title}
          </div>
        </div>

        {subheader && <div className="space-y-3 px-5 pt-4">{subheader}</div>}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">{children}</div>

        {footer && (
          <div
            className="flex flex-wrap items-center gap-3 px-5 py-3"
            style={{ background: "var(--air-card)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
