"use client";

/*
 * «Avto hal qilish» tuzatishining joyida progressi (§1: har fon ishi — nima
 * ishlanayotgani, foiz va taxminiy tugash). Rasm bosqichida haqiqiy kadr
 * holati (`useImageJob` — qaysi kadr yasalyapti, o'lchangan o'rtacha vaqt),
 * qolgan bosqichlarda — bosqich boshidan o'tgan vaqt va backend taxmini.
 * Tovar sahifasidagi panel va burchakdagi panel BIR XIL komponentni ishlatadi.
 */

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { formatEta, useImageJob } from "@/features/products-ai/use-image-job";
import type { AutoResolveFix } from "@/lib/api";
import { cn } from "@/lib/utils";

const PHASES: { key: string; label: string }[] = [
  { key: "prepare", label: "Tayyorlash" },
  { key: "work", label: "Tuzatish" },
  { key: "uzum", label: "Uzum'da yangilash" },
  { key: "report", label: "Operatorga isbot" },
];

function phaseIndex(fix: AutoResolveFix, status: string): number {
  if (status === "report_due") return 3;
  if (fix.phase === "uzum") return 2;
  if (fix.phase === "images" || fix.phase === "texts") return 1;
  return 0;
}

export function AutoResolveProgress({ fix, status, compact = false }: {
  fix: AutoResolveFix;
  status: string;
  compact?: boolean;
}) {
  const images = fix.phase === "images" && status === "fixing";
  const job = useImageJob(images ? fix.draftId ?? undefined : undefined, images);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (status !== "fixing") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  const idx = phaseIndex(fix, status);
  let percent: number;
  let eta = 0;
  if (images && job.total > 0) {
    const inFlight = Object.values(job.frames).reduce((a, f) => a + job.percentOf(f), 0) / 100;
    percent = Math.round((inFlight / job.total) * 100);
    eta = job.etaSeconds;
  } else {
    const from = fix.phaseAt ? Date.parse(fix.phaseAt) : now;
    const to = fix.etaAt ? Date.parse(fix.etaAt) : 0;
    percent = to > from ? Math.min(95, Math.round(((now - from) / (to - from)) * 100)) : 0;
    eta = to ? Math.max(0, Math.round((to - now) / 1000)) : 0;
  }
  // Umumiy chiziq: har bosqich teng ulush, joriy bosqich ichki foizi bilan.
  const overall = status === "report_due" ? 95 : Math.min(97, Math.round(((idx + percent / 100) / PHASES.length) * 100));
  const pending = status === "fix_pending";

  return (
    <div className={cn("space-y-1.5", !compact && "rounded-lg border bg-muted/15 p-2.5")}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 font-medium">
          {!pending && <Loader2 className="size-3 shrink-0 animate-spin" />}
          <span className="truncate">{pending ? "Tuzatish kutmoqda" : fix.label || "Tuzatilmoqda"}</span>
        </span>
        {!pending && <span className="shrink-0 tabular-nums text-muted-foreground">{overall}%{eta ? ` · ${formatEta(eta)}` : ""}</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", pending ? "bg-[var(--warn)]" : "bg-primary")} style={{ width: `${pending ? 100 : Math.max(4, overall)}%` }} />
      </div>
      {images && job.total > 0 && (
        <p className="text-[11px] text-muted-foreground">
          Rasmlar: {job.done}/{job.total} tayyor{job.runningCount ? ` · ${job.runningCount} ta yasalmoqda` : ""}
          {job.failed ? ` · ${job.failed} ta rad etildi (qayta yasaladi)` : ""}
        </p>
      )}
      {!compact && fix.targets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {fix.targets.map((t) => (
            <span key={t} className="rounded-full border bg-background px-2 py-0.5 text-[11px]">{t}</span>
          ))}
        </div>
      )}
      {!compact && (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          {PHASES.map((p, i) => (
            <li key={p.key} className={cn("flex items-center gap-1", i < idx ? "text-[var(--ok)]" : i === idx ? "font-medium" : "text-muted-foreground")}>
              {i < idx ? <Check className="size-3" /> : <span className={cn("size-1.5 rounded-full", i === idx ? "bg-primary" : "bg-muted-foreground/40")} />}
              {p.label}
            </li>
          ))}
        </ol>
      )}
      {pending && fix.error && <p className="text-[11px] text-muted-foreground">Sabab: {fix.error}</p>}
    </div>
  );
}
