"use client";

import { cn } from "@/lib/utils";

/**
 * SEO bali.
 *
 * Rang ataylab uch bosqichli: 0-49 qizil, 50-74 sariq, 75+ yashil.
 * Oraliq baholarni yashil qilish sotuvchini "hammasi joyida" deb
 * ishontiradi, holbuki qamrovning yarmi qo'ldan ketayotgan bo'ladi.
 */
export function ScoreRing({
  score,
  size = 72,
  className,
}: {
  score: number | null;
  size?: number;
  className?: string;
}) {
  const value = score ?? 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone =
    score === null
      ? "text-muted-foreground"
      : value >= 75
        ? "text-emerald-500"
        : value >= 50
          ? "text-amber-500"
          : "text-destructive";

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="stroke-muted" strokeWidth={5} fill="none"
        />
        {score !== null && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            className={cn("transition-[stroke-dashoffset] duration-700", tone)}
            stroke="currentColor" strokeWidth={5} fill="none" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / 100)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-lg font-bold tabular-nums", tone)}>
          {score === null ? "—" : value}
        </span>
      </div>
    </div>
  );
}
