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
