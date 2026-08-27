"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { PermissionModule } from "@/lib/types";

/**
 * Ruxsatlarni belgilash ro'yxati.
 *
 * Katalog backend'dan keladi — kodlar bu yerda yozib qo'yilmaydi.
 * Aks holda front'da ko'rinib turgan, lekin API 403 beradigan
 * (yoki teskarisi — API ochiq, front'da yo'q) bo'lim paydo bo'ladi.
 *
 * `control` belgilanganda `view` avtomatik belgilanadi: "o'zgartira
 * oladi, lekin ko'ra olmaydi" ma'nosiz holat va uni har safar
 * ikkita katakcha bilan qo'lda belgilash — xatoga chorlash.
 * Teskarisi ham: `view` olib tashlansa `control` ham ketadi.
 */
export function PermissionPicker({
  modules,
  value,
  onChange,
  disabled,
}: {
  modules: PermissionModule[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  // Ko'rsatiladigan to'plam — HAQIQATDA ochiq bo'ladiganlari.
  // Saqlangan ro'yxatda `expenses.control` bo'lsa-yu `expenses.view`
  // bo'lmasa, backend baribir ikkalasini ham ochadi. Katakchani
  // bo'sh ko'rsatish — egasiga yolg'on aytish.
  const picked = React.useMemo(() => {
    const set = new Set(value);
    for (const code of value) {
      if (code.endsWith(".control")) {
        set.add(code.replace(/\.control$/, ".view"));
      }
    }
    return set;
  }, [value]);

  const toggle = (code: string) => {
    const next = new Set(picked);
    const base = code.replace(/\.(view|control)$/, "");
    const isControl = code.endsWith(".control");

    if (next.has(code)) {
      next.delete(code);
      if (!isControl) next.delete(`${base}.control`);
    } else {
      next.add(code);
      if (isControl) next.add(`${base}.view`);
    }
    onChange([...next].sort());
  };

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.name}>
          <div className="pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {module.name}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {module.actions.map((action) => {
              const on = picked.has(action.code);
              return (
                <button
                  key={action.code}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(action.code)}
                  aria-pressed={on}
                  className={cn(
                    "flex min-w-0 items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                    on ? "border-primary/50 bg-primary/5" : "hover:bg-accent",
                    disabled && "pointer-events-none opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{action.name}</span>
                    {action.note ? (
                      <span className="block text-xs text-muted-foreground">
                        {action.note}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
