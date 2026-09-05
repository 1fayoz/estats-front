"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Coins,
  PackagePlus,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PnlTotals } from "@/lib/types";

/**
 * The five numbers that answer the question directly: what came in, what went out,
 * what it cost, and whether that leaves a profit or a loss.
 */
export function SummaryCards({ totals }: { totals: PnlTotals }) {
  const isProfit = totals.profit >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Tile
        icon={PackagePlus}
        label="Kirim (davr ichida)"
        value={formatSum(totals.intakeCost)}
        hint={`${formatNumber(totals.intakeQuantity)} dona keldi`}
      />
      <Tile
        icon={Boxes}
        label="Sotildi"
        value={`${formatNumber(totals.soldQuantity)} dona`}
        hint={
          totals.returnedQuantity > 0
            ? `${formatNumber(totals.returnedQuantity)} dona qaytdi — ${formatSum(totals.returnedAmount)}`
            : "qaytarilgani yo'q"
        }
        warn={totals.returnedQuantity > 0}
      />
      <Tile
        icon={Coins}
        label="Uzum to'lovi"
        value={formatSum(totals.revenue)}
        hint={`${formatSum(totals.gross)} savdodan`}
      />
      <Tile
        icon={TrendingDown}
        label="Tan narx (FIFO)"
        value={formatSum(totals.cogs)}
        hint={
          totals.uncoveredQuantity > 0
            ? `${formatNumber(totals.uncoveredQuantity)} dona tan narxsiz`
            : "to'liq hisoblangan"
        }
        warn={totals.uncoveredQuantity > 0}
      />
      <Tile
        icon={isProfit ? TrendingUp : ArrowDownRight}
        label={isProfit ? "Sof foyda" : "Zarar"}
        value={formatSum(totals.profit)}
        hint={`marja ${totals.margin.toFixed(1)}%`}
        tone={isProfit ? "positive" : "negative"}
      />
    </div>
  );
}

interface TileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
  warn?: boolean;
}

function Tile({ icon: Icon, label, value, hint, tone, warn }: TileProps) {
  return (
    <Card
      className={cn(
        tone === "positive" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "negative" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div
          className={cn(
            "text-lg font-semibold tabular-nums",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-destructive"
          )}
        >
          {value}
        </div>
        {hint && (
          <div
            className={cn(
              "text-xs text-muted-foreground",
              warn && "text-amber-600 dark:text-amber-500"
            )}
          >
            {hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Small inline profit/loss badge used in table rows. */
export function ProfitBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tabular-nums",
        positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatSum(value)}
    </span>
  );
}

export function MarginBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Percent className="h-3 w-3" />
      {value.toFixed(1)}
    </span>
  );
}
