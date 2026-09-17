/**
 * eStats Lens xizmatiga eshik (`estats-lens`) — uzum.uz uchun brauzer
 * kengaytmasining serveri.
 *
 * Kabinet bu yerdan faqat BRAUZERLARNI boshqaradi: ulash (qurilma tokeni
 * olish), ro'yxat va uzish. Tahlilning o'zi kengaytma ichida.
 *
 * Manzil `API_BASE` dan keltirib chiqariladi (`market.ts` bilan bir xil
 * sabab): ikkalasi bitta domenda — `api.estats.uz/api/v1` va
 * `api.estats.uz/lens/api/v1`.
 */

import { API_BASE, ApiError } from "./api";
import { AUTH_STORAGE_KEY } from "./auth";

export const LENS_BASE =
  process.env.NEXT_PUBLIC_LENS_API?.replace(/\/$/, "") || API_BASE.replace(/\/api\/v1$/, "/lens/api/v1");

function jwt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw)?.state?.accessToken ?? null) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const token = auth ? jwt() : null;
  let response: Response;
  try {
    response = await fetch(`${LENS_BASE}${path}`, {
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
    throw new ApiError("eStats Lens xizmatiga ulanib bo'lmadi.", 0);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = (body && (body.detail ?? body.message)) || "So'rov bajarilmadi";
    throw new ApiError(typeof detail === "string" ? detail : JSON.stringify(detail), response.status);
  }
  return body as T;
}

export type LensDevice = {
  id: number;
  name: string;
  tokenHint: string;
  extensionVersion: string | null;
  createdAt: string | null;
  lastSeenAt: string | null;
};

export type LensRelease = {
  version: string;
  file: string;
  size: number;
  sha256: string;
  minimumChromeVersion?: string;
  builtAt: string;
};

export const fetchLensDevices = () => request<{ items: LensDevice[] }>("/devices");

/** Token FAQAT shu javobda keladi — saqlanmaydi, darhol kengaytmaga uzatiladi. */
export const createLensDevice = (payload: { name: string; extensionVersion?: string | null; userAgent?: string }) =>
  request<{ token: string; device: LensDevice }>("/devices", { method: "POST", body: JSON.stringify(payload) });

export const revokeLensDevice = (id: number) => request<{ ok: boolean }>(`/devices/${id}`, { method: "DELETE" });

export const fetchLensRelease = () => request<LensRelease>("/extension", { auth: false });

export const lensDownloadUrl = () => `${LENS_BASE}/extension/download`;

// ── Kengaytma bilan sahifa ichida gaplashish ─────────────────────
//
// Kengaytmaning `content-estats.js` skripti FAQAT
// `estats.uz/extension/connect*` sahifasida ishlaydi va xabarni faqat
// shu oynaning o'zidan, shu kelib chiqishdan qabul qiladi.

export const SOURCE_PAGE = "estats-front";
export const SOURCE_EXTENSION = "estats-lens-extension";

export type ExtensionMessage =
  | { source: typeof SOURCE_EXTENSION; type: "lens:ready"; version: string }
  | { source: typeof SOURCE_EXTENSION; type: "lens:connected"; ok: boolean };

export function isExtensionMessage(event: MessageEvent): event is MessageEvent<ExtensionMessage> {
  return event.source === window && event.origin === window.location.origin && event.data?.source === SOURCE_EXTENSION;
}

/** Faqat shu ulash sahifasiga qaytish mumkin — ochiq yo'naltirish (open redirect) bo'lmasin. */
const RETURN_KEY = "estats:return-after-login";
const RETURN_ALLOWED = /^\/extension\/connect(\?[^#]*)?$/;

export function rememberReturn(path: string): void {
  if (!RETURN_ALLOWED.test(path)) return;
  try {
    window.sessionStorage.setItem(RETURN_KEY, path);
  } catch {
    /* sessionStorage yopiq — kirgandan keyin odatiy sahifaga */
  }
}

export function consumeReturn(): string | null {
  try {
    const path = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    return path && RETURN_ALLOWED.test(path) ? path : null;
  } catch {
    return null;
  }
}
