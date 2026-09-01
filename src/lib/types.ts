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
  /** Uzum sotuvchi kabinetiga (brauzer sessiyasi) so'nggi ulangan payt. */
  uzumSellerConnectedAt: string | null;
}

/** Ochiq turgan hisob — o'ziniki yoki taklif qilingan hisob. */
export interface Workspace {
  id: number;
  name: string;
  isOwner: boolean;
}

export interface Me {
  id: number;
  email: string;
  fullName: string | null;
  image: string | null;
  /** Telegram botga ulanish kaliti — bot shu raqam bo'yicha topadi. */
  phone: string | null;
  shops: Shop[];
  /** Hozir qaysi hisob ochiq. Eski backend'da yo'q. */
  workspace?: Workspace | null;
  /** Kirish mumkin bo'lgan hamma hisob — o'ziniki birinchi. */
  workspaces?: Workspace[];
  /**
   * Shu hisobda ochiq ruxsat kodlari. Menyu AYNAN shu ro'yxat
   * bo'yicha yig'iladi — kodlar front'da yozib qo'yilmaydi, backend
   * katalogidan keladi.
   *
   * IXTIYORIY, va bu farq muhim:
   *
   * * `undefined` — backend ruxsat haqida umuman gapirmayapti
   *   (eski versiya). Bunda HAMMASI ochiq deb qaraladi, aks holda
   *   front backend'dan oldin joylangan bir necha daqiqada menyu
   *   hamma uchun bo'shab qolardi.
   * * `[]` — hech nima ochilmagan. Bu HAQIQIY holat: egasi odamni
   *   qo'shib, ruxsatni hali bermagan.
   */
  actions?: string[];
  isOwner?: boolean;
}

export interface TeamMember {
  id: number;
  phone: string;
  name: string | null;
  actions: string[];
  isActive: boolean;
  /** Odam saytga kirib, taklif bog'langanmi. */
  accepted: boolean;
  acceptedAt: string | null;
  email: string | null;
  image: string | null;
}

/** Hisob egasi — jamoa ro'yxatining birinchi qatori. */
export interface TeamOwner {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
}

export interface Team {
  /** Eski backend egasini qaytarmaydi — u holda `null`. */
  owner: TeamOwner | null;
  members: TeamMember[];
}

export interface PermissionAction {
  code: string;
  name: string;
  note: string;
}

export interface PermissionModule {
  name: string;
  actions: PermissionAction[];
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

/**
 * Tovarning sur'ati: kuniga qancha ketyapti va qoldiq qancha kunga yetadi.
 *
 * Jami "sotildi / qoldi" savdo tezligi haqida hech nima aytmaydi —
 * 100 dona qoldiq bir tovarda ikki kunlik, boshqasida yarim yillik zaxira.
 */
export interface ProductTempo {
  days: number;
  soldQuantity: number;
  orders: number;
  revenue: number;
  profit: number;
  avgPerDay: number;
  /** `null` — bu davrda sotuv bo'lmagan, ya'ni qoldiq tugamaydi. Nol EMAS. */
  daysOfStock: number | null;
  /** O'rtacha kunlik qoldiq — sur'atni to'g'ri o'qish uchun. */
  avgStock: number;
  firstSaleAt: string | null;
  lastSaleAt: string | null;
}

/**
 * Uzum sotuvchi API'si beradigan, ilgari ko'rsatilmagan raqamlar.
 *
 * Hammasi sinxronizatsiya javobida allaqachon kelib turardi — na yangi
 * so'rov, na yangi ustun kerak edi.
 */
export interface MarketplaceFacts {
  /** Uzumning kartochkaga qo'ygan darajasi (A/B/C/D). */
  rank: string | null;
  rankNote: string | null;
  status: string | null;
  statusColor: string | null;
  /** Qaytarish ulushi, foizda. */
  returnedPercent: number | null;
  forecastOutOfStock: boolean;
  hasActiveDiscount: boolean;
  mxik: string | null;

  available: number | null;
  reserved: number | null;
  returned: number | null;
  defected: number | null;
  pending: number | null;
  soldTotal: number | null;

