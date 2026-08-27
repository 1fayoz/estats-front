import type { ExpenseCategory, ExpensePeriod } from "@/lib/types";

export const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "tax", label: "Soliq", emoji: "🧾" },
  { value: "rent", label: "Arenda", emoji: "🏬" },
  { value: "salary", label: "Oylik", emoji: "👤" },
  { value: "marketing", label: "Reklama", emoji: "📣" },
  { value: "service", label: "Xizmat", emoji: "🔧" },
  { value: "other", label: "Boshqa", emoji: "📌" },
];

export const PERIODS: { value: ExpensePeriod; label: string }[] = [
  { value: "monthly", label: "Har oy" },
  { value: "quarterly", label: "Har chorak" },
  { value: "yearly", label: "Yiliga bir" },
];

export const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export const periodLabel = (value: string) =>
  PERIODS.find((p) => p.value === value)?.label ?? value;

/** "2026-08" → "Avgust 2026" */
export const prettyPeriod = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};
