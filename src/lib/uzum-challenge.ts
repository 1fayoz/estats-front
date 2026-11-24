/**
 * Uzum (Cloudflare) «Verify you are human» tekshiruvi — interfeys qoidalari.
 * SOF modul (React'siz): `tests/uzum-challenge.test.mjs`.
 *
 * 2026-11-24 gacha banner «Bir marta belgi qo'ysangiz, qolganini eStats o'zi
 * davom ettiradi» deb va'da berardi, oyna esa tekshiruv qayta-qayta chiqsa
 * ham jim turardi. O'lchangan haqiqat boshqa: tekshiruv sotuvchi hisobiga
 * yoki brauzer keshiga emas, eStats SERVERINING IP'siga qo'yilgan (serverdan
 * har so'rov `403 cf-mitigated: challenge`, oddiy IP'dan — 200); oynada belgi
 * qo'yilgandan keyin sahifa qayta yuklanib yana tekshiruvga tushadi. Sotuvchi
 * belgini qayta-qayta bosib, keshdan gumon qilardi.
 *
 * Endi interfeys ISHLAYDIGAN yo'lni ko'rsatadi: kabinet amallari (voronka,
 * Bust narxlari, reklama) sotuvchining o'z brauzerida, eStats Lens
 * kengaytmasi orqali. Server oynasi — faqat «urinib ko'rish». Belgi
 * avtomatik bosilmaydi va bosilmasligi kerak (xavfsizlik chegarasi).
 */
import type { UzumChallenge, UzumLoginStatus } from "./types";

/** Kengaytma sozlamasi — kabinet amallari sotuvchining o'z brauzerida. */
export const EXTENSION_HREF = "/integrations?tab=extension";
/** Serverdagi brauzer oynasi (VNC) — DARHOL ochiladi. */
export const WINDOW_HREF = "/integrations?connect=uzum";

export type ChallengeAction = { href: string; label: string };

export type ChallengeBannerView = {
  text: string;
  /** Kichik izoh: server qachon o'zi qayta urinadi. */
  note: string | null;
  primary: ChallengeAction;
  secondary: ChallengeAction | null;
};

/** Pauza qoldig'i odam o'qiydigan ko'rinishda: «~25 daqiqa» yoki «~4 soat». */
export function approxDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  // 90 daqiqadan boshlab soatda: «~360 daqiqa» o'qilmaydi.
  return minutes < 90 ? `~${minutes} daqiqa` : `~${Math.round(minutes / 60)} soat`;
}

/** Banner matni va tugmalari — holatga qarab. */
export function challengeBannerView(state: UzumChallenge): ChallengeBannerView {
  const tryWindow: ChallengeAction = { href: WINDOW_HREF, label: "Oynada urinib ko'rish" };
  const note = state.cooldown && state.cooldown > 0
    ? `Server orqali keyingi urinish ${approxDuration(state.cooldown)}dan keyin, o'zi.`
    : null;

  if (state.extensionEnabled && state.extensionOnline) {
    return {
      text:
        "Voronka, Bust narxlari va reklama brauzeringizdagi eStats Lens kengaytmasi orqali ishlayapti. " +
        "Uzum'ga joylash server orqali bajariladi — u Uzum (Cloudflare) «Verify you are human» tekshiruvi sabab to'xtab turibdi.",
      note,
      primary: tryWindow,
      secondary: null,
    };
  }
  if (state.extensionEnabled) {
    return {
      text:
        "Uzum (Cloudflare) eStats serveridan kelgan so'rovlarni «Verify you are human» tekshiruviga tushirgan. " +
        "Voronka, Bust narxlari va reklama brauzeringizdagi eStats Lens kengaytmasi orqali ishlaydi — " +
        "kengaytmada «Sotuvchi kabineti vazifalari»ni yoqing va seller.uzum.uz ga kiring. " +
        "Serverdagi oynada belgi qo'yilgandan keyin ham tekshiruv qayta chiqishi mumkin.",
      note,
      primary: { href: EXTENSION_HREF, label: "Kengaytmani yoqish" },
      secondary: tryWindow,
    };
  }
  return {
    text:
      "Uzum (Cloudflare) eStats serveridan kelgan so'rovlarni «Verify you are human» tekshiruviga tushirgan — " +
      "Bust narxlari, voronka va joylash to'xtab turibdi. Oynada belgi qo'yib ko'ring; " +
      "tekshiruv qayta chiqsa — bu Uzum tomonidagi cheklov, qayta-qayta bosish yordam bermaydi.",
    note,
    primary: tryWindow,
    secondary: null,
  };
}

/** Tekshiruv shuncha marta qayta kelsa — «aylanib qoldi» deb tushuntiriladi. */
export const CHALLENGE_LOOP_AFTER = 2;

export type VncSessionView =
  /** Sessiya yo'q yoki begona — oyna qora ekran ko'rsatardi. */
  | { kind: "ended" }
  /**
   * Tekshiruv qayta-qayta chiqyapti — sababi va (kengaytma yo'li shu do'kon
   * uchun yoqilgan bo'lsa, `extension`) ishlaydigan yo'l.
   */
  | { kind: "loop"; count: number; extension: boolean }
  /** Tekshiruv sahifasi turibdi (birinchi marta) — nima qilish kerakligi. */
  | { kind: "challenge" }
  | { kind: "ok" };

/**
 * Ochiq oyna uchun holat (`GET /market/uzum-login/status`).
 * `null` — hali so'ralmagan yoki so'rov yiqildi: hech narsa ko'rsatilmaydi
 * (tarmoq uzilishi «sessiya tugadi» degani emas).
 */
export function vncSessionView(status: UzumLoginStatus | null): VncSessionView {
  if (!status) return { kind: "ok" };
  if (!status.active || !status.mine) return { kind: "ended" };
  const count = status.challengeCount ?? 0;
  if (status.challenged && count >= CHALLENGE_LOOP_AFTER) {
    return { kind: "loop", count, extension: Boolean(status.extensionEnabled) };
  }
  if (status.challenged) return { kind: "challenge" };
  return { kind: "ok" };
}

/** «Kirdim, saqlash» ni hozir bosish mumkinmi — tekshiruv turgan bo'lsa yo'q. */
export function canSaveSession(status: UzumLoginStatus | null): boolean {
  return !(status && status.active && status.mine && status.challenged);
}
