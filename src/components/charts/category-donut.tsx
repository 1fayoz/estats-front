"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatSumShort, formatPercent } from "@/lib/format";

interface CategoryDonutProps {
  data: { name: string; revenue: number }[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklch, var(--chart-1) 70%, var(--chart-3))",
  "color-mix(in oklch, var(--chart-2) 70%, var(--chart-4))",
];

export function CategoryDonut({ data }: CategoryDonutProps) {
  const total = data.reduce((acc, d) => acc + d.revenue, 0);

  return (
    <div className="relative h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { name: string; revenue: number };
              return (
                <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-muted-foreground">
                    {formatSumShort(p.revenue)} · {formatPercent((p.revenue / total) * 100)}
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Jami daromad</span>
        <span className="text-xl font-bold tabular-nums">{formatSumShort(total)}</span>
      </div>
    </div>
  );
}
