"use client";

import * as React from "react";
import {
  Wallet,
  ArrowDownRight,
  Truck,
  Receipt,
  PiggyBank,
  Percent,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FinanceTotals } from "../types";

interface Metric {
  key: string;
  label: string;
  icon: LucideIcon;
  value: (t: FinanceTotals) => string;
  hint?: (t: FinanceTotals) => string;
  tone?: "positive" | "negative" | "neutral";
  sign?: "minus";
  emphasis?: boolean;
}

const METRICS: Metric[] = [
  {
    key: "gross",
    label: "Yalpi savdo",
    icon: Wallet,
    value: (t) => formatSumShort(t.gross),
    hint: (t) => `${t.orders} buyurtma · ${t.units} dona`,
    tone: "neutral",
  },
  {
    key: "commission",
    label: "Uzum komissiyasi",
    icon: ArrowDownRight,
    value: (t) => formatSumShort(t.commission),
    hint: (t) => `o'rtacha ${formatPercent(t.commissionRate)}`,
    tone: "negative",
    sign: "minus",
  },
  {
    key: "logistics",
    label: "Logistika",
    icon: Truck,
    value: (t) => formatSumShort(t.logistics),
    hint: (t) => `${t.units} dona yetkazish`,
    tone: "negative",
    sign: "minus",
  },
  {
    key: "expenses",
    label: "Boshqa yechimlar",
    icon: Receipt,
    value: (t) => formatSumShort(t.expenses),
    hint: () => "jarima, saqlash, reklama",
    tone: "negative",
    sign: "minus",
  },
  {
    key: "net",
    label: "Sof to'lov (payout)",
    icon: PiggyBank,
    value: (t) => formatSumShort(t.net),
    hint: (t) => (t.gross > 0 ? `marja ${formatPercent((t.net / t.gross) * 100)}` : "—"),
    tone: "positive",
    emphasis: true,
  },
  {
    key: "rate",
    label: "Ushlab qolindi",
    icon: Percent,
    value: (t) =>
      t.gross > 0
        ? formatPercent(((t.gross - t.net) / t.gross) * 100)
        : "—",
    hint: () => "komissiya + logistika + yechim",
    tone: "neutral",
  },
];

const toneText: Record<NonNullable<Metric["tone"]>, string> = {
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-rose-600 dark:text-rose-400",
  neutral: "text-foreground",
};

export function SummaryCards({
  totals,
  loading,
}: {
  totals?: FinanceTotals;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {METRICS.map((m) => (
        <Card
          key={m.key}
          className={cn(
            "p-4",
            m.emphasis && "bg-gradient-to-br from-emerald-500/10 via-card to-primary/5"
          )}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <m.icon className="h-3.5 w-3.5" />
            <span className="truncate">{m.label}</span>
          </div>
          {loading || !totals ? (
            <>
              <Skeleton className="mt-2.5 h-6 w-24" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </>
          ) : (
            <>
              <div
                className={cn(
                  "mt-2 text-xl font-bold tabular-nums",
                  toneText[m.tone ?? "neutral"]
                )}
              >
                {m.sign === "minus" && totals.gross > 0 ? "−" : ""}
                {m.value(totals)}
              </div>
              {m.hint && (
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {m.hint(totals)}
                </div>
              )}
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
