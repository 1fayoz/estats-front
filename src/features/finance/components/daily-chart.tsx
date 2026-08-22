"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { formatDayLabel } from "@/lib/date-range";
import type { DailyFinance } from "../types";

const SERIES = [
  { key: "net", label: "Sof to'lov", color: "var(--chart-3)" },
  { key: "commission", label: "Komissiya", color: "var(--chart-5)" },
  { key: "logistics", label: "Logistika", color: "var(--chart-4)" },
  { key: "expenses", label: "Boshqa yechim", color: "var(--muted-foreground)" },
] as const;

export function DailyChart({ daily }: { daily: DailyFinance[] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-0.5 w-4 rounded-full bg-primary" />
          Buyurtmalar
        </span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayLabel}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            yAxisId="money"
            tickFormatter={(v) => formatSumShort(v)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            width={64}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            width={28}
          />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={<ChartTooltip />} />
          {SERIES.map((s, i) => (
            <Bar
              key={s.key}
              yAxisId="money"
              dataKey={s.key}
              stackId="money"
              fill={s.color}
              radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={34}
            />
          ))}
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: DailyFinance }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-[13rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
      <div className="mb-1.5 font-semibold">{formatDayLabel(d.date)}</div>
      <Row label="Yalpi savdo" value={formatSum(d.gross)} />
      <Row label="Komissiya" value={`−${formatSum(d.commission)}`} muted />
      <Row label="Logistika" value={`−${formatSum(d.logistics)}`} muted />
      {d.expenses > 0 && <Row label="Boshqa yechim" value={`−${formatSum(d.expenses)}`} muted />}
      <div className="my-1 border-t" />
      <Row label="Sof to'lov" value={formatSum(d.net)} strong />
      <Row label="Buyurtma / dona" value={`${formatNumber(d.orders)} / ${formatNumber(d.units)}`} muted />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? "font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
            : muted
              ? "tabular-nums text-muted-foreground"
              : "font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
