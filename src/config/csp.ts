/**
 * Content-Security-Policy — `next.config.ts` dan import qilinadi, shuning
 * uchun `@/` taxallusi va boshqa modullarsiz qoladi (testlanadi).
 *
 * Nega CSP: sessiya JWT'si localStorage'da, kabinetda esa uchinchi
 * tomon skriptlari (telegram.org, Google GIS) ishlaydi. Har qanday skript
 * in'ektsiyasi tokenni to'g'ridan-to'g'ri o'qiy oladi.
 *
 * Ikki qism:
 *   1. MAJBURIY (`Content-Security-Policy`) — hech narsani sindira
 *      olmaydigan direktivalar: `base-uri`, `object-src`, `frame-ancestors`
 *      (X-Frame-Options SAMEORIGIN bilan bir xil ma'no).
 *   2. KUZATUV (`Content-Security-Policy-Report-Only`) — to'liq ro'yxat
 *      (script/connect/frame...). Hozircha faqat brauzer konsolida
 *      ogohlantiradi: Telegram WebApp, Google GIS, E-IMZO (127.0.0.1),
 *      PDF iframe va ijtimoiy tarmoq rasmlari prod'da tekshirilmagan.
 *      Konsol toza bo'lgach bu qism majburiyga ko'chiriladi.
 *
 * `script-src` da `'unsafe-inline'` majburan bor: Next App Router o'z
 * inline skriptlarini (`self.__next_f`) nonce'siz chiqaradi, JSON-LD ham
 * inline. Nonce uchun har sahifa dinamik render bo'lishi kerak — statik
 * landing sahifalarini yo'qotish narxi hozircha ortiqcha.
 */

/** Manzildan `https://host` va mos `wss://host` ni oladi. Buzuq manzil — e'tiborsiz. */
function originsOf(url: string | undefined): string[] {
  if (!url) return [];
  try {
    const { origin, protocol, host } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return [];
    return [origin, `${protocol === "https:" ? "wss" : "ws"}://${host}`];
  } catch {
    return [];
  }
}

const GOOGLE = "https://accounts.google.com";
const TELEGRAM = "https://telegram.org";
// E-IMZO — sotuvchi kompyuteridagi ilova (`didox/eimzo-core.ts`).
const EIMZO = ["wss://127.0.0.1:64443", "ws://127.0.0.1:64646"];

export interface CspOptions {
  /** Brauzer chaqiradigan API manzillari (NEXT_PUBLIC_*_API/URL). */
  apiUrls: (string | undefined)[];
  /** `next dev` — HMR uchun `eval` va websocket kerak. */
  dev?: boolean;
}

export function buildCsp({ apiUrls, dev = false }: CspOptions): { enforced: string; reportOnly: string } {
  const api = [...new Set(apiUrls.flatMap(originsOf))];
  const httpApi = api.filter((o) => o.startsWith("http"));

  const enforced = ["base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'"];

  const reportOnly = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} ${TELEGRAM} ${GOOGLE}`,
    `style-src 'self' 'unsafe-inline' ${GOOGLE}`,
    // Tovar/ijtimoiy tarmoq rasmlari ko'p CDN'dan keladi (Uzum, Instagram...).
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${[...api, GOOGLE, ...EIMZO].join(" ")}${dev ? " ws: wss:" : ""}`,
    `frame-src 'self' blob: ${[GOOGLE, ...httpApi].join(" ")}`,
    "worker-src 'self' blob:",
    "media-src 'self' blob: https:",
    "form-action 'self'",
    ...enforced,
  ];

  return { enforced: enforced.join("; "), reportOnly: reportOnly.join("; ") };
}
