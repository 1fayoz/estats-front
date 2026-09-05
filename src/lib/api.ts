// The single door to the backend.
//
// Auth is a JWT issued by POST /auth/login in exchange for an Uzum seller token. The
// Uzum token itself is stored server-side on the seller's row and never comes back to
// the browser — every later call carries only the JWT.

import { AUTH_STORAGE_KEY } from "./auth";
import type {
  AdPlan,
  AdVerdict,
  AdResult,
  ExpenseBurn,
  ExpenseDueItem,
  ExpenseMonth,
  InstagramAccount,
  InstagramAd,
  InstagramCoverage,
  InstagramChoices,
  InstagramPost,
  Intake,
  IntakeInput,
  IntakeRow,
  LoginResponse,
  Me,
  Goal,
  MarketingReport,
  NetworksOverview,
  Paginated,
  PermissionModule,
  Plan,
  PnlReport,
  PositionWhy,
  ProductDetail,
  ProductTimeline,
  MarketTokenStatus,
  MarketUploader,
  MarketAutoRefresh,
  MarketLoginSession,
  TelegramOperatorStatus,
  UzumLoginStart,
  UzumLoginStatus,
  BroadcastResult,
  BulkValidationResult,
  ChangeImpact,
  ProductMarket,
  ProductFixResult,
  PublishPreview,
  RecurringExpense,
  Shop,
  ShopCreateResult,
  AiKeyState,
  AiDraft,
  AiCategoryNode,
  AiDraftPatch,
  AiDraftRow,
  AiImageRedo,
  AiPackage,
  OpenAiKeyState,
  SeoAudit,
  SeoAuditRow,
  SeoJob,
  SeoPositionRow,
  SeoRival,
  SocialAccount,
  SocialApp,
  SocialPlatformRow,
  SocialPost,
  SyncState,
  Team,
  TeamMember,
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
function readPersisted(): {
  accessToken?: string | null;
  activeShopId?: number | null;
  workspaceId?: number | null;
} {
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
  // Qaysi hisob ochiqligi. Server a'zolikni qaytadan tekshiradi, ya'ni
  // bu sarlavha ma'lumotni TANLAYDI — ochib bermaydi.
  const workspaceId = auth ? persisted.workspaceId : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        // FormData'da Content-Type QO'YILMAYDI: brauzer uni
        // `multipart/form-data; boundary=...` qilib o'zi yozadi va
        // qo'lda yozilgani boundary'siz qolib, server faylni
        // umuman ko'rmaydi.
        ...(rest.body && !(rest.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(shopId ? { "X-Shop-Id": String(shopId) } : {}),
        ...(workspaceId ? { "X-Workspace-Id": String(workspaceId) } : {}),
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

export const fetchProducts = (
  params: { search?: string; page?: number; size?: number; sync?: boolean; archived?: boolean } = {},
) => request<Paginated<WarehouseProduct>>(`/warehouse/products${qs({ ...params, size: params.size ?? 200 })}`);

export const fetchProductDetail = (id: number) =>
  request<ProductDetail>(`/warehouse/products/${id}`);

export const checkProductUzum = (id: number) =>
  request<ProductDetail>(`/warehouse/products/${id}/uzum-check`, { method: "POST" });

export const bulkCheckProductsUzum = (productIds: number[]) =>
  request<BulkValidationResult>("/warehouse/products/uzum-check", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });

/** `field` — SEO auditdagi kabi alohida-alohida: "title" yoki "description".
 *  Berilmasa ikkalasi ham qayta yasaladi. */
export const aiFixProductUzum = (id: number, field?: "title" | "description") =>
  request<ProductFixResult>(`/warehouse/products/${id}/ai-fix${qs({ field })}`, { method: "POST" });

export const autoFixProductUzum = (id: number) =>
  request<ProductFixResult>(`/warehouse/products/${id}/auto-fix`, { method: "POST" });

export const bulkAutoFixProductsUzum = (productIds: number[]) =>
  request<BulkValidationResult>("/warehouse/products/auto-fix", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });

/** Bloklangan tovarlarning aniq moderatsiya sabablarini Uzum kabinetidan ko'chiradi. */
export const syncModerationReasons = (productId?: number) =>
  request<{ checked: number; updated: number; message: string }>(
    `/warehouse/moderation/sync${productId ? `?product_id=${productId}` : ""}`,
    { method: "POST" },
  );

/** Bitta matn o'zgarishini oldingi holatiga qaytaradi (qoralamada). */
export const revertProductChange = (id: number, logId: number) =>
  request<ProductFixResult>(
    `/warehouse/products/${id}/change-logs/${logId}/revert`,
    { method: "POST" },
  );

/** Har matn o'zgarishining SEO/sotuvga ta'siri: oldin ↔ keyin. */
export const fetchChangeImpact = (id: number) =>
  request<ChangeImpact[]>(`/warehouse/products/${id}/change-impact`);

/** "Qaysi narxda qancha foyda" jadvalidagi bir narxni haqiqiy Uzum narxiga aylantiradi. */
export const applyProductPrice = (id: number, sellPrice: number) =>
  request<{ marketplacePrice: number }>(`/warehouse/products/${id}/price`, {
    method: "POST",
    body: JSON.stringify({ sellPrice }),
  });



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

// ── Uzum sotuvchi kabinetiga o'z sessiyasi bilan kirish ───────────────────────
//
// `shopId` — do'kon bir nechta bo'lsa QAYSI biriga kiriladi. Berilmasa —
// faol do'kon (`X-Shop-Id` odatdagidek). Har bir chaqiruv o'sha bitta
// do'konni maqsad qiladi, chunki server tomonida ekran BITTA — bir vaqtda
// faqat bitta login sessiyasi bo'ladi.
const shopHeader = (shopId?: number) =>
  shopId ? { headers: { "X-Shop-Id": String(shopId) } } : {};

export const startUzumLogin = (shopId?: number) =>
  request<UzumLoginStart>("/market/uzum-login/start", { method: "POST", ...shopHeader(shopId) });

export const completeUzumLogin = (shopId?: number) =>
  request<UzumLoginStatus>("/market/uzum-login/complete", {
    method: "POST",
    ...shopHeader(shopId),
  });

export const fetchUzumLoginStatus = (shopId?: number) =>
  request<UzumLoginStatus>("/market/uzum-login/status", shopHeader(shopId));

/** VNC ko'prigining WebSocket manzili — brauzer o'zi shu bilan ulanadi. */
export function uzumLoginVncUrl(shopId: number): string {
  const persisted = readPersisted();
  const token = persisted.accessToken ?? "";
  const wsBase = API_BASE.replace(/^http/, "ws");
  return `${wsBase}/product-ai/uzum-login-vnc?token=${encodeURIComponent(token)}&shop_id=${shopId}`;
}

// ── Uzum MIJOZ (bozor) hisobiga o'z sessiyasi bilan kirish ────────────────────
//
// Yuqoridagi sotuvchi-kabinet loginidan farqli: BITTA, APP darajasidagi
// hisob — do'konga bog'liq emas, shuning uchun `X-Shop-Id` yubormaydi.
// Bir marta ulangach bozor tokeni har ~3 daqiqada o'zi yangilanadi
// (`/market/token/auto-refresh`), qo'lda qayta kirish shart emas.

export const startMarketLogin = () =>
  request<UzumLoginStart>("/market/uzum-market-login/start", { method: "POST", shopScoped: false });

export const completeMarketLogin = () =>
  request<MarketAutoRefresh>("/market/uzum-market-login/complete", {
    method: "POST",
    shopScoped: false,
  });

export const fetchMarketLoginStatus = () =>
  request<MarketLoginSession>("/market/uzum-market-login/status", { shopScoped: false });

export const fetchMarketAutoRefresh = () =>
  request<MarketAutoRefresh>("/market/token/auto-refresh", { shopScoped: false });

/** VNC ko'prigining WebSocket manzili — bozor (mijoz) hisobi uchun, do'konsiz. */
export function marketLoginVncUrl(): string {
  const persisted = readPersisted();
  const token = persisted.accessToken ?? "";
  const wsBase = API_BASE.replace(/^http/, "ws");
  return `${wsBase}/product-ai/market-login-vnc?token=${encodeURIComponent(token)}`;
}

// ── Uzum moderatsiya operatoriga Telegram orqali yozish ───────────────────────
//
// Userbot ULASH bu yerda EMAS — Django adminkada ("Telegram userbot" →
// "Qo'shish"): bir martalik, ilova darajasidagi sozlash. Front faqat
// "ulanganmi?" deb so'raydi — kelajakda tovar kartochkasidagi "Operatorga
// yozish" tugmasi shunga qarab yoqiladi.

export const fetchTelegramOperatorStatus = () =>
  request<TelegramOperatorStatus>("/telegram-operator/status", { shopScoped: false });

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

// ── doimiy to'lovlar (recurring expenses) ────────────────────────────────────

export const fetchExpenses = (includeInactive = false) =>
  request<RecurringExpense[]>(`/expenses${qs({ include_inactive: includeInactive })}`);

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  period: string;
  dueDay: number;
  anchorMonth?: number;
  startsOn?: string | null;
  endsOn?: string | null;
  note?: string | null;
}

export const createExpense = (payload: ExpenseInput) =>
  request<RecurringExpense>("/expenses", { method: "POST", body: JSON.stringify(payload) });

export const updateExpense = (id: number, payload: Partial<ExpenseInput & { isActive: boolean }>) =>
  request<RecurringExpense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteExpense = (id: number) =>
  request<void>(`/expenses/${id}`, { method: "DELETE" });

/** Bir oyning to'liq manzarasi: tovar foydasi, doimiy xarajatlar va sof natija. */
export const fetchExpenseMonth = (period?: string) =>
  request<ExpenseMonth>(`/expenses/month${qs({ period })}`);

export const fetchExpenseBurn = (dailyProfit = 0) =>
  request<ExpenseBurn>(`/expenses/burn${qs({ daily_profit: dailyProfit })}`);

export const payExpense = (id: number, periodKey: string, amount?: number) =>
  request<ExpenseDueItem>(`/expenses/${id}/pay`, {
    method: "POST",
    body: JSON.stringify({ periodKey, amount }),
  });

export const unpayExpense = (id: number, periodKey: string) =>
  request<void>(`/expenses/${id}/pay${qs({ period: periodKey })}`, { method: "DELETE" });

// ── Instagram (backend socialift SDK orqali ishlaydi) ────────────────────────

export const fetchInstagramAccount = () => request<InstagramAccount>("/instagram/account");

export const fetchInstagramConnectUrl = (add = false) =>
  request<{ url: string }>(`/instagram/connect${qs({ add: add || undefined })}`);

export const fetchInstagramChoices = () => request<InstagramChoices>("/instagram/choices");

export const selectInstagramAccount = (payload: {
  pageId: string;
  instagramId: string;
  adAccountId?: string | null;
}) => request<InstagramAccount>("/instagram/select", { method: "POST", body: JSON.stringify(payload) });

export const disconnectInstagram = () =>
  request<void>("/instagram/account", { method: "DELETE" });

export const fetchInstagramPosts = (productId?: number) =>
  request<InstagramPost[]>(`/instagram/posts${qs({ product_id: productId })}`);

export const syncInstagramPosts = () =>
  request<InstagramPost[]>("/instagram/posts/sync", { method: "POST" });

export const linkPostToProducts = (postId: number, productIds: number[]) =>
  request<InstagramPost>(`/instagram/posts/${postId}/link`, {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });

export const unlinkPostFromProduct = (postId: number, productId: number) =>
  request<void>(`/instagram/posts/${postId}/link/${productId}`, { method: "DELETE" });

export const fetchPublishPreview = (productId: number) =>
  request<PublishPreview>(`/instagram/publish/${productId}`);

export const publishToInstagram = (payload: {
  productId: number;
  caption?: string;
  images?: string[];
}) => request<{ postId: number; mediaId: string; permalink: string | null }>("/instagram/publish", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const fetchInstagramCoverage = () => request<InstagramCoverage>("/instagram/coverage");

export interface AdInput {
  postId: number;
  dailyBudget: number;
  goal: string;
  ageMin: number;
  ageMax: number;
  gender?: string | null;
  productId?: number | null;
}

export const fetchInstagramAds = () => request<InstagramAd[]>("/instagram/ads");

export const planInstagramAd = (payload: AdInput) =>
  request<AdPlan>("/instagram/ads/plan", { method: "POST", body: JSON.stringify(payload) });

export const createInstagramAd = (payload: AdInput) =>
  request<InstagramAd>("/instagram/ads", { method: "POST", body: JSON.stringify(payload) });

export const startInstagramAd = (id: number) =>
  request<InstagramAd>(`/instagram/ads/${id}/start`, { method: "POST" });

export const stopInstagramAd = (id: number) =>
  request<InstagramAd>(`/instagram/ads/${id}/stop`, { method: "POST" });

export const deleteInstagramAd = (id: number) =>
  request<void>(`/instagram/ads/${id}`, { method: "DELETE" });

export const fetchAdResult = (id: number) => request<AdResult>(`/instagram/ads/${id}/result`);

// ── ijtimoiy tarmoqlar ───────────────────────────────────────────────────────

export const fetchSocialApps = () => request<SocialApp[]>("/social/apps");

export const saveSocialApp = (
  platform: string,
  payload: { clientId: string; clientSecret?: string },
) => request<SocialApp>(`/social/apps/${platform}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteSocialApp = (platform: string) =>
  request<void>(`/social/apps/${platform}`, { method: "DELETE" });

/** OAuth bilan ulanadigan tarmoqning login sahifasi. */
export const fetchSocialConnectUrl = (platform: string) =>
  request<{ url: string }>(`/social/connect/${platform}`);

export const fetchSocialPlatforms = () =>
  request<SocialPlatformRow[]>("/social/platforms");

export const fetchSocialAccounts = (platform?: string) =>
  request<SocialAccount[]>(`/social/accounts${qs({ platform })}`);

export const connectSocialAccount = (payload: {
  platform: string;
  credential: string;
  chat?: string;
}) => request<SocialAccount>("/social/accounts", { method: "POST", body: JSON.stringify(payload) });

export const updateSocialAccount = (id: number, payload: { isDefault?: boolean }) =>
  request<SocialAccount>(`/social/accounts/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const refreshSocialAccount = (id: number) =>
  request<SocialAccount>(`/social/accounts/${id}/refresh`, { method: "POST" });

export const disconnectSocialAccount = (id: number) =>
  request<void>(`/social/accounts/${id}`, { method: "DELETE" });

export const publishToSocial = (payload: {
  productId: number;
  accountIds?: number[];
  caption?: string;
  images?: string[];
  /** Narxni matnga yozish. Sukut bo'yicha yo'q — narx tez o'zgaradi. */
  withPrice?: boolean;
}) => request<BroadcastResult>("/social/publish", { method: "POST", body: JSON.stringify(payload) });

export const fetchNetworksOverview = () => request<NetworksOverview>("/social/overview");

export const fetchAdVerdict = (productId: number) =>
  request<AdVerdict>(`/social/ad-check/${productId}`);

export const fetchMarketingReport = () => request<MarketingReport>("/marketing");

export const syncSocialAccount = (id: number) =>
  request<SocialAccount>(`/social/accounts/${id}/sync`, { method: "POST" });

export const fetchSocialPosts = (params: { platform?: string; productId?: number } = {}) =>
  request<SocialPost[]>(`/social/posts${qs({ platform: params.platform, product_id: params.productId })}`);

export const linkSocialPost = (postId: number, productIds: number[]) =>
  request<SocialPost>(`/social/posts/${postId}/link`, {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });

export const unlinkSocialPost = (postId: number, productId: number) =>
  request<void>(`/social/posts/${postId}/link/${productId}`, { method: "DELETE" });

/**
 * Ketayotgan va yaqinda tugagan e'lonlar.
 *
 * E'lon serverda ketadi, brauzerda emas — shuning uchun sahifa almashsa
 * ham, brauzer qayta ochilsa ham holat shu yerdan o'qib olinadi.
 */
export const fetchBroadcasts = (params: { active?: boolean; limit?: number } = {}) =>
  request<BroadcastResult[]>(`/social/broadcasts${qs({ active: params.active, limit: params.limit })}`);

export const retryBroadcast = (id: number) =>
  request<BroadcastResult>(`/social/broadcasts/${id}/retry`, { method: "POST" });

// ── SEO auditi ───────────────────────────────────────────────────────────────

/**
 * Tahlilni Excel faylga yuklab oladi.
 *
 * `request` ishlatilmaydi: u javobni JSON deb o'qiydi va ikkilik
 * faylni buzadi. Sarlavhalar esa aynan o'sha — token va do'kon
 * tanlovi bu yerda ham kerak.
 */
export async function downloadSeoAudit(productId: number, run?: number | null) {
  const persisted = readPersisted();
  const query = qs({ run: run ?? undefined });
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/seo/${productId}/export${query}`, {
      cache: "no-store",
      headers: {
        ...(persisted.accessToken ? { Authorization: `Bearer ${persisted.accessToken}` } : {}),
        ...(persisted.activeShopId ? { "X-Shop-Id": String(persisted.activeShopId) } : {}),
      },
    });
  } catch {
    throw new ApiError("Serverga ulanib bo'lmadi. Backend ishlayaptimi?", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = (body && (body.detail ?? body.message)) || "Fayl chiqmadi";
    throw new ApiError(typeof detail === "string" ? detail : "Fayl chiqmadi", response.status);
  }

  // Fayl nomini server aytadi — u yerda tovar nomi va sana bor.
  const disposition = response.headers.get("Content-Disposition") || "";
  const matched = /filename="?([^"]+)"?/.exec(disposition);
  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = matched?.[1] || `seo-${productId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Brauzer yuklab olishni boshlagunicha havola yashashi kerak.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Telefon raqamini biriktiradi.
 *
 * Telegram bot hisobni AYNAN shu raqam bo'yicha topadi — boshqa
 * bog'lovchi yo'q.
 */
export const setProfile = (fullName: string) =>
  request<Me>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ fullName }),
  });

export const setPhone = (phone: string) =>
  request<Me>("/auth/phone", { method: "PUT", body: JSON.stringify({ phone }) });

/**
 * Telegram WebApp'dan kirish.
 *
 * `auth: false` — hali tokenimiz yo'q, aynan shu chaqiruv uni
 * beradi. `initData` ni Telegram imzolagan va uni backend
 * tekshiradi.
 */
export const telegramLogin = (initData: string) =>
  request<LoginResponse>("/auth/telegram", {
    method: "POST",
    auth: false,
    shopScoped: false,
    body: JSON.stringify({ initData }),
  });

// ── jamoa ────────────────────────────────────────────────────────────────────

export const getPermissionCatalogue = () =>
  request<PermissionModule[]>("/team/permissions", { shopScoped: false });

/**
 * Jamoa: egasi va a'zolar.
 *
 * Eski backend faqat MASSIV qaytaradi (egasisiz). Front backend'dan
 * oldin joylanadigan bir necha daqiqada shu holat bo'ladi va
 * `team.members` `undefined` bo'lib sahifani yiqitardi — shuning
 * uchun ikkala shakl ham qabul qilinadi.
 */
export const getTeam = async (): Promise<Team> => {
  const body = await request<Team | TeamMember[]>("/team", { shopScoped: false });
  if (Array.isArray(body)) return { owner: null, members: body };
  return { owner: body.owner ?? null, members: body.members ?? [] };
};

export const addTeamMember = (body: {
  phone: string;
  name: string;
  actions: string[];
}) =>
  request<TeamMember>("/team", {
    method: "POST",
    shopScoped: false,
    body: JSON.stringify(body),
  });

export const updateTeamMember = (
  id: number,
  body: { name?: string; actions?: string[]; isActive?: boolean }
) =>
  request<TeamMember>(`/team/${id}`, {
    method: "PATCH",
    shopScoped: false,
    body: JSON.stringify(body),
  });

export const removeTeamMember = (id: number) =>
  request<void>(`/team/${id}`, { method: "DELETE", shopScoped: false });

export const fetchSeoList = () => request<SeoAuditRow[]>("/seo");

export const fetchSeoAudit = (productId: number, run?: number | null) =>
  request<SeoAudit>(`/seo/${productId}${qs({ run: run ?? undefined })}`);

/** Yadroni yig'ib, kartochkani tekshiradi. O'nlab tashqi so'rov — sekin. */
export const runSeoAnalyse = (productId: number) =>
  request<SeoAudit>(`/seo/${productId}/analyse`, { method: "POST" });

export const runSeoMedia = (productId: number) =>
  request<SeoAudit>(`/seo/${productId}/media`, { method: "POST" });

export const runSeoContent = (productId: number) =>
  request<SeoAudit>(`/seo/${productId}/content`, { method: "POST" });

export const fetchAiKey = () => request<AiKeyState>("/seo/ai-key");

export const saveAiKey = (apiKey: string) =>
  request<AiKeyState>("/seo/ai-key", { method: "PUT", body: JSON.stringify({ apiKey }) });

export const deleteAiKey = () => request<void>("/seo/ai-key", { method: "DELETE" });

/** Bir necha tovarni birdan — fonda. */
export const runSeoBulk = (payload: {
  productIds?: number[];
  kind?: "audit" | "media" | "content";
  all?: boolean;
}) => request<SeoJob>("/seo/analyse", { method: "POST", body: JSON.stringify(payload) });

export const fetchSeoJobs = (active = false) =>
  request<SeoJob[]>(`/seo/jobs${qs({ active: active || undefined })}`);

export const saveSeoDraft = (
  productId: number,
  payload: {
    titleUz?: string; titleRu?: string;
    descriptionUz?: string; descriptionRu?: string;
    applied?: boolean;
  },
) => request<SeoAudit>(`/seo/${productId}/draft`, { method: "PUT", body: JSON.stringify(payload) });

export const fetchSeoPositions = (productId: number) =>
  request<SeoPositionRow[]>(`/seo/${productId}/positions`);

export const trackSeoPositions = (productId: number) =>
  request<SeoPositionRow[]>(`/seo/${productId}/positions`, { method: "POST" });

/** Kalit so'zni kuzatuvga qo'shadi va darhol o'lchaydi. */
export const addSeoPhrase = (productId: number, phrase: string) =>
  request<SeoPositionRow[]>(`/seo/${productId}/positions/phrases`, {
    method: "POST",
    body: JSON.stringify({ phrase }),
  });

export const dropSeoPhrase = (productId: number, phrase: string) =>
  request<SeoPositionRow[]>(
    `/seo/${productId}/positions/phrases?phrase=${encodeURIComponent(phrase)}`,
    { method: "DELETE" },
  );

/** Uzum qidiruvining o'z takliflari — xaridor haqiqatan yozadigan so'rovlar. */
export const fetchSeoSuggestions = (productId: number) =>
  request<string[]>(`/seo/${productId}/positions/suggest`);

/** Shu so'zda nega pastdamiz — Uzum raqamlari bilan solishtirish. */
export const fetchPositionWhy = (productId: number, phrase: string) =>
  request<PositionWhy>(
    `/seo/${productId}/positions/why?phrase=${encodeURIComponent(phrase)}`,
  );

/** Kun-ba-kun: sotuv va o'sha kundagi o'rinlar bitta jadvalda. */
export const fetchProductTimeline = (productId: number, days = 60) =>
  request<ProductTimeline>(`/warehouse/products/${productId}/timeline?days=${days}`);

export const fetchSeoRivals = (productId: number) =>
  request<SeoRival[]>(`/seo/${productId}/rivals`);


// ── AI bilan mahsulot tayyorlash ────────────────────────────────
//
// Yuklash DARHOL javob qaytaradi: quvur bir necha o'n soniya
// davom etadi va brauzerni shuncha kuttirish kerak emas. Sahifa
// holatni `fetchAiDraft` bilan so'rab turadi.

/**
 * `/media/...` yo'lini to'liq manzilga aylantiradi.
 *
 * Rasmlar API domenida turadi (`api.estats.uz`), front esa
 * boshqa domenda — nisbiy yo'l front'ning o'ziga qarab qolib,
 * 404 beradi.
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE.replace(/\/api\/v1$/, "")}${path}`;
}

export const fetchOpenAiKey = () => request<OpenAiKeyState>("/product-ai/key");

export const saveOpenAiKey = (apiKey: string) =>
  request<OpenAiKeyState>("/product-ai/key", {
    method: "PUT",
    body: JSON.stringify({ apiKey }),
  });

export const clearOpenAiKey = () =>
  request<void>("/product-ai/key", { method: "DELETE" });

export const fetchAiDrafts = () => request<AiDraftRow[]>("/product-ai/drafts");

export const fetchAiDraft = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}`);

export function createAiDraft(files: File[], hint: string) {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  form.append("hint", hint);
  return request<AiDraft>("/product-ai/drafts", { method: "POST", body: form });
}

export const retryAiDraft = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/retry`, { method: "POST" });

export const patchAiDraft = (id: number, patch: AiDraftPatch) =>
  request<AiDraft>(`/product-ai/drafts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const approveAiDraft = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/approve`, { method: "POST" });

// ── Uzum turkumi ────────────────────────────────────────────────
// Daraxt BIZNING bazamizda (sotuvchi kabinetidan bir marta
// ko'chirilgan), shuning uchun bu so'rovlar oddiy va tez — brauzer
// ochilmaydi, Uzum'ga chiqilmaydi.

/** Bitta daraja (`parentId` bo'lmasa — ildiz) yoki nom bo'yicha qidiruv (`q`). */
export const fetchAiCategories = (params: { parentId?: number; q?: string }) =>
  request<AiCategoryNode[]>(`/product-ai/categories${qs(params)}`);

export const setAiDraftCategory = (id: number, categoryId: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/category`, {
    method: "PUT",
    body: JSON.stringify({ categoryId }),
  });

/** Tayyor uzum.uz tovaridan turkumni ko'chiradi — havola yoki tovar raqami. */
export const setAiDraftCategoryFromUrl = (id: number, url: string) =>
  request<AiDraft>(`/product-ai/drafts/${id}/category/from-url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });

