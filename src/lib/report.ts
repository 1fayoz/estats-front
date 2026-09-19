/**
 * Bozor hisoboti — `estats-market` ning `/report` bo'limi.
 *
 * Sahifalar tashqi hisobot bilan bir-bir. Har javobda `meta`
 * bor: raqam qaysi davr, qaysi kun holatiga va QAYERDAN (tashqi xizmat
 * importi yoki o'z o'lchovimiz) — interfeys buni yashirmaydi.
 */

import { ApiError } from "./api";
import { MARKET_BASE } from "./market";

/*
  Yuklanish holati — BITTA joyda.

  Hisobot so'rovlari sekundlarga cho'zilishi mumkin (butun bozor jadvallari
  million qatorli). Bu vaqtda sahifa «Ma'lumot yo'q» deb turardi — ya'ni
  foydalanuvchiga BUZUQ ko'rinardi. Har sahifaga alohida holat qo'shish
  o'rniga hisoblagich shu yerda: `get()` dan o'tmaydigan so'rov yo'q.
*/
let inFlight = 0;
const listeners = new Set<(busy: boolean) => void>();

export function reportBusy(): boolean {
  return inFlight > 0;
}

export function onReportActivity(listener: (busy: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function track(delta: number) {
  inFlight = Math.max(0, inFlight + delta);
  for (const listener of listeners) listener(inFlight > 0);
}

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const url = `${MARKET_BASE}/report${path}${query.toString() ? `?${query}` : ""}`;
  let response: Response;
  track(1);
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    track(-1);
    throw new ApiError("Bozor xizmatiga ulanib bo'lmadi.", 0);
  }
  const body = await response.json().catch(() => null);
  track(-1);
  if (!response.ok) {
    const detail = (body && (body.detail ?? body.message)) || "So'rov bajarilmadi";
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), response.status);
  }
  return body as T;
}

export type ReportMeta = {
  period: string;
  period_label?: string;
  as_of: string | null;
  source: "import" | "estats" | null;
  scope: string;
} | null;

export type PeriodOption = { key: string; label: string };

export type Paged<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  meta: ReportMeta;
  periods: PeriodOption[];
};

/* `as_of` — FAQAT o'z kuni sahifaning kunidan farq qiladigan kartalarda
   bo'ladi (do'kon eksporti tushum eksportidan kechroq olinadi). */
export type Kpi = { value: number | null; previous?: number | null; growth: number | null; as_of?: string };
export type KpiBlock = { meta: ReportMeta; values: Record<string, Kpi> } | null;

// `in_growth` — «Toifa O'sish %» diagrammasiga kiradimi (subsidiya toifasi
// hisobotda ham u yerda ko'rsatilmaydi; doiraviy diagrammada qoladi).
export type ToifaSlice = { toifa: string; revenue: number; share: number | null; growth: number | null;
                           in_growth?: boolean };

export type ShopRow = {
  shop: string;
  seller?: string;
  shop_id: number | null;
  revenue: number | null;
  growth: number | null;
  share: number | null;
  units?: number | null;
  daily_units?: number | null;
  turnover?: number | null;
};

/* `growth_as_of` — o'sish ustuni QAYSI kunning eksportidan. Tushum bilan
   bir xil bo'lmasligi mumkin: do'kon eksporti kechroq olinadi, o'sishni
   esa qatorlardan tiklab bo'lmaydi (backend `_published_growth`). */
export type Totals = { revenue: number | null; growth: number | null; share: number | null;
                       growth_as_of?: string } | null;

export type OverviewData = {
  meta: ReportMeta;
  periods: PeriodOption[];
  kpis: KpiBlock;
  toifas: ToifaSlice[];
  top_shops: ShopRow[];
  top_shops_totals: Totals;
  daily: { day: string; revenue: number | null; source: string }[];
};

export type TreeNode = { name: string; revenue: number; children: TreeNode[] };

export type CategoriesData = {
  meta: ReportMeta;
  periods: PeriodOption[];
  toifas: string[];
  kpis: KpiBlock;
  tree: TreeNode;
  top_shops: ShopRow[];
  top_shops_totals: Totals;
};

export type LayerRow = {
  path: string;
  category_id: number | null;
  level: number | null;
  revenue: number | null;
  growth: number | null;
  units: number | null;
  avg_price: number | null;
  shops: number | null;
  shops_with_sales: number | null;
  cards: number | null;
  cards_with_sales: number | null;
  shop_profit: number | null;
  turnover: number | null;
};

export type ProductRow = {
  product_id: number;
  toifa1: string | null;
  category: string | null;
  shop: string | null;
  shop_id: number | null;
  title: string | null;
  revenue: number | null;
  growth: number | null;
  lost_revenue: number | null;
  units: number | null;
  daily_units: number | null;
  avg_price: number | null;
  fbs_days: number | null;
  boost_days: number | null;
  stock_days: number | null;
  orders: number | null;
  reviews: number | null;
  rating: number | null;
  stock: number | null;
  days_on_uzum: number | null;
  image: string | null;
};

export type SkuRow = Omit<ProductRow, "growth" | "boost_days" | "days_on_uzum"> & {
  sku_id: number;
  sku_title: string | null;
  seller: string | null;
  turnover: number | null;
};

export type KeywordRow = {
  keyword: string;
  subject: string;
  coverage: number | null;
  coverage_growth: number | null;
  daily_coverage: number | null;
  search_skus: number | null;
  search_skus_growth: number | null;
  ads_skus: number | null;
  ads_skus_growth: number | null;
  demand: number | null;
};

