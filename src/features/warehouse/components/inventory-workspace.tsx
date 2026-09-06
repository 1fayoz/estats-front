"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Boxes, PackagePlus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/stores/user-store";
import { cn } from "@/lib/utils";

/**
 * Ombor bo'limlarining tepasi: bo'lim almashtirgich va harakat
 * tugmalari.
 *
 * Sarlavha matnlari ("Ombor boshqaruvi", "Tovarlar", tavsif)
 * OLIB TASHLANDI (foydalanuvchi so'rovi): qaysi bo'limda
 * turganini yon menyu ham, quyidagi tab ham ko'rsatib turadi —
 * uchinchi marta takrorlash ekranning tepasidan joy yeb, jadval
 * pastga suriladi.
 */
export function InventoryHeader({ active, actions }: {
  active: "warehouse" | "intakes";
  actions?: ReactNode;
}) {
  const canViewWarehouse = useCan("warehouse.view");
  const canViewIntakes = useCan("intakes.view");
  const sections = [
    { key: "warehouse", href: "/warehouse", label: "Tovarlar", icon: Boxes, visible: canViewWarehouse },
    { key: "intakes", href: "/intakes", label: "Kirimlar", icon: PackagePlus, visible: canViewIntakes },
  ];

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Ombor bo‘limlari" className="flex w-full gap-1 rounded-xl border bg-muted/40 p-1 sm:w-fit">
        {sections.filter((section) => section.visible).map((section) => (
          <Link
            key={section.key}
            href={section.href}
            aria-current={active === section.key ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none",
              active === section.key ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}
          >
            <section.icon className="h-4 w-4" aria-hidden="true" />
            {section.label}
          </Link>
        ))}
      </nav>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2 [&>a]:min-h-11 [&>a]:flex-1 [&>button]:min-h-11 [&>button]:flex-1 sm:[&>a]:flex-none sm:[&>button]:flex-none">
          {actions}
        </div>
      )}
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
