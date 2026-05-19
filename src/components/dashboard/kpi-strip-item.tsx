"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIStripItemProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  spark?: { v: number }[];
}

export function KPIStripItem({ label, value, delta, hint, spark }: KPIStripItemProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border bg-card p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="flex items-end justify-between gap-2">
        {delta !== undefined && (
          <div className="flex items-center gap-1 text-[11px]">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-sm px-1 py-0 text-[10px] font-bold",
                positive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              )}
            >
              {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
        {spark && (
          <div className="ml-auto h-7 w-20">
            <ResponsiveContainer>
              <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`kpi-spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={positive ? "oklch(0.7 0.2 145)" : "oklch(0.65 0.22 25)"}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor={positive ? "oklch(0.7 0.2 145)" : "oklch(0.65 0.22 25)"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={positive ? "oklch(0.7 0.2 145)" : "oklch(0.65 0.22 25)"}
                  strokeWidth={1.5}
                  fill={`url(#kpi-spark-${label})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
