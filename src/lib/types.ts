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
  /**
   * Parol o'rnatilganmi. `false` va email bor bo'lsa — kabinet
   * ochilishidan oldin parol o'rnatish MAJBURIY (birinchi kirish
   * Google bilan, keyingilari email + parol). `undefined` — eski
   * backend, hech narsa so'ralmaydi.
   */
  hasPassword?: boolean;
  /** Hozirgina Google bilan kirilgan — parolni joriysisiz almashtirish mumkin (15 daqiqa). */
  passwordResetAllowed?: boolean;
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
  uzumStatusValue: string | null;
  uzumStatusTitle: string | null;
  uzumStatusColor: string | null;
  uzumStatusAdditional: Array<Record<string, unknown>>;
  uzumModerationValue: string | null;
  uzumModerationTitle: string | null;
  uzumModerationColor: string | null;
  uzumBlocked: boolean;
  uzumBlockingReason: string | null;
  /** Bir marta bloklangan bo'lsa — "tuzatilib, qayta moderatsiyaga yuborildi"ni ajratish uchun. */
  uzumHadBlock: boolean;
  /** Bir marta tasdiqlangan bo'lsa — "o'zgartirilib qayta moderatsiyaga tushdi"ni ajratish uchun. */
  uzumWasModerated: boolean;
  /** `false` — Uzum'da bu variant olib tashlangan; tarixi saqlanadi. Eski backendda yo'q. */
  isActive?: boolean;
  /** Uzum'dan qachon olib tashlangan (oxirgi marta ko'ringan payt). */
  uzumRemovedAt?: string | null;
  uzumValidation: ProductValidation | null;
  uzumValidatedAt: string | null;
  /** Butun davr bo'yicha — qoldiq = keldi − sotildi ekani ko'rinib tursin. */
  totalIntakeQuantity: number;
  totalSoldQuantity: number;
  totalReturnedQuantity: number;
  /** Hisobda qoldiqqa qaytgan, lekin jismonan hali kelmagan donalar. */
  pendingReturnQuantity: number;
  /**
   * «Bir xil tovar» guruhi — Uzum'da bir necha marta qo'yilgan bitta tovar.
   * Bo'lsa: `stockQuantity`, `stockValue`, `totalIntakeQuantity` va tan narx
   * guruh bo'yicha UMUMIY (har a'zoda AYNAN bir xil raqam), `totalSoldQuantity`
   * esa shu e'lonniki. Jami hisoblaganda qoldiqni guruh bo'yicha BIR MARTA
   * qo'shing (`sumStock` yordamchisi).
   */
  stockGroupId: number | null;
}

/** Guruhdagi bitta e'lon — umumiy tovarning Uzum'dagi bir nusxasi. */
export interface StockGroupMember {
  id: number;
  title: string;
  variantName: string | null;
  skuCode: string | null;
  image: string | null;
  externalProductId: string | null;
  uzumUrl: string | null;
  isCurrent: boolean;
  isPrimary: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  /** Xaridor hozir sotib ola oladimi (arxivda emas, bloklanmagan). */
  isSellable: boolean;
  status: string | null;
  price: number | null;
  /** Uzum omboridagi shu e'lonning o'z qoldig'i. */
  uzumStock: number | null;
  soldQuantity: number;
  revenue: number;
  profit: number;
  avgPerDay: number;
  /** Guruh savdosidagi ulushi (dona), foizda. */
  share: number;
  uzumDaysOfStock: number | null;
  totalSoldQuantity: number;
  /** Shu e'londa KIRITILGAN partiyalar — ajratilsa shu yerda qoladi. */
  intakeQuantity: number;
  intakes: number;
  /** Guruh ajratilsa shu e'lonning qoldig'i qancha bo'lardi. */
  aloneOnHand: number;
}

/** «Bir xil tovar»: umumiy ombor va e'lonlarni yonma-yon solishtirish. */
export interface StockGroup {
  id: number;
  title: string;
  customTitle: string | null;
  primaryProductId: number | null;
  windowDays: number;
  onHand: number;
  stockValue: number;
  intakeQuantity: number;
  totalSoldQuantity: number;
  soldQuantity: number;
  revenue: number;
  profit: number;
  avgPerDay: number;
  daysOfStock: number | null;
  priceMin: number | null;
  priceMax: number | null;
  members: StockGroupMember[];
}

export interface StockGroupBriefMember {
  id: number;
  title: string;
  variantName: string | null;
  image: string | null;
  externalProductId: string | null;
  isArchived: boolean;
  isBlocked: boolean;
  stockQuantity: number;
  totalSoldQuantity: number;
}

/** Ro'yxat sahifalari uchun yengil ko'rinish. */
export interface StockGroupBrief {
  id: number;
  title: string;
  customTitle: string | null;
  primaryProductId: number | null;
  members: StockGroupBriefMember[];
}


export interface ProductValidationFinding {
  field: string;
  level: string;
  message: string;
  ruleId: string | null;
  ruleTitle: string | null;
  ruleUrl: string | null;
  explanation: string | null;
  suggestion: string | null;
  autoFixable: boolean;
  currentValue: string | null;
  proposedValue: string | null;
}

export interface ProductValidation {
  checkedAt: string;
  readiness: number;
  summary: { ok: number; warning: number; error: number };
  areas: Record<string, string>;
  findings: ProductValidationFinding[];
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
  /**
   * Logistika qayerdan: `own` — shu tovar sotuvlari, `shop` — do'kon
   * sotuvlaridagi odatiy summa (sotuvi yo'q tovar), `none` — noma'lum.
   * Eski backend'da yo'q.
   */
  logisticsSource?: "own" | "shop" | "none";
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
  variantName: string | null;
  /** Partiya «bir xil tovar» guruhiga tegishli bo'lsa — uning id'si. */
  stockGroupId: number | null;
}

/** Bitta partiyadan sotilgan donalar va ular necha pulga sotilgani (FIFO). */
export interface IntakeBatchMoney {
  id: number;
  soldQuantity: number;
  gross: number;
  revenue: number;
  cogs: number;
  profit: number;
}

