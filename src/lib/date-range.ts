/** Date helpers for the finance report — all in Asia/Tashkent (UTC+5, no DST). */

const UZ_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

/** Current calendar day in Tashkent. */
export function todayUz(): string {
  return new Date(Date.now() + UZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** Shift an ISO day by `n` days (n may be negative). */
export function addDays(isoDay: string, n: number): string {
  const base = Date.parse(`${isoDay}T00:00:00.000Z`);
  return new Date(base + n * DAY_MS).toISOString().slice(0, 10);
}

/** First day of the month for an ISO day. */
export function startOfMonth(isoDay: string): string {
  return `${isoDay.slice(0, 7)}-01`;
}

/** Inclusive day count in a range. */
export function daysInRange({ from, to }: DateRange): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1;
}

export type PresetKey = "7d" | "30d" | "90d" | "thisMonth" | "lastMonth";

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "7 kun" },
  { key: "30d", label: "30 kun" },
  { key: "90d", label: "90 kun" },
  { key: "thisMonth", label: "Shu oy" },
  { key: "lastMonth", label: "O'tgan oy" },
];

export function presetRange(key: PresetKey): DateRange {
  const today = todayUz();
  switch (key) {
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "90d":
      return { from: addDays(today, -89), to: today };
    case "thisMonth":
      return { from: startOfMonth(today), to: today };
    case "lastMonth": {
      const lastMonthDay = addDays(startOfMonth(today), -1);
      return { from: startOfMonth(lastMonthDay), to: lastMonthDay };
    }
  }
}

/** Stable cache key for a range. */
export function rangeKey({ from, to }: DateRange): string {
  return `${from}_${to}`;
}

const LABEL_FMT = new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "short" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("uz-UZ", { weekday: "short" });

/** "12-iyul" style short label from an ISO day (parsed as a UZ-local wall date). */
export function formatDayLabel(isoDay: string): string {
  return LABEL_FMT.format(new Date(`${isoDay}T12:00:00`));
}

export function formatWeekday(isoDay: string): string {
  return WEEKDAY_FMT.format(new Date(`${isoDay}T12:00:00`));
}
