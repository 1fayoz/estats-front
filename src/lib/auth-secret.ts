/**
 * next-auth session cookie'sini shifrlaydigan secret — route handler ham,
 * `proxy.ts` ham SHU qiymatni o'qiydi.
 *
 * Ikkalasi turli secret bilan ishlasa (masalan lokal `.env.local` da
 * `NEXTAUTH_SECRET` yo'q: next-auth o'zi vaqtinchalik secret yasaydi, proxy
 * esa bo'sh qiymat bilan cookie'ni o'qiy olmaydi) — brauzer "kirgan", proxy
 * "kirmagan" deb o'ylab, login va kabinet orasida cheksiz aylanadi.
 *
 * Prod'da secret majburiy: bo'lmasa next-auth xato beradi (compose ham to'xtaydi).
 */
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "estats-dev-only-secret");
