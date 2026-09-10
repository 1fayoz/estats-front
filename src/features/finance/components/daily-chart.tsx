"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
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
  const isCompact = useMediaQuery("(max-width: 639px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const descriptionId = React.useId();

  return (
    <figure aria-describedby={descriptionId} className="min-w-0">
      <figcaption id={descriptionId} className="sr-only">
        Kunlar bo&apos;yicha sof to&apos;lov, komissiya, logistika, boshqa yechimlar va
        buyurtmalar soni dinamikasi. Grafik nuqtalarini klaviatura orqali ham ko&apos;rish mumkin.
      </figcaption>

      <div
        aria-label="Grafik ko'rsatkichlari"
        className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
        role="list"
      >
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="flex shrink-0 items-center gap-2 rounded-full border bg-background/70 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs"
            role="listitem"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-[3px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
        <span
          className="flex shrink-0 items-center gap-2 rounded-full border bg-background/70 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs"
          role="listitem"
        >
          <span aria-hidden="true" className="relative h-2.5 w-4">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary" />
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background" />
          </span>
          Buyurtmalar
        </span>
      </div>

      <div className="h-[17.5rem] min-w-0 sm:h-[21rem]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart
            accessibilityLayer
            data={daily}
            margin={
              isCompact
                ? { top: 8, right: -8, left: -12, bottom: 0 }
                : { top: 8, right: 2, left: 0, bottom: 0 }
            }
          >
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="var(--border)"
              strokeOpacity={0.8}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: isCompact ? 9 : 10 }}
              interval="preserveStartEnd"
              minTickGap={isCompact ? 28 : 18}
              tickMargin={10}
            />
            <YAxis
              yAxisId="money"
              tickFormatter={(v) => formatSumShort(v)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: isCompact ? 9 : 10 }}
              tickCount={isCompact ? 4 : 5}
              width={isCompact ? 58 : 68}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: isCompact ? 9 : 10 }}
              tickCount={isCompact ? 4 : 5}
              width={isCompact ? 24 : 30}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              wrapperStyle={{ outline: "none", zIndex: 20 }}
            />
            {SERIES.map((s, i) => (
              <Bar
                key={s.key}
                yAxisId="money"
                dataKey={s.key}
                stackId="money"
                fill={s.color}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={34}
                isAnimationActive={!prefersReducedMotion}
              >
                {daily.map((entry) => (
                  <Cell
                    key={`${s.key}-${entry.date}`}
                    fill={s.key === "net" && entry.net < 0 ? "var(--destructive)" : s.color}
                    fillOpacity={s.key === "expenses" ? 0.72 : 0.94}
                  />
                ))}
              </Bar>
            ))}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 3, stroke: "var(--background)" }}
              isAnimationActive={!prefersReducedMotion}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
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
    <div
      className="w-[14rem] max-w-[calc(100vw-3rem)] rounded-xl border bg-popover/95 p-3 text-xs shadow-2xl backdrop-blur-md"
      role="tooltip"
    >
      <div className="mb-2.5 flex items-center justify-between gap-5 border-b pb-2">
        <span className="font-semibold text-popover-foreground">{formatDayLabel(d.date)}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium tabular-nums text-muted-foreground">
          {formatNumber(d.orders)} ta buyurtma
        </span>
      </div>

      <div className="space-y-1.5">
        <Row label="Yalpi savdo" value={formatSum(d.gross)} />
        <Row label="Komissiya" value={formatDeduction(d.commission)} muted />
        <Row label="Logistika" value={formatDeduction(d.logistics)} muted />
        {d.expenses !== 0 && (
          <Row label="Boshqa yechim" value={formatDeduction(d.expenses)} muted />
        )}
      </div>

      <div className="my-2.5 border-t" />
      <Row
        label="Sof to'lov"
        value={formatSum(d.net)}
        tone={d.net < 0 ? "negative" : d.net > 0 ? "positive" : "neutral"}
      />
      <Row label="Sotilgan dona" value={formatNumber(d.units)} muted />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  tone = "neutral",
}: {
  label: string;
  value: string;
  muted?: boolean;
  tone?: "neutral" | "positive" | "negative";
}) {
  const valueClass = muted
    ? "tabular-nums text-muted-foreground"
    : tone === "positive"
      ? "font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "font-semibold tabular-nums text-destructive"
        : "font-medium tabular-nums text-popover-foreground";

  return (
    <div className="flex min-h-5 items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function formatDeduction(value: number): string {
  if (value > 0) return `−${formatSum(value)}`;
  if (value < 0) return `+${formatSum(Math.abs(value))}`;
  return formatSum(0);
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}
