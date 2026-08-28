/**
 * Server-only Uzum Seller OpenAPI client + aggregation.
 *
 * The seller token never leaves the server — this module is imported exclusively
 * from route handlers. Do not import it into client components.
 */
import "server-only";

import type {
  DailyFinance,
  ExpenseLine,
  FinanceReport,
  FinanceTotals,
  OrderStatus,
} from "@/features/finance/types";

const BASE_URL =
  process.env.UZUM_API_BASE ??
  "https://api-seller.uzum.uz/api/seller-openapi";

/** Uzbekistan has no DST; a fixed +05:00 offset is exact. */
const UZ_OFFSET_MS = 5 * 60 * 60 * 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 100; // hard stop so a misbehaving API can't loop forever

interface UzumOrderItem {
  status: OrderStatus;
  date: number | null;
  orderId: number | null;
  amount: number | null;
  amountReturns: number | null;
  sellPrice: number | null;
  commission: number | null;
  logisticDeliveryFee: number | null;
  sellerProfit: number | null;
}

interface UzumPayment {
  id: number;
  dateCreated: number | null;
  dateService: number | null;
  name: string | null;
  source: string | null;
  paymentPrice: number | null;
  code: string | null;
  status: string | null;
  type: "OUTCOME" | "INCOME" | null;
}

export class UzumConfigError extends Error {}
export class UzumApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/**
 * Resolve the seller token to use for a request. A per-request `override` (the token
 * the user pasted, forwarded by a route handler) takes precedence over the env token.
 */
function getToken(override?: string): string {
  const token = (override ?? process.env.UZUM_API_TOKEN)?.trim();
  if (!token) {
    throw new UzumConfigError(
      "UZUM_API_TOKEN yo'q. .env.local faylida Uzum seller tokenini o'rnating."
    );
  }
  return token;
}

export interface UzumShop {
  id: number;
  name: string;
}

/**
 * The shops the given token can access — the token's own identity check.
 * A 401/403 from Uzum means the token is invalid or lacks the shops scope.
 */
export async function fetchShops(token?: string): Promise<UzumShop[]> {
  return uzumGet<UzumShop[]>("/v1/shops", {}, token);
}

export interface UzumSku {
  skuId: number;
  skuTitle: string | null;
  skuFullTitle: string | null;
  productTitle: string | null;
  characteristics: string | null;
  barcode: number | null;
  previewImage: string | null;
  price: number | null;
  marketPrice: number | null;
  commission: number | null;
  quantityAvailable: number | null;
  quantityActive: number | null;
  quantitySold: number | null;
  quantityReturned: number | null;
  archived: boolean | null;
}

export interface UzumProduct {
  productId: number;
  category: string | null;
  rating: string | null;
  feedbackQuantity: number | null;
  status: { title?: string; value?: string; color?: string } | null;
  commissionDto: { minCommission?: number; maxCommission?: number } | null;
  skuList: UzumSku[] | null;
}

/**
 * All products of a shop (endpoint: /v1/product/shop/{shopId}). The response has no
 * total count, so we page until a short page arrives, guarded by MAX_PAGES.
 */
export async function fetchShopProducts(shopId: number, token?: string): Promise<UzumProduct[]> {
  const products: UzumProduct[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await uzumGet<{ productList?: UzumProduct[] }>(
      `/v1/product/shop/${shopId}`,
      { page, size: PAGE_SIZE },
      token,
    );
    const batch = data.productList ?? [];
    products.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return products;
}

/** Uzum image ids come without an extension; the CDN serves /original.jpg. */
export function uzumImageUrl(previewImage: string | null | undefined): string | null {
  if (!previewImage) return null;
  if (/\.(jpg|jpeg|png|webp)$/i.test(previewImage)) return previewImage;
  return `${previewImage.replace(/\/$/, "")}/original.jpg`;
}

export function getShopIds(): number[] {
  const raw = process.env.UZUM_SHOP_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!ids.length) {
    throw new UzumConfigError(
      "UZUM_SHOP_IDS yo'q. .env.local faylida do'kon ID(lar)ini o'rnating."
    );
  }
  return ids;
}

