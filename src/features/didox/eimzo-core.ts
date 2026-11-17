/**
 * E-IMZO bilan ishlashning SOF (DOM'siz, tarmoqsiz) qismi.
 *
 * Bu fayl ataylab hech narsa import qilmaydi va faqat «o'chiriladigan»
 * TS sintaksisini ishlatadi (enum, parametr-xususiyat yo'q) — shuning
 * uchun `node --test tests/eimzo-core.test.mjs` uni to'g'ridan-to'g'ri
 * yuklaydi (Node 22.18+ turlarni o'zi olib tashlaydi).
 *
 * E-IMZO — sotuvchi kompyuteridagi ilova, faqat `127.0.0.1` da tinglaydi:
 * https sahifadan `wss://127.0.0.1:64443/service/cryptapi`, http sahifadan
 * `ws://127.0.0.1:64646/service/cryptapi`. Har chaqiruv — bitta JSON xabar,
 * bitta javob (`{success, reason?, ...}`). Manba: Didox «Работа с E-IMZO»
 * (https://api-docs.didox.uz/ru/integrators-eimzo) va E-IMZO'ning o'z
 * `e-imzo.js` mijozidagi xabarlar.
 *
 * Shaxsiy kalit HECH QACHON brauzerga ham chiqmaydi: `load_key` faqat
 * E-IMZO ichidagi `keyId` ni qaytaradi, parolni E-IMZO o'z oynasida so'raydi.
 */

export const EIMZO_DOWNLOAD_URL = "https://e-imzo.uz/";
/** Didox: kiruvchi hujjatni QABUL qilish shu versiyadan (§10). */
export const EIMZO_MIN_ACCEPT_VERSION = "6.3.5";

export function eimzoSocketUrl(protocol: string): string {
  return protocol.toLowerCase() === "https:"
    ? "wss://127.0.0.1:64443/service/cryptapi"
    : "ws://127.0.0.1:64646/service/cryptapi";
}

// ── xabarlar ─────────────────────────────────────────────────────────────────

export interface EimzoRequest {
  plugin?: string;
  name: string;
  arguments?: unknown[];
}

export interface EimzoCertificateRef {
  disk: string;
  path: string;
  name: string;
  alias: string;
}

export function buildMessage(name: string, plugin?: string, args?: unknown[]): EimzoRequest {
  const message: EimzoRequest = { name };
  if (plugin) message.plugin = plugin;
  if (args && args.length) message.arguments = args;
  return message;
}

export const messages = {
  version: (): EimzoRequest => buildMessage("version"),
  /** Domen kalitlari: `[domen1, kalit1, domen2, kalit2, ...]`. */
  apikey: (pairs: [string, string][]): EimzoRequest =>
    buildMessage("apikey", "apikey", pairs.flat()),
  listCertificates: (): EimzoRequest => buildMessage("list_all_certificates", "pfx"),
  loadKey: (cert: EimzoCertificateRef): EimzoRequest =>
    buildMessage("load_key", "pfx", [cert.disk, cert.path, cert.name, cert.alias]),
  /** `"no"` — imzo hujjat bilan birga (attached), Didox shuni kutadi. */
  createPkcs7: (dataB64: string, keyId: string): EimzoRequest =>
    buildMessage("create_pkcs7", "pkcs7", [dataB64, keyId, "no"]),
  unloadKey: (keyId: string): EimzoRequest => buildMessage("unload_key", "pfx", [keyId]),
};

/** `NEXT_PUBLIC_EIMZO_API_KEYS="estats.uz:KALIT;www.estats.uz:KALIT2"` → juftlar. */
export function parseApiKeys(raw: string | undefined | null): [string, string][] {
  return (raw ?? "")
    .split(/[;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const at = part.indexOf(":");
      return at > 0 ? ([part.slice(0, at).trim(), part.slice(at + 1).trim()] as [string, string]) : null;
    })
    .filter((pair): pair is [string, string] => !!pair && !!pair[0] && !!pair[1]);
}

// ── versiya ──────────────────────────────────────────────────────────────────

/**
 * E-IMZO `version` javobi: `{major, minor}` (ba'zan `build`/`patch`/
 * `revision`) yoki `{version: "6.3.5"}`. Raqamlar ro'yxati, aniqlab
 * bo'lmasa `null`.
 */
export function parseVersion(data: unknown): number[] | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.version === "string" && /^\d+(\.\d+)*$/.test(d.version.trim())) {
    return d.version.trim().split(".").map(Number);
  }
  const parts: number[] = [];
  for (const key of ["major", "minor", "build", "patch", "revision"]) {
    const value = d[key];
    if (value === undefined || value === null || value === "") {
      if (key === "major" || key === "minor") return parts.length ? parts : null;
      continue;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) return parts.length ? parts : null;
    parts.push(n);
  }
  return parts.length ? parts : null;
}