export type PriceBucket = { range: string; revenue: number; units: number; shops: number; cards: number };

export type SkuDay = {
  day: string;
  sku_title: string;
  sku_id: number | null;
  price: number | null;
  stock: number | null;
  units: number | null;
  revenue: number | null;
  reviews: number | null;
  rating: number | null;
  source: string;
};

export type Spark = { day: string; value: number | null }[];

export type CardData = {
  range: { start: string; end: string; days: number };
  info: {
    product_id: number;
    title: string | null;
    photo: string | null;
    shop: string | null;
    shop_id: number | null;
    shop_slug: string | null;
    category: string | null;
    first_seen: string | null;
    uzum_url: string;
  };
  kpis: Record<string, Kpi>;
  sparks: Record<string, Spark>;
  skus: { sku_id: number | null; sku_title: string; revenue: number; units: number; avg_price: number | null;
          turnover: number | null }[];
  sku_days: SkuDay[];
  sources: string[];
  promos: { promo: string; first_day: string; last_day: string }[];
  category_positions: { day: string; level: number; category: string; position: number | null }[];
  keyword_positions: { keyword: string; day: string; position: number | null; is_ad: boolean }[];
  totals?: { price: number | null; stock: number; units: number; revenue: number; reviews: number | null;
             rating: number | null };
};

export type ShopData = {
  range: { start: string; end: string; days: number };
  info: { id: number; title: string; slug: string | null; avatar: string | null; orders_total: number;
          reviews: number; rating: number | null; uzum_url: string | null };
  kpis: Record<string, Kpi>;
  sparks: Record<string, Spark>;
  cards: { product_id: number; title: string; revenue: number; units: number; turnover: number | null }[];
  cards_total: number;
  tree: { path: string; revenue: number }[];
  series: { day: string; revenue: number; units: number; stock: number; stock_value: number }[];
  previous: { day: string; revenue: number; offset_day: number }[];
};

export type KeywordData = {
  keyword: string;
  range: { start: string; end: string };
  latest: KeywordDay | null;
  series: KeywordDay[];
};
export type KeywordDay = { day: string; coverage: number | null; skus: number | null; ads_skus: number | null;
                           demand: number | null; source: string };

export type CompetitorsData = {
  keyword: string;
  latest: { day: string; coverage: number | null; cards: number | null; cards_in_ads: number | null;
            demand_ratio: number | null } | null;
  days: string[];
  items: { product_id: number; title: string; category: string | null; shop: string | null;
           shop_id: number | null; boost: boolean; positions: Record<string, number | null> }[];
};

export type DynamicsData = {
  path: string;
  category_id: number | null;
  range: { start: string; end: string };
  series: { day: string; revenue: number | null; median_price: number | null; shops: number | null;
            cards: number | null; source: string }[];
  /* Oylik qator — HAR turkum uchun bor (kunlik qator esa faqat to'liq
     o'lchangan kunlardan iborat va yangi turkumda deyarli bo'sh). */
  monthly: { month: string; as_of: string; source: string; revenue: number | null; units: number | null;
             avg_price: number | null; shops: number | null; cards: number | null;
             growth: number | null }[];
  /* Kunlik qator ishonchli bo'lgan eng erta kun; `null` — hali yo'q. */
  daily_from: string | null;
};

type ListParams = Record<string, string | number | undefined | null>;

export type ReportIndex = {
  toifas: string[];
  periods: Record<string, PeriodOption[]>;
  as_of: string | null;
};

export const report = {
  meta: () => get<ReportIndex>("/meta"),
  overview: (period: string) => get<OverviewData>("/overview", { period }),
  categories: (period: string, toifa: string) => get<CategoriesData>("/categories", { period, toifa }),
  competition: (period: string) =>
    get<OverviewData & { bubbles: { toifa: string; shops: number; cards: number; revenue: number }[] }>(
      "/competition", { period },
    ),
  prices: (params: ListParams) => get<{ meta: ReportMeta; buckets: PriceBucket[]; periods: PeriodOption[] }>(
    "/prices", params,
  ),
  layers: (params: ListParams) => get<Paged<LayerRow>>("/layers", params),
  categoryPaths: (params: ListParams) => get<{ path: string; revenue: number | null }[]>("/category-paths", params),
  products: (params: ListParams) =>
    get<Paged<ProductRow> & { totals: { revenue: number | null; units: number | null } }>("/products", params),
  skus: (params: ListParams) => get<Paged<SkuRow> & { totals: { revenue: number | null } }>("/skus", params),
  sellerSkus: (params: ListParams) =>
    get<Paged<SkuRow> & { totals: { revenue: number | null } }>("/seller-skus", params),
  shops: (params: ListParams) => get<Paged<ShopRow> & { totals: Totals }>("/shops", params),
  keywords: (params: ListParams) => get<Paged<KeywordRow>>("/keywords", params),
  keywordSubjects: (params: ListParams) =>
    get<{ items: { subject: string; keywords: number }[] }>("/keyword-subjects", params),
  card: (id: number, params: ListParams) => get<CardData>(`/product/${id}`, params),
  cardTable: (id: number, params: ListParams) => get<CardData>(`/product/${id}/table`, params),
  shop: (params: ListParams) => get<ShopData>("/shop", params),
  keyword: (params: ListParams) => get<KeywordData>("/keyword", params),
  competitors: (params: ListParams) => get<CompetitorsData>("/keyword/competitors", params),
  dynamics: (params: ListParams) => get<DynamicsData>("/dynamics", params),
};
