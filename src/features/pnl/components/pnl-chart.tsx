"use client";

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

import { formatDayLabel } from "@/lib/date-range";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import type { DailyPnl } from "@/lib/types";

import styles from "./pnl.module.css";

const SERIES = [
  { key: "revenue", label: "Uzum to‘lovi" },
  { key: "cogs", label: "Tan narx" },
  { key: "profit", label: "Sof foyda" },
] as const;

export function PnlChart({ daily }: { daily: DailyPnl[] }) {
  return (
    <div className={styles.chartShell}>
      <div className={styles.chartLegend} aria-label="Grafik ko‘rsatkichlari">
        {SERIES.map((series) => (
          <span key={series.key}>
            <i data-series={series.key} aria-hidden="true" />
            {series.label}
          </span>
        ))}
      </div>

      <div className={styles.chartCanvas}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={240}
          initialDimension={{ width: 800, height: 300 }}
        >
          <ComposedChart
            data={daily}
            margin={{ top: 12, right: 10, left: -4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 5"
              stroke="var(--border)"
              strokeOpacity={0.72}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={22}
              dy={8}
            />
            <YAxis
              tickFormatter={(value: number) => formatSumShort(value)}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={68}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.36 }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="revenue"
              fill="var(--pnl-revenue)"
              radius={[5, 5, 1, 1]}
              maxBarSize={24}
            />
            <Bar
              dataKey="cogs"
              fill="var(--pnl-cost)"
              radius={[5, 5, 1, 1]}
              maxBarSize={24}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--pnl-profit)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 3, stroke: "var(--card)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: DailyPnl }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const day = payload[0].payload;
  const isProfit = day.profit >= 0;

  return (
    <div className={styles.chartTooltip}>
      <div className={styles.tooltipDate}>{formatDayLabel(day.date)}</div>
      <TooltipRow label="Sotildi" value={`${formatNumber(day.soldQuantity)} dona`} muted />
      <TooltipRow label="Uzum to‘lovi" value={formatSum(day.revenue)} />
      <TooltipRow label="Tan narx (FIFO)" value={`− ${formatSum(day.cogs)}`} muted />
      <div className={styles.tooltipResult} data-positive={isProfit}>
        <span>{isProfit ? "Sof foyda" : "Zarar"}</span>
        <strong>{formatSum(day.profit)}</strong>
      </div>
    </div>
  );
}

function TooltipRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={styles.tooltipRow} data-muted={muted}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
