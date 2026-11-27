/**
 * Uzum'ga AVTOMATIK joylash va tirik tovarni yangilash (kabinet formasini
 * to'ldirish) — 2026-11-24 dan TO'XTATILGAN.
 *
 * Bu ish serverdagi brauzerda (`estats-publish`) bajarilardi; brauzer
 * o'chirildi (Uzum/Cloudflare server IP'sini «Verify you are human» ga
 * tushirgan, belgini bosish ham yordam bermasdi). Voronka, Bust, reklama,
 * moderatsiya sababi allaqachon eStats Lens orqali sotuvchi brauzerida;
 * joylash ham kengaytmaga ko'chirilmoqda. Shu paytgacha kartochka paketi
 * («Uzum uchun matn sifatida nusxalash», `GET /product-ai/drafts/{id}/package`)
 * nusxalanib kabinetda qo'lda to'ldiriladi.
 *
 * Bayroq `false` qilinsa eski tugmalar o'z joyiga qaytadi (kod o'chirilmagan).
 */
export const UZUM_PUBLISH_PAUSED: boolean = true;

export const UZUM_PUBLISH_PAUSED_SHORT = "Uzum'ga avtomatik joylash vaqtincha to'xtatilgan";

export const UZUM_PUBLISH_PAUSED_TEXT =
  "Uzum'ga avtomatik joylash va yangilash vaqtincha to'xtatilgan: serverdagi brauzer o'chirildi, " +
  "eStats Lens kengaytmasi orqali joylash tayyorlanmoqda. Hozircha «Uzum uchun matn sifatida nusxalash» " +
  "bilan kartochkani nusxalab, seller.uzum.uz da qo'lda to'ldiring.";
