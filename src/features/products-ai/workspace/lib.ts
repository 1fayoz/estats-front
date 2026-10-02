import type { DraftTabKey } from "@/features/products-ai/components/draft-fields";
import { formatUsd } from "@/lib/format";
import type { AiChatSession, AiDraft, AiImageEngine, AiSessionTarget } from "@/lib/types";

/** Sahifadagi tablar — URL `?tab=` qiymatlari. */
export const TAB_KEYS: DraftTabKey[] = [
  "general", "ru", "images", "attrs", "keywords", "market", "pricing", "audit",
];

export const TAB_TITLE: Record<DraftTabKey, string> = {
  general: "Tovar haqida",
  ru: "Ruscha matn",
  images: "Rasmlar",
  attrs: "Xususiyatlar",
  keywords: "Kalit so'zlar",
  market: "Bozordagi raqobatchilar",
  pricing: "Tan narx va foyda",
  audit: "Joylashga tayyorlik",
};

/** Sotuvchi harakat qilishi kerak bo'lgan holatlar — "xato" emas, "keyingi qadam". */
export const FAILED_PUBLISH = new Set(["error", "category_unresolved", "shop_unavailable", "shop_mismatch"]);

/** Do'kon bilan bog'liq to'xtashlarda `estats-publish` bergan ANIQ xabar ko'rsatiladi. */
export const SHOP_PUBLISH_STOPS = new Set(["shop_unavailable", "shop_mismatch"]);

/** Tahrirlash natijasi — yaratishdan boshqa so'z bilan ("joylandi" emas). */
export const EDIT_STATUS_LABEL: Record<string, string> = {
  published: "Uzum'dagi tovar yangilandi ✓",
  error: "Yangilanmadi",
  needs_manual_step: "Yangilash bir bosqichda to'xtadi — qo'lda tekshirish kerak",
  unknown_final_state: "Yangilash holati noma'lum — qayta bosing",
};

export const PUBLISH_STATUS_LABEL: Record<string, string> = {
  published: "Uzum'ga joylandi ✓",
  needs_login: "Uzum sessiyasi yo'q — Sozlamalar → Integratsiyalar'da ulaning",
  captcha: "Uzum CAPTCHA so'radi — qayta urinib ko'ring",
  category_unresolved: "Kategoriya avtomatik topilmadi — qo'lda joylash kerak",
  needs_manual_step: "Bir bosqichda to'xtadi — qo'lda tekshirish kerak",
  stopped: "To'xtatildi — davom ettirish mumkin",
  shop_unavailable: "Tanlangan do'kon kabinet hisobida yo'q — boshqa do'kon tanlang",
  shop_mismatch: "Kabinet boshqa do'konga yozmoqchi bo'ldi — joylash to'xtatildi",
  error: "Joylanmadi",
};

export const PUBLISH_STAGE_LABEL: Record<string, string> = {
  starting: "sahifa ochilmoqda",
  category: "kategoriya aniqlanmoqda",
  content: "nom va tavsif to'ldirilmoqda",
  images: "rasmlar yuklanmoqda",
  review: "yakuniy bosqichlar",
};

/**
 * Do'kon tanlovini o'zgartirib bo'lmasa — sababi (backenddagi
 * `uzum_shops.lock_reason` bilan bir xil qoida, server baribir tekshiradi).
 */
export function shopLockReason(draft: AiDraft): string | null {
  const publish = draft.uzumPublish;
  if (publish?.productId) {
    return `Tovar Uzum'da allaqachon bor (ID ${publish.productId}) — boshqa do'konga ko'chirib bo'lmaydi.`;
  }
  if (publish && ["queued", "running", "stopped"].includes(publish.status)) {
    return "Joylash jarayoni ochiq — do'konni o'zgartirishdan oldin uni yakunlang.";
  }
  return null;
}

