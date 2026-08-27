"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PRESETS,
  presetRange,
  todayUz,
  type DateRange,
  type PresetKey,
} from "@/lib/date-range";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** Which preset (if any) matches the current value — for the active pill state. */
function activePreset(value: DateRange): PresetKey | null {
  for (const { key } of PRESETS) {
    const r = presetRange(key);
    if (r.from === value.from && r.to === value.to) return key;
  }
  return null;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const active = activePreset(value);
  const max = todayUz();

  const setFrom = (from: string) =>
    onChange({ from, to: from > value.to ? from : value.to });
  const setTo = (to: string) =>
    onChange({ from: to < value.from ? to : value.from, to });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(presetRange(key))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active === key
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 sm:ml-auto">
        <Input
          type="date"
          value={value.from}
          max={value.to}
          onChange={(e) => e.target.value && setFrom(e.target.value)}
          className="h-9 w-[9.5rem] tabular-nums"
          aria-label="Boshlanish sanasi"
        />
        <span className="text-muted-foreground">—</span>
        <Input
          type="date"
          value={value.to}
          min={value.from}
          max={max}
          onChange={(e) => e.target.value && setTo(e.target.value)}
          className="h-9 w-[9.5rem] tabular-nums"
          aria-label="Tugash sanasi"
        />
      </div>
    </div>
  );
}
