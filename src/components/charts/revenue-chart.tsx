"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatSumShort, formatDate, formatSum } from "@/lib/format";
import type { DailyPoint } from "@/types/domain";

interface RevenueChartProps {
  data: DailyPoint[];
  metric?: "revenue" | "sales";
  height?: number;
}

export function RevenueChart({ data, metric = "revenue", height = 300 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(v) =>
            metric === "revenue" ? formatSumShort(v) : v.toLocaleString("uz-UZ")
          }
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={70}
        />
        <Tooltip
          cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as DailyPoint;
            return (
              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                <div className="mb-1 font-semibold">{formatDate(label as string)}</div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
                  <span className="text-muted-foreground">Daromad:</span>
                  <span className="font-medium tabular-nums">{formatSum(p.revenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
                  <span className="text-muted-foreground">Sotuv:</span>
                  <span className="font-medium tabular-nums">{p.sales}</span>
                </div>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey={metric}
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
