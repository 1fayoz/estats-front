"use client";

import { Check, ImagePlus, Sparkles, ClipboardCheck } from "lucide-react";

import { AI_STAGES, activeIndex, doneIndex } from "@/features/products-ai/stages";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/**
 * Bosqichlar chizig'i — modal sarlavhasi ostida.
 *
 * Qoralama hali yo'q bo'lsa (`draft === null`) birinchi qadam
 * faol ko'rinadi: sotuvchi rasm tashlash — ETTITADAN BIRINCHISI
 * ekanini tugmani bosishdan oldin ko'radi.
 */
export function StageStrip({ draft }: { draft: AiDraft | null }) {
  const done = draft ? doneIndex(draft) : -1;
  const active = draft ? activeIndex(draft) : 0;
  const failed = draft?.stage === "failed" || Boolean(draft?.error);

  if (!draft) {
    return (
      <ol className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Tovar yaratish bosqichlari">
        {[
          { icon: ImagePlus, label: "Rasm qo'shish" },
          { icon: Sparkles, label: "AI tayyorlash" },
          { icon: ClipboardCheck, label: "Tekshirish" },
        ].map(({ icon: Icon, label }, index) => (
          <li key={label} aria-current={index === 0 ? "step" : undefined} className={cn(
            "flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-center text-[10px] font-medium sm:justify-start sm:px-4 sm:text-xs",
            index === 0 ? "border-emerald-500/25 bg-emerald-500/10 text-[color:var(--ok)]" : "border-[color:var(--air-line)] text-muted-foreground",
          )}>
            <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden />
            <span>{index + 1}. {label}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs sm:hidden" role="status">
        <span className={cn("min-w-0 truncate", failed ? "text-destructive" : "text-muted-foreground")}>
          {draft.stageLabel}
        </span>
        <span className="shrink-0 font-semibold tabular-nums text-[color:var(--ok)]">{draft.progress}%</span>
      </div>
      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Kartochka tayyorlanishi">
      {AI_STAGES.map((stage, index) => {
        // Yiqilgan qoralamada to'xtagan joy QIZIL: "shu yergacha
        // yetdi" degani, va aynan shu yerdan davom ettiriladi.
        const state =
          index <= done
            ? "done"
            : failed && index === done + 1
              ? "failed"
              : index === active
                ? "active"
                : "next";
        return (
          <li key={stage.key} aria-current={state === "active" ? "step" : undefined} data-state={state} className="min-w-0" title={stage.label}>
            <div className={cn(
              "h-1.5 rounded-full transition-colors motion-reduce:transition-none",
              state === "done" || state === "active" ? "bg-[color:var(--ok)]" : state === "failed" ? "bg-destructive" : "bg-muted-foreground/15",
              state === "active" && "motion-safe:animate-pulse",
            )} />
            <span className={cn(
              "mt-2 hidden items-center gap-1 text-[11px] sm:flex",
              state === "done" || state === "active" ? "font-medium text-[color:var(--ok)]" : state === "failed" ? "text-destructive" : "text-muted-foreground",
            )}>
              {state === "done" && <Check className="size-3 shrink-0" aria-hidden />}
              <span className="truncate">{stage.short}</span>
            </span>
            <span className="sr-only">{stage.label}: {state === "done" ? "tayyor" : state === "active" ? "bajarilmoqda" : state === "failed" ? "to'xtadi" : "kutilmoqda"}</span>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
