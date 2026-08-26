"use client";

import * as React from "react";
import { History, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SeoRun } from "@/lib/types";

/**
 * Tahlillar tarixi.
 *
 * Sukut bo'yicha OXIRGISI ochiladi — eng ko'p kerak bo'ladigan holat
 * shu. Eskisini tanlash matnni o'zgartirgandan keyin "nima o'zgardi"
 * degan savolga javob beradi: ball o'sdimi, qaysi kalit so'zlar
 * qo'shildi.
 */
export function RunPicker({
  runs,
  activeId,
  onPick,
}: {
  runs: SeoRun[];
  activeId: number | null;
  onPick: (id: number | null) => void;
}) {
  // Bitta tahlil bo'lsa tanlashga narsa yo'q.
  if (runs.length < 2) return null;

  const latest = runs[0];
  const shown = runs.find((r) => r.current) ?? latest;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2.5">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Tahlillar
      </span>

      <div className="flex flex-wrap gap-1.5">
        {runs.map((run, index) => {
          const isShown = run.id === shown.id;
          // O'zgarish — oldingi tahlilga nisbatan.
          const before = runs[index + 1];
          const delta = before ? run.score - before.score : null;
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => onPick(index === 0 ? null : run.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors",
                isShown ? "border-primary bg-primary/10" : "hover:bg-accent",
              )}
            >
              <span className="tabular-nums font-medium">{run.score}</span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 tabular-nums",
                    delta > 0
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-destructive",
                  )}
                >
                  {delta > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(delta)}
                </span>
              )}
              <span className="text-muted-foreground">
                {run.analyzedAt
                  ? new Date(run.analyzedAt).toLocaleDateString("uz-UZ", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : "—"}
              </span>
              {index === 0 && <Badge variant="secondary">oxirgi</Badge>}
            </button>
          );
        })}
      </div>

      {activeId !== null && (
        <span className="text-xs text-muted-foreground">
          Eski tahlil ko&apos;rsatilyapti — raqamlar o&apos;sha paytdagi holicha.
        </span>
      )}
    </div>
  );
}
