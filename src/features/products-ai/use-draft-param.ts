"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

/**
 * AI qoralama oynasining holati — MANZILDA, joriy sahifaning O'ZIDA.
 *
 *   ?draft=12   — mavjud qoralama
 *   ?draft=new  — yangi tovar qo'shish
 *
 * Ilgari bu faqat `/warehouse` (ombor RO'YXATI) sahifasida edi.
 * Tovar SAHIFASIDAN ("/warehouse/9") "AI bilan tuzatish" bosilganda
 * `window.location.assign("/warehouse?draft=...")` chaqirilardi —
 * bu TO'LIQ SAHIFA almashinuvi: avval `/warehouse`ga o'tib, undan
 * keyin OYNA ochilardi, va oyna yopilganda ham sotuvchi endi
 * "/warehouse/9" emas, ro'yxatda qolib ketardi. Bu hook har ikkala
 * sahifada BIR XIL ishlaydi — qaysi sahifada chaqirilsa, o'sha
 * sahifaning O'Z URL'ida ochiladi/yopiladi, hech qanday navigatsiya
 * bo'lmaydi.
 *
 * `useSearchParams()` FAQAT boshlang'ich qiymat uchun — reload yoki
 * havola orqali ochilganda. Undan KEYIN mahalliy holat yagona manba:
 * Next'ning `router.replace()`i bilan sinovda topilgan real xato bor
 * edi (yopishda `?draft=3` → bo'sh o'rniga eskisini QAYTA yozib
 * qo'yardi — Next marshrutlash keshi bilan bog'liq). Shuning uchun
 * React holati DARHOL yangilanadi, URL esa faqat ULASHISH/YANGILASH
 * uchun brauzerning O'Z `history.replaceState`i bilan yoziladi.
 *
 * Chaqiruvchi komponent `useSearchParams()` talab qiladigan Suspense
 * chegarasi ICHIDA bo'lishi SHART (`<React.Suspense>` bilan o'ralgan
 * export default) — aks holda Next qurilishda yiqiladi.
 */
export function useDraftParam() {
  const searchParams = useSearchParams();
  const [draftParam, setDraftParamState] = React.useState<string | null>(
    () => searchParams.get("draft"),
  );

  // Orqaga/oldinga tugmasi — brauzerning o'z hodisasidan
  // (`popstate`), Next hookidan emas: yuqoridagi sababga ko'ra.
  React.useEffect(() => {
    const onPop = () => {
      setDraftParamState(new URLSearchParams(window.location.search).get("draft"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setDraftParam = React.useCallback((value: string | null) => {
    setDraftParamState(value);
    const next = new URLSearchParams(window.location.search);
    if (value === null) next.delete("draft");
    else next.set("draft", value);
    const query = next.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const openAi = React.useCallback(
    (id: number | null) => setDraftParam(id === null ? "new" : String(id)),
    [setDraftParam],
  );

  return {
    draftParam,
    aiOpen: draftParam !== null,
    aiDraftId: draftParam && draftParam !== "new" ? Number(draftParam) : null,
    setDraftParam,
    openAi,
  };
}
