/**
 * Bozor razvedkasi xizmatiga eshik (`estats-market`).
 *
 * Bu ALOHIDA xizmat: o'z konteyneri, o'z bazasi, o'z quvuri.
 * `my-stats-back` sotuvchining O'Z do'koni haqida, bu esa butun
 * bozor haqida — nishalar, raqobatchilar, qidiruvdagi o'rinlar.
 *
 * Manzil `API_BASE` dan KELTIRIB CHIQARILADI, alohida muhit
 * o'zgaruvchisi bilan emas: ikkalasi bitta domenda turadi
 * (`api.estats.uz/api/v1` va `api.estats.uz/market`) va ikkinchi
 * o'zgaruvchi qo'shish har deployda uni unutish imkonini yaratardi.
 */

import { API_BASE, ApiError } from "./api";

export const MARKET_BASE =
  process.env.NEXT_PUBLIC_MARKET_API?.replace(/\/$/, "") ||
  API_BASE.replace(/\/api\/v1$/, "/market");

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const url = `${MARKET_BASE}${path}${query.toString() ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Bozor xizmatiga ulanib bo'lmadi.", 0);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = (body && (body.detail ?? body.message)) || "So'rov bajarilmadi";
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), response.status);
  }
  return body as T;
}

// ── Tiplar — backend sxemalari bilan bir-bir ────────────────────

export type MarketScorecard = {
  key: string;
  label: string;
  value: number | null;
  growth: number | null;
  kind: "money" | "int" | "percent" | "float";
};

export type MarketOverview = {
  period_start: string;
  period_end: string;
  cards: MarketScorecard[];
  /** 0..1. Interfeys buni YASHIRMAYDI — pastda 8-izohga qarang. */
  coverage: number | null;
};

export type MarketPoint = { day: string; revenue: number | null; units: number | null };

export type MarketCategorySlice = {
  category_id: number;
  title: string;
  revenue: number;
  units: number;
  share: number;
  growth: number | null;
};

export type MarketNiche = {
  category_id: number;
  niche: string;
  revenue: number;
  growth: number | null;
  units: number;
  avg_price: number | null;
  median_price: number | null;
  shops: number;
  shops_with_sales_pct: number | null;
  products: number;
  products_with_sales_pct: number | null;
  revenue_per_shop: number | null;
  turnover_days: number | null;
};

export type MarketProduct = {
  product_id: number;
  title: string;
  photo: string | null;
  category: string | null;
  shop: string | null;
  revenue: number;
  growth: number | null;
  lost_revenue: number | null;
  units: number;
  daily_units: number | null;
  avg_price: number | null;
  rating: number | null;
  stock: number | null;
  days_out_of_stock: number | null;
  days_on_uzum: number | null;
  url: string | null;
};

export type MarketShop = {
  shop_id: number;
  title: string;
  seller: string | null;
  revenue: number;
  growth: number | null;
  share: number | null;
  units: number;
  daily_units: number | null;
  orders_total: number | null;
  url: string | null;
};

export type MarketKeyword = {
  keyword_id: number;
  text: string;
  coverage: number | null;
  cards: number | null;
  cards_in_ads: number | null;
  demand_ratio: number | null;
  top100_revenue: number | null;
  url: string | null;
};

export type MarketPage<T> = { items: T[]; total: number; offset: number; limit: number };

export type MarketCoverage = {
  day: string;
  source: string;
  products_seen: number;
  products_known: number;
  ratio: number;
  rolled_up: boolean;
};

export type MarketState = {
  data_from: string | null;
  data_until: string | null;
  measured_days: number;
  /** Ma'lumot necha kun eskirgan. 0 — kechagi kungacha bor. */
  stale_days: number | null;
  missing_days: number;
  token_configured: boolean;
  token_age_hours: number | null;
  token_likely_expired: boolean;
};

export type MarketTokenStatus = {
  configured: boolean;
  hint?: string;
  updated_at?: string;
  likely_expired?: boolean;
};

export type MarketRun = {
  id: number;
  day: string;
  stage: string;
  status: string;
  items: number;
  requests: number;
  error: string | null;
};

// ── So'rovlar ──────────────────────────────────────────────────

export const market = {
  overview: (days: number) => get<MarketOverview>("/overview", { days }),
  timeline: (days: number) => get<MarketPoint[]>("/overview/timeline", { days }),
  categories: (days: number, level = 1, limit = 12) =>
    get<MarketCategorySlice[]>("/overview/categories", { days, level, limit }),

  niches: (params: { days: number; q?: string; root?: number; limit?: number; offset?: number }) =>
    get<MarketPage<MarketNiche>>("/niches", { limit: 200, ...params }),
  nicheDynamics: (id: number, days = 90) => get<MarketPoint[]>(`/niches/${id}/dynamics`, { days }),

  products: (params: { days: number; q?: string; root?: number; limit?: number }) =>
    get<MarketPage<MarketProduct>>("/products", { limit: 200, ...params }),

  shops: (params: { days: number; q?: string; limit?: number }) =>
    get<MarketPage<MarketShop>>("/shops", { limit: 200, ...params }),

  sellers: (params: { days: number; limit?: number }) =>
    get<MarketPage<Record<string, unknown>>>("/sellers", { limit: 200, ...params }),

  keywords: (params: { q?: string; limit?: number }) =>
    get<MarketPage<MarketKeyword>>("/seo/keywords", { limit: 200, ...params }),

  state: () => get<MarketState>("/ops/state"),
  gaps: () => get<{ missing: string[]; count: number; first: string | null }>("/ops/gaps"),
  coverage: (days = 30) => get<MarketCoverage[]>("/ops/coverage", { days }),
  runs: (limit = 20) => get<MarketRun[]>("/ops/runs", { limit }),
  tokenStatus: () => get<MarketTokenStatus>("/ops/token"),

  async saveToken(token: string): Promise<void> {
    const response = await fetch(`${MARKET_BASE}/ops/token`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new ApiError("Token saqlanmadi.", response.status);
  },

  async backfill(): Promise<void> {
    const response = await fetch(`${MARKET_BASE}/ops/backfill`, { method: "POST" });
    if (!response.ok) throw new ApiError("To'ldirish ishga tushmadi.", response.status);
  },

  async mine(stage: string, day?: string): Promise<void> {
    const query = day ? `?day=${day}` : "";
    const response = await fetch(`${MARKET_BASE}/ops/mine/${stage}${query}`, { method: "POST" });
    if (!response.ok) throw new ApiError("Qadam ishga tushmadi.", response.status);
  },
};
