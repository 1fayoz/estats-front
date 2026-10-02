/*
 * Web AI hisob kalitlari: `gemini_web`, `gemini_web_2` … va `chatgpt_web`,
 * `chatgpt_web_2` … (backend `models/ai/web_account.py` `family_of` bilan bir xil).
 * Hisoblar soni sotuvchiga bog'liq — yorliq kalitdan yasaladi, qattiq ro'yxat yo'q.
 */

export type AiFamily = "gemini_web" | "chatgpt_web";

const RE = /^(gemini_web|chatgpt_web)(?:_(\d+))?$/;

export function aiFamily(key: string): AiFamily | null {
  const m = RE.exec(key);
  return m ? (m[1] as AiFamily) : null;
}

export function aiNumber(key: string): number {
  const m = RE.exec(key);
  return m?.[2] ? Number(m[2]) : 1;
}

export const AI_FAMILY_NAME: Record<AiFamily, string> = { gemini_web: "Gemini", chatgpt_web: "ChatGPT" };

/** «Gemini», «Gemini · 2», «ChatGPT · 3». */
export function aiAccountLabel(key: string): string {
  const fam = aiFamily(key);
  if (!fam) return key;
  const n = aiNumber(key);
  return n === 1 ? AI_FAMILY_NAME[fam] : `${AI_FAMILY_NAME[fam]} · ${n}`;
}
