import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DailyPoint } from "@/types/domain";
import { Sparkline } from "@/components/charts/sparkline";

interface KPICardProps {
  label: string;
  value: string;
  delta?: number;
  helper?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
  sparkData?: DailyPoint[];
}

const TONE_CLASS: Record<NonNullable<KPICardProps["tone"]>, string> = {
  primary: "from-primary/15 text-primary",
  success: "from-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "from-amber-500/15 text-amber-600 dark:text-amber-400",
  info: "from-sky-500/15 text-sky-600 dark:text-sky-400",
};

const TONE_SPARK: Record<NonNullable<KPICardProps["tone"]>, string> = {
  primary: "var(--primary)",
  success: "oklch(0.7 0.2 145)",
  warning: "oklch(0.78 0.18 75)",
  info: "oklch(0.65 0.18 240)",
};

export function KPICard({
  label,
  value,
  delta,
  helper,
  icon: Icon,
  tone = "primary",
  sparkData,
}: KPICardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-1.5 truncate text-2xl font-bold tabular-nums">{value}</div>
          {helper && (
            <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br to-card",
            TONE_CLASS[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(delta !== undefined || sparkData) && (
        <div className="mt-4 flex items-end justify-between gap-3">
          {delta !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                positive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              )}
            >
              {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(delta).toFixed(1)}%
            </div>
          )}
          {sparkData && (
            <div className="ml-auto h-10 w-28">
              <Sparkline data={sparkData} color={TONE_SPARK[tone]} dataKey="revenue" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
