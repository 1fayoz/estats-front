/**
 * Hamma ro'yxatlar uchun BITTA sahifa hajmi.
 *
 * Backend ham shu raqamni sukut qiladi (`my-stats-back`
 * `src/utils/pagination.py` → `PAGE_SIZE`, `estats-market` → `limit`).
 * Ikki joyda ikki xil raqam bo'lsa, server 20 ta qaytarib, front 15
 * tasini ko'rsatib, qolgan 5 tasi hech qaysi sahifada chiqmay qolardi.
 *
 * `lib` da turadi, komponentda emas: `lib/market.ts` kabi mijozlar ham
 * shu raqamni ishlatadi va `lib` → `components` bog'liqligi teskari
 * yo'nalish bo'lardi.
 */
export const PAGE_SIZE = 15;

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / size));
}
