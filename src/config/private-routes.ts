/**
 * Login ortidagi kabinet va kirish sahifalari — ikkita prefiks.
 *
 * `robots.ts` (Disallow), `next.config.ts` (X-Robots-Tag: noindex) va
 * `proxy.ts` (sessiya tekshiruvi) shu prefikslarni ishlatadi, ya'ni kabinetga
 * yangi bo'lim qo'shilganda hech qayerga yozish shart emas.
 *
 * Diqqat: bu fayl `next.config.ts` va `proxy.ts` dan import qilinadi,
 * shuning uchun `@/` taxallusi va boshqa modullarsiz qolishi kerak.
 */
export const DASHBOARD_PREFIX = "/dashboard";
export const AUTH_PREFIX = "/auth";
export const LOGIN_PATH = "/auth/login";
/** `/dashboard` ning o'zi ochilganda — AuthGuard ruxsatga qarab boshqa bo'limga o'tkazadi. */
export const DASHBOARD_HOME = "/dashboard/warehouse";

/**
 * Prefiksdan oldingi eski manzillar (`/today`, `/warehouse/12`, …).
 *
 * Faqat 301 redirect uchun: saqlangan havolalar, Telegram bot tugmalari va
 * xatlardagi eski URL'lar ishlashda davom etsin. Hamma joy yangi manzilga
 * o'tgach olib tashlanadi.
 */
export const LEGACY_DASHBOARD_SEGMENTS = [
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
] as const;
