export type CategoryCommissionKey =
  | "electronics"
  | "fashion"
  | "beauty"
  | "home"
  | "kids"
  | "sports"
  | "auto"
  | "food"
  | "books"
  | "other";

export type Trend = "up" | "down" | "flat";

export interface DailyPoint {
  date: string;
  sales: number;
  revenue: number;
  visits?: number;
  conversion?: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  image: string;
  category: CategoryCommissionKey;
  categoryName: string;
  price: number;
  oldPrice?: number;
  cost: number;
  stock: number;
  rating: number;
  reviews: number;
  sold30d: number;
  sold7d: number;
  revenue30d: number;
  growthPercent: number;
  conversionRate: number;
  searchPosition: number;
  trend: Trend;
  history: DailyPoint[];
  status: "active" | "out_of_stock" | "paused" | "low_stock";
  brand: string;
}

export interface Category {
  id: string;
  key: CategoryCommissionKey;
  name: string;
  productsCount: number;
  activeStores: number;
  averagePrice: number;
  marketRevenue: number;
  growthPercent: number;
  turnoverDays: number;
  topShare: number;
  priceSegments: { range: string; share: number; revenue: number }[];
}

export interface Competitor {
  id: string;
  store: string;
  logo: string;
  rating: number;
  reviews: number;
  productsCount: number;
  revenue30d: number;
  sales30d: number;
  growthPercent: number;
  averagePrice: number;
  niche: string;
  topProduct: string;
}

export interface Seller {
  id: string;
  store: string;
  logo: string;
  legalEntity: string;
  inn: string;
  city: string;
  joinedYear: number;
  rating: number;
  reviews: number;
  productsCount: number;
  activeProducts: number;
  revenue30d: number;
  revenue60d: number;
  sales30d: number;
  growthPercent: number;
  marketShare: number;
  topCategory: string;
  paymentStatus: "verified" | "pending" | "premium";
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  country: string;
  productsCount: number;
  sellersCount: number;
  averagePrice: number;
  revenue30d: number;
  sales30d: number;
  growthPercent: number;
  marketShare: number;
  rating: number;
  topProduct: string;
  category: string;
}

export interface Keyword {
  id: string;
  query: string;
  searchVolume: number;
  ourPosition: number | null;
  competitors: number;
  topRevenue: number;
  difficulty: "low" | "medium" | "high";
  trendPercent: number;
  cpc: number;
}

export interface BoostCampaign {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  keyword: string;
  bid: number;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
  revenue: number;
  drr: number;
  roas: number;
  status: "active" | "paused" | "ended";
}

export interface NegativeKeyword {
  id: string;
  word: string;
  blockedImpressions: number;
  savedSpend: number;
  addedDays: number;
}

export interface PhotoSearchResult {
  id: string;
  image: string;
  title: string;
  store: string;
  price: number;
  sales30d: number;
  similarity: number;
}

export interface LostProduct {
  id: string;
  sku: string;
  productImage: string;
  productTitle: string;
  expectedUnits: number;
  receivedUnits: number;
  lostUnits: number;
  estimatedLoss: number;
  warehouse: string;
  detectedAt: string;
  status: "investigating" | "compensated" | "rejected" | "pending";
}

export interface MonitoringEvent {
  id: string;
  type: "price_change" | "stock_change" | "content_change" | "rank_change" | "new_review";
  productId: string;
  productImage: string;
  productTitle: string;
  before: string;
  after: string;
  delta?: number;
  severity: "info" | "warning" | "alert";
  detectedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  reply?: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  productImage: string;
  amount: number;
  status: "delivered" | "shipping" | "processing" | "returned" | "cancelled";
  date: string;
  city: string;
}
