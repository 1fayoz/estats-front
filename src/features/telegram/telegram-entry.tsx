import Script from "next/script";

import { TelegramWebApp } from "./telegram-webapp";

/**
 * Telegram WebApp kirish nuqtasi: SDK + avto-login.
 *
 * Faqat WebApp ochiladigan joylarda qo'yiladi — bosh sahifa va kirish
 * (`(auth)`), kabinet (`(dashboard)`). Bot WebApp'ni `/` va `/pnl` dan
 * ochadi. Ilgari skript ildiz layout'da turib, har bir ochiq SEO
 * sahifada ham yuklanardi.
 *
 * `beforeInteractive` — `initData` React ishga tushishidan OLDIN tayyor
 * bo'lishi kerak: App Router bunday skriptni gidratsiyadan oldin
 * yuklaydi (`self.__next_s`). Aks holda AuthGuard `/login` ga
 * yo'naltirganda URL'dagi `#tgWebAppData` yo'qolib, avto-login
 * ishlamay qolardi. Telegram tashqarisida skript hech nima qilmaydi.
 */
export function TelegramEntry() {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramWebApp />
    </>
  );
}