  promoName: string | null;
  promoEndsAt: string | null;
  promoPrice: number | null;
  promoType: string | null;
  inPromo: boolean;
}

/** Bitta Uzum kartochkasidagi qo'shni variant (o'lcham, rang). */
export interface SiblingSku {
  id: number;
  title: string;
  variantName: string | null;
  skuCode: string | null;
  image: string | null;
  price: number | null;
  onHand: number;
  soldQuantity: number;
  revenue: number;
  avgPrice: number;
  /** Kartochka savdosidagi ulushi, foizda. */
  share: number;
  isCurrent: boolean;
}

/** Bitta kun: sotuv va o'sha kundagi o'rinlar. */
export interface TimelineDay {
  day: string;
  soldQuantity: number;
  orders: number;
  revenue: number;
  profit: number;
  /** O'sha kungi o'rtacha sotuv narxi. Sotuv bo'lmasa — `null`. */
  avgPrice: number | null;
  /** Kun oxiridagi qoldiq — kirim va sotuvdan orqaga qarab tiklanadi. */
  stock: number;
  /**
   * Kalit so'z -> o'sha kungi o'rin. `null` — o'lchandi, lekin chuqurlik
   * ichida topilmadi. Kalit umuman yo'q — o'sha kuni o'lchov bo'lmagan.
   */
  positions: Record<string, number | null>;
}

/**
 * Kun-ba-kun: nechta sotildi va o'sha kuni qaysi so'zda nechanchi edik.
 *
 * Ikkalasi alohida turganda savolga javob yo'q edi: o'rin ko'tarilgan
 * kuni sotuv ham oshdimi degan savol aynan shu jadvalda ko'rinadi.
 */
export interface ProductTimeline {
  days: TimelineDay[];
  /** Ustunlar tartibi — hozirgi o'rni bo'yicha, yaxshisi birinchi. */
  phrases: string[];
  from: string;
  to: string;
}

/** Bitta tekshirilgan sabab. */
export interface WhyReason {
  kind: string;
  /** `high` | `medium` | `info` — nima avval tuzatilishi kerak. */
  weight: string;
  title: string;
  detail: string;
}

/** Kartochkaning Uzum'dagi ochiq raqamlari. */
export interface CardStats {
  price: number | null;
  rating: number | null;
  reviews: number | null;
  orders: number | null;
  /** Yetakchilar bloki uchun: nechta tovar bo'yicha mediana olingan. */
  count: number | null;
}

export interface WhyRival {
  productId: number;
  title: string;
  price: number;
  rating: number | null;
  reviews: number;
  orders: number;
  image: string | null;
  url: string | null;
  rank: number;
}

/** Shu so'zda nega pastdamiz. */
export interface PositionWhy {
  phrase: string;
  position: number | null;
  me: CardStats;
  leaders: CardStats;
  reasons: WhyReason[];
  rivals: WhyRival[];
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
  tempo: ProductTempo;
  /** Shu kartochkadagi barcha variantlar (o'zi ham ichida). Bittasi bo'lsa — bo'sh. */
  siblings: SiblingSku[];
  marketplace: MarketplaceFacts;
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

/** Uzum sotuvchi kabinetiga o'z sessiyasi bilan kirish holati. Ekran bitta — bir vaqtda bitta do'kon. */
export interface UzumLoginStatus {
  active: boolean;
  mine: boolean;
  shopId: number | null;
  startedAt: number | null;
}

export interface UzumLoginStart {
  status: string;
  shopId: number | null;
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

// ── Instagram ────────────────────────────────────────────────────────────────

export interface InstagramAccount {
  connected: boolean;
  /** Facebook'dan qaytilgan, lekin akkaunt hali tanlanmagan. */
  needsSelection: boolean;
  id: number | null;
  username: string | null;
  name: string | null;
  profilePicture: string | null;
  followers: number;
  pageName: string | null;
  adAccountId: string | null;
  adAccountName: string | null;
  adAccountCurrency: string | null;
  canPublish: boolean;
  canAdvertise: boolean;
  tokenExpiresAt: string | null;
  tokenExpiresSoon: boolean;
  tokenExpired: boolean;
  postsSyncedAt: string | null;
  postCount: number;
  /** Nima yetishmayotgani — tugmani jimgina yashirmaslik uchun. */
  missing: string[];
}

export interface InstagramPage {
  pageId: string;
  pageName: string | null;
  instagramId: string | null;
  instagramUsername: string | null;
  picture: string | null;
}

export interface InstagramAdAccount {
  id: string;
  name: string | null;
  currency: string | null;
  isActive: boolean;
  minDailyBudget: number | null;
}

export interface InstagramChoices {
  pages: InstagramPage[];
  adAccounts: InstagramAdAccount[];
  grantedScopes: string[];
}

export interface LinkedProduct {
  id: number;
  title: string;
  image: string | null;
}

export interface InstagramPost {
  id: number;
  mediaId: string;
  kind: PostKind;
  caption: string | null;
  permalink: string | null;
  thumbnail: string | null;
  postedAt: string | null;
  /** Nechta boshqa-boshqa odam ko'rgan. */
  reach: number;
  /** Nechta marta ko'rilgan — `reach` dan boshqa narsa. */
  views: number;
  likes: number;
  comments: number;
  saved: number;
  /** Direct orqali jo'natilgan. */
  shares: number;
  totalInteractions: number;
  profileVisits: number;
  engagementRate: number | null;
  insightsSyncedAt: string | null;
  publishedByUs: boolean;
  products: LinkedProduct[];
  hasAd: boolean;
}

export interface PublishPreview {
  productId: number;
  title: string;
  caption: string;
  images: string[];
  uzumUrl: string | null;
  canPublish: boolean;
  reason: string | null;
}

export interface CoverageItem {
  productId: number;
  title: string;
  image: string | null;
  imageCount: number;
  stock: number;
  soldQuantity: number;
  price: number | null;
  canPublish: boolean;
  reason: string | null;
}

export interface InstagramCoverage {
  total: number;
  posted: number;
  missing: number;
  items: CoverageItem[];
}

export type AdGoal = "traffic" | "engagement" | "reach" | "messages";
export type AdStatus = "draft" | "paused" | "active" | "finished" | "failed";

export interface InstagramAd {
  id: number;
  title: string;
  goal: AdGoal;
  status: AdStatus;
  productId: number | null;
  productTitle: string | null;
  postId: number | null;
  permalink: string | null;
  thumbnail: string | null;
  dailyBudget: number;
  currency: string | null;
  audience: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  costPerClick: number | null;
  insightsSyncedAt: string | null;
  error: string | null;
}

/** Reklama yoqishdan oldingi taxmin — pul sarflanmaydi. */
export interface AdPlan {
  dailyBudget: number;
  currency: string | null;
  minDailyBudget: number | null;
  audience: string;
  estimatedClicksLow: number;
  estimatedClicksHigh: number;
  /** Byudjetni qoplash uchun kerakli bosishlar soni. */
  breakEvenClicks: number | null;
  profitPerSale: number | null;
  warning: string | null;
}

/**
 * Reklama davridagi sotuv o'zgarishi.
 *
 * Meta bergan atribusiya EMAS — Instagram Uzum'dagi sotuvni ko'rmaydi.
 * Bu reklama ishlagan kunlar bilan undan oldingi shuncha kunning solishtiruvi.
 */
export interface AdResult {
  adId: number;
  days: number;
  spend: number;
  unitsBefore: number;
  unitsDuring: number;
  profitBefore: number;
  profitDuring: number;
  unitsDelta: number;
  profitDelta: number;
  netAfterSpend: number;
  isWorthIt: boolean | null;
  note: string;
}

// ── ijtimoiy tarmoqlar (ko'p tarmoq, ko'p akkaunt) ───────────────────────────

export type SocialPlatform = "instagram" | "telegram" | "tiktok" | "linkedin";

/** Tarmoq nima qila oladi — interfeys shunga qarab chiziladi. */
export interface SocialCapabilities {
  connect: "oauth" | "token";
  carousel: boolean;
  maxImages: number;
  video: boolean;
  maxCaption: number;
  clickableLinks: boolean;
  postInsights: boolean;
  ads: boolean;
}

/** Tarmoq ilovasining holati. Kalitning o'zi hech qachon kelmaydi. */
export interface SocialApp {
  platform: SocialPlatform;
  label: string;
  configured: boolean;
  /** Ilovani qayerda yaratish kerak. */
  portal: string | null;
  /** Developer portaliga aynan shu satr yoziladi. */
  redirectUri: string;
}

export interface SocialPlatformRow {
  platform: SocialPlatform;
  label: string;
  capabilities: SocialCapabilities;
  connected: number;
  /** Ulab bo'lmasa — sababi. */
  unavailable: string | null;
  /** Ulash mumkin, lekin avval ilova kaliti kiritilishi kerak. */
  needsApp: boolean;
  hint: string | null;
}

export interface SocialAccount {
  id: number;
  platform: SocialPlatform;
  externalId: string;
  username: string | null;
  name: string | null;
  picture: string | null;
  followers: number;
  profileUrl: string | null;
  isDefault: boolean;
  canPublish: boolean;
  canAdvertise: boolean;
  tokenExpiresAt: string | null;
  tokenExpiresSoon: boolean;
  tokenExpired: boolean;
  connectedAt: string | null;
  postsSyncedAt: string | null;
  postCount: number;
  error: string | null;
  /** Hozircha ishlayapti, lekin e'lonlarni tortib bo'lmaydigan holat. */
  warning: string | null;
}

export type BroadcastStatus = "pending" | "running" | "done" | "failed";

export interface BroadcastItem {
  accountId: number;
  platform: SocialPlatform;
  account: string;
  status: BroadcastStatus;
  ok: boolean;
  postId: number | null;
  permalink: string | null;
  error: string | null;
  attempts: number;
}

/**
 * E'lon vazifasi.
 *
 * Natija har akkaunt uchun alohida — bittasi ketmasa qolgani ketaveradi.
 * `active` bo'lsa hali ketmoqda: e'lon so'rov ichida tugamaydi va bu
 * holat vaqt o'tishi bilan o'zgaradi.
 */
export interface BroadcastResult {
  id: number;
  broadcastId: string;
  productId: number;
  productTitle: string | null;
  productImage: string | null;
  status: BroadcastStatus;
  active: boolean;
  sent: number;
  failed: number;
  pending: number;
  createdAt: string | null;
  finishedAt: string | null;
  items: BroadcastItem[];
}

export interface NetworkRow {
  platform: SocialPlatform;
  label: string;
  accounts: number;
  followers: number;
  posts: number;
  /** E'lonlar jami nechta odamga yetgan. */
  audience: number;
  interactions: number;
  engagementRate: number | null;
  /** Tarmoq statistikani umuman bermasa — noli "yomon" deb o'qilmasin. */
  insightsAvailable: boolean;
  /** Qamrov bor, reaksiya yo'q degan holat ham bor — Telegram shunday. */
  interactionsAvailable: boolean;
}

export interface NetworksOverview {
  totalFollowers: number;
  totalPosts: number;
  totalAudience: number;
  networks: NetworkRow[];
}

/** Reklama shu tovarga arziydimi. Meta bashorati emas — o'z raqamlaringiz. */
export interface AdVerdict {
  productId: number;
  title: string;
  profitPerUnit: number | null;
  organicUnitsPerDay: number;
  organicProfitPerDay: number;
  maxSensibleDaily: number | null;
  costPerCustomerLow: number | null;
  costPerCustomerHigh: number | null;
  verdict: "good" | "careful" | "no" | "unknown";
  headline: string;
  reasons: string[];
}

// ── marketing hisoboti ───────────────────────────────────────────────────────

export interface MarketingInsight {
  productId: number;
  title: string;
  image: string | null;
  units: number;
  profit: number;
  profitShare: number;
  price: number | null;
  stock: number;
  daysLeft: number | null;
  marginPercent: number | null;
  /** Postda ishlatsa bo'ladigan HAQIQIY dalillar. */
  proof: string[];
  actions: string[];
}

export interface MarketingAction {
  priority: number;
  title: string;
  detail: string;
  kind: "good" | "warning" | "danger" | "info";
}

export interface MarketingReport {
  windowDays: number;
  generatedAt: string | null;
  totalProfit: number;
  totalUnits: number;
  productsSold: number;
  productsTotal: number;
  /** Foydaning katta qismini beradigan tovarlar soni. */
  coreCount: number;
  coreShare: number;
  audience: number;
  networksConnected: number;
  winners: MarketingInsight[];
  dead: MarketingInsight[];
  actions: MarketingAction[];
}

/** Telegram kanalida rasmsiz e'lon odatiy hol, Instagram'da esa bo'lmaydi. */
export type PostKind = "image" | "video" | "carousel" | "reel" | "story" | "text";

/** Bitta e'lon — tarmoqdan qat'i nazar. */
export interface SocialPost {
  id: number;
  platform: SocialPlatform;
  externalId: string;
  kind: PostKind;
  caption: string | null;
  permalink: string | null;
  thumbnail: string | null;
  postedAt: string | null;
  publishedByUs: boolean;
  /** Statistika bermaydigan tarmoqda `null` — nol EMAS. */
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagementRate: number | null;
  insightsAvailable: boolean;
  products: LinkedProduct[];
}

// ── SEO auditi ───────────────────────────────────────────────────────────────

export interface SeoKeywordRow {
  phrase: string;
  /** So'rov ortidagi TALAB: buyurtmalar + sharhlar. Tovarlar soni bunga kirmaydi. */
  coverage: number;
  /** Nechta tovar chiqadi — bu raqobat zichligi, talab emas. */
  products: number;
  orders: number;
  reviews: number;
  language: string | null;
  /** So'rovga chiqqan tovarlarning ustun turkumi. */
  category: string | null;
  inTitle: number;
  inDescription: number;
  /** Ibora matnning necha foizini egallaydi. */
  share: number;
}

export interface SeoVerdict {
  title: string;
  good: string[];
  warnings: string[];
}

export interface SeoMediaImage {
  kind: "model" | "product" | "infographic" | "other";
  has_text: boolean;
  languages?: string[];
  note?: string;
}

export interface SeoMedia {
  total: number;
  infographics: number;
  on_model: number;
  product_only: number;
  with_text: number;
  summary: string;
  facts: string[];
  images: SeoMediaImage[];
  advice: string[];
}

export interface SeoGenerated {
  title_uz: string;
  title_ru: string;
  description_uz: string;
  description_ru: string;
  highlights: string[];
  /** Ruscha tezislar — ular ham kartochkaga ruscha tushadi. */
  highlights_ru?: string[];
  tags: string[];
}

/** Bitta tildagi kartochkaning holati — tillar mustaqil o'lchanadi. */
export interface SeoLanguage {
  language: string;
  name: string;
  filled: boolean;
  /** Matn ikkinchi tilning aynan nusxasi — ya'ni bu tilda yozilmagan. */
  mirrorsOther: boolean;
  /**
   * Matn shu tilning yozuvida yozilganmi (ruscha maydonda kirill).
   *
   * Eski tahlillarda maydon yo'q — shuning uchun `=== false` bilan
   * tekshiriladi, aks holda yo'qligi "matn yo'q" degan YOLG'ON
   * ogohlantirish beradi.
   */
  scriptOk?: boolean;

