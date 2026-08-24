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
  Goal,
  Paginated,
  Plan,
  PnlReport,
  ProductDetail,
  MarketTokenStatus,
  MarketUploader,
  ProductMarket,
  Shop,
  ShopCreateResult,
  SyncState,
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



/** Everything the Settings page needs about syncing, in one request. */
export const fetchSyncState = () => request<SyncState>("/warehouse/sync/state");

/**
 * Pull catalog and sales now instead of waiting for the schedule.
 * Safe to press twice — both imports are locked per shop.
 */
export const syncEverything = (days = 30) =>
  request<{ started: boolean; message: string }>(
    `/warehouse/sync/all${qs({ days })}`,
    { method: "POST" }
  );

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




// ── hisob-kitob (P&L) ────────────────────────────────────────────────────────

export const fetchPnl = (from: string, to: string, allProducts = false) =>
  request<PnlReport>(`/warehouse/pnl${qs({ from, to, all_products: allProducts })}`);

// ── bozor (raqobatchilar) ────────────────────────────────────────────────────

/** Where one of my goods sits in the public Uzum catalog. */
export const fetchProductMarket = (productId: number) =>
  request<ProductMarket>(`/market/product/${productId}`);


export const fetchMarketTokenStatus = () =>
  request<MarketTokenStatus>("/market/token", { shopScoped: false });

export const fetchMarketUploader = () =>
  request<MarketUploader>("/market/uploader", { shopScoped: false });

export const updateMarketToken = (token: string) =>
  request<MarketTokenStatus>("/market/token", {
    method: "PUT",
    shopScoped: false,
    body: JSON.stringify({ token }),
  });

// ── reja (plan) ──────────────────────────────────────────────────────────────

export const fetchPlan = () => request<Plan>("/plan");

export const createGoal = (payload: {
  title: string;
  emoji?: string | null;
  targetAmount: number;
  note?: string | null;
}) => request<Goal>("/plan/goals", { method: "POST", body: JSON.stringify(payload) });

export const updateGoal = (id: number, payload: Partial<{ title: string; emoji: string | null; targetAmount: number; note: string | null }>) =>
  request<Goal>(`/plan/goals/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const achieveGoal = (id: number) =>
  request<Goal>(`/plan/goals/${id}/achieve`, { method: "POST" });

export const deleteGoal = (id: number) =>
  request<void>(`/plan/goals/${id}`, { method: "DELETE" });

// ── moliya (Uzum's own ledger) ───────────────────────────────────────────────

export const fetchFinanceReport = <T>(from: string, to: string) =>
  request<T>(`/finance/orders${qs({ from, to })}`);
