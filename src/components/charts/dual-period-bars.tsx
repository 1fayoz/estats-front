"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatSum, formatSumShort } from "@/lib/format";

interface Props {
  data: { date: string; current: number; previous: number }[];
  height?: number;
}

export function DualPeriodBars({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          tickFormatter={(v) => formatSumShort(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          width={70}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const cur = payload.find((p) => p.dataKey === "current");
            const prev = payload.find((p) => p.dataKey === "previous");
            return (
              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                <div className="mb-1 font-semibold">{formatDate(label as string)}</div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
                  <span className="text-muted-foreground">Joriy davr:</span>
                  <span className="font-medium tabular-nums">{formatSum(cur?.value as number ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--chart-2)] opacity-50" />
                  <span className="text-muted-foreground">Oldingi 30 kun:</span>
                  <span className="font-medium tabular-nums">{formatSum(prev?.value as number ?? 0)}</span>
                </div>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="top"
          height={30}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
        />
        <Bar dataKey="previous" name="Oldingi 30 kun" fill="var(--chart-2)" opacity={0.35} radius={[4, 4, 0, 0]} />
        <Bar dataKey="current" name="Joriy davr" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
