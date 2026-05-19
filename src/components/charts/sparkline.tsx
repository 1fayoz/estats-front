"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { DailyPoint } from "@/types/domain";

interface SparklineProps {
  data: DailyPoint[];
  color?: string;
  height?: number;
  dataKey?: keyof DailyPoint;
}

export function Sparkline({
  data,
  color = "var(--primary)",
  height = 40,
  dataKey = "revenue",
}: SparklineProps) {
  const id = `spark-${dataKey}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey as string}
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#${id})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
