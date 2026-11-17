"use client";

/**
 * Brauzer ↔ sotuvchi kompyuteridagi E-IMZO ilovasi (WebSocket).
 *
 * Shaxsiy kalit HECH QACHON brauzerga ham, eStats serveriga ham chiqmaydi:
 * `load_key` faqat E-IMZO ichidagi `keyId` ni qaytaradi (parolni E-IMZO
 * O'Z oynasida so'raydi), `create_pkcs7` esa tayyor imzoni (PKCS#7) beradi.
 * Serverga faqat shu imzo ketadi (`/didox/.../sign`, `/didox/connect`).
 *
 * Sof qismlar (xabarlar, versiya, STIR tekshiruvi) — `eimzo-core.ts`.
 */

import {
  EIMZO_DOWNLOAD_URL,
  type EimzoCertificate,
  type EimzoRequest,
  eimzoSocketUrl,
  formatVersion,
  isCancelReason,
  isWrongPassword,
  messages,
  parseApiKeys,
  parseVersion,
  toCertificate,
  versionStatus,
} from "./eimzo-core";

export type EimzoErrorCode =
  | "not_running"
  | "old_version"
  | "no_certificates"
  | "wrong_tin"
  | "cancelled"
  | "wrong_password"
  | "failed";

export class EimzoError extends Error {
  constructor(message: string, readonly code: EimzoErrorCode) {
    super(message);
    this.name = "EimzoError";
  }
}

export const NOT_RUNNING_HELP =
  "E-IMZO ilovasi topilmadi yoki ishga tushmagan. Kompyuteringizga E-IMZO'ni o'rnating " +
  `(${EIMZO_DOWNLOAD_URL}), ishga tushiring (soat yonida belgisi chiqadi) va sahifani yangilang. ` +
  "Telefonda imzolab bo'lmaydi — kompyuter kerak.";

const SHORT_TIMEOUT = 15_000;
/** `load_key` da odam E-IMZO oynasida parol yozadi — uzoqroq kutamiz. */
const KEY_TIMEOUT = 3 * 60_000;

type EimzoResponse = Record<string, unknown> & { success?: boolean; reason?: string };

function call(request: EimzoRequest, timeoutMs = SHORT_TIMEOUT): Promise<EimzoResponse> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      reject(new EimzoError(NOT_RUNNING_HELP, "not_running"));
      return;
    }
    let settled = false;
    let socket: WebSocket;
    const done = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try { socket.close(); } catch { /* yopilgan */ }
      fn();
    };
    const timer = window.setTimeout(
      () => done(() => reject(new EimzoError("E-IMZO javob bermadi. Ilova ochiqligini tekshirib, qayta urinib ko'ring.", "failed"))),
      timeoutMs,
    );
    try {
      socket = new WebSocket(eimzoSocketUrl(window.location.protocol));
    } catch {
      done(() => reject(new EimzoError(NOT_RUNNING_HELP, "not_running")));
      return;
    }
    socket.onopen = () => socket.send(JSON.stringify(request));
    socket.onerror = () => done(() => reject(new EimzoError(NOT_RUNNING_HELP, "not_running")));
    socket.onclose = () => done(() => reject(new EimzoError(NOT_RUNNING_HELP, "not_running")));
    socket.onmessage = (event) => {
      let data: EimzoResponse;
      try {
        data = JSON.parse(String(event.data));
      } catch {
        done(() => reject(new EimzoError("E-IMZO tushunarsiz javob qaytardi.", "failed")));
        return;
      }
      if (data.success === false) {
        const reason = String(data.reason ?? "");
        if (isCancelReason(reason)) {
          done(() => reject(new EimzoError("Imzolash bekor qilindi.", "cancelled")));
        } else if (isWrongPassword(reason)) {
          done(() => reject(new EimzoError("Kalit paroli noto'g'ri. Qayta urinib ko'ring.", "wrong_password")));
        } else {
          done(() => reject(new EimzoError(reason ? `E-IMZO: ${reason}` : "E-IMZO amalni bajarmadi.", "failed")));
        }
        return;
      }
      done(() => resolve(data));
    };
  });
}

/** Domen kaliti (estats.uz uchun e-imzo.uz beradi) — sozlangan bo'lsa yuboriladi. */
async function sendApiKeys(): Promise<void> {
  const pairs = parseApiKeys(process.env.NEXT_PUBLIC_EIMZO_API_KEYS);
  if (!pairs.length) return;
  try {
    await call(messages.apikey(pairs));
  } catch (error) {
    if (error instanceof EimzoError && error.code === "not_running") throw error;
    // Kalit rad etilsa ham davom etamiz — keyingi chaqiruv aniq xato beradi.
  }
}

export interface EimzoState {
  version: number[] | null;
  versionText: string;
  versionStatus: "ok" | "old" | "unknown";
  certificates: EimzoCertificate[];
}

/**
 * E-IMZO bormi, versiyasi va kalitlari. `minVersion` berilsa (qabul qilish
 * uchun 6.3.5) eski versiyada `EimzoError("old_version")`.
 */
export async function detectEimzo(minVersion?: string | null): Promise<EimzoState> {
  await sendApiKeys();
  const versionData = await call(messages.version());
  const version = parseVersion(versionData);
  const status = versionStatus(version, minVersion);
  if (status === "old") {
    throw new EimzoError(
      `E-IMZO versiyasi eski (${formatVersion(version)}). Bu amal uchun ${minVersion} yoki yangisi kerak — ` +
        `${EIMZO_DOWNLOAD_URL} dan yangilang.`,
      "old_version",
    );
  }
  const list = await call(messages.listCertificates());
  const raw = Array.isArray(list.certificates) ? list.certificates : [];
  const certificates = raw
    .filter((c): c is { disk: string; path: string; name: string; alias: string } =>
      !!c && typeof c === "object" && typeof (c as { alias?: unknown }).alias === "string")
    .map(toCertificate);
  return { version, versionText: formatVersion(version), versionStatus: status, certificates };
}

export interface Pkcs7Result {
  pkcs7: string;
  signatureHex: string;
}

/**
 * `dataB64` ni tanlangan kalit bilan imzolaydi. Parolni E-IMZO o'zi so'raydi;
 * kalit ishdan keyin E-IMZO xotirasidan chiqariladi.
 */
export async function signWithCertificate(cert: EimzoCertificate, dataB64: string): Promise<Pkcs7Result> {
  const loaded = await call(messages.loadKey(cert), KEY_TIMEOUT);
  const keyId = String(loaded.keyId ?? "");
  if (!keyId) throw new EimzoError("Kalit yuklanmadi.", "failed");
  try {
    const signed = await call(messages.createPkcs7(dataB64, keyId), KEY_TIMEOUT);
    const pkcs7 = String(signed.pkcs7_64 ?? "");
    const signatureHex = String(signed.signature_hex ?? "");
    if (!pkcs7 || !signatureHex) throw new EimzoError("E-IMZO imzo qaytarmadi.", "failed");
    return { pkcs7, signatureHex };
  } finally {
    call(messages.unloadKey(keyId)).catch(() => undefined);
  }
}