/**
 * Qoralama hozir QAYSI do'konga bog'langan (`id: null` — joriy do'kon).
 * Tovar Uzum'da bo'lsa yoki joylash ochiq bo'lsa — joylash YOZGAN do'kon;
 * aks holda sotuvchining tanlovi (eski urinishning do'koni ATAYLAB emas —
 * `shop_unavailable` dan keyin boshqa do'kon tanlanganda eskisi qaytmasin).
 */
export function draftShop(draft: AiDraft): { id: number | null; title: string | null } {
  const publish = draft.uzumPublish;
  if (shopLockReason(draft) && publish?.uzumShopId) {
    return { id: publish.uzumShopId, title: publish.uzumShopTitle ?? null };
  }
  return { id: draft.uzumShop?.id ?? null, title: draft.uzumShop?.title ?? null };
}

/** Quvur, joylash yoki bo'lish FONDA ketyaptimi — sahifa shunda so'rab turadi. */
export function isDraftBusy(draft: AiDraft | null): boolean {
  if (!draft) return false;
  return (
    (draft.progress < 100 && !draft.error) ||
    draft.uzumPublish?.status === "queued" ||
    draft.uzumPublish?.status === "running" ||
    ["waiting", "texts", "publishing"].includes(draft.split?.auto?.status ?? "")
  );
}

/** Rasm yo'li — eski backend maydonni bermasa pulli API deb hisoblanadi. */
export function imageEngineOf(source: { imageEngine?: AiImageEngine } | null | undefined): AiImageEngine {
  return source?.imageEngine ?? "api";
}

/**
 * Rasm narxi matni (2026-10-03, sotuvchi: «API'ning pullisidan foydalanganda
 * bitta rasm necha pulga tayyor bo'lishi ko'rsatiladi, brauzerdan ulagan
 * bo'lsa — yo'q»). `count` ta kadr uchun.
 */
export function imageCostText(
  source: { imageEngine?: AiImageEngine; imagePriceUsd: number; imageFallback?: string } | null | undefined,
  count = 1,
): { paid: boolean; text: string; hint: string } {
  const engine = imageEngineOf(source);
  if (engine === "web") {
    return {
      paid: false,
      text: "brauzer hisobi, pulsiz",
      hint: source?.imageFallback === "api"
        ? "Brauzer hisobi (Gemini) bilan yasaladi — pulsiz. Hisob band yoki limitda bo'lsa pulli API zaxira."
        : "Brauzer hisobi (Gemini) bilan yasaladi — pulsiz.",
    };
  }
  if (engine === "none") {
    return { paid: false, text: "yasovchi ulanmagan", hint: "Integratsiyalar → AI'da brauzer hisobini ulang yoki kalit kiriting." };
  }
  const usd = (source?.imagePriceUsd ?? 0) * Math.max(1, count);
  return {
    paid: true,
    text: usd > 0 ? `~${formatUsd(usd)}` : "bir necha sent",
    hint: "Pulli API (Gemini/OpenAI) bilan yasaladi — narx chaqiruv paytidagi tarif bo'yicha.",
  };
}

/** Sessiya turi — filtr va guruhlash uchun (backend `session_targets.kind_of`). */
export type SessionKind = AiSessionTarget["kind"];

export const SESSION_KIND_LABEL: Record<SessionKind, string> = {
  image: "Rasm",
  verify: "Tekshiruv",
  text: "Matn",
  analysis: "Tahlil",
  other: "Boshqa",
};

export function sessionKind(session: AiChatSession): SessionKind {
  return session.target?.kind ?? (session.taskType === "image.generate" ? "image" : "other");
}

/** Shu kadr uchun ochilgan sessiyalar (yasash + tekshiruv). */
export function sessionsForImage(
  sessions: AiChatSession[],
  where: { position?: number; slot?: string; variantIndex?: number; order?: number },
): AiChatSession[] {
  return sessions.filter((s) => {
    const t = s.target;
    if (!t || (t.kind !== "image" && t.kind !== "verify")) return false;
    if (where.slot) return t.slot === where.slot;
    if (where.variantIndex !== undefined) return t.variantIndex === where.variantIndex && t.order === where.order;
    return where.position !== undefined && t.position === where.position && t.place === "gallery";
  });
}
