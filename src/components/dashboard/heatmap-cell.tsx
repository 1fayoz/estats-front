import { cn } from "@/lib/utils";

interface HeatmapCellProps {
  value: number;
  max: number;
  display: string;
  tone?: "primary" | "rose" | "emerald" | "sky";
  align?: "left" | "right";
}

const TONES = {
  primary: "color-mix(in oklch, var(--primary) 35%, transparent)",
  rose: "color-mix(in oklch, oklch(0.65 0.22 25) 38%, transparent)",
  emerald: "color-mix(in oklch, oklch(0.7 0.2 145) 32%, transparent)",
  sky: "color-mix(in oklch, oklch(0.65 0.18 240) 32%, transparent)",
};

export function HeatmapCell({
  value,
  max,
  display,
  tone = "primary",
  align = "right",
}: HeatmapCellProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn("relative overflow-hidden rounded px-2 py-1", align === "right" ? "text-right" : "text-left")}>
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${pct}%`,
          background: TONES[tone],
        }}
      />
      <span className="relative font-medium tabular-nums">{display}</span>
    </div>
  );
}