/** Daraxtni Uzum kabinetidan qayta ko'chiradi. Kamdan-kam kerak. */
export const syncAiCategories = () =>
  request<{ count: number }>(`/product-ai/categories/sync`, { method: "POST" });

/** Bozor tahlilini qayta yuritadi — endi tanlangan turkum bo'yicha. */
export const refreshAiDraftMarket = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/market/refresh`, { method: "POST" });

export const deleteAiDraft = (id: number) =>
  request<void>(`/product-ai/drafts/${id}`, { method: "DELETE" });

/**
 * Rasmni qayta yasaydi — bittasini yoki hammasini.
 *
 * Fonda ketadi: bitta rasm o'ttiz soniyagacha yasaladi. Javob
 * darhol qaytadi va `stage` vaqtincha "rasm" bo'ladi.
 */
export const redoAiImages = (id: number, body: AiImageRedo) =>
  request<AiDraft>(`/product-ai/drafts/${id}/images`, {
    method: "POST",
    body: JSON.stringify(body),
  });

/** Shu kadrni oxirgi "qayta yasash"dan oldingi holatiga qaytaradi — pulsiz, darhol. */
export const revertAiImage = (id: number, index: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/images/${index}/revert`, { method: "POST" });

export const fetchAiPackage = (id: number) =>
  request<AiPackage>(`/product-ai/drafts/${id}/package`);

