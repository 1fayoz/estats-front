"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Modal — Bitrix24 naqshi bo'yicha.
 *
 * O'lchangan qiymatlar (`popup-window`):
 *   fon      #fff
 *   radius   18px
 *   soya     rgba(0,0,0,.21) 0 8px 17px
 *   sarlavha chapda, × o'ngda
 *   ost qism yashil asosiy tugma (markazda), bekor qilish yonida,
 *            o'ngda esa "zavod holatiga" kabi uchinchi darajali amal
 *
 * Ost qismning shu tuzilishi ataylab: asosiy amal MARKAZDA turadi
 * va ko'z uni birinchi topadi; xavfsiz bekor qilish yonida;
 * kamdan-kam kerak bo'ladigan "tiklash" esa chetda, tasodifan
 * bosilmaydigan joyda.
 */
export function AirModal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 900,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  // Escape bilan yopish — modal ochilganda hujjat darajasida.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Ostidagi sahifa aylanmasin: modal ochiq turganda orqadagi
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1a1550]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "air-modal relative flex max-h-[86svh] w-full flex-col overflow-hidden",
          "rounded-[18px] bg-card text-card-foreground shadow-[0_8px_17px_rgba(0,0,0,0.21)]"
        )}
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
          <div className="text-[17px] font-semibold leading-snug">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="-mr-1 -mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center gap-3 border-t px-6 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}
