// The single door to the backend.
//
// Auth is a JWT issued by POST /auth/login in exchange for an Uzum seller token. The
// Uzum token itself is stored server-side on the seller's row and never comes back to
// the browser — every later call carries only the JWT.

import { AUTH_STORAGE_KEY } from "./auth";
import type {
  Intake,
  IntakeInput,
  IntakeRow,
  LoginResponse,
  Me,
  Paginated,
  PnlReport,
  ProductDetail,
  Sale,
  MarketTokenStatus,
  ProductMarket,
  SalesCoverage,
  SalesSyncResult,
  Shop,
  ShopCreateResult,
  SyncStatus,
  WarehouseProduct,
} from "./types";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** The session is gone or the stored token was rejected — the user must sign in again. */
  get isAuthError(): boolean {
    return this.status === 401;
  }
}

/**
 * Read the JWT straight out of persisted storage rather than from the store.
 *
 * `api` is imported by the auth store itself, so going through the store would be a
 * circular import; localStorage is the same source of truth either way.
 */
function readPersisted(): { accessToken?: string | null; activeShopId?: number | null } {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw)?.state ?? {}) : {};
  } catch {
    return {};
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; shopScoped?: boolean } = {}
): Promise<T> {
  const { auth = true, shopScoped = true, headers, ...rest } = init;
  const persisted = auth ? readPersisted() : {};
  const token = persisted.accessToken ?? null;
  // Every shop-scoped call carries the active shop. The server re-checks that the
  // shop belongs to the caller, so this header selects data — it never grants it.
  const shopId = shopScoped ? persisted.activeShopId : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(shopId ? { "X-Shop-Id": String(shopId) } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError("Serverga ulanib bo'lmadi. Backend ishlayaptimi?", 0);
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      (body && (body.detail ?? body.message ?? body.error)) || "So'rov bajarilmadi";
    throw new ApiError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      response.status
    );
  }
  return body as T;
}

const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
};

// ── auth ─────────────────────────────────────────────────────────────────────

/** Exchange a Google ID token for a session. */
export const googleLogin = (idToken: string) =>
  request<LoginResponse>("/auth/google", {
    method: "POST",
    auth: false,
    shopScoped: false,
    body: JSON.stringify({ idToken }),
  });

export const fetchMe = () => request<Me>("/auth/me", { shopScoped: false });

// ── magazinlar ───────────────────────────────────────────────────────────────

export const fetchShops = () => request<Shop[]>("/auth/shops", { shopScoped: false });

/** Add every shop an Uzum token can reach. Re-submitting a token refreshes it. */
export const addShops = (token: string) =>
  request<ShopCreateResult>("/auth/shops", {
    method: "POST",
    shopScoped: false,
    body: JSON.stringify({ token: token.trim() }),
  });

export const updateShop = (
  id: number,
  payload: { name?: string; token?: string; isDefault?: boolean }
) =>
  request<Shop>(`/auth/shops/${id}`, {
    method: "PATCH",
    shopScoped: false,
    body: JSON.stringify(payload),
  });

export const deleteShop = (id: number) =>
  request<void>(`/auth/shops/${id}`, { method: "DELETE", shopScoped: false });

// ── ombor (goods) ────────────────────────────────────────────────────────────

export const fetchProducts = (params: { search?: string; page?: number; size?: number; sync?: boolean } = {}) =>
  request<Paginated<WarehouseProduct>>(`/warehouse/products${qs({ ...params, size: params.size ?? 200 })}`);

export const fetchProductDetail = (id: number) =>
  request<ProductDetail>(`/warehouse/products/${id}`);

export const triggerCatalogSync = () =>
  request<{ started: boolean; message: string }>("/warehouse/sync", { method: "POST" });

export const fetchSyncStatus = () => request<SyncStatus>("/warehouse/sync/status");

// ── kirim (intakes) ──────────────────────────────────────────────────────────

export const fetchIntakes = (warehouseProductId?: number) =>
  request<IntakeRow[]>(`/warehouse/intakes${qs({ warehouse_product_id: warehouseProductId })}`);

export const createIntake = (payload: IntakeInput) =>
  request<Intake>("/warehouse/intakes", { method: "POST", body: JSON.stringify(payload) });

export const updateIntake = (id: number, payload: Partial<IntakeInput>) =>
  request<Intake>(`/warehouse/intakes/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteIntake = (id: number) =>
  request<void>(`/warehouse/intakes/${id}`, { method: "DELETE" });

// ── sotuv (sales) ────────────────────────────────────────────────────────────

export const syncSales = (from: string, to: string) =>
  request<SalesSyncResult>(`/warehouse/sales/sync${qs({ from, to })}`, { method: "POST" });

/** Which slice of sales history is loaded — context for the on-hand figure. */
export const fetchSalesCoverage = () =>
  request<SalesCoverage>("/warehouse/sales/coverage");

export const fetchSales = (params: { warehouseProductId?: number; page?: number; size?: number } = {}) =>
  request<Paginated<Sale>>(
    `/warehouse/sales${qs({
      warehouse_product_id: params.warehouseProductId,
      page: params.page,
      size: params.size ?? 100,
    })}`
  );

// ── hisob-kitob (P&L) ────────────────────────────────────────────────────────

export const fetchPnl = (from: string, to: string, allProducts = false) =>
  request<PnlReport>(`/warehouse/pnl${qs({ from, to, all_products: allProducts })}`);

// ── bozor (raqobatchilar) ────────────────────────────────────────────────────

/** Where one of my goods sits in the public Uzum catalog. */
export const fetchProductMarket = (productId: number) =>
  request<ProductMarket>(`/market/product/${productId}`);

export const searchMarket = (q: string, limit = 20) =>
  request<ProductMarket>(`/market/search${qs({ q, limit })}`);

export const fetchMarketTokenStatus = () =>
  request<MarketTokenStatus>("/market/token", { shopScoped: false });

export const updateMarketToken = (token: string) =>
  request<MarketTokenStatus>("/market/token", {
    method: "PUT",
    shopScoped: false,
    body: JSON.stringify({ token }),
  });

// ── moliya (Uzum's own ledger) ───────────────────────────────────────────────

export const fetchFinanceReport = <T>(from: string, to: string) =>
  request<T>(`/finance/orders${qs({ from, to })}`);
