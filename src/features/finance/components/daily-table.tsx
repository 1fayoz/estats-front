"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatDayLabel, formatWeekday } from "@/lib/date-range";
import type { DailyFinance, FinanceTotals } from "../types";

const COLS = [
  { key: "date", label: "Sana", align: "left" },
  { key: "orders", label: "Buyurtma", align: "right" },
  { key: "units", label: "Dona", align: "right" },
  { key: "gross", label: "Yalpi savdo", align: "right" },
  { key: "commission", label: "Komissiya", align: "right" },
  { key: "logistics", label: "Logistika", align: "right" },
  { key: "expenses", label: "Boshqa yechim", align: "right" },
  { key: "net", label: "Sof to'lov", align: "right" },
] as const;

export function DailyTable({
  daily,
  totals,
}: {
  daily: DailyFinance[];
  totals: FinanceTotals;
}) {
  // Newest day first.
  const rows = React.useMemo(
    () => [...daily].sort((a, b) => b.date.localeCompare(a.date)),
    [daily]
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-y bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            {COLS.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-2.5 font-medium",
                  c.align === "right" ? "text-right" : "text-left"
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.date} className="border-b last:border-0 hover:bg-accent/30">
              <td className="whitespace-nowrap px-4 py-2.5">
                <div className="font-medium">{formatDayLabel(d.date)}</div>
                <div className="text-[11px] capitalize text-muted-foreground">
                  {formatWeekday(d.date)}
                </div>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {d.orders || <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {d.units || <span className="text-muted-foreground">—</span>}
                {d.returns > 0 && (
                  <span className="ml-1 text-[11px] text-rose-500">↩{d.returns}</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                {d.gross ? formatSum(d.gross) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                {d.commission ? (
                  <span className="inline-flex items-center gap-1.5">
                    {formatSum(d.commission)}
                    <Badge variant="destructive" className="px-1 py-0 font-mono text-[10px]">
                      {formatPercent(d.commissionRate)}
                    </Badge>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                {d.logistics ? formatSum(d.logistics) : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {d.expenses ? formatSum(d.expenses) : "—"}
              </td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right font-semibold tabular-nums",
                  d.net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {d.gross || d.expenses ? formatSum(d.net) : <span className="font-normal text-muted-foreground">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 bg-muted/40 font-semibold">
            <td className="px-4 py-3">Jami</td>
            <td className="px-4 py-3 text-right tabular-nums">{formatNumber(totals.orders)}</td>
            <td className="px-4 py-3 text-right tabular-nums">{formatNumber(totals.units)}</td>
            <td className="px-4 py-3 text-right tabular-nums">{formatSum(totals.gross)}</td>
            <td className="px-4 py-3 text-right tabular-nums text-rose-600 dark:text-rose-400">
              <span className="inline-flex items-center gap-1.5">
                {formatSum(totals.commission)}
                <Badge variant="destructive" className="px-1 py-0 font-mono text-[10px]">
                  {formatPercent(totals.commissionRate)}
                </Badge>
              </span>
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
              {formatSum(totals.logistics)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
              {formatSum(totals.expenses)}
            </td>
            <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatSum(totals.net)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
