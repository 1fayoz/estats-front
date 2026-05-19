"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatNumber } from "@/lib/format";

interface Props {
  data: { date: string; sales: number; stock: number }[];
  height?: number;
}

export function SalesStockChart({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => formatDate(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          minTickGap={28}
        />
        <YAxis
          yAxisId="sales"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          width={40}
        />
        <YAxis
          yAxisId="stock"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          width={45}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0]?.payload as { sales: number; stock: number };
            return (
              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                <div className="mb-1 font-semibold">{formatDate(label as string)}</div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">Sotuv:</span>
                  <span className="font-medium tabular-nums">{formatNumber(p.sales)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-muted-foreground">Qoldiq:</span>
                  <span className="font-medium tabular-nums">{formatNumber(p.stock)}</span>
                </div>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
        />
        <Bar yAxisId="stock" dataKey="stock" name="Qoldiq, dona" fill="var(--chart-2)" opacity={0.4} radius={[3, 3, 0, 0]} />
        <Line
          yAxisId="sales"
          type="monotone"
          dataKey="sales"
          name="Sotuv, dona"
          stroke="oklch(0.65 0.22 25)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "oklch(0.65 0.22 25)" }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
