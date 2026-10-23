/**
 * Login ortidagi (kabinet) va kirish yo'llarining birinchi segmenti.
 *
 * Bitta ro'yxat uch joyda ishlatiladi: `robots.ts` (Disallow),
 * `next.config.ts` (X-Robots-Tag: noindex) — kabinet layout'idagi
 * `robots: noindex` meta bilan birga. `(dashboard)` ga yangi bo'lim
 * qo'shilsa — shu yerga ham yoziladi.
 *
 * Diqqat: bu fayl `next.config.ts` dan import qilinadi, shuning uchun
 * `@/` taxallusi va boshqa modullarsiz qolishi kerak.
 */
export const PRIVATE_ROUTE_SEGMENTS = [
  "today",
  "market",
  "bust",
  "team",
  "extension",
  "seo",
  "plan",
  "expenses",
  "instagram",
  "socials",
  "networks",
  "marketing",
  "integrations",
  "warehouse",
  "intakes",
  "pnl",
  "finance",
  "settings",
  "login",
] as const;
