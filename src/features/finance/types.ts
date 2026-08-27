/**
 * Shared finance types — used by both the server route handler and the client.
 * Keep this file free of server-only imports so it can be bundled either side.
 */

export type OrderStatus =
  | "TO_WITHDRAW"
  | "PROCESSING"
  | "CANCELED"
  | "PARTIALLY_CANCELLED";

/** Aggregated figures for a single calendar day (Asia/Tashkent). */
export interface DailyFinance {
  /** ISO day key, e.g. "2026-07-12". */
  date: string;
  /** Distinct orders that had at least one item on this day. */
  orders: number;
  /** Number of sold units (excludes cancelled). */
  units: number;
  /** Gross sales amount (sellPrice × amount) in so'm. */
  gross: number;
  /** Uzum sales commission withheld, in so'm. */
  commission: number;
  /** Logistics / delivery fee withheld, in so'm. */
  logistics: number;
  /** Other Uzum deductions this day (penalties, storage, ads…), in so'm. */
  expenses: number;
  /** Seller profit reported by Uzum (gross − commission − logistics), in so'm. */
  sellerProfit: number;
  /** Net payout = sellerProfit − other expenses, in so'm. */
  net: number;
  /** Returned units on this day. */
  returns: number;
  /** Effective commission rate against gross, in percent (0 when gross = 0). */
  commissionRate: number;
}

/** A single "other deduction" line item (from finance/expenses). */
export interface ExpenseLine {
  id: number;
  date: string;
  name: string;
  source: string;
  amount: number;
  code: string | null;
  status: string;
}

export interface FinanceTotals {
  orders: number;
  units: number;
  gross: number;
  commission: number;
  logistics: number;
  expenses: number;
  sellerProfit: number;
  net: number;
  returns: number;
  commissionRate: number;
}

export interface FinanceReport {
  /** Requested inclusive range, ISO days. */
  from: string;
  to: string;
  /** Per-day rows, ascending by date. */
  daily: DailyFinance[];
  /** Roll-up across the whole range. */
  totals: FinanceTotals;
  /** Count of order-items per status across the range. */
  statusCounts: Record<OrderStatus, number>;
  /** Largest individual "other deduction" lines, for context. */
  topExpenses: ExpenseLine[];
  /** Server timestamp (epoch ms) the report was produced. */
  generatedAt: number;
}
