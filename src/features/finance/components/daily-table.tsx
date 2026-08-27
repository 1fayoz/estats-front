"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { CardHead, CardList, CardStats, DataCard } from "@/components/dashboard/data-cards";
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
    <>
      {/* Telefonda: har kun — alohida kartochka, jami esa tepada. */}
      <CardList className="px-4 pb-4">
        <DataCard className="border-primary/30 bg-primary/5">
          <CardHead title="Jami" note={`${formatNumber(totals.orders)} buyurtma · ${formatNumber(totals.units)} dona`} />
          <CardStats
            items={[
              { label: "Yalpi savdo", value: formatSum(totals.gross) },
              { label: "Sof to'lov", value: formatSum(totals.net), tone: "good" },
              {
                label: "Komissiya",
                value: `${formatSum(totals.commission)} · ${formatPercent(totals.commissionRate)}`,
                tone: "bad",
              },
              { label: "Logistika", value: formatSum(totals.logistics), tone: "bad" },
            ]}
          />
        </DataCard>

        {rows.map((d) => (
          <DataCard key={d.date}>
            <CardHead
              title={formatDayLabel(d.date)}
              note={<span className="capitalize">{formatWeekday(d.date)}</span>}
              right={
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    d.net >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {d.gross || d.expenses ? formatSum(d.net) : "—"}
                </span>
              }
            />
            <CardStats
              items={[
                {
                  label: "Buyurtma / dona",
                  value: (
                    <>
                      {d.orders || 0} / {d.units || 0}
                      {d.returns > 0 && (
                        <span className="ml-1 text-[11px] text-rose-500">↩{d.returns}</span>
                      )}
                    </>
                  ),
                },
                { label: "Yalpi savdo", value: d.gross ? formatSum(d.gross) : "—" },
                {
                  label: "Komissiya",
                  value: d.commission
                    ? `${formatSum(d.commission)} · ${formatPercent(d.commissionRate)}`
                    : "—",
                  tone: d.commission ? "bad" : "muted",
                },
                {
                  label: "Logistika",
                  value: d.logistics ? formatSum(d.logistics) : "—",
                  tone: d.logistics ? "bad" : "muted",
                },
              ]}
            />
          </DataCard>
        ))}
      </CardList>

      <div className="hidden overflow-x-auto md:block">
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
    </>
  );
}
