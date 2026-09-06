// Shared warehouse (ombor) types — no client-only imports, safe in server routes too.

/** One sellable unit (SKU) pulled live from Uzum. Identity = `skuId` (never duplicated). */
export interface WarehouseItem {
  skuId: number;
  productId: number;
  shopId: number;
  shopName: string;
  title: string;
  variant: string | null;
  sku: string | null;
  barcode: string | null;
  image: string | null;
  category: string | null;
  /** Uzum sell price. */
  price: number;
  marketPrice: number | null;
  commission: number | null;
  /** Marketplace-side quantities (Uzum's own numbers). */
  marketplaceStock: number;
  quantityActive: number;
  sold: number;
  returned: number;
  status: string | null;
  archived: boolean;
}

export interface WarehouseResponse {
  shops: { id: number; name: string }[];
  items: WarehouseItem[];
  generatedAt: number;
}

/**
 * One goods intake (tovar keldi / kirim) at its own cost price. The good never
 * changes; only the cost varies, so every arrival is its own batch keyed by skuId.
 */
export interface CostBatch {
  id: string;
  qty: number;
  /** tan narxi — per-unit cost for THIS intake. */
  costPrice: number;
  note?: string;
  /** epoch ms */
  receivedAt: number;
}

/** Derived cost/stock figures for a SKU from its intake batches. */
export interface CostSummary {
  batches: CostBatch[];
  intakeQty: number;
  averageCost: number | null;
  lastCost: number | null;
  totalCostValue: number;
}
