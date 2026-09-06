"use client";

import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Ombor bo'limlarining tepasi — endi FAQAT harakat tugmalari.
 *
 * Sarlavha matnlari ham, «Tovarlar / Kirimlar» tablari ham OLIB
 * TASHLANDI (foydalanuvchi so'rovi): ikkala bo'lim yon menyuda
 * («Ombor» guruhida) turibdi va qaysi biri ochiqligi o'sha yerda
 * ko'rinadi — sahifaning burchagida ikkinchi marta takrorlash
 * jadval uchun joy yeb qo'yardi.
 *
 * `active` prop qoldirilgan: chaqiruvchilar uni beradi va kelajakda
 * bo'limga xos xatti-harakat kerak bo'lsa qo'l keladi — lekin
 * hozir hech narsa chizmaydi.
 */
export function InventoryHeader({ actions }: {
  active?: "warehouse" | "intakes";
  actions?: ReactNode;
}) {
  if (!actions) return null;

  return (
    <header className="flex flex-wrap justify-end gap-2 [&>a]:min-h-11 [&>a]:flex-1 [&>button]:min-h-11 [&>button]:flex-1 sm:[&>a]:flex-none sm:[&>button]:flex-none">
      {actions}
    </header>
  );
}


export function InventoryStat({ icon: Icon, label, value, hint, loading, tone = "default", active, onClick }: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
  tone?: "default" | "warning";
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone === "warning" ? "bg-amber-500/10 text-[color:var(--warn)]" : "bg-primary/8 text-primary")}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">{label}</span>
        {onClick && <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />}
      </div>
      {loading ? <Skeleton className="mt-3 h-7 w-3/4" /> : <div className="mt-3 break-words text-lg font-semibold leading-snug tracking-tight text-foreground tabular-nums [overflow-wrap:anywhere] sm:text-xl 2xl:text-2xl">{value}</div>}
      {hint && <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</div>}
    </>
  );
  const className = cn(
    "min-w-0 rounded-2xl border bg-card p-3.5 text-left sm:p-4",
    tone === "warning" && "border-amber-500/25 bg-amber-500/5",
    active && "ring-2 ring-amber-500/60",
    onClick && "cursor-pointer transition-colors hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={Boolean(active)} className={className}>{content}</button>
  ) : (
    <div className={className}>{content}</div>
  );
}