  /** 85 dan: xususiyatlar tillar uchun umumiy. */
  score: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;

  keywordsTotal: number;
  keywordsUsed: number;
  coverageTotal: number;
  coverageUsed: number;
  coverageMissed: number;

  title: string;
  titleLength: number;
  titleWords: number;
  descriptionLength: number;
  descriptionWords: number;
  stopRatio: number;

  /** Umumiy talabdagi ulushi, 0..1 — umumiy ballga shuncha ta'sir qiladi. */
  weight: number;
  verdicts: SeoVerdict[];
  missing: string[];
}

export interface SeoReviews {
  total: number;
  rating: number | null;
  /** Baho bo'yicha taqsimot: {"5": 12, "4": 3}. */
  breakdown: Record<string, number>;
  /** Nechta sharh o'qildi — Uzum hammasini bermaydi. */
  analysed: number;
  loved: string[];
  complaints: string[];
  words: string[];
  advice: string[];
}

export interface SeoAttributeRow {
  title: string;
  values: string[];
  filled: boolean;
}

export interface SeoAttributes {
  total: number;
  filled: number;
  rows: SeoAttributeRow[];
  missing: string[];
  score: number;
}

/** Kalit so'zlar bo'yicha oldimizda turgan tovar. */
export interface SeoRival {
  productId: number;
  title: string;
  price: number;
  rating: number | null;
  reviews: number;
  orders: number;
  image: string | null;
  url: string | null;
  phrases: string[];
  bestRank: number;
}

export interface SeoAudit {
  productId: number;
  title: string;
  image: string | null;

