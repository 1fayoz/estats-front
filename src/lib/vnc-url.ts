/**
 * VNC ko'prigi WebSocket manzilining sof qismi (tarmoqsiz — testlanadi).
 *
 * Brauzer WebSocket'iga sarlavha (`Authorization`, `X-Workspace-Id`) qo'yib
 * bo'lmaydi, shuning uchun hammasi query'da ketadi:
 *   - `ticket` — `POST /auth/ws-ticket` bergan 60 soniyalik BIR MARTALIK
 *     chipta. Sessiya JWT'si (`?token=`) URL'ga HECH QACHON qo'yilmaydi:
 *     u nginx/uvicorn log'iga tushardi (audit #37/#51/#49);
 *   - `workspace_id` — oddiy so'rovlardagi `X-Workspace-Id` ning o'rnini
 *     bosadi. Usiz backend birinchi workspace'ni tanlab, boshqa
 *     workspace'dagi do'kon oynasini 1008 bilan yopardi (audit #48);
 *   - `shop_id` — sotuvchi kabineti oynasi uchun.
 */
export function buildVncUrl(
  apiBase: string,
  path: string,
  opts: { ticket: string; workspaceId?: number | null; shopId?: number | null },
): string {
  const wsBase = apiBase.replace(/\/$/, "").replace(/^http/, "ws");
  const query = new URLSearchParams({ ticket: opts.ticket });
  if (opts.workspaceId) query.set("workspace_id", String(opts.workspaceId));
  if (opts.shopId != null) query.set("shop_id", String(opts.shopId));
  return `${wsBase}${path}?${query.toString()}`;
}

/** Chipta olinmasa ko'rsatiladigan xabar (JWT zaxirasi yo'q). */
export const VNC_TICKET_ERROR = "Xavfsiz ulanish chiptasini olib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.";
