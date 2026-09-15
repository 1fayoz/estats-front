"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { mediaUrl } from "@/lib/api";

export interface LightboxItem {
  url: string;
  /** Rasm ostidagi yozuv: qaysi joy uchun (masalan «Tavsif uchun · 2/4»). */
  caption: string;
}

/**
 * Rasmni katta ko'rish — bir nechta rasm orasida ‹ › va klaviatura
 * strelkalari bilan yuriladi.
 *
 * Sotuvchi talabi (2026-09-15): tavsif va bo'limlar uchun yasalgan
 * alohida kadrlar ham galereya kabi kattalashtirib ko'rilsin — ular
 * kichik ko'rinishda yozuvlari o'qilmaydi, sifati esa joylashdan
 * oldin aynan shu yozuvlar bo'yicha tekshiriladi.
 */
export function ImageLightbox({
  items,
  index,
  onIndex,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndex: (next: number | null) => void;
}) {
  const count = items.length;
  const current = index !== null ? items[index] : undefined;
  const step = React.useCallback(
    (delta: number) => {
      if (index === null || count < 2) return;
      onIndex((index + delta + count) % count);
    },
    [index, count, onIndex],
  );

  React.useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  return (
    <Dialog open={current !== undefined} onOpenChange={(open) => !open && onIndex(null)}>
      <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">{current?.caption ?? "Rasm"}</DialogTitle>
        {current && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(current.url)}
              alt={current.caption}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Oldingi rasm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Keyingi rasm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <p className="mt-2 text-center text-sm text-white drop-shadow">
              {current.caption}
              {count > 1 && <span className="ml-2 opacity-70">({(index ?? 0) + 1}/{count})</span>}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
