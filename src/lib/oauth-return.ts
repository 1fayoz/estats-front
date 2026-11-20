/**
 * OAuth'dan qaytgandagi `?net_error=` / `?ig_error=` matnini ko'rsatish.
 *
 * Backend xatoni ochiq MATN sifatida qaytaradi (provayder
 * `error_description`i ham). Tekshiruvsiz `toast.error(param)` esa
 * istalgan havola orqali kabinet ichida begona matn ("Hisobingiz
 * bloklandi, +998... ga qo'ng'iroq qiling") ko'rsatishga imkon berardi.
 *
 * Shu sabab:
 *   - backend'ning o'zgarmas xabarlari (pastdagi ro'yxat) — har doim;
 *   - boshqa matn — faqat shu oynada odam O'ZI ulashni boshlagan bo'lsa
 *     (`markOAuthPending`), uzunligi cheklangan holda;
 *   - aks holda — umumiy xabar. Begona matn hech qachon chiqmaydi.
 */
const PENDING_KEY = "estats:oauth-pending";
/** Ulash oqimi shundan uzoq cho'zilmaydi; eski belgi qayta ishlatilmaydi. */
const PENDING_TTL_MS = 15 * 60 * 1000;
const MAX_LEN = 200;

export const GENERIC_OAUTH_ERROR = "Ulanib bo'lmadi. Qayta urinib ko'ring.";

/** Backend (`social/router.py`, `instagram/router.py`) yuboradigan o'zgarmas xabarlar. */
const KNOWN_MESSAGES = new Set([
  // State/nonce mos kelmadi — oqim boshqa brauzer/oynada tugagan (audit #50).
  // Aynan shu holatda bu oynada `pending` belgisi yo'q, shuning uchun matn
  // ro'yxatda bo'lishi shart, aks holda umumiy xabar chiqadi.
  "Ulanish havolasi eskirgan yoki boshqa brauzerda ochilgan.",
  // Eski backend matnlari (orqaga moslik uchun).
  "Ulanish havolasi eskirgan.",
  "Ulanish havolasi mos kelmadi.",
  "Tarmoq kod qaytarmadi.",
  "Ilova kaliti yo'q.",
  "Tarmoq akkaunt identifikatorini bermadi.",
  "Facebook kod qaytarmadi.",
]);

/** Sof qism: qaysi matn ko'rsatiladi. `null` — ko'rsatiladigan xato yo'q. */
export function oauthErrorMessage(raw: string | null | undefined, pending: boolean): string | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;
  if (KNOWN_MESSAGES.has(text)) return text;
  if (!pending) return GENERIC_OAUTH_ERROR;
  return text.length > MAX_LEN ? `${text.slice(0, MAX_LEN)}…` : text;
}

/** Provayderga yo'naltirishdan OLDIN chaqiriladi. */
export function markOAuthPending(): void {
  try {
    window.sessionStorage.setItem(PENDING_KEY, String(Date.now()));
  } catch {
    /* sessionStorage yopiq — qaytishda faqat ma'lum xabarlar chiqadi */
  }
}

/** Belgini o'qiydi va o'chiradi: bitta qaytish — bitta ishonch. */
export function consumeOAuthPending(now: number = Date.now()): boolean {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    window.sessionStorage.removeItem(PENDING_KEY);
    const at = raw ? Number(raw) : NaN;
    return Number.isFinite(at) && now - at >= 0 && now - at < PENDING_TTL_MS;
  } catch {
    return false;
  }
}

/**
 * OAuth'dan qaytganda qaysi tab ochilishi kerak (audit #51).
 *
 * Instagram callback'i `/integrations?ig_connected=1` (yoki `?ig_error=`)
 * ga `tab` siz qaytaradi; natijani o'qiydigan `InstagramConnectCard` esa
 * faqat Instagram tabida turadi. Sukutdagi Uzum tabida odam na xabarni,
 * na akkaunt tanlash bosqichini ko'rardi. `tab` aniq berilgan bo'lsa —
 * tegilmaydi. `null` — tabni o'zgartirish shart emas.
 */
export function oauthReturnTab(get: (key: string) => string | null): string | null {
  if (get("tab")) return null;
  if (get("ig_error") || get("ig_connected")) return "instagram";
  return null;
}
