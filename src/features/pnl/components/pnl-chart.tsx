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

import { formatSum, formatSumShort } from "@/lib/format";
import { formatDayLabel } from "@/lib/date-range";
import type { DailyPnl } from "@/lib/types";

const SERIES = [
  { key: "revenue", label: "Uzum to'lovi", color: "var(--chart-1)" },
  { key: "cogs", label: "Tan narx", color: "var(--chart-4)" },
] as const;

/** Daily payout vs cost, with the resulting profit drawn on top as a line. */
export function PnlChart({ daily }: { daily: DailyPnl[] }) {
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
          Sof foyda
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayLabel}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tickFormatter={(v: number) => formatSumShort(v)}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.35 }}
            content={<ChartTooltip />}
          />
          <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="cogs" fill="var(--chart-4)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Line
            type="monotone"
            dataKey="profit"
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
  payload?: { payload: DailyPnl }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const positive = d.profit >= 0;
  return (
    <div className="min-w-[13rem] rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
      <div className="mb-1.5 font-semibold">{formatDayLabel(d.date)}</div>
      <Row label="Sotildi" value={`${d.soldQuantity} dona`} muted />
      <Row label="Uzum to'lovi" value={formatSum(d.revenue)} />
      <Row label="Tan narx (FIFO)" value={`−${formatSum(d.cogs)}`} muted />
      <div className="mt-1.5 flex items-center justify-between gap-4 border-t pt-1.5 font-semibold">
        <span>{positive ? "Sof foyda" : "Zarar"}</span>
        <span
          className={
            positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }
        >
          {formatSum(d.profit)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>{value}</span>
    </div>
  );
}