/**
 * Uzum'ga AVTOMATIK joylashni boshlaydi. Darhol qaytadi — natija fonda
 * `draft.uzumPublish` ga yoziladi, front shuni so'rab turadi
 * (`fetchAiDraft`, xuddi rasm/matn qadamlari kabi).
 *
 * Qoralama har doim O'Z do'koniga joylanadi (`X-Shop-Id` — faol
 * do'kon) — u yaratilgan paytdayoq bitta do'konga bog'langan, boshqa
 * do'konga ko'chirib bo'lmaydi.
 */
/**
 * `categoryManualPath` — avtomatika `category_unresolved` bilan
 * to'xtagach (`AiUzumPublish.categoryLevels`), sotuvchi HAR daraja
 * uchun tanlagan yo'l, daraja tartibida (bo'sh joy — o'sha daraja
 * o'zgartirilmagan, avtomatika o'zi tanlagani qoladi). Bo'lsa,
 * keyingi urinishda shu darajalarda ballashsiz aynan shu bosiladi.
 */
export const publishAiDraftUzum = (id: number, categoryManualPath?: string[]) => {
  const qs = (categoryManualPath || [])
    .map((name) => `category_manual_path=${encodeURIComponent(name)}`)
    .join("&");
  return request<AiDraft>(
    `/product-ai/drafts/${id}/publish-uzum${qs ? `?${qs}` : ""}`,
    { method: "POST" },
  );
};

