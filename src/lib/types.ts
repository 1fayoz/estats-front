// Wire types — a 1:1 mirror of the FastAPI backend's response models.
// Backend field names are already camelCase, so nothing is reshaped in between.

export interface Shop {
  id: number;
  shopId: number;
  name: string;
  isDefault: boolean;
  hasToken: boolean;
  currency: string;
  /** Sotuv tarixining qaysi qismi yuklangani — qoldiqni to'g'ri o'qish uchun. */
  salesSyncedFrom: string | null;
  salesSyncedTo: string | null;
  salesSyncedAt: string | null;
}

export interface Me {
  id: number;
  email: string;
  fullName: string | null;
  image: string | null;
  shops: Shop[];
}

export interface LoginResponse {
  accessToken: string;
  user: Me;
}

export interface ShopCreateResult {
  created: Shop[];
  updated: Shop[];
  message: string;
}

export interface SalesCoverage {
  from: string | null;
  to: string | null;
  syncedAt: string | null;
  isComplete: boolean;
}

/** A warehouse good: the Uzum SKU plus our own cost/stock truth. */
export interface WarehouseProduct {
  id: number;
  source: string;
  externalProductId: string | null;
  externalSkuId: string | null;
  skuCode: string | null;
  barcode: string | null;
  sellerSku: string | null;
  title: string;
  image: string | null;
  categoryName: string | null;
  variantName: string | null;
  marketplacePrice: number | null;
  marketplaceStock: number | null;
  commissionRate: number | null;
  currency: string;
  /** Our own on-hand quantity, derived from intake batches minus FIFO-consumed sales. */
  stockQuantity: number;
  averageCost: number;
  lastCost: number | null;
  stockValue: number;
  warehouseId: number | null;
  syncedAt: string | null;
  /** To'liq galereya (bo'sh bo'lsa — faqat `image`). */
  images: string[];
  /** Tovarni Uzum'da ochish havolasi. */
  uzumUrl: string | null;
  /** Butun davr bo'yicha — qoldiq = keldi − sotildi ekani ko'rinib tursin. */
  totalIntakeQuantity: number;
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  /** Hisobda qoldiqqa qaytgan, lekin jismonan hali kelmagan donalar. */
  pendingReturnQuantity: number;
}

export type ReturnStatus = "pending" | "sent" | "completed" | "canceled";
export type ReturnType = "fbs" | "return" | "defected";

/** Qaytarilgan tovar: qancha, qachon va qo'lingizga yetib keldimi. */
export interface ProductReturnRow {
  id: number;
  externalReturnId: string;
  title: string;
  skuCode: string | null;
  quantity: number;
  packedQuantity: number;
  status: ReturnStatus;
  returnType: ReturnType;
  returnedAt: string;
  completedAt: string | null;
  canceledAt: string | null;
  isReceived: boolean;
  isResellable: boolean;
  isPending: boolean;
}

export interface ReturnsSummary {
  totalQuantity: number;
  receivedQuantity: number;
  /** Yo'lda — ombordagi raqam aynan shuncha donaga optimistik. */
  pendingQuantity: number;
  defectedQuantity: number;
  canceledQuantity: number;
}

/** "Buncha qo'ysam — buncha foyda" jadvalining bitta qatori. */
export interface PriceRung {
  price: number;
  payout: number;
  profit: number;
  margin: number;
  isCurrent: boolean;
}

/** Dona boshiga pul qayerga ketishi va qaysi narxdan foyda boshlanishi. */
export interface UnitEconomics {
  unitCost: number;
  avgSellPrice: number;
  commissionRate: number;
  logisticsPerUnit: number;
  breakEvenPrice: number | null;
  isEstimated: boolean;
  hasCost: boolean;
  priceLadder: PriceRung[];
}

export interface SalesPeriod {
  period: string;
  soldQuantity: number;
  orders: number;
  gross: number;
  revenue: number;
  cogs: number;
  profit: number;
  avgPrice: number;
}

/** One goods arrival (kirim) at its own cost price — what FIFO consumes from. */
export interface Intake {
  id: number;
  warehouseProductId: number;
  quantity: number;
  remainingQuantity: number;
  soldQuantity: number;
  costPrice: number;
  totalCost: number;
  currency: string;
  supplier: string | null;
  reference: string | null;
  note: string | null;
  receivedAt: string;
}

export interface IntakeRow extends Intake {
  title: string;
  image: string | null;
  skuCode: string | null;
}

export interface IntakeInput {
  warehouseProductId: number;
  quantity: number;
  costPrice: number;
  supplier?: string | null;
  reference?: string | null;
  note?: string | null;
  receivedAt?: string | null;
}

export type SaleStatus = "sold" | "processing" | "returned" | "canceled";