/** Bitta tovar butun davr bo'yicha: nechta keldi, nechta sotildi, qancha pul. */
export interface IntakeProductMoney {
  warehouseProductId: number | null;
  title: string;
  image: string | null;
  skuCode: string | null;
  batches: number;
  intakeQuantity: number;
  intakeCost: number;
  soldQuantity: number;
  inTransitQuantity: number;
  onHand: number;
  stockValue: number;
  gross: number;
  revenue: number;
  cogs: number;
  /** Kirim kiritilmagan tovarda `null` — foyda noma'lum, nol emas. */
  profit: number | null;
  uncoveredQuantity: number;
  /** «Bir xil tovar» guruhi — qator bitta jismoniy tovar (kirim bitta). */
  stockGroupId: number | null;
  /** Guruhdagi e'lonlar id'lari; birinchisi — asosiy. */
  productIds: number[];
}

export interface IntakeMoneyTotals {
  products: number;
  soldProducts: number;
  batches: number;
  intakeQuantity: number;
  intakeCost: number;
  soldQuantity: number;
  inTransitQuantity: number;
  onHand: number;
  stockValue: number;
  gross: number;
  revenue: number;
  cogs: number;
  profit: number;
  uncoveredQuantity: number;
}

export interface IntakeMoney {
  batches: IntakeBatchMoney[];
  products: IntakeProductMoney[];
  totals: IntakeMoneyTotals;
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
  returnedAmount: number;
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
  /** «Bir xil tovar» guruhi: kirim va qoldiq guruhniki (a'zolarda bir xil). */
  stockGroupId: number | null;
  stockGroupSize: number;
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
  returnedAmount: number;
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
  /** «Bir xil tovar» guruhidagi e'lonlar soni (1 — guruh yo'q). */
  sharedListings: number;
  /** Guruhning BIRGA sur'ati — `daysOfStock` shundan hisoblanadi. */
  sharedAvgPerDay: number | null;
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
  /** Uzum'dan olib tashlangan bo'lsa — qachon. */
  removedAt?: string | null;
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
  moderationErrors: ModerationError[];
  changeLogs: ProductChangeLog[];
  /** Uzum voronkasi. `null` — hali olinmagan. */
  funnel?: Funnel | null;
  /** Qoralama matni oxirgi marta Uzum'ga qachon yuborilgani — undan keyingi
   *  `changeLogs` yozuvlari hali tirik e'londa emas ("joriy, tasdiqlanmagan"). */
  draftTextPushedAt: string | null;
  /** Shu tovarga bog'langan AI qoralamasi (bo'lsa) — "AI kartochka" tugmasi shuni ochadi. */
  aiDraftId: number | null;
  /** Uzum'ga eStats orqali yuborilgan va saqlangan kartochka. `null` — yuborilmagan. */
  uzumCard?: UzumCard | null;
  /**
   * «Bir xil tovar» guruhi — tovar Uzum'da bir necha marta qo'yilgan bo'lsa.
   * `onHand`, `stockValue`, `totalIntakeQuantity` va `intakes` UMUMIY, sotuv
   * raqamlari esa shu e'lonniki.
   */
  stockGroup?: StockGroup | null;
  /** Bloklangan tovar uchun aniqlangan nomuvofiqlik va tuzatish taklifi. */
  fixProposal?: (ProductFixDiagnosis & { draftId?: number; applied?: boolean }) | null;
}

/** Uzum saqlashni tasdiqlagan paytdagi kartochka nusxasi (`uzum_publish.publishedCard`). */
export interface UzumCard {
  titleUz: string;
  titleRu: string;
  shortUz: string;
  shortRu: string;
  descriptionUz: string;
  descriptionRu: string;
  sizeUz: string;
  sizeRu: string;
  compositionUz: string;
  compositionRu: string;
  usageUz: string;
  usageRu: string;
  descriptionImages: string[];
  sectionImages: Partial<Record<"description" | "size" | "composition" | "usage", string[]>>;
  images: string[];
  sku: string;
  categoryPath?: string[];
  /** Xususiyatlar: nom → qiymat. */
  attributes?: Record<string, string>;
  mxik?: string;
  mxikName?: string;
  price?: number | null;
  at: string;
}

export interface ModerationError {
  id: number;
  status: string | null;
  errorCode: string | null;
  errorMessage: string;
  ruleId: string | null;
  ruleTitle: string | null;
  ruleUrl: string | null;
  explanation: string | null;
  suggestedFix: string | null;
  createdAt: string;
}

export interface ProductChangeLog {
  id: number;
  draftId: number | null;
  fieldName: string;
  beforeValue: string | null;
  afterValue: string | null;
  reason: string | null;
  changedBy: string;
  createdAt: string;
}

/** O'zgarish sanasidan oldingi yoki keyingi ~7 kunlik o'rtachalar. */
export interface ChangeImpactWindow {
  avgPosition: number | null;
  trackedPhrases: number;
  dailySold: number;
  dailyRevenue: number;
  days: number;
}

/** Bitta matn o'zgarishining SEO/sotuvga ta'siri: oldin ↔ keyin. */
export interface ChangeImpact {
  logId: number;
  date: string;
  fieldName: string;
  reason: string | null;
  before: ChangeImpactWindow;
  after: ChangeImpactWindow;
  /** `improved` | `worsened` | `flat` | `unknown`. */
  verdict: string;
}

export interface BulkValidationResult {
  checked: number;
  ready: number;
  warning: number;
  error: number;
}

export interface ModerationManualBlock {
  blockType: string | null;
  reason: string | null;
  instruction: string | null;
  ruleTitle: string | null;
  ruleUrl: string | null;
}

/**
 * `/products/{id}/regenerate` javobi — faqat qoralama ID'si,
 * natija hali TAYYOR EMAS (fonda ishlaydi). Modal shu ID bilan
 * ochiladi va o'z holatini create'dagi kabi kuzatib turadi.
 */
export interface ProductRegenerateResult {
  draftId: number;
}

export interface ProductFixFieldDiff {
  field: string;
  fieldLabel: string;
  before: string;
  after: string;
  reason?: string | null;
}

export interface ProductFixDiagnosis {
  detectedIssue: string;
  sellerWrote?: string | null;
  actualInImages?: string | null;
  fixSummary?: string | null;
  ruleTitle?: string | null;
  changes: ProductFixFieldDiff[];
  applied?: boolean;
  draftId?: number;
}

