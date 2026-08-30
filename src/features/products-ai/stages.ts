import type { AiDraft } from "@/lib/types";

/**
 * AI quvurining qadamlari — backenddagi `DraftStage.ORDER` bilan
 * BIR XIL tartibda.
 *
 * Nega front'da yana bir nusxa: `stageLabel` faqat JORIY qadamni
 * aytadi, chizig'i esa hammasini bir vaqtda ko'rsatadi — o'tilgani,
 * hozirgisi va oldindagisi. Tartib buzilmasligi uchun `key` lar
 * backend qiymatlari bilan aynan bir xil yozilgan.
 */
export interface AiStage {
  /** Backenddagi `stage` qiymati. */
  key: string;
  /** Chiziqdagi qisqa nom — joy tor. */
  short: string;
  /** Yon ustundagi to'liq nom. */
  label: string;
}

export const AI_STAGES: AiStage[] = [
  { key: "new", short: "Rasm", label: "Rasm qabul qilindi" },
  { key: "vision", short: "Tahlil", label: "Rasmda nima borligi aniqlandi" },
  { key: "market", short: "Bozor", label: "Raqobatchilar o'rganildi" },
  { key: "text", short: "Matn", label: "Uz va ru matn yozildi" },
  { key: "attributes", short: "Xususiyat", label: "Xususiyatlar va MXIK to'ldirildi" },
  { key: "images", short: "Rasm yasash", label: "Kartochka rasmi yasaldi" },
  { key: "ready", short: "Tayyor", label: "Tasdiqlashga tayyor" },
];

/**
 * Nechta qadam BAJARILGAN (indeks: 0 = faqat rasm qabul qilingan).
 *
 * `stage` ning o'ziga tayanib bo'lmaydi: xato bo'lganda u `failed`
 * ga aylanadi va qayerda to'xtaganini AYTMAYDI. Shuning uchun
 * yiqilgan qoralamada joy natija maydonlaridan tiklanadi — xuddi
 * backenddagi `_last_done` kabi, aks holda chiziq xatodan keyin
 * boshiga qaytib ketardi.
 */
export function doneIndex(draft: AiDraft): number {
  if (draft.stage === "approved") return AI_STAGES.length - 1;
  if (draft.stage === "failed") {
    if (draft.images.length || draft.imageNote) return 5;
    if (Object.keys(draft.attributes).length) return 4;
    if (draft.titleUz && draft.titleRu) return 3;
    if (draft.market) return 2;
    if (draft.vision) return 1;
    return 0;
  }
  const index = AI_STAGES.findIndex((stage) => stage.key === draft.stage);
  return index < 0 ? 0 : index;
}

/** Hozir ishlanayotgan qadam. Tugagan yoki to'xtaganda `null`. */
export function activeIndex(draft: AiDraft): number | null {
  if (draft.error || draft.stage === "failed") return null;
  if (draft.progress >= 100) return null;
  return Math.min(doneIndex(draft) + 1, AI_STAGES.length - 1);
}
