"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AiDraftRow } from "@/lib/types";

/**
 * O'ng-pastki burchakdagi suzuvchi panel — AI fonda qanday
 * ishlayotganini sahifa qayerga aylantirilmasin ko'rsatib turadi.
 *
 * Ilgari shu ma'lumot (`DraftStrip`) sahifa ICHIDAGI oddiy qator
 * edi — pastga aylantirilsa ko'rinmay qolardi, quvur esa bir necha
 * DAQIQA davom etadi (rasm bosqichi ~6 daqiqa). Foydalanuvchi
 * so'rovi: "burchakda pastda progress bar bilan ko'rsatib tursin".
 * `fixed` bo'lgani uchun endi doim ko'rinadi; yig'ilganda kichik
 * chiziqqa tushadi, band qilib turmaslik uchun.
 */
export function AiGenerationTray({
  rows,
  onOpen,
}: {
  rows: AiDraftRow[];
  onOpen: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (!rows.length) return null;

  const running = rows.filter((row) => row.progress < 100 && !row.error);
  const attention = rows.filter((row) => row.progress === 100 || row.error);
  // E'tibor talab qilgani (tayyor yoki xato) yuqorida, "hali
  // ishlayotgani" pastda — sotuvchi avval hal qilinishi kerak
  // bo'lganini ko'rsin.
  const ordered = [...attention, ...running];

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-[calc(3.25rem+env(safe-area-inset-bottom)+0.75rem)] z-40 animate-slide-up",
        "sm:inset-x-auto sm:right-4 sm:w-80 lg:bottom-4",
      )}
    >
      <div className="air-surface overflow-hidden rounded-2xl border shadow-lg">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/40"
        >
          {running.length > 0 ? (
            <span className="relative flex h-4 w-4 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
              </span>
            </span>
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 flex-1 truncate">
            {running.length > 0
              ? `AI ${running.length} ta qoralamani tayyorlamoqda`
              : `${rows.length} ta qoralama ko'rib chiqishni kutmoqda`}
          </span>
          {collapsed ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {!collapsed && (
          <div className="max-h-[60vh] space-y-1.5 overflow-y-auto border-t p-2">
            {ordered.map((row) => {
              const isRunning = row.progress < 100 && !row.error;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onOpen(row.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-muted/60",
                    row.error && "bg-destructive/5",
                  )}
                >
                  {row.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(row.cover)}
                      alt=""
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-lg border object-cover",
                        isRunning && "ring-2 ring-primary/50",
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted",
                        isRunning && "ring-2 ring-primary/50",
                      )}
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">{row.titleUz || "(nomsiz)"}</div>
                    <div
                      className={cn(
                        "mt-0.5 truncate text-[11px]",
                        row.error ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {row.error ?? row.stageLabel}
                    </div>
                    {isRunning && (
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70 bg-[length:200%_100%] animate-shimmer"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-semibold tabular-nums",
                      row.error ? "text-destructive" : isRunning ? "text-primary" : "text-[color:var(--ok)]",
                    )}
                  >
                    {row.error ? "Xato" : isRunning ? `${row.progress}%` : "Tayyor"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
