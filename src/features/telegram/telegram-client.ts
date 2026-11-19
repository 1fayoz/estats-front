/**
 * Sahifa HAQIQATAN Telegram mijozi ichida ochilganmi — sof qism (testlanadi).
 *
 * Nega `initData` ning o'zi yetmaydi: SDK uni `location.hash` dagi
 * `#tgWebAppData=...` dan oladi — ODDIY brauzerda ham. Imzo satr
 * haqiqiy ekanini isbotlaydi, lekin uni AYNAN shu brauzer egasi
 * olganini emas. Hujumchi o'z WebApp'idan olingan `initData` ni
 * `estats.uz/login#tgWebAppData=...` havolasiga qo'yib yuborsa, qurbon
 * jimgina HUJUMCHI hisobiga kirib qolardi (login CSRF) va keyin
 * kiritgan Uzum tokeni, Didox ulanishi va h.k. hujumchi hisobiga tushardi.
 *
 * Haqiqiy mijoz SDK bilan gaplashish uchun albatta bitta "ko'prik"
 * beradi (SDK `postEvent` ham aynan shularni tekshiradi):
 *   - `window.TelegramWebviewProxy` — Android, iOS, Desktop, macOS;
 *   - `window.external.notify` — eski Windows mijozlari;
 *   - `window.parent !== window` — Telegram Web (iframe). Begona sayt
 *     bizni iframe'ga qo'ya olmaydi: `X-Frame-Options: SAMEORIGIN` va
 *     CSP `frame-ancestors 'self'`.
 * Bularni URL orqali soxtalashtirib bo'lmaydi.
 */
type WindowLike = {
  TelegramWebviewProxy?: unknown;
  external?: unknown;
  parent?: unknown;
};

export function isInsideTelegramClient(win: WindowLike): boolean {
  if (win.TelegramWebviewProxy !== undefined) return true;
  const ext = win.external as { notify?: unknown } | null | undefined;
  if (ext && typeof ext === "object" && typeof ext.notify === "function") return true;
  return win.parent != null && win.parent !== win;
}

/** `#tgWebAppData=..&tgWebAppVersion=..` dan `tgWebApp*` kalitlarini olib tashlaydi. */
export function stripTelegramHash(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return "";
  const kept = raw.split("&").filter((part) => part && !/^tgWebApp/i.test(part));
  return kept.length ? `#${kept.join("&")}` : "";
}

/**
 * Telegram tashqarisida kelgan ishga tushirish parametrlarini o'chiradi —
 * satr na URL'da, na SDK'ning `sessionStorage` nusxasida qolmasin
 * (aks holda qayta yuklashda yana `initData` sifatida chiqardi).
 */
export function scrubTelegramLaunchParams(): void {
  try {
    const { hash, pathname, search } = window.location;
    const next = stripTelegramHash(hash);
    if (next !== hash) {
      window.history.replaceState(window.history.state, "", `${pathname}${search}${next}`);
    }
  } catch {
    /* URL'ni o'zgartirib bo'lmadi — login baribir chaqirilmaydi */
  }
  try {
    window.sessionStorage.removeItem("__telegram__initParams");
  } catch {
    /* sessionStorage yopiq */
  }
}
