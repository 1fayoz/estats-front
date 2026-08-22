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
  SalesSyncResult,
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
function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const token = auth ? readToken() : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

/** Exchange an Uzum seller token for a session. The Uzum token stays on the server. */
export const login = (token: string) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ token: token.trim() }),
  });

export const fetchMe = () => request<Me>("/auth/me");

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

// ── moliya (Uzum's own ledger) ───────────────────────────────────────────────

export const fetchFinanceReport = <T>(from: string, to: string) =>
  request<T>(`/finance/orders${qs({ from, to })}`);
