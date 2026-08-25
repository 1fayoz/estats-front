export const siteConfig = {
  name: "eStats",
  tagline: "Uzum Market uchun professional analitika",
  description:
    "Uzum Market sotuvchilari uchun tan narx, FIFO bo'yicha foyda va zarar, " +
    "doimiy xarajatlar va Instagram reklamasi — bitta joyda. Komissiya va " +
    "logistikadan keyingi haqiqiy foydani ko'ring.",
  url: "https://estats.uz",
  locale: "uz",
  // Ilgari sayt shu manzilda turgan. Eski havolalar 301 bilan yangisiga
  // yo'naltiriladi; bu yerda faqat hujjat sifatida qoladi.
  previousUrl: "https://stats.chatx.uz",
} as const;

export type SiteConfig = typeof siteConfig;