export interface Sale {
  id: number;
  externalItemId: string;
  externalOrderId: string | null;
  skuCode: string | null;
  title: string;
  status: SaleStatus;
  quantity: number;
  returnedQuantity: number;
  unitPrice: number;
  gross: number;
  commission: number;
  logistics: number;
  /** What Uzum pays out — already net of commission and logistics. */
  revenue: number;
  soldAt: string;
}

export interface SalesSyncResult {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  matched: number;
  unmatched: number;
  message: string | null;
}

/** Per-product P&L: buncha keldi, buncha sotildi, buncha foyda. */
export interface ProductPnl {
  warehouseProductId: number | null;
  title: string;
  image: string | null;
  skuCode: string | null;
  barcode: string | null;
  categoryName: string | null;
  intakeQuantity: number;
  intakeCost: number;
  soldQuantity: number;
  returnedQuantity: number;
  orders: number;
  gross: number;
  commission: number;
  logistics: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  onHand: number;
  stockValue: number;
  lastCost: number | null;
  avgCost: number;
  /** Units sold with no intake behind them — their cost is unknown, not zero. */
  uncoveredQuantity: number;
  isCosted: boolean;
  totalIntakeQuantity: number;
  totalIntakeCost: number;
  totalSoldQuantity: number;
  totalRevenue: number;
  totalCogs: number;
  totalProfit: number;
  minSellPrice: number | null;
  maxSellPrice: number | null;
  lastSellPrice: number | null;
  economics: UnitEconomics;
}

export interface PnlTotals {
  intakeQuantity: number;
  intakeCost: number;
  soldQuantity: number;
  returnedQuantity: number;
  gross: number;
  commission: number;
  logistics: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  onHand: number;
  stockValue: number;
  uncoveredQuantity: number;
  productsInProfit: number;
  productsInLoss: number;
}

export interface DailyPnl {
  date: string;
  soldQuantity: number;
  revenue: number;
  cogs: number;
  profit: number;
}

export interface PnlReport {
  from: string;
  to: string;
  rows: ProductPnl[];
  daily: DailyPnl[];
  totals: PnlTotals;
}

export interface ProductDetail {
  product: WarehouseProduct;
  intakes: Intake[];
  sales: Sale[];
  onHand: number;
  stockValue: number;
  uncoveredQuantity: number;
  totalIntakeQuantity: number;
  totalSoldQuantity: number;
  totalRevenue: number;
  totalCogs: number;
  totalProfit: number;
  economics: UnitEconomics;
  returns: ProductReturnRow[];
  returnsSummary: ReturnsSummary;
  daily: SalesPeriod[];
  monthly: SalesPeriod[];
  yearly: SalesPeriod[];
}

/** Hamma sinxronizatsiyaning bir joydagi holati (Sozlamalar → Uzum). */
export interface SyncState {
  catalogRunning: boolean;
  catalogSyncedAt: string | null;
  catalogStale: boolean;
  productCount: number;

  salesRunning: boolean;
  salesSyncedAt: string | null;
  salesSyncedFrom: string | null;
  salesSyncedTo: string | null;
  salesStale: boolean;
  saleCount: number;

  returnsRunning: boolean;
  returnCount: number;
  pendingReturnQuantity: number;

  catalogIntervalMinutes: number;
  salesIntervalMinutes: number;
  returnsIntervalMinutes: number;
  lastMessage: string | null;
}

