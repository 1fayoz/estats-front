/**
 * Sotuvchi kabineti vazifalari — eStats Lens kengaytmasi holati (banner va
 * kartalar uchun). SOF modul (React'siz): `tests/cabinet-extension.test.mjs`.
 *
 * 2026-11-24 dan serverdagi brauzer O'CHIRILDI (Uzum/Cloudflare server IP'sini
 * «Verify you are human» ga tushirgan edi): voronka, Bust narxlari, reklama,
 * moderatsiya sababi va kartochka nusxasi endi FAQAT sotuvchining o'z
 * brauzerida — eStats Lens orqali, u o'zi kirgan seller.uzum.uz sessiyasi
 * bilan bajariladi. Kengaytma ulanmagan yoki oflayn bo'lsa bu ishlar
 * yangilanmaydi — banner shuni aytadi va nima qilish kerakligini ko'rsatadi.
 */

/** `GET /cabinet-runner/shop/summary` — faol do'kon uchun kengaytma holati. */
export interface CabinetExtensionSummary {
  /** Serverdagi brauzer yoqilganmi (favqulodda zaxira; sukut — yo'q). */
  serverBrowser: boolean;
  /** Hamma vazifa turlari uchun kerakli eng past kengaytma versiyasi. */
  minVersion: string;
  /** Shu do'kon uchun «Sotuvchi kabineti vazifalari» biror marta ishlagan. */
  paired: boolean;
  /** Kengaytma so'nggi ~90 soniyada yurak urishi yubordi. */
  online: boolean;
  /** Onlayn VA seller.uzum.uz ga kirilgan. */
  loggedIn: boolean;
  /** Onlayn kengaytma versiyasi `minVersion` dan eski. */
  outdated: boolean;
  version: string | null;
  lastSeenAt: string | null;
}

export type ExtensionIssue = "unpaired" | "offline" | "logged_out" | "outdated";

/** Kengaytma sozlamasi — Integratsiyalar → Brauzer kengaytmasi. */
export const EXTENSION_HREF = "/integrations?tab=extension";
/** Sotuvchi kabineti — kengaytma shu sessiyadan foydalanadi. */
export const SELLER_CABINET_URL = "https://seller.uzum.uz";
/** Yopilgan banner shuncha vaqt ko'rinmaydi. */
export const DISMISS_MS = 24 * 60 * 60 * 1000;

/** Hozir sotuvchidan nima talab qilinadi — hech narsa bo'lmasa `null`. */
export function extensionIssue(summary: CabinetExtensionSummary | null): ExtensionIssue | null {
  if (!summary || summary.serverBrowser) return null;
  if (!summary.paired) return "unpaired";
  if (!summary.online) return "offline";
  if (!summary.loggedIn) return "logged_out";
  if (summary.outdated) return "outdated";
  return null;
}

export type BannerAction = { href: string; label: string; external?: boolean };
export type ExtensionBannerView = { text: string; action: BannerAction };

const WHAT = "Voronka, Bust narxlari, reklama, moderatsiya sababi va kartochka nusxasi";

/** Banner matni va tugmasi — holatga qarab. */
export function extensionBannerView(issue: ExtensionIssue, minVersion = ""): ExtensionBannerView {
  const connect: BannerAction = { href: EXTENSION_HREF, label: "Kengaytmani ulash" };
  switch (issue) {
    case "unpaired":
      return {
        text:
          `${WHAT} endi server emas, sizning brauzeringizda — eStats Lens kengaytmasi orqali bajariladi. ` +
          "Kengaytmada «Sotuvchi kabineti vazifalari»ni yoqing va seller.uzum.uz ga kiring.",
        action: connect,
      };
    case "offline":
      return {
        text:
          `eStats Lens oflayn — brauzer yopiq yoki kabinet vazifalari o'chiq. ${WHAT} hozir yangilanmaydi; ` +
          "Chrome'ni ochsangiz o'zi davom etadi.",
        action: connect,
      };
    case "logged_out":
      return {
        text:
          "eStats Lens onlayn, lekin brauzerda seller.uzum.uz ga kirilmagan. Do'kon egasining hisobi bilan kiring — " +
          "kabinet vazifalari shu sessiya bilan bajariladi.",
        action: { href: SELLER_CABINET_URL, label: "seller.uzum.uz ni ochish", external: true },
      };
    case "outdated":
      return {
        text:
          `eStats Lens kengaytmasini yangilang${minVersion ? ` (kamida ${minVersion})` : ""}: Chrome uni do'kondan o'zi yangilaydi, ` +
          "kutmaslik uchun chrome://extensions → «Yangilash».",
        action: { href: EXTENSION_HREF, label: "Kengaytma holati" },
      };
  }
}

/** Yopish belgisi kaliti — do'kon va holat bo'yicha (holat o'zgarsa banner qaytadi). */
export function dismissKey(shopId: number | string | null | undefined, issue: ExtensionIssue): string {
  return `estats-ext-banner:${shopId ?? "-"}:${issue}`;
}

/** `localStorage` dagi qiymat (yopilgan vaqt, ms) hali kuchdami. */
export function isDismissed(stored: string | null | undefined, now = Date.now()): boolean {
  const at = Number(stored);
  return Number.isFinite(at) && at > 0 && now - at < DISMISS_MS;
}
