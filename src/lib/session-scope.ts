/**
 * Sessiya «doirasi»: qaysi foydalanuvchi (token), qaysi hisob va qaysi do'kon.
 *
 * `api.ts` har so'rovda `X-Shop-Id` / `X-Workspace-Id` / token'ni
 * localStorage'dan o'qiydi. localStorage esa BARCHA oynalar uchun umumiy:
 * ikkinchi oynada do'kon almashtirilsa (yoki boshqa odam kirsa), birinchi
 * oyna eski do'kon ma'lumotini ko'rsatib turadi, lekin keyingi so'rovlari
 * (saqlash, nashr qilish) YANGI do'kon sarlavhasi bilan ketadi. Shu sabab
 * doira o'zgarganini bilish kerak — o'zgarsa oyna qayta yuklanadi.
 *
 * Sof funksiyalar: `node --test` bilan tekshiriladi.
 */

export type SessionScope = {
  accessToken: string | null;
  workspaceId: number | null;
  activeShopId: number | null;
};

/** Zustand `persist` yozgan JSON'dan doirani ajratadi. Buzuq/bo'sh — hammasi null. */
export function parseSessionScope(raw: string | null | undefined): SessionScope {
  let state: Record<string, unknown> = {};
  try {
    state = (raw ? JSON.parse(raw)?.state : null) ?? {};
  } catch {
    state = {};
  }
  return {
    accessToken: typeof state.accessToken === "string" ? state.accessToken : null,
    workspaceId: typeof state.workspaceId === "number" ? state.workspaceId : null,
    activeShopId: typeof state.activeShopId === "number" ? state.activeShopId : null,
  };
}

/** Ikki holat orasida token, hisob yoki do'kon o'zgarganmi. */
export function sessionScopeChanged(
  oldRaw: string | null | undefined,
  newRaw: string | null | undefined,
): boolean {
  const a = parseSessionScope(oldRaw);
  const b = parseSessionScope(newRaw);
  return (
    a.accessToken !== b.accessToken ||
    a.workspaceId !== b.workspaceId ||
    a.activeShopId !== b.activeShopId
  );
}