/** ISO day key (YYYY-MM-DD) for an epoch-ms instant, in Asia/Tashkent. */
function dayKey(epochMs: number): string {
  return new Date(epochMs + UZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** Inclusive [00:00, 23:59:59.999] Tashkent-day bounds as epoch ms. */
function rangeToEpoch(fromDay: string, toDay: string): { from: number; to: number } {
  const from = Date.parse(`${fromDay}T00:00:00.000+05:00`);
  const to = Date.parse(`${toDay}T23:59:59.999+05:00`);
  if (Number.isNaN(from) || Number.isNaN(to)) {
    throw new UzumApiError("Sana formati noto'g'ri (YYYY-MM-DD kutilmoqda).", 400);
  }
  return { from, to };
}

async function uzumGet<T>(
  path: string,
  params: Record<string, string | number | number[]>,
  token?: string,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
    else url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    headers: { Authorization: getToken(token), Accept: "application/json" },
    // Always hit Uzum fresh; caching is the client's job (see the store).
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new UzumApiError(
      `Uzum API xatosi (${res.status}) ${path}${body ? `: ${body.slice(0, 200)}` : ""}`,
      res.status
    );
  }
  return (await res.json()) as T;
}

/**
 * Page through finance/orders and stop once we've paged past the window's start.
 *
 * NOTE: Uzum's `dateFrom`/`dateTo` filter the *issued/withdrawn* date, which is
 * null for in-progress orders, so they silently drop rows we need. We therefore
 * DON'T send them — instead we rely on the API returning items sorted by `date`
 * descending, page from newest, and stop as soon as a page dips below `from`.
 * The caller filters the exact [from, to] window during aggregation.
 */
async function fetchOrders(shopIds: number[], from: number): Promise<UzumOrderItem[]> {
  const items: UzumOrderItem[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await uzumGet<{ orderItems?: UzumOrderItem[]; totalElements?: number }>(
      "/v1/finance/orders",
      { shopIds, group: "false", page, size: PAGE_SIZE }
    );
    const batch = data.orderItems ?? [];
    items.push(...batch);
    const total = data.totalElements ?? 0;
    const reachedOlder = batch.some((it) => it.date != null && it.date < from);
    if (batch.length < PAGE_SIZE || items.length >= total || reachedOlder) break;
  }
  return items;
}

/**
 * Page through finance/expenses (sorted by dateCreated desc), stopping past the
 * window's start. `totalElements` is unreliable here (returns 0), and the date
 * params are just as fragile as on /orders, so we page + stop client-side.
 * Filtered to confirmed outgoing charges.
 */
async function fetchExpenses(shopIds: number[], from: number): Promise<UzumPayment[]> {
  const payments: UzumPayment[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await uzumGet<{ payload?: { payments?: UzumPayment[] } }>(
      "/v1/finance/expenses",
      { shopIds, page, size: PAGE_SIZE }
    );
    const batch = data.payload?.payments ?? [];
    payments.push(...batch);
    const reachedOlder = batch.some((p) => (p.dateCreated ?? p.dateService ?? 0) < from);
    if (batch.length < PAGE_SIZE || reachedOlder) break;
  }
  return payments.filter(
    (p) => p.type === "OUTCOME" && p.status !== "CANCELED" && p.status !== "REFUNDED"
  );
}

const STATUS_ZERO: Record<OrderStatus, number> = {
  TO_WITHDRAW: 0,
  PROCESSING: 0,
  CANCELED: 0,
  PARTIALLY_CANCELLED: 0,
};

function emptyDay(date: string): DailyFinance {
  return {
    date,
    orders: 0,
    units: 0,
    gross: 0,
    commission: 0,
    logistics: 0,
    expenses: 0,
    sellerProfit: 0,
    net: 0,
    returns: 0,
    commissionRate: 0,
  };
}

/** Fetch + aggregate everything into a client-ready report. */
export async function buildFinanceReport(fromDay: string, toDay: string): Promise<FinanceReport> {
  const shopIds = getShopIds();
  const { from, to } = rangeToEpoch(fromDay, toDay);

  const [orders, expenses] = await Promise.all([
    fetchOrders(shopIds, from),
    fetchExpenses(shopIds, from).catch(() => [] as UzumPayment[]),
  ]);

  const inRange = (ts: number | null | undefined): ts is number =>
    ts != null && ts >= from && ts <= to;

  const days = new Map<string, DailyFinance>();
  const orderIdsByDay = new Map<string, Set<number>>();
  const statusCounts: Record<OrderStatus, number> = { ...STATUS_ZERO };

  const dayFor = (key: string) => {
    let d = days.get(key);
    if (!d) {
      d = emptyDay(key);
      days.set(key, d);
      orderIdsByDay.set(key, new Set());
    }
    return d;
  };

  for (const it of orders) {
    if (!inRange(it.date)) continue;
    const key = dayKey(it.date);
    const d = dayFor(key);
    if (it.status in statusCounts) statusCounts[it.status]++;

    const amount = it.amount ?? 0;
    d.units += amount;
    d.gross += (it.sellPrice ?? 0) * amount;
    d.commission += it.commission ?? 0;
    d.logistics += it.logisticDeliveryFee ?? 0;
    d.sellerProfit += it.sellerProfit ?? 0;
    d.returns += it.amountReturns ?? 0;
    if (it.orderId != null) orderIdsByDay.get(key)!.add(it.orderId);
  }

  const topExpenses: ExpenseLine[] = [];
  for (const p of expenses) {
    const ts = p.dateCreated ?? p.dateService;
    if (!inRange(ts)) continue;
    const key = dayKey(ts);
    const d = dayFor(key);
    const amount = p.paymentPrice ?? 0;
    d.expenses += amount;
    topExpenses.push({
      id: p.id,
      date: key,
      name: p.name ?? "—",
      source: p.source ?? "Uzum",
      amount,
      code: p.code,
      status: p.status ?? "",
    });
  }

  const daily = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of daily) {
    d.orders = orderIdsByDay.get(d.date)?.size ?? 0;
    d.net = d.sellerProfit - d.expenses;
    d.commissionRate = d.gross > 0 ? (d.commission / d.gross) * 100 : 0;
  }

  const totals = daily.reduce<FinanceTotals>(
    (acc, d) => {
      acc.orders += d.orders;
      acc.units += d.units;
      acc.gross += d.gross;
      acc.commission += d.commission;
      acc.logistics += d.logistics;
      acc.expenses += d.expenses;
      acc.sellerProfit += d.sellerProfit;
      acc.net += d.net;
      acc.returns += d.returns;
      return acc;
    },
    {
      orders: 0,
      units: 0,
      gross: 0,
      commission: 0,
      logistics: 0,
      expenses: 0,
      sellerProfit: 0,
      net: 0,
      returns: 0,
      commissionRate: 0,
    }
  );
  totals.commissionRate = totals.gross > 0 ? (totals.commission / totals.gross) * 100 : 0;

  topExpenses.sort((a, b) => b.amount - a.amount);

  return {
    from: fromDay,
    to: toDay,
    daily,
    totals,
    statusCounts,
    topExpenses: topExpenses.slice(0, 8),
    generatedAt: Date.now(),
  };
}
