// Backend `src/api/reports/schemas.py` bilan 1:1 (pul — oddiy son, so'm, 2 xona).

export type ReportBasis = "ordered" | "issued";

export interface ReportPeriod {
  from: string;
  to: string;
  month: string | null;
  label: string;
  days: number;
}

export interface ReportTotals {
  orders: number;
  units: number;
  returnsQuantity: number;
  returnsAmount: number;
  grossSales: number;
  commission: number;
  commissionPct: number;
  logistics: number;
  otherOrderDeductions: number;
  payout: number;
  uzumFees: number;
  ads: number;
  cogs: number;
  ownExpenses: number;
  netProfit: number;
  marginPct: number;
  uncoveredQuantity: number;
}

export interface WaterfallStep {
  key: string;
  label: string;
  amount: number;
  kind: "total" | "minus" | "result";
}

export interface ReportProduct {
  warehouseProductId: number | null;
  title: string;
  skuCode: string | null;
  image: string | null;
  soldQuantity: number;
  returnedQuantity: number;
  returnedAmount: number;
  orders: number;
  grossSales: number;
  commission: number;
  logistics: number;
  payout: number;
  cogs: number;
  profit: number;
  marginPct: number;
  uncoveredQuantity: number;
}

export interface ReportFee {
  id: number;
  date: string;
  name: string;
  source: string;
  kind: "storage" | "fine" | "withdrawal" | "ads" | "other";
  amount: number;
}

export interface ReportOwnExpense {
  id: number;
  title: string;
  category: string;
  due: string;
  amount: number;
  paid: boolean;
}

export interface CompareMetric {
  key: string;
  label: string;
  current: number;
  previous: number;
  lastYear: number;
  deltaPrevious: number;
  deltaPreviousPct: number | null;
  deltaLastYear: number;
  deltaLastYearPct: number | null;
}

export interface ReportTax {
  period: string;
  rate: number;
  marketplaceIncome: number;
  incomeSource: "estats" | "commissioner";
  estatsIncome: number;
  commissionerIncome: number | null;
  tax: number;
  nominalDeadline: string;
  deadline: string;
  autoDraftFrom: string;
  commissionerReadyFrom: string;
  invoiceDeadline: string;
  daysLeft: number;
  isEstimate: boolean;
  formula: string;
  notes: string[];
  checklist: string[];
}

export interface MonthlyReport {
  period: ReportPeriod;
  totals: ReportTotals;
  waterfall: WaterfallStep[];
  products: ReportProduct[];
  fees: ReportFee[];
  ownExpenses: ReportOwnExpense[];
  sources: {
    basis: ReportBasis;
    feesAvailable: boolean;
    feesReason: string | null;
    adsSource: "uzum_expenses" | "cabinet_cpo" | "none";
    adsCoveredDays: number;
    salesComplete: boolean;
    salesSyncedFrom: string | null;
  };
  comparison: {
    previous: ReportPeriod;
    lastYear: ReportPeriod;
    previousComplete: boolean;
    lastYearComplete: boolean;
    metrics: CompareMetric[];
  };
  tax: ReportTax | null;
  commissioner: { period: string; filename: string; uploadedAt: string; salesTotal: number | null } | null;
  generatedAt: string;
}

export interface ReconcileLine {
  key: string;
  label: string;
  uzum: number | null;
  estats: number | null;
  diff: number | null;
  diffPct: number | null;
  status: "match" | "close" | "mismatch" | "missing";
}

export interface CommissionerReport {
  period: string;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  totals: Record<string, number>;
  layout: { sheet?: string; headerRow?: number; columns?: Record<string, string>; totalsFrom?: string };
  warnings: string[];
  rowsCount: number;
  lines: ReconcileLine[];
  rowKey: "order_id" | "sku" | null;
  rowDiffs: {
    key: string;
    uzum: number | null;
    estats: number | null;
    diff: number;
    status: "mismatch" | "onlyUzum" | "onlyEstats";
  }[];
  explanation: string[];
}

export interface ReportQuery {
  month?: string;
  from?: string;
  to?: string;
  basis: ReportBasis;
  taxRate: number;
}
