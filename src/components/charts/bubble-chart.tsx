"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { formatNumber, formatSumShort } from "@/lib/format";

interface BubbleChartProps {
  data: { category: string; competitors: number; cards: number; revenue: number; color: string }[];
  height?: number;
}

export function BubbleChart({ data, height = 360 }: BubbleChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 12, bottom: 24, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="competitors"
          name="Raqobatchilar"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          label={{
            value: "do'konlar (raqobatchilar)",
            position: "insideBottom",
            offset: -10,
            style: { fill: "var(--muted-foreground)", fontSize: 11 },
          }}
        />
        <YAxis
          type="number"
          dataKey="cards"
          name="Kartochkalar"
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          label={{
            value: "kartochkalar (assortiment)",
            angle: -90,
            position: "insideLeft",
            style: { fill: "var(--muted-foreground)", fontSize: 11, textAnchor: "middle" },
          }}
        />
        <ZAxis type="number" dataKey="revenue" range={[300, 4_000]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as BubbleChartProps["data"][number];
            return (
              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                <div className="font-semibold">{p.category}</div>
                <div className="text-muted-foreground">
                  raqobatchi: <span className="font-medium text-foreground">{formatNumber(p.competitors)}</span>
                </div>
                <div className="text-muted-foreground">
                  karta: <span className="font-medium text-foreground">{formatNumber(p.cards)}</span>
                </div>
                <div className="text-muted-foreground">
                  daromad: <span className="font-medium text-foreground">{formatSumShort(p.revenue)}</span>
                </div>
              </div>
            );
          }}
        />
        <Scatter data={data} shape={(props: { cx?: number; cy?: number; payload?: BubbleChartProps["data"][number]; size?: number }) => {
          const { cx = 0, cy = 0, payload, size = 8 } = props;
          const r = Math.max(8, Math.sqrt((size as number) / Math.PI));
          return (
            <g>
              <circle cx={cx} cy={cy} r={r} fill={payload?.color ?? "var(--chart-1)"} opacity={0.7} stroke="var(--background)" strokeWidth={1.5} />
              {r > 18 && (
                <text x={cx} y={cy} dy={3} textAnchor="middle" fill="white" fontSize={10} fontWeight={600} style={{ pointerEvents: "none" }}>
                  {payload?.category.split(" ")[0].slice(0, 10)}
                </text>
              )}
            </g>
          );
        }} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
