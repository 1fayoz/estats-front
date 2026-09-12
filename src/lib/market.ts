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

/** `src/mining/sellers.py`dagi `LEGAL_FORM_LABELS` bilan bir xil turishi shart. */
export const LEGAL_FORM_LABELS: Record<string, string> = {
  yatt: "YaTT (ИП)",
  mchj: "MChJ",
  aj: "Aksiyadorlik jamiyati",
  self_employed: "O'zini-o'zi band qilgan shaxs",
  individual: "Jismoniy shaxs",
};

export type MarketSeller = {
  seller_id: number;
  title: string;
  tin: string | null;
  legal_form: string | null;
  first_seen: string;
  shops: number;
  orders_total: number;
  avatar: string | null;
  banner: string | null;
  flagship_shop: string | null;
  revenue: number;
  units: number;
  joined_at: string | null;
  /** `true` — hali sinxronlanmagan, kuzatuv boshlangan kun bilan almashtirilgan taxmin. */
  joined_is_estimate: boolean;
};

export type MarketSellerShop = {
  shop_id: number;
  title: string;
  slug: string | null;
  avatar: string | null;
  banner: string | null;
  description: string | null;
  official: boolean | null;
  rating: number | null;
  reviews: number;
  orders_total: number;
  registered_at: string | null;
  revenue: number;
  units: number;
  url: string | null;
};

/**
 * Ochiq davlat reyestridan olingan maydonlar (`orginfo.uz`).
 *
 * Hammasi IXTIYORIY: reyestrda topilmagan maydon umuman
 * kelmaydi — "topilmadi" va "bo'sh" ajratilishi kerak, shuning
 * uchun `undefined` qoldiriladi, nol yoki tire yozilmaydi.
 *
 * Maydonlar `mk_sellers.registry` JSONB ichida keladi: reyestr
 * sahifasi o'zgarsa yangi maydon uchun API/tur o'zgartirish
 * kerak bo'lmasin (`registry.py` dagi izohga q.).
 */
export type MarketSellerRegistry = {
  official_name?: string;
  short_name?: string;
  status?: string;
  registered_on?: string;
  registrar?: string;
  tin?: string;
  legal_form_registry?: string;
  activity?: string;
  activity_code?: string;
  activity_name?: string;
  charter_capital?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  stability?: string;
  large_taxpayer?: string;
  director?: string;
  founders?: { name: string; share: string | null }[];
  trademarks?: string[];
};

export type MarketSellerDetail = {
  seller: {
    seller_id: number;
    title: string;
    tin: string | null;
    ogrnip?: string | null;
    legal_form: string | null;
    first_seen: string;
    registered_on?: string | null;
    status?: string | null;
    director?: string | null;
    address?: string | null;
    phone?: string | null;
    registry_url?: string | null;
    registry_synced_at?: string | null;
    registry?: MarketSellerRegistry | null;
  };
  totals: { shops: number; orders_total: number; revenue: number; units: number; joined_at: string | null };
  shops: MarketSellerShop[];
  period: { start: string; end: string };
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
  token_expires_in_minutes: number | null;
  token_likely_expired: boolean;
  token_error: string | null;
  token_manage_at: string;
};

export type MarketTokenStatus = {
  configured: boolean;
  /** Har doim "core": token shu xizmatda saqlanmaydi. */
  source: string;
  hint?: string;
  expires_at?: string | null;
  expires_in_minutes?: number | null;
  likely_expired?: boolean;
  error?: string;
  /** Token AYNAN shu sahifada kiritiladi. */
  manage_at: string;
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

  products: (params: { days: number; q?: string; root?: number; shop?: number; limit?: number }) =>
    get<MarketPage<MarketProduct>>("/products", { limit: 200, ...params }),

  shops: (params: { days: number; q?: string; limit?: number }) =>
    get<MarketPage<MarketShop>>("/shops", { limit: 200, ...params }),

  sellers: (params: {
    days: number;
    q?: string;
    min_shops?: number;
    joined_after?: string;
    joined_before?: string;
    legal_form?: string;
    order?: "revenue" | "shops" | "orders" | "joined";
    limit?: number;
    offset?: number;
  }) => get<MarketPage<MarketSeller>>("/sellers", { limit: 60, ...params }),

  sellerDetail: (id: number, days: number) => get<MarketSellerDetail>(`/sellers/${id}`, { days }),

  keywords: (params: { q?: string; limit?: number }) =>
    get<MarketPage<MarketKeyword>>("/seo/keywords", { limit: 200, ...params }),

  state: () => get<MarketState>("/ops/state"),
  gaps: () => get<{ missing: string[]; count: number; first: string | null }>("/ops/gaps"),
  coverage: (days = 30) => get<MarketCoverage[]>("/ops/coverage", { days }),
  runs: (limit = 20) => get<MarketRun[]>("/ops/runs", { limit }),
  tokenStatus: () => get<MarketTokenStatus>("/ops/token"),

  // `saveToken` ATAYLAB YO'Q. Token yadroda, «Integratsiyalar»
  // sahifasida kiritiladi (`updateMarketToken` — `lib/api.ts`).
  // Ikkinchi kiritish joyi ikkita nusxa demak va ularning biri
  // jimgina eskirib qoladi.

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