export interface ProductFixResult {
  draftId: number;
  validation: ProductValidation;
  /** Nima tuzatildi (deterministik yoki AI) va nima qo'lda qoldi. */
  deterministicFix?: {
    applied?: string[];
    /** Deterministik yechilmagan blok AI bilan (tavsif rasmga moslandi). */
    aiUsed?: boolean;
    manual?: ModerationManualBlock[];
    at?: string;
    diagnosis?: ProductFixDiagnosis;
  };
  /** SEO bali past bo'lgani uchun chaqirilgan AI-fix qoralamani tuzatgach
   *  avtomatik Uzum'ga ham yubordi — natija shu yerda (moderatsiya-
   *  tetiklangan AI-fix'da bo'sh: sotuvchi "Uzumda yangilash"ni o'zi bosadi). */
  uzumPush?: { ok: boolean; message: string } | null;
  diagnosis?: ProductFixDiagnosis | null;
  canApply?: boolean;
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

/** Uzum MIJOZ (bozor) hisobiga o'z sessiyasi bilan kirish holati — do'konga bog'liq emas. */
export interface MarketLoginSession {
  active: boolean;
  startedAt: number | null;
}

/**
 * Uzum moderatsiya operatoriga Telegram orqali yozish uchun hisob holati.
 * Ulash adminkada ("Telegram userbot"), bu yerda faqat holat o'qiladi.
 */
export interface TelegramOperatorStatus {
  credentialsConfigured: boolean;
  connected: boolean;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  connectedAt: string | null;
}

/**
 * Sotuvchining O'Z Telegram hisobi (do'konga bog'liq) — `/integrations`
 * dagi karta shu bilan ishlaydi.
 *
 * `credentialsConfigured` — ilova kaliti (`api_id`/`api_hash`,
 * adminkada) bormi: usiz login umuman boshlanmaydi.
 * `pendingStep` — boshlangan, lekin tugamagan login qaysi qadamda
 * ("code" | "password"): sahifa yopilib qayta ochilsa sotuvchi
 * raqamdan emas, o'sha yerdan davom etadi (kod qayta so'ralmaydi).
 */
export interface TelegramAccountStatus {
  credentialsConfigured: boolean;
  connected: boolean;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  connectedAt: string | null;
  pendingStep: "code" | "password" | null;
}

/** Login qadamining natijasi: `code_sent` · `password_required` · `connected`. */
export interface TelegramLoginStep {
  status: "code_sent" | "password_required" | "connected";
  phone: string | null;
  username: string | null;
  firstName: string | null;
  message: string | null;
}

/** Operatorga yuboriladigan matn — YUBORISHDAN OLDIN ko'rsatiladi va tahrirlanadi. */
export interface ComplaintPreview {
  productId: number;
  text: string;
  blocked: boolean;
  reasons: number;
  changes: number;
  lastSentAt: string | null;
  connected: boolean;
}

export interface ComplaintStep {
  sent: string;
  text: string | null;
  buttons: string[][];
}

/**
 * Operatorga yozish FON vazifasining holati.
 *
 * `status`: `idle` · `queued` (navbatda — boshqa kartochka
 * yozilmoqda) · `running` · `done` · `failed`.
 * `replyText` — OPERATORNING javobi (tirik odam), sotuvchi uni
 * saytda ko'radi, Telegramni ochmasdan.
 */
export interface ComplaintJob {
  productId: number;
  status: "idle" | "scheduled" | "queued" | "running" | "done" | "failed";
  percent: number;
  step: string;
  error: string | null;
  path: string[];
  reachedOperator: boolean;
  resumed: boolean;
  replyText: string | null;
  replyAt: string | null;
  finishedAt: string | null;
}

/**
 * Do'kon darajasidagi so'rov (bitta tovar haqida EMAS): ombordagi
 * qaytarilgan tovarlar, nuqsonli tovarlar, mablag' yechish…
 *
 * `items` — matnga qo'shilgan haqiqiy tovarlar soni (Uzum
 * javobidagi `quantityReturned`/`quantityDefected` dan).
 * `supportOpen` — qo'llab-quvvatlash markazi hozir ishlayaptimi
 * (09:00–21:00, Toshkent).
 */
/**
 * Uzum sotuvchi kabinetiga avtomatik kirish uchun saqlangan hisob.
 *
 * PAROL hech qachon qaytmaydi — faqat `saved`. `waitingCode` — Uzum
 * tasdiqlash kodini so'radi va brauzer serverda ochiq turibdi.
 */
export interface UzumCredentials {
  saved: boolean;
  login: string | null;
  lastLoginAt: string | null;
  connectedAt: string | null;
  waitingCode: boolean;
}

/** `status`: ok · sms_required · bad_credentials · captcha · bad_code · expired · error. */
export interface UzumAutoLoginResult {
  status: string;
  message: string | null;
}

export interface ShopRequestPreview {
  kind: string;
  title: string;
  text: string;
  items: number;
  connected: boolean;
  supportOpen: boolean;
}

export interface ComplaintSendResult {
  sent: boolean;
  /** Bosilgan menyu tugmalari. Bo'sh — menyu topilmadi, xabar to'g'ridan-to'g'ri ketdi. */
  path: string[];
  steps: ComplaintStep[];
  sentAt: string | null;
}

/** Bozor tokenini avtomatik yangilash holati — `lastStatus`: ok | needs_login | captcha | error. */
export interface MarketAutoRefresh {
  connected: boolean;
  connectedAt: string | null;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastMessage: string | null;
  /** Oxirgi muvaffaqiyatli tokenning turi: session (shaxsiy) | anonymous (mehmon, avtomatik tiklangan). */
  lastMode: string | null;
  intervalSeconds: number;
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

/**
 * «Qidiruvdagi o'rin» jadvalining bitta katagi.
 *
 * Katakning YO'QLIGI — o'sha kuni o'lchov bo'lmagan; `position: null` —
 * o'lchandi, TOP-100 da yo'q. Ikkalasi boshqa narsa va boshqacha chiziladi.
 */
export interface SeoPositionCell {
  day: string;
  position: number | null;
  /** Reklamasiz (organik) o'rin. */
  organic: number | null;
  /** Birinchi chiqish reklama (Boost) edi. */
  ad: boolean;
  /** Oldingi O'LCHOVGA nisbatan (oldingi kunga emas). */
  move: "up" | "down" | "new" | "lost" | null;
}

export type SeoPhraseSource = "manual" | "audit" | "suggest" | "rival" | "market" | "seed" | "sibling";

export interface SeoPositionTableRow {
  phrase: string;
  source: SeoPhraseSource;
  manual: boolean;
  /** `visible` — davrda TOP-100 da ko'ringan; `hidden` — o'lchandi, chiqmadi; `pending` — hali o'lchanmagan. */
  status: "visible" | "hidden" | "pending";
  /** Birinchi 20 natijaning buyurtma + sharhi. `null` — hali o'lchanmagan. */
  demand: number | null;
  /** Uzum shu so'rovga nechta tovar qaytaradi. */
  products: number | null;
  avgPosition: number | null;
  bestPosition: number | null;
  current: number | null;
  currentDay: string | null;
  /** Manfiy — yuqoriga chiqdi. */
  change: number | null;
  foundDays: number;
  measuredDays: number;
  adDays: number;
  lastCheckedOn: string | null;
  lastFoundOn: string | null;
  bestEver: number | null;
  cells: SeoPositionCell[];
}

export interface SeoPositionsSummary {
  visible: number;
  top10: number;
  top30: number;
  top100: number;
  avgPosition: number | null;
  improved: number;
  worsened: number;
  adDays: number;
  candidates: number;
  pending: number;
  hidden: number;
  lastCheckedAt: string | null;
}

export interface SeoPositionsJob {
  running: boolean;
  stage: "discover" | "measure" | "done" | "error" | null;
  done: number;
  total: number;
  error: string | null;
  finishedAt: string | null;
}

export interface SeoPositionsTable {
  days: number;
  today: string;
  /** Davr kunlari — eng yangisi birinchi. */
  calendar: string[];
  summary: SeoPositionsSummary;
  job: SeoPositionsJob;
  rows: SeoPositionTableRow[];
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

/**
 * AI kaliti holati va sarf. Haqiqiy balansni provayderlar oddiy kalitga
 * bermaydi: `remainingUsd` — sotuvchi kiritgan balans minus eStats sarfi
 * (taxminiy), `status === "no_credit"` bo'lsa esa o'lchangan nol.
 */
export interface AiAccountState {
  status: "active" | "rate_limited" | "spend_cap" | "no_credit" | "invalid" | "error" | "missing";
  statusMessage: string | null;
  checkedAt: string | null;
  billingUrl: string;
  spentTodayUsd: number;
  spentMonthUsd: number;
  spentTotalUsd: number;
  balanceUsd: number | null;
  balanceSetAt: string | null;
  remainingUsd: number | null;
  /** Kiritilgan balansdan keyingi sarf undan oshgan, kalit esa ishlaydi — balansni yangilang. */
  balanceStale?: boolean;
}

export interface AiKeyState {
  configured: boolean;
  studioUrl: string;
  /** Faqat `account: true` bilan so'ralganda. */
  account?: AiAccountState | null;
}

// ── AI bilan mahsulot tayyorlash ────────────────────────────────

export interface OpenAiKeyState {
  configured: boolean;
  platformUrl: string;
  /** Bitta rasm taxminan qancha turadi. */
  imagePriceUsd: number;
  /** Faqat `account: true` bilan so'ralganda. */
  account?: AiAccountState | null;
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
  /** Uzum'ga muvaffaqiyatli joylangan bo'lsa — qatordan yashiriladi. */
  uzumPublished: boolean;
  /**
   * Uzum'ning O'Z tovar ID'si (joylangan bo'lsa). Ombor jadvali
   * shuni `WarehouseProduct.externalProductId` bilan solishtirib,
   * tovar qatoridan aynan shu qoralamaga havola qo'yadi. FAQAT
   * ro'yxat (`DraftListOut`) qaytaradi — to'liq qoralamada
   * `uzumPublish.productId` bor.
   */
  productId?: string | null;
}

export interface AiRival {
  title: string;
  price: number | null;
  orders: number;
  url: string;
  image: string;
  reviews: number;
  rating: number | null;
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

export interface AiCategoryLevel {
  depth: number;
  /** Avtomatika shu darajada tanlagan nom (ishonchli bo'lmasa ham). */
  chosen: string;
  /** Shu darajada mavjud barcha variant. */
  candidates: string[];
}

export interface AiUzumPublish {
  /** queued / published / needs_login / captcha / category_unresolved / needs_manual_step / stopped / error. */
  status: string;
  message: string;
  log: string[];
  /**
   * "edit" — tirik tovarni tahrirlash («Uzumda yangilash»), yo'q/"publish" — yaratish.
   * Tahrirlash bosqichlari: opening / names / descriptions / sections / gallery / saving / attributes / finishing.
   */
  kind?: string | null;
  /** Tahrirlashda rasmlar ham almashtirilyaptimi. */
  replaceImages?: boolean | null;
  /** starting / category / content / images / review — hozir qaysi bosqichda. */
  stage: string | null;
  progress: number;
  /** bosqich nomi -> millisekund (tugagan bosqichlar uchun). */
  timings: Record<string, number>;
  /** `status === "category_unresolved"` bo'lganda: HAR bosilgan daraja, birinchisidan boshlab — xato ko'pincha o'rtada bo'ladi. */
  categoryLevels: AiCategoryLevel[];
  /** `status === "published"` bo'lgach Uzum'ning o'z tovar ID'si — keyingi tahrirlash shunga tayanadi. */
  productId: string | null;
  /**
   * Tovar QAYSI Uzum do'koniga joylangan (joylanmoqda). Tahrirlash shu
   * raqamga boradi. Eski yozuvlarda yo'q — ular qoralamaning o'z do'konida.
   */
  uzumShopId?: number | null;
  uzumShopTitle?: string | null;
  /**
   * Sotuvchi qoralamani MAVJUD tovarga o'zi bog'lagan (`status: "linked"`) —
   * yangi e'lon yaratilmagan. Bog'lanishni faqat shu holatda bekor qilish mumkin.
   */
  linkedManually?: boolean | null;
  linkedAt?: string | null;
  /** Oxirgi "Uzumda tekshirish" natijasi. `null` — hali tekshirilmagan. */
  verified: boolean | null;
  verifiedAt: string | null;
  verifyMessage: string | null;
}

/** Qoralamani joylash mumkin bo'lgan bitta Uzum do'koni. */
export interface AiUzumShop {
  /** Uzum'ning O'Z do'kon raqami. */
  id: number;
  title: string;
  /** Uzum SKU'lar oldiga qo'yadigan prefiks ("LUNAHUB"). */
  skuPrefix: string | null;
  /**
   * Kabinetga kirilgan Uzum hisobida bormi. `null` — kabinet ro'yxati
   * hali olinmagan; `false` — yo'q, bu sessiya u yerga joylay olmaydi.
   */
  inCabinet: boolean | null;
  /** eStats'da ish maydoni sifatida qo'shilganmi. */
  inEstats: boolean;
  /** Hozir ochiq eStats do'koni — sukut bo'yicha joylash shu yerga. */
  isCurrent: boolean;
}

export interface AiUzumShops {
  shops: AiUzumShop[];
  /** Sukut bo'yicha nishon — joriy eStats do'konining Uzum raqami. */
  currentId: number;
  /** Kabinetdagi ro'yxat olinganmi (`false` — faqat eStats'dagi do'konlar). */
  cabinetKnown: boolean;
  syncedAt: string | null;
}

export interface AiCategoryNode {
  id: number;
  title: string;
  /** "Goʻzallik va parvarish → Shaxsiy gigiyena → ..." — bitta nom yetmaydi: bir xil nom daraxtning bir necha joyida bor. */
  fullTitle: string | null;
  level: number;
  /** Uzum shu tugunga tovar qo'yishga ruxsat beradimi. */
  canUse: boolean;
  hasChildren: boolean;
  okpd2Required: boolean;
}

export interface AiCategoryPick {
  id: number | null;
  title: string | null;
  fullTitle: string | null;
  /** Ildizdan nishongacha — har darajani alohida o'zgartirish uchun. */
  path: AiCategoryNode[];
  /** "ai" | "manual" | "product" — sotuvchi tanlovini quvur bosib ketmasligi uchun. */
  source: string | null;
  treeReady: boolean;
}

export interface AiDraft extends AiDraftRow {
  sourceImages: string[];
  /** To'liq AI tadqiqoti. Qoralama BILAN keladi — alohida so'rov yo'q. */
  intelligence?: AiIntelligenceResult;
  /**
   * Qoralamadagi rasmlar Uzum'dagidan farq qiladimi.
   *
   * Rasm qayta yasalgach tirik e'lon O'ZI yangilanmaydi (qayta
   * moderatsiya — sotuvchining qarori), shuning uchun farq
   * KO'RSATILADI.
   */
  imagesOutOfSync?: boolean;
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
  /** Shu indekslarda "qayta yasash"dan oldingi variant bor — orqaga qaytarish tugmasi shunga qarab ko'rsatiladi. */
  imageHistoryIndexes: number[];
  /** Joylashdan oldingi tekshiruv — matn, rasm, MXIK to'liqmi. */
  audit: AiAudit | null;
  /** Uzum'ga avtomatik joylash holati. Hali boshlanmagan bo'lsa `null`. */
  uzumPublish: AiUzumPublish | null;
  /** Uzum turkumi — endi qoralamaning O'Z maydoni, joylash paytida topiladigan narsa emas. */
  category: AiCategoryPick | null;
  /** Qaysi Uzum do'koniga joylanadi. `null` — qoralamaning o'z (joriy) do'koni. */
  uzumShop?: { id: number; title: string } | null;
  /** Sotuvchi kiritgan xom qiymatlar — «Tan narx» maydonlarini oldindan to'ldirish uchun. */
  pricing: {
    unitCost?: number | null;
    commissionPct?: number | null;
    logisticsPerUnit?: number | null;
  };
  /** Tan narx bo'yicha «beziyon nuqta» va narx-foyda jadvali. Tan narx yo'q bo'lsa `hasCost=false`. */
  economics: UnitEconomics | null;
  /**
   * Uzum formasining qolgan bo'limlari — qisqacha tavsif (390),
   * o'lchamli setka, tarkib, yo'riqnoma. Snake_case ATAYLAB:
   * backenddagi `card_content.CONTENT_FIELDS` bilan bir xil kalit.
   */
  content?: Partial<Record<AiContentKey, string>>;
  /** Qaysi rasm qaysi bo'limga qo'yiladi (tavsif, o'lcham, tarkib, yo'riqnoma). */
  sectionImages?: Partial<Record<"description" | "size" | "composition" | "usage", string[]>>;
  /** Sotuvchi «Olib tashlash» bosgan rasmlar — chizilgan holda turadi, Uzum'ga ketmaydi. */
  removedImages?: string[];
  /** Xaridor tanlaydigan variantlar (rang, o'lcham …). */
  variants?: AiVariants;
  /** Har ko'rinadigan variant uchun yasalgan kadrlar: `{kalit: [url]}`. */
  variantImages?: Record<string, string[]>;
  /** Qaysi joyga nechta kadr. */
  imageSettings?: AiImageSettings;
  /** Tavsif/bo'lim rasmlari slot kaliti bilan. */
  contentImages?: Record<string, string>;
  /** Asl surat bo'la oladigan rasmlar. */
  sourceCandidates?: AiSourceCandidate[];
  /** Rejadagi, lekin yasalmagan galereya o'rinlari. */
  missingGallery?: { position: number; type: string; goal: string }[];
  /** Uzum 2-bosqichidagi «SKU» — tovar nomidan. */
  sku?: string;
  updatedAt: string;
}

/** Davrni ochgan bitta o'zgarish (`warehouse_product_change_logs`). */
export interface ProductPeriodEvent {
  id: number;
  at: string;
  /** title / image / images / category / price / description / sections / period. */
  field: string;
  label: string;
  /** uzum — katalogdan topildi, estats — «Uzumda yangilash», manual — sotuvchi belgisi. */
  source: string;
  before: string | null;
  after: string | null;
  note: string | null;
}

/** Davr ko'rsatkichlari — hammasi o'lchangan ma'lumotdan hisoblanadi. */
export interface ProductPeriodMetrics {
  days: number;
  funnel: {
    measuredDays: number;
    impressions: number;
    views: number;
    cart: number;
    orders: number;
    impressionsPerDay: number | null;
    viewsPerDay: number | null;
    cartPerDay: number | null;
    ordersPerDay: number | null;
    viewRate: number | null;
    cartRate: number | null;
    orderRate: number | null;
  };
  sales: {
    units: number;
    revenue: number;
    unitsPerDay: number;
    revenuePerDay: number;
    avgPrice: number | null;
  };
  seo: {
    checkedPhrases: number;
    foundPhrases: number;
    top10: number;
    top50: number;
    avgPosition: number | null;
    best: { phrase: string; avgPosition: number | null; bestPosition: number | null; foundDays: number }[];
  };
  /** Solishtiruv javobida — oraliq chegaralari. */
  from?: string;
  to?: string;
}

export interface ProductPeriod {
  index: number;
  start: string;
  end: string;
  days: number;
  isCurrent: boolean;
  /** Shu davrdagi nom va asosiy rasm (hodisalardan orqaga tiklangan). */
  title: string | null;
  image: string | null;
  events: ProductPeriodEvent[];
  metrics: ProductPeriodMetrics;
}

export interface ProductPeriods {
  productId: number;
  externalProductId: string | null;
  firstDay: string;
  periods: ProductPeriod[];
}

/** Ikki davrdagi bitta kalit so'z. */
export interface PeriodKeywordRow {
  phrase: string;
  a: number | null;
  b: number | null;
  aFoundDays: number;
  bFoundDays: number;
  delta: number | null;
  /** up / down / same / new / lost / unmeasured. */
  status: string;
}

export interface ProductPeriodCompare {
  a: ProductPeriodMetrics;
  b: ProductPeriodMetrics;
  keywords: PeriodKeywordRow[];
}

/** AI sarfining bir bo'lagi — xizmat (Gemini/OpenAI) yoki ish guruhi. */
export interface AiCostPart {
  key: string;
  label: string;
  usd: number;
  calls: number;
  images: number;
}

/** Bitta kartochka uchun AI sarfi. */
export interface AiCost {
  totalUsd: number;
  calls: number;
  images: number;
  services: AiCostPart[];
  tasks: AiCostPart[];
}

export interface AiCostDraftRow {
  draftId: number;
  title: string;
  cover: string | null;
  stage: string;
  productId: string | null;
  totalUsd: number;
  geminiUsd: number;
  openaiUsd: number;
  calls: number;
  images: number;
  lastAt: string | null;
}

/** Do'konning kartochkalar bo'yicha AI sarfi (eng qimmatidan). */
export interface AiCostList {
  totalUsd: number;
  services: AiCostPart[];
  /** Kartochkaga bog'lanmagan chaqiruvlar (kalit tekshiruvi, SEO auditi…). */
  unassignedUsd: number;
  total: number;
  drafts: AiCostDraftRow[];
}

export type AiContentKey =
  | "short_uz" | "short_ru"
  | "size_uz" | "size_ru"
  | "composition_uz" | "composition_ru"
  | "usage_uz" | "usage_ru";

export interface AiDraftPatch {
  /** Uzum formasining bo'limlari — berilgan kalitlar birlashtiriladi. */
  content?: Partial<Record<AiContentKey, string>>;
  titleUz?: string;
  titleRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  attributes?: Record<string, string>;
  keywords?: string[];
  mxik?: string;
  mxikName?: string;
  suggestedPrice?: number;
  /** Qaysi Uzum do'koniga joylanadi. `null` — qoralamaning o'z do'koniga qaytaradi. */
  uzumShopId?: number | null;
  /**
   * Rasm tahlilining (`vision`) sotuvchi tuzatishi mumkin bo'lgan
   * qismi. RANGLAR alohida muhim — ular rasm rejasini belgilaydi
   * (har rang uchun 4 kadr). Faqat oq ro'yxatdagi kalitlar
   * (`colors`, `material`, `product`, `features`, `category`)
   * qabul qilinadi.
   */
  vision?: {
    colors?: string[];
    material?: string;
    product?: string;
    features?: string[];
    category?: string;
  };
  /** Tan narx va (ixtiyoriy) komissiya foizi / dona-logistikasi. */
  pricing?: {
    unitCost?: number | null;
    commissionPct?: number | null;
    logisticsPerUnit?: number | null;
  };
}

export interface AiImageRedo {
  /** Sotuvchining o'z ko'rsatmasi. Bo'sh bo'lsa faktlar bo'yicha. */
  prompt?: string;
  /** Galereyadagi qaysi rasm (faqat shu bittasi qayta yasaladi). */
  index?: number | null;
  /** Faqat shu tavsif/bo'lim kadrini qayta yasaydi (`bolim_tarkib`, `bolim_tarkib_2` …). */
  slot?: string;
  /** Variant kadri: qiymat kaliti va tartibi (0 — muqova). */
  variant?: string;
  order?: number;
  /** Joyga QO'SHIMCHA kadr — mavjudlari tahlil qilinib, takrorlanmaydigani yasaladi. */
  add?: "gallery" | "description" | "size" | "composition" | "usage" | "variant";
  /** Rejadagi, lekin yasalmagan galereya o'rni. */
  position?: number;
  /** Rejadagi hamma yetishmagan kadr birdan. */
  missing?: boolean;
}

/** Asl surat nomzodi — backend `product_ai/sources.py`. */
export interface AiSourceCandidate {
  url: string;
  /** "seller" | "uzum" | "uzum_description" | "uzum_cdn" | "generated" | "other" */
  origin: string;
  label: string;
  selected: boolean;
  /** AI yasagan — asl surat bo'la olmaydi (olib tashlash kerak). */
  generated: boolean;
}

/** Variant qiymati (rang, o'lcham …) — backend `intelligence/variants.py`. */
export interface AiVariantValue {
  key: string;
  nameUz: string;
  nameRu: string;
  hex: string;
  /** Shu qiymat ko'rinadigan namuna suratlar. */
  images: string[];
  description: string;
}

export type AiVariantKind = "color" | "design" | "size" | "other";

export interface AiVariantAxis {
  key: string;
  titleUz: string;
  titleRu: string;
  kind: AiVariantKind;
  /** Rasmi alohida chiziladimi (rang, dizayn). */
  visual: boolean;
  values: AiVariantValue[];
}

export interface AiVariants {
  axes?: AiVariantAxis[];
  /** "seller" | "uzum" | "warehouse" | "vision" */
  source?: string;
  /** Aniqlab bo'lmadi — sotuvchi tanlashi kerak. */
  needsChoice?: boolean;
  question?: string;
  confidence?: number;
  detectedAt?: string;
}

export interface AiVariantType {
  titleUz: string;
  titleRu: string;
  kind: AiVariantKind;
  visual: boolean;
  /** Bazadagi nechta kartochkada uchragan (0 — standart ro'yxatdan). */
  count: number;
}

export interface AiImageSettings {
  /** 0 — avtomatik (5-8). */
  gallery: number;
  per_variant: number;
  description: number;
  size: number;
  composition: number;
  usage: number;
}

export interface AiImageSettingsState {
  settings: AiImageSettings;
  limits: Record<keyof AiImageSettings, [number, number]>;
  imagePriceUsd: number;
  setPriceUsd: number;
}

export interface AiKeywordFillResult {
  before: number;
  after: number;
  woven: string[];
  tail: string[];
  irrelevant: string[];
  draft: AiDraft;
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

// ── Product Intelligence (§18) ──────────────────────────────────
//
// Backend `intelligence/service.py` `summarise()` shakli.
//
// **Bu yerdagi maydonlar SNAKE_CASE — loyihaning qolgan turlaridan
// farqli.** Sabab: `IntelligenceOut.result` — Pydantic sxemasi
// EMAS, oddiy `dict`, ya'ni Python nomlari o'zgarishsiz keladi.
// Avtomatik camelCase'ga o'girish ATAYLAB qilinmadi: `grouped`
// kalitlari (`long_tail`) o'girilsa, `Keyword.group` QIYMATI
// (`"long_tail"` — u kalit emas, satr) o'girilmasdi va ikkalasi
// bir-biriga mos kelmay qolardi.
//
// Har blok ixtiyoriy: quvur qadamma-qadam ketadi va sotuvchi
// tugallanmagan natijani ham ko'radi (yiqilgan qadam qolganini
// to'smaydi — §17).

/** Bitta qiymat va u QAYERDAN kelgani. */
export interface AiFact {
  value: string;
  /** seen — rasmda ko'rindi · given — sotuvchi bergan · assumed — taxmin. */
  source: "seen" | "given" | "assumed";
  confidence: number;
}

export interface AiUnderstanding {
  product_type: AiFact;
  category: AiFact;
  subcategory: AiFact;
  brand: AiFact;
  material: AiFact[];
  colors: AiFact[];
  size: Record<string, unknown>;
  quantity: number | null;
  quantity_source: string;
  usage: string[];
  target_audience: string[];
  main_features: string[];
  visual_features: string[];
  possible_keywords: string[];
  search_queries: string[];
  confidence: number;
  /** Model aniqlay olmagani — bo'sh javobdan halolroq. */
  unclear: string[];
  /** Faqat ko'rilgan/berilgan faktlar. Ajratmani BACKEND qiladi. */
  certain_facts: Record<string, string | string[]>;
  assumptions: Record<string, string | string[]>;
  provider: string;
  model: string;
}

export interface AiCompetitor {
  competitor_id: string;
  title: string;
  /** 0..1 — birga-bir o'xshashlik balli. */
  similarity_score: number;
  semantic_similarity: number;
  visual_similarity: number | null;
  price: number;
  rating: number;
  reviews: number;
  orders: number;
  image: string;
  image_count: number;
  category: string;
  url: string;
  /** Nega o'xshash deb topildi. */
  why: string[];
}

export interface AiColorGuess {
  name: string;
  rgb: number[];
  share: number;
}

export interface AiColors {
  primary: string;
  secondary: string;
  multicolor: boolean;
  confidence: number;
  /** Piksel bo'yicha O'LCHANGAN — model taxmini emas. */
  measured: AiColorGuess[];
  model_named: string[];
  /** O'lchov va model kelishdimi. */
  agreed: boolean;
  notes: string[];
}

export interface AiKeyword {
  phrase: string;
  source: string;
  suggest_rank: number | null;
  demand: number;
  competitor_usage: number;
  group: string;
  covered: boolean;
  weight: number;
  /** Tovarga tegishlimi — tegishli emasi qamrovga kirmaydi. */
  relevant?: boolean;
  /** Nega tegishli emas. */
  reason?: string;
  /** To'g'ri imlodagi shakli (`phrase` normallashtirilgan). */
  spelled?: string;
}

export interface AiSeoPlan {
  coverage: number;
  /** Qo'ldan ketayotgan qamrov — tashqi xizmatdagi asosiy ko'rsatkich. */
  missed_coverage: number;
  keywords: AiKeyword[];
  grouped: Record<string, AiKeyword[]>;
  missing_top: AiKeyword[];
  /** Tegishlilik AI bilan tekshirilganmi. */
  reviewed?: boolean;
  /** Tovarga tegishli bo'lmagan iboralar (sababi bilan). */
  irrelevant?: AiKeyword[];
}

export interface AiTextIssue {
  field: string;
  message: string;
}

export interface AiTexts {
  title_uz: string;
  title_ru: string;
  short_uz: string;
  short_ru: string;
  description_uz: string;
  description_ru: string;
  bullets_uz: string[];
  bullets_ru: string[];
  usage_uz: string;
  usage_ru: string;
  care_uz: string;
  used_keywords: string[];
  issues: AiTextIssue[];
  /** Tekshiruvdan o'tdimi — o'tmagani QORALAMAGA yozilmaydi. */
  ok: boolean;
  provider: string;
  model: string;
}

export interface AiPricing {
  market_min: number;
  market_median: number;
  market_max: number;
  recommended_price: number;
  /** Ustidan chizib ko'rsatiladigan narx. */
  recommended_full_price: number;
  competitive_price: number;
  premium_price: number;
  discount_percent: number;
  confidence: number;
  /** Nechta raqobatchi hisobga olindi. */
  sample: number;
  /** Nechtasi chetlatildi (10 dona ≠ 1 dona). */
  dropped: number;
  reasoning_summary: string;
  notes: string[];
}

export interface AiMxik {
  code: string;
  name: string;
  path: string;
  /** verified — katalogda tekshirildi · needs_review · not_found. */
  status: string;
  confidence: number;
  reasoning: string;
  alternatives: Record<string, unknown>[];
  /** Qanday qidirilgani — audit uchun. */
  evidence: string[];
  agreed: boolean | null;
  /** Qoralamaga AVTOMATIK yozish mumkinmi. */
  auto_acceptable: boolean;
  provider: string;
  model: string;
}

export interface AiCharacteristic {
  characteristic_id: string;
  characteristic_name: string;
  value_id: string;
  value: string;
  confidence: number;
  /** deterministic — aniq moslik · model — AI tanlagan. */
  source: string;
  reason: string;
  required: boolean;
  accepted: boolean;
}

export interface AiComplianceIssue {
  code: string;
  level: string;
  message: string;
  auto_fixable: boolean;
  action: string;
}

export interface AiCompliance {
  ready: boolean;
  summary: string;
  blocking: AiComplianceIssue[];
  warnings: AiComplianceIssue[];
}

export interface AiGeneratedImage {
  position: number;
  type: string;
  accepted: boolean;
  /** Asl tovarga o'xshashligi — 0.7 dan past bo'lsa rad etiladi. */
  visual_similarity: number;
  same_product: boolean;
  quality: number;
  differences: string[];
  verdict: string;
  attempts: number;
  error: string;
  has_image: boolean;
}

export interface AiPlannedImage {
  position: number;
  type: string;
  /** Kadrning vazifasi (backend `PlannedImage.goal`). */
  goal?: string;
  concept?: string;
  text_on_image?: string;
  purpose: string;
  composition: string;
  background: string;
  text: string;
  props: string[];
  /** Tavsif/bo'lim kaliti (`bolim_tarkib_2`). */
  slot?: string;
  /** "" | "*" (hammasi) | qiymat kaliti. */
  variant?: string;
}

export interface AiImagePlan {
  /** Shu tovarga XOS yo'nalish — umumiy shablon EMAS. */
  creative_direction: string;
  tone: string;
  palette: string[];
  hero_message: string;
  avoid: string[];
  recommended_image_count: number;
  images: AiPlannedImage[];
  /** Tavsif va bo'limlar uchun alohida kadrlar (`position` 100+). */
  content_images?: AiPlannedImage[];
  /** Har ko'rinadigan variant uchun kadrlar (`position` 2000+). */
  variant_images?: AiPlannedImage[];
  provider: string;
  model: string;
}

/** `draft.attributes["intelligence"]` — tayyor natija. */
export interface AiIntelligenceResult {
  updated_at?: string;
  understanding?: AiUnderstanding;
  competitors?: AiCompetitor[];
  pattern?: Record<string, unknown>;
  colors?: AiColors;
  seo?: AiSeoPlan;
  texts?: AiTexts;
  pricing?: AiPricing;
  mxik?: AiMxik;
  image_plan?: AiImagePlan;
  visual_identity?: Record<string, unknown>;
  generated_images?: AiGeneratedImage[];
  characteristics?: AiCharacteristic[];
  compliance?: AiCompliance;
  /**
   * Qisman yurish natijasi («Matnlarni qayta yozish»). Yiqilsa
   * qoralama `failed` ga tushmaydi — sabab shu yerda.
   */
  partial?: {
    only: string[];
    status: "done" | "failed";
    error: string;
    at: string;
  };
}

/** Voronkaning bitta kuni — grafik uchun. */
export interface FunnelDay {
  date: string;
  impressions: number;
  views: number;
  cart: number;
  orders: number;
  completed: number;
  gmv: number;
}

/** Tashxisni asoslovchi bitta topilma. */
export interface FunnelFinding {
  text: string;
  /** "measured" — shu tovar uchun o'lchangan aniq raqam; "uzum_guide" — Uzum'ning umumiy tavsiyasi. */
  source: "measured" | "uzum_guide";
}

/**
 * Eng zaif bosqich va uni kuchaytirish uchun amaliy yordam.
 *
 * Manba ikki qatlamli: Uzum'ning O'Z rasmiy qo'llanmasi
 * (sotuvchi kabinetidan so'zma-so'z ko'chirilgan) + shu tovar
 * uchun bizda bor o'lchangan ma'lumot (SEO audit, bozor
 * mediani, qoldiq, blok holati) bo'lsa — umumiy tavsiyani aniq
 * raqamga bog'laydi.
 */
export interface FunnelDiagnosis {
  stage: string;
  stageTitle: string;
  /** "yetarli" — namuna hukm chiqarish uchun yetarli; "kam_malumot" — hali kam, ehtiyot bilan o'qing. */
  confidence: "yetarli" | "kam_malumot";
  metric: number | null;
  benchmarkMin: number | null;
  benchmarkMax: number | null;
  why: string;
  note: string;
  findings: FunnelFinding[];
  actions: string[];
}

/**
 * Uzum «Voronka» analitikasi — bitta tovar bo'yicha.
 *
 * Manba: sotuvchi kabinetidagi `analytics/funnel` sahifasi
 * ishlatadigan Cube.js xizmati. Sonlar Uzum bergan holda —
 * QAYTA HISOBLANMAYDI, chunki sotuvchi ularni kabinetdagi
 * sonlar bilan solishtiradi.
 */
export interface Funnel {
  periodFrom: string;
  periodTo: string;

