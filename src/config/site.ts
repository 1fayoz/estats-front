export const siteConfig = {
  name: "eStats",
  tagline: "Marketpleyslar uchun professional analitika va boshqaruv",
  // Meta description — 155 belgidan oshmasin (qidiruvda kesiladi).
  description:
    "Uzum Market, Yandex Market, Wildberries va Ozon sotuvchilari uchun yagona " +
    "ekotizim: tan narx, FIFO bo'yicha sof foyda, xarajatlar va savdo boshqaruvi.",
  url: "https://estats.uz",
  locale: "uz",
  // Ilgari sayt shu manzilda turgan. Eski havolalar 301 bilan yangisiga
  // yo'naltiriladi; bu yerda faqat hujjat sifatida qoladi.
  previousUrl: "https://stats.chatx.uz",
  //: Telegram bot. Bitta joyda, chunki u yon panelda ham, landing'da
  //: ham, Sozlamalardagi kartochkada ham ko'rsatiladi — uchtasi
  //: ajralib qolsa odam ishlamaydigan botga yozib o'tiradi.
  botUsername: "estatsuz_bot",
  botUrl: "https://t.me/estatsuz_bot",
} as const;

export type SiteConfig = typeof siteConfig;
