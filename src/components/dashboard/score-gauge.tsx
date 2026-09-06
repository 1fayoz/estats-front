import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 64, label, showLabel = true }: ScoreGaugeProps) {
  const radius = (size - 8) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color =
    score >= 80
      ? "oklch(0.7 0.2 145)"
      : score >= 60
      ? "oklch(0.78 0.18 75)"
      : "oklch(0.65 0.22 25)";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size / 2 + 4 }}>
        <svg width={size} height={size / 2 + 4} viewBox={`0 0 ${size} ${size / 2 + 4}`}>
          <path
            d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`}
            stroke="var(--muted)"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 4 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2}`}
            stroke={color}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-end justify-center pb-0.5 text-base font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </div>
      </div>
      {showLabel && label && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  value: number;
  className?: string;
}

export function ScoreBar({ label, value, className }: ScoreBarProps) {
  const color =
    value >= 80
      ? "from-emerald-500/40 to-emerald-500"
      : value >= 60
      ? "from-amber-500/40 to-amber-500"
      : "from-rose-500/40 to-rose-500";
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-semibold tabular-nums">{value}</span>
    </div>
  );
}
