/**
 * Kirgandan keyin qaytish mumkin bo'lgan manzillar — sof qism (testlanadi).
 *
 * Faqat kengaytmalarni ulash sahifalari: Lens (`/extension/connect`) va
 * eStats AI (`/extension/ai-connect`). Ikkalasi ham kengaytma bergan
 * `?state=` ni kutadi — kirish oralig'ida u yo'qolsa ulash buziladi.
 * Ro'yxat qat'iy va faqat shu kelib chiqishdagi yo'l, ya'ni ochiq
 * yo'naltirish (open redirect) bo'lmaydi.
 */
const RETURN_ALLOWED = /^\/extension\/(?:ai-)?connect(\?[^#]*)?$/;

export function isReturnAllowed(path: string | null | undefined): path is string {
  return typeof path === "string" && RETURN_ALLOWED.test(path);
}