  /** Qidiruv va katalogda necha marta ko'rsatildi. */
  impressions: number;
  /** Kartochka necha marta ochildi. */
  views: number;
  addToCart: number;
  orders: number;
  completed: number;
  canceled: number;
  returned: number;

  /** Konversiyalar, foizda. */
  convImpressionToView: number;
  convViewToCart: number;
  convCartToOrder: number;
  /** Sotib olish foizi: yetkazilgan / buyurtma. */
  redemption: number;

  gmvGenerated: number;
  gmvCompleted: number;
  gmvReturnedCanceled: number;
  avgOrderPrice: number;
  avgOrdersPerDay: number;

  daily: FunnelDay[];
  /** Uzumdan oxirgi marta qachon olingani. */
  syncedAt: string | null;
  /** Eng zaif bosqich va uni kuchaytirish uchun amaliy yordam. */
  diagnosis: FunnelDiagnosis | null;
}

/** «Uzum sababini aniqlash» fon ishining bitta bosqichi. */
export interface ModerationJobStage {
  key: "prepare" | "cabinet" | "relogin" | "save" | "done" | string;
  label: string;
  state: "done" | "active" | "pending" | "failed" | "skipped";
}

/** «Uzum sababini aniqlash» — fonda ketadigan ish (backend §9.38). */
export interface ModerationJob {
  /** Tovar id yoki `all`. */
  key: string;
  productId: number | null;
  title: string;
  status: "queued" | "running" | "done" | "failed";
  percent: number;
  step: string;
  stages: ModerationJobStage[];
  startedAt: string | null;
  updatedAt: string | null;
  finishedAt: string | null;
  checked: number;
  updated: number;
  message: string;
  error: string | null;
  reasons: string[];
}

/** Uzum operatoriga yuboriladigan pochta va manbasi (backend §9.39). */
export interface SupportEmail {
  email: string;
  /** `shop` — saqlangan; `cabinet_login` — kabinet logini; `account` — eStats hisobi; "" — yo'q. */
  source: "shop" | "cabinet_login" | "account" | "";
  /** Shu do'konga alohida saqlangan qiymat. */
  saved: string;
  /** Foydalanuvchining do'konlari soni. */
  shops: number;
}
