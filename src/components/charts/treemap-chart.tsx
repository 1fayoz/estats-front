"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatSumShort } from "@/lib/format";

interface TreemapChartProps {
  data: { name: string; size: number; category?: string; fill?: string }[];
  height?: number;
}

interface ContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  fill?: string;
  depth?: number;
  rank?: number;
}

function CustomCell(props: ContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", fill = "var(--chart-1)" } = props;
  const showLabel = width > 60 && height > 28;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "var(--background)",
          strokeWidth: 2,
          opacity: 0.85,
        }}
      />
      {showLabel && (
        <text
          x={x + 8}
          y={y + 20}
          fill="oklch(0.18 0.02 270)"
          fontSize={11}
          fontWeight={500}
          style={{ pointerEvents: "none" }}
        >
          {name.length > Math.floor(width / 7) ? name.slice(0, Math.floor(width / 7) - 1) + "…" : name}
        </text>
      )}
    </g>
  );
}

export function TreemapChart({ data, height = 380 }: TreemapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        isAnimationActive
        content={<CustomCell />}
      >
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { name: string; size: number; category?: string };
            return (
              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                {p.category && <div className="text-[10px] text-muted-foreground">{p.category}</div>}
                <div className="font-semibold">{p.name}</div>
                <div className="text-muted-foreground">{formatSumShort(p.size)}</div>
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