/**
 * Joylash jarayonini bosqichlar ORASIDA to'xtatadi — brauzer ochiq
 * qoladi. Xuddi shu `publishAiDraftUzum` qaytadan chaqirilsa, noldan
 * emas, shu joydan davom etadi.
 */
export const stopAiDraftUzum = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/publish-uzum/stop`, { method: "POST" });

/**
 * ALLAQACHON Uzum'da turgan tovarni tahrirlaydi (nom, tavsif,
 * so'ralsa rasmlar) — YANGI tovar yaratmaydi. Faqat oldin
 * muvaffaqiyatli joylangan (`uzumPublish.productId` bor) qoralama
 * uchun ishlaydi.
 */
export const editAiDraftUzum = (id: number, replaceImages: boolean) =>
  request<AiDraft>(
    `/product-ai/drafts/${id}/edit-uzum${replaceImages ? "?replace_images=true" : ""}`,
    { method: "POST" },
  );

/**
 * Bizning bazamizdagi holat va Uzum'ning HAQIQIY holati — ikki
 * xil manba, ular ajralib qolishi mumkin (server qayta ishga
 * tushishi, yoki tovar keyinroq Uzum tomonidan o'chirilishi).
 * Bu `productId` ni ochiq katalog orqali qayta tekshiradi.
 */
export const verifyAiDraftUzum = (id: number) =>
  request<AiDraft>(`/product-ai/drafts/${id}/verify-uzum`, { method: "POST" });