export function formatVersion(parts: number[] | null): string {
  return parts && parts.length ? parts.join(".") : "noma'lum";
}

/** -1 / 0 / 1; yo'q qism 0 deb olinadi. */
export function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/**
 * `ok` — yetarli; `old` — eski; `unknown` — aytib bo'lmaydi (versiya
 * kelmadi yoki E-IMZO faqat `major.minor` berdi va u talab bilan bir xil:
 * 6.3 ≥ 6.3.5 mi — noma'lum). `unknown` da imzolashga ruxsat beriladi,
 * lekin ogohlantiriladi: Didox o'zi rad etsa xabar ko'rsatiladi.
 */
export function versionStatus(have: number[] | null, need: string | null | undefined): "ok" | "old" | "unknown" {
  if (!need) return "ok";
  if (!have || !have.length) return "unknown";
  const required = need.split(".").map(Number);
  const prefix = required.slice(0, have.length);
  const cmp = compareVersions(have, prefix);
  if (cmp < 0) return "old";
  if (cmp > 0) return "ok";
  return have.length >= required.length ? "ok" : "unknown";
}

// ── sertifikatlar ────────────────────────────────────────────────────────────

export interface EimzoCertificate extends EimzoCertificateRef {
  /** Egasining ismi (CN). */
  cn: string;
  /** Tashkilot nomi (O), bo'lsa. */
  organization: string;
  /** Yuridik shaxs STIRi (OID 1.2.860.3.16.1.1). */
  orgTin: string;
  /** Jismoniy shaxs STIRi (UID). */
  uid: string;
  /** JShShIR (OID 1.2.860.3.16.1.2). */
  pinfl: string;
  serialNumber: string;
  validFrom: Date | null;
  validTo: Date | null;
}

/** `cn=ALIYEV ALI,o=OOO TEST,1.2.860.3.16.1.1=123456789,...` → kalit (kichik harf) → qiymat. */
export function parseAlias(alias: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (alias ?? "").split(",")) {
    const at = part.indexOf("=");
    if (at <= 0) continue;
    const key = part.slice(0, at).trim().toLowerCase();
    const value = part.slice(at + 1).trim();
    if (key && !(key in out)) out[key] = value;
  }
  return out;
}

function parseEimzoDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  // «2024.01.31 10:20:30» → ISO
  const iso = raw.trim().replace(/^(\d{4})\.(\d{2})\.(\d{2})/, "$1-$2-$3").replace(" ", "T");
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toCertificate(raw: EimzoCertificateRef): EimzoCertificate {
  const x = parseAlias(raw.alias);
  return {
    disk: raw.disk,
    path: raw.path,
    name: raw.name,
    alias: raw.alias,
    cn: x["cn"] ?? raw.name,
    organization: x["o"] ?? "",
    orgTin: x["1.2.860.3.16.1.1"] ?? "",
    uid: x["uid"] ?? x["initials"] ?? "",
    pinfl: x["1.2.860.3.16.1.2"] ?? "",
    serialNumber: x["serialnumber"] ?? "",
    validFrom: parseEimzoDate(x["validfrom"]),
    validTo: parseEimzoDate(x["validto"]),
  };
}

export function isExpired(cert: EimzoCertificate, now: Date = new Date()): boolean {
  return !!cert.validTo && cert.validTo.getTime() < now.getTime();
}

/**
 * Sertifikat kutilgan STIR/JShShIRga tegishlimi. `expected` dan birortasi
 * sertifikatdagi tashkilot STIRi, shaxs STIRi yoki JShShIR bilan teng
 * bo'lsa — mos. Kutilgan ro'yxat bo'sh bo'lsa tekshirib bo'lmaydi → `true`.
 */
export function certificateMatches(cert: EimzoCertificate, expected: (string | null | undefined)[]): boolean {
  const wanted = expected.map((v) => (v ?? "").trim()).filter((v) => /^\d{9}$|^\d{14}$/.test(v));
  if (!wanted.length) return true;
  const own = [cert.orgTin, cert.uid, cert.pinfl].filter(Boolean);
  return wanted.some((v) => own.includes(v));
}

/** E-IMZO `reason` matni foydalanuvchi bekor qilganini bildiradimi. */
export function isCancelReason(reason: unknown): boolean {
  const text = String(reason ?? "").toLowerCase();
  return /cancel|отмен|bekor|прерван|aborted/.test(text);
}

/** E-IMZO o'z xatosida «noto'g'ri parol» deydimi. */
export function isWrongPassword(reason: unknown): boolean {
  const text = String(reason ?? "").toLowerCase();
  return /password|парол|parol/.test(text) && /incorrect|wrong|неверн|noto/.test(text);
}

export function isBase64(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && /^[A-Za-z0-9+/\r\n]+={0,2}$/.test(value);
}
