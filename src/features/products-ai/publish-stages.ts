import type { AiUzumPublish } from "@/lib/types";

/**
 * Uzum'ga joylash — UCH ko'rinadigan bosqich, xuddi `AI_STAGES`
 * chizig'i kabi (`stages.ts`) va Uzum'ning O'Z sahifasidagi
 * bosqich chizig'i kabi (masalan «Xususiyatlar → Yakunlash»).
 *
 * Backendda (`estats-publish`) haqiqatda 5 ta ichki bosqich bor
 * (`starting/category/content/images/review`) — lekin sotuvchiga
 * hammasi alohida chiqsa, "sahifa ochilmoqda" kabi bir zumlik
 * texnik qadamlar chiziqni cho'zib, muhimini (kategoriya,
 * rasmlar) yo'qotib qo'yadi. Shuning uchun 3 taga birlashtirilgan
 * — sotuvchi uchun ma'noli chegaralar bo'yicha.
 */
export interface PublishPhase {
  key: string;
  short: string;
  label: string;
  /** Shu fazaga kiruvchi haqiqiy backend bosqichlari (`timings` kalitlari). */
  parts: readonly string[];
}

export const PUBLISH_PHASES: PublishPhase[] = [
  { key: "category", short: "Kategoriya", label: "Kategoriya tanlandi", parts: ["starting", "category"] },
  { key: "content", short: "Ma'lumot", label: "Nom, tavsif va rasmlar yuklandi", parts: ["content", "images"] },
  { key: "review", short: "Yakunlash", label: "Uzum'ning o'z tekshiruvidan o'tdi", parts: ["review"] },
];

export type PublishPhaseState = "done" | "active" | "failed" | "next";

/**
 * Faza holati `stage`ning O'ZIGA emas, `timings`ga tayanadi — xuddi
 * `stages.ts`dagi `doneIndex()` kabi: xato bo'lganda `stage` qayerda
 * to'xtaganini aytmay qolishi mumkin, `timings` esa tugagan
 * bosqichlarni saqlab qoladi.
 */
export function publishPhaseState(
  phase: PublishPhase,
  publish: Pick<AiUzumPublish, "stage" | "timings" | "status"> | null | undefined,
  publishing: boolean,
): PublishPhaseState {
  if (!publish) return "next";
  if (publish.status === "published") return "done";
  if (phase.parts.every((p) => publish.timings[p] !== undefined)) return "done";
  if (publish.stage !== null && phase.parts.includes(publish.stage)) {
    if (publishing) return "active";
    return publish.status ? "failed" : "next";
  }
  return "next";
}

/**
 * «Uzumda yangilash» — tirik tovarni TAHRIRLASH bosqichlari.
 *
 * Backend (`estats-publish/edit-stages.js`) tartibi bilan BIR XIL.
 * Galereya bosqichi faqat rasmlar ham almashtirilganda bor —
 * rasmsiz yangilashda u chiziqda umuman ko'rsatilmaydi.
 */
export const EDIT_STAGE_ORDER = [
  "opening", "names", "descriptions", "sections", "gallery", "saving", "attributes", "finishing",
] as const;

export const EDIT_STAGE_LABEL: Record<string, string> = {
  opening: "Uzum kabineti ochilmoqda",
  names: "Nom yangilanmoqda",
  descriptions: "Qisqacha tavsif va tavsif (rasmlari bilan) yozilmoqda",
  sections: "Oʻlchamli setka, tarkib va yoʻriqnoma yozilmoqda",
  gallery: "Galereya rasmlari almashtirilmoqda",
  saving: "Oʻzgarishlar saqlanmoqda",
  attributes: "Xususiyatlar jadvali toʻldirilmoqda",
  finishing: "Yakunlanmoqda",
};

const EDIT_PHASES_ALL: PublishPhase[] = [
  { key: "open", short: "Ochish", label: "Uzum kabinetida tovar ochildi", parts: ["opening"] },
  { key: "text", short: "Matn va bo'limlar", label: "Nom, tavsif, setka, tarkib, yo'riqnoma", parts: ["names", "descriptions", "sections"] },
  { key: "gallery", short: "Rasmlar", label: "Galereya rasmlari almashtirildi", parts: ["gallery"] },
  { key: "save", short: "Saqlash", label: "Saqlandi, xususiyatlar to'ldirildi", parts: ["saving", "attributes", "finishing"] },
];

export function editPhases(replaceImages: boolean | null | undefined): PublishPhase[] {
  return replaceImages ? EDIT_PHASES_ALL : EDIT_PHASES_ALL.filter((p) => p.key !== "gallery");
}

/**
 * Tahrirlashda `timings`ga tayanib bo'lmaydi: o'tkazib yuborilgan
 * bosqich (masalan rasmsiz yangilashda galereya) hech qachon vaqt
 * yozmaydi. Shuning uchun holat bosqichlar TARTIBIDAN chiqariladi.
 */
export function editPhaseState(
  phase: PublishPhase,
  publish: Pick<AiUzumPublish, "stage" | "status"> | null | undefined,
  publishing: boolean,
): PublishPhaseState {
  if (!publish) return "next";
  if (publish.status === "published") return "done";
  const order = EDIT_STAGE_ORDER as readonly string[];
  const current = publish.stage ? order.indexOf(publish.stage) : -1;
  const first = Math.min(...phase.parts.map((p) => order.indexOf(p)));
  const last = Math.max(...phase.parts.map((p) => order.indexOf(p)));
  if (current > last) return "done";
  if (current >= first) return publishing ? "active" : "failed";
  return "next";
}