  score: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;

  keywordsTotal: number;
  keywordsUsed: number;
  coverageTotal: number;
  coverageUsed: number;
  coverageMissed: number;

  titleLength: number;
  titleWords: number;
  descriptionLength: number;
  descriptionWords: number;
  stopRatio: number;

  description: string | null;
  verdicts: SeoVerdict[];
  keywords: SeoKeywordRow[];
  missing: string[];

  attributeScore: number;
  /** O'zbekcha va ruscha kartochka — alohida o'lchangan. */
  languages: SeoLanguage[];

  media: SeoMedia | null;
  reviews: SeoReviews | null;
  attributes: SeoAttributes | null;
  generated: SeoGenerated | null;
  /** Sotuvchi tahrirlagan variant — AI natijasi ustiga yozilmaydi. */
  draft: Partial<SeoGenerated> | null;
  appliedAt: string | null;
  /** Tovarning barcha tahlillari — yangisidan eskisiga. */
  runs: SeoRun[];
  /** Hozir ko'rsatilayotgan tahlil. `null` — oxirgisi. */
  runId: number | null;

  analyzedAt: string | null;
  /** Yadro AI bilan kengaytirilganmi — natijani o'qishda muhim. */
  aiUsed: boolean;
  error: string | null;
}

export interface SeoJobItem {
  productId: number;
  title: string | null;
  status: BroadcastStatus;
  error: string | null;
}

/** Ko'p tovarni tahlil qilish vazifasi — fonda ketadi. */
export interface SeoJob {
  id: number;
  kind: "audit" | "media" | "content";
  status: BroadcastStatus;
  active: boolean;
  total: number;
  done: number;
  failed: number;
  pending: number;
  createdAt: string | null;
  finishedAt: string | null;
  items: SeoJobItem[];
}

export interface SeoPositionPoint {
  day: string;
  /** `null` — belgilangan chuqurlikda topilmadi. Nol EMAS. */
  position: number | null;
}

export interface SeoPositionRow {
  phrase: string;
  coverage: number;
  current: number | null;
  /** Manfiy — yuqoriga chiqdi. */
  change: number | null;
  /** `false` — endi qo'shildi, hali bir marta ham o'lchanmagan. */
  measured: boolean;
  points: SeoPositionPoint[];
}

/** Tarixdagi bitta tahlil. */
export interface SeoRun {
  id: number;
  score: number;
  keywordsUsed: number;
  keywordsTotal: number;
  coverageUsed: number;
  coverageTotal: number;
  analyzedAt: string | null;
  current: boolean;
}

export interface SeoAuditRow {
  productId: number;
  title: string;
  image: string | null;
  /** Tahlil qilinmagan bo'lsa `null` — nol EMAS. */
  score: number | null;
  keywordsUsed: number;
  keywordsTotal: number;
  coverageMissed: number;
  analyzedAt: string | null;
  appliedAt: string | null;
  /** Tahlil navbatda yoki ketmoqda. */
  queued: boolean;
}

export interface AiKeyState {
  configured: boolean;
  studioUrl: string;
}

// ── AI bilan mahsulot tayyorlash ────────────────────────────────

export interface OpenAiKeyState {
  configured: boolean;
  platformUrl: string;
  /** Bitta rasm taxminan qancha turadi. */
  imagePriceUsd: number;
}

export interface AiDraftRow {
  id: number;
  stage: string;
  stageLabel: string;
  /** 0-100. Quvur uzun, sotuvchi qayerdaligini ko'rib turishi kerak. */
  progress: number;
  error: string | null;
  titleUz: string | null;
  titleRu: string | null;
  cover: string | null;
  suggestedPrice: number | null;
  createdAt: string;
}

export interface AiRival {
  title: string;
  price: number | null;
  orders: number;
  url: string;
  image: string;
}

export interface AiMarket {
  queries: string[];
  rivals: AiRival[];
  priceMin: number | null;
  priceMax: number | null;
  priceMedian: number | null;
  category: string;
  error: string;
}

export interface AiImageCheck {
  index: number;
  accepted: boolean;
  score: number;
  /** Bozordagi yetakchilar rasmlariga nisbatan raqobatbardoshlik, 0-10. */
  marketFit: number;
  /** main / angle / detail / scale. */
  shot: string;
  /** Qaysi rang uchun. Bir rangli tovarda bo'sh. */
  color: string;
  sameProduct: boolean;
  problems: string[];
  error: string;
}

export interface AiAuditFinding {
  /** block — joylashni to'sadi, warn — ogohlantirish, ok — hammasi yaxshi. */
  level: "block" | "warn" | "ok";
  area: string;
  text: string;
}

export interface AiAudit {
  score: number;
  blocking: number;
  findings: AiAuditFinding[];
}

export interface AiUzumPublish {
  /** queued / published / needs_login / captcha / category_unresolved / needs_manual_step / stopped / error. */
  status: string;
  message: string;
  log: string[];
  /** starting / category / content / images / review — hozir qaysi bosqichda. */
  stage: string | null;
  progress: number;
  /** bosqich nomi -> millisekund (tugagan bosqichlar uchun). */
  timings: Record<string, number>;
  /** `status === "category_unresolved"` bo'lganda: ishonchli topilgan yuqori bosqichlar. */
  categoryPath: string[];
  /** `status === "category_unresolved"` bo'lganda: ANIQLANMAGAN darajadagi barcha variant nomlari — shulardan biri tanlanadi. */
  categoryCandidates: string[];
}

export interface AiDraft extends AiDraftRow {
  sourceImages: string[];
  hint: string | null;
  vision: Record<string, unknown> | null;
  market: AiMarket | null;
  descriptionUz: string | null;
  descriptionRu: string | null;
  attributes: Record<string, string>;
  keywords: string[];
  mxik: string | null;
  mxikName: string | null;
  /** MXIK — TAXMIN. Rasmiy katalogda tekshirish havolasi. */
  mxikCheckUrl: string | null;
  images: string[];
  /** Bitta rasm necha dollar turadi. Manba — backenddagi narx jadvali. */
  imagePriceUsd: number;
  /** Butun to'plam (hamma kadr) qancha turadi. */
  imageSetPriceUsd: number;
  /** Bozordagi yetakchilar rasmlaridan chiqarilgan xulosa. */
  marketBrief: string;
  imagePrompt: string | null;
  imageNote: string | null;
  /** Sotuvchining oxirgi ko'rsatmasi — maydonga qaytadan yoziladi. */
  imagePromptExtra: string | null;
  imageChecks: AiImageCheck[];
  /** Joylashdan oldingi tekshiruv — matn, rasm, MXIK to'liqmi. */
  audit: AiAudit | null;
  /** Uzum'ga avtomatik joylash holati. Hali boshlanmagan bo'lsa `null`. */
  uzumPublish: AiUzumPublish | null;
  updatedAt: string;
}

export interface AiDraftPatch {
  titleUz?: string;
  titleRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  attributes?: Record<string, string>;
  keywords?: string[];
  mxik?: string;
  mxikName?: string;
  suggestedPrice?: number;
}

export interface AiImageRedo {
  /** Sotuvchining o'z ko'rsatmasi. Bo'sh bo'lsa faktlar bo'yicha. */
  prompt?: string;
  /** Qaysi rasm. Berilmasa — hammasi. */
  index?: number | null;
}

export interface AiPackage {
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  /** Bozor tahlilidan — raqobatchining ochiq katalogdagi kategoriyasi. */
  category: string;
  /** Zaxira (rasm tahlilidan) — `category` sotuvchi kabineti qidiruvida topilmasa shu sinaladi. */
  categoryFallback: string;
  attributes: Record<string, string>;
  keywords: string[];
  mxik: string;
  mxikName: string;
  mxikCheckUrl: string;
  price: number | null;
  images: string[];
  /** Bitta tugma bilan nusxalash uchun hammasi bir matnda. */
  plainText: string;
  /** Nima yetishmayapti. Bo'sh bo'lsa to'plam to'liq. */
  missing: string[];
}
