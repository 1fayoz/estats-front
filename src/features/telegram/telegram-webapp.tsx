"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { telegramLogin } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

/**
 * Telegram WebApp'dan kirish — qayta login qilmasdan.
 *
 * Bot ichidagi «Kabinet» tugmasi saytni Telegram brauzerida ochadi
 * va sahifaga IMZOLANGAN `initData` satrini beradi. Imzo bot
 * tokenidan olingan kalit bilan yasalgani uchun uni faqat backend
 * tekshira oladi — shu sababli satr o'sha yerga yuboriladi va
 * javobiga o'z tokenimizni olamiz.
 *
 * Muhim: bu yerda hisob OCHILMAYDI. Backend faqat mavjud
 * bog'lanishni topadi, u esa o'z navbatida kimdir odamni saytdan
 * Jamoaga biriktirgan bo'lsagina paydo bo'ladi. «WebApp'ni ochdim»
 * hech qachon «kirdim» degani emas.
 *
 * Ilova ichida ko'rinadigan qismi yo'q: u faqat kirishni bajaradi
 * va odamni kabinetga o'tkazadi.
 */
export function TelegramWebApp() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useUserStore((s) => s.hydrated);
  const signIn = useUserStore((s) => s.signIn);
  const tried = React.useRef(false);

  React.useEffect(() => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    if (!tg) return;
    // Telegram yuklanish indikatorini shu chaqiruvdan keyin oladi;
    // aytmasak oynada bo'sh oq ekran turadi.
    tg.ready?.();
    tg.expand?.();
  }, []);

  React.useEffect(() => {
    // Saqlangan sessiya o'qilgunicha kutamiz, aks holda `signIn`
    // yozgan tokenni rehydrate ustidan yozib ketardi.
    if (!hydrated || tried.current) return;

    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;

    // Saqlangan token bo'lsa ham qayta kiramiz.
    //
    // Telegram Web WebApp'ni AYNI o'sha domenda ochadi, ya'ni
    // localStorage umumiy. Brauzerda boshqa hisob saqlanib qolgan
    // bo'lsa, "tokeni bor ekan" deb o'tkazib yuborish odamga
    // BEGONA hisobni ko'rsatardi. WebApp ichida kimlikni Telegram
    // belgilaydi — bitta so'rov shu noaniqlikni butunlay yopadi.
    tried.current = true;
    (async () => {
      try {
        const { accessToken: token, user } = await telegramLogin(initData);
        signIn(token, user);
        // Landing yoki kirish sahifasida turgan bo'lsa — kabinetga.
        // Boshqa sahifada bo'lsa o'sha joyida qoladi: bot xabaridagi
        // havola aynan kerakli ekranga olib borishi mumkin.
        if (pathname === "/" || pathname.startsWith("/login")) {
          router.replace("/warehouse");
        }
      } catch {
        // Jimgina: bog'lanmagan odam oddiy landing'ni ko'raveradi va
        // Google orqali kira oladi. Bu XATO holat emas. Mavjud
        // sessiya ham tegilmaydi — muvaffaqiyatsiz urinish odamni
        // tizimdan chiqarib yuborishi mumkin emas.
      }
    })();
  }, [hydrated, pathname, router, signIn]);

  return null;
}
