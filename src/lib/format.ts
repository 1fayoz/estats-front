const SUM_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 0,
});

const COMPACT_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("uz-UZ", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
});

export function formatSum(value: number): string {
  return `${SUM_FORMATTER.format(Math.round(value))} so'm`;
}

export function formatSumShort(value: number): string {
  return `${COMPACT_FORMATTER.format(value)} so'm`;
}

export function formatNumber(value: number): string {
  return SUM_FORMATTER.format(value);
}

export function formatCompact(value: number): string {
  return COMPACT_FORMATTER.format(value);
}

export function formatPercent(value: number, fromRatio = false): string {
  return PERCENT_FORMATTER.format(fromRatio ? value : value / 100);
}

export function formatDate(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return DATE_FORMATTER.format(date);
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
