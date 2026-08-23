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
  /** Butun davr bo'yicha — qoldiq = keldi − sotildi ekani ko'rinib tursin. */
  totalIntakeQuantity: number;
  totalSoldQuantity: number;
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
  daily: SalesPeriod[];
  monthly: SalesPeriod[];
  yearly: SalesPeriod[];
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