export interface SyncStatus {
  running: boolean;
  status: string | null;
  fetchedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  message: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface Paginated<T> {
  results: T[];
  count: number;
  page: number;
  pages: number;
}

// ── bozor (uzum.uz ochiq katalogi) ───────────────────────────────────────────

export interface MarketProduct {
  productId: number;
  title: string;
  price: number;
  fullPrice: number | null;
  discountPercent: number | null;
  rating: number | null;
  reviews: number;
  orders: number;
  image: string | null;
  category: string | null;
  url: string;
}

export interface MarketStats {
  count: number;
  min: number;
  max: number;
  median: number;
  average: number;
}

export interface ProductMarket {
  query: string;
  total: number;
  items: MarketProduct[];
  stats: MarketStats;
  myPrice: number | null;
  /** Mendan arzon sotayotganlar ulushi (0–100). */
  cheaperShare: number;
  breakEvenPrice: number | null;
  profitAtMarketMin: number | null;
  profitAtMarketMedian: number | null;
  canMatchCheapest: boolean;
  note: string | null;
}

/** Bozor tokenining holati. Tokenning o'zi hech qachon qaytarilmaydi. */
/** Tokenni bir bosishda yuboradigan bookmarklet. */
export interface MarketUploader {
  key: string;
  bookmarklet: string;
  instructions: string[];
}

export interface MarketTokenStatus {
  configured: boolean;
  expiresAt: string | null;
  expiresInMinutes: number | null;
  isExpired: boolean;
}

// ── reja (plan) ──────────────────────────────────────────────────────────────

/** Hisoblangan balans — Uzum'da balans endpointi yo'q, bu buyurtmalardan chiqadi. */
export interface PlanBalance {
  readyToWithdraw: number;
  inProgress: number;
  expected: number;
  stockValue: number;
  pendingReturnUnits: number;
}

export interface PlanRate {
  dailyProfit: number;
  /** Doimiy xarajatlar ayirilgandan keyingi haqiqiy kunlik foyda. */
  netDailyProfit: number;
  dailyRevenue: number;
  dailyUnits: number;
  windowDays: number;
  activeDays: number;
  trendPercent: number;
}

export interface PlanForecast {
  days7: number;
  days30: number;
  days90: number;
  days365: number;
}

export interface Goal {
  id: number;
  title: string;
  emoji: string | null;
  targetAmount: number;
  note: string | null;
  sortOrder: number;
  achievedAt: string | null;
  progress: number;
  remaining: number;
  daysLeft: number | null;
  reachDate: string | null;
  isAchieved: boolean;
  isCurrent: boolean;
  /** Maqsadga shu muddatda yetish uchun kerakli kunlik foyda. */
  requiredDaily30: number;
  requiredDaily90: number;
  requiredDaily365: number;
}

export interface PlanDailyPoint {
  date: string;
  profit: number;
  revenue: number;
  units: number;
}

export interface PlanPeriod {
  period: string;
  profit: number;
}

export interface StockoutRisk {
  productId: number;
  title: string;
  image: string | null;
  onHand: number;
  dailyRate: number;
  daysLeft: number | null;
}

export interface TopProduct {
  productId: number;
  title: string;
  image: string | null;
  profit: number;
  share: number;
}

export interface Insight {
  kind: "good" | "warning" | "danger" | "info";
  title: string;
  detail: string;
}

export interface Plan {
  balance: PlanBalance;
  rate: PlanRate;
  forecast: PlanForecast;
  /** Doimiy xarajatlar ayirilgandan keyingi bashorat. */
  netForecast: PlanForecast;
  fixed: FixedCosts;
  totalProfit: number;
  thisMonth: number;
  lastMonth: number;
  monthGrowth: number;
  daily: PlanDailyPoint[];
  monthly: PlanPeriod[];
  yearly: PlanPeriod[];
  goals: Goal[];
  stockouts: StockoutRisk[];
  topProducts: TopProduct[];
  insights: Insight[];
}

// ── doimiy to'lovlar (recurring expenses) ────────────────────────────────────

export type ExpenseCategory = "tax" | "rent" | "salary" | "marketing" | "service" | "other";
export type ExpensePeriod = "monthly" | "quarterly" | "yearly";

export interface RecurringExpense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  period: ExpensePeriod;
  dueDay: number;
  anchorMonth: number;
  startsOn: string | null;
  endsOn: string | null;
  note: string | null;
  isActive: boolean;
  /** Yillik/chorakli to'lovning bir oyga to'g'ri keladigan ulushi. */
  monthlyEquivalent: number;
}

export interface ExpenseDueItem {
  expenseId: number;
  title: string;
  category: ExpenseCategory;
  period: ExpensePeriod;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAmount: number | null;
  paidAt: string | null;
  isOverdue: boolean;
  note: string | null;
}

export interface ExpenseMonth {
  period: string;
  grossProfit: number;
  fixedPlanned: number;
  fixedPaid: number;
  fixedUnpaid: number;
  netProfit: number;
  isProfitable: boolean;
  items: ExpenseDueItem[];
}

/**
 * Doimiy xarajatlarning umumiy yuki.
 *
 * `monthlyFixed` — yillik va chorakli to'lovlar oylarga teng taqsimlangan
 * o'rtacha. `thisMonthPlanned` — aynan shu oyda to'lanadigan haqiqiy summa.
 * Ikkalasi boshqa savolga javob beradi, shuning uchun ikkalasi ham bor.
 */
export interface FixedCosts {
  monthlyFixed: number;
  dailyFixed: number;
  thisMonthPlanned: number;
  thisMonthPaid: number;
  thisMonthUnpaid: number;
  grossProfit: number;
  netProfit: number;
  isProfitable: boolean;
  coveragePercent: number;
  unpaidCount: number;
  overdueCount: number;
  nextDueTitle: string | null;
  nextDueDate: string | null;
  nextDueAmount: number;
  breakEvenDailyProfit: number;
}

export interface ExpenseBurn {
  monthlyFixed: number;
  dailyFixed: number;
  breakEvenDailyProfit: number;
  currentDailyProfit: number;
  coveragePercent: number;
  isCovered: boolean;
  breakEvenDayOfMonth: number | null;
}
