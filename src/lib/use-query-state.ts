"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Sahifa holatini MANZILDA saqlaydi.
 *
 * Nega manzilda: tab yoki filtr faqat komponent xotirasida tursa, har
 * yangilanishda va har qaytishda sahifa boshiga tashlanadi. Manzilda
 * turgan holat esa yangilashdan ham, orqaga qaytishdan ham, havolani
 * birovga yuborishdan ham omon qoladi.
 *
 * `replace` ishlatiladi, `push` emas: tab almashtirish brauzer tarixiga
 * yozilsa, "orqaga" tugmasi sahifadan chiqarish o'rniga tablarni
 * teskari aylantirib chiqardi.
 */
export function useQueryState(
  key: string,
  fallback: string,
): [string, (next: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(key) ?? fallback;

  const set = React.useCallback(
    (next: string) => {
      const search = new URLSearchParams(params.toString());
      // Sukutdagi qiymat manzilni kir qilmasin.
      if (!next || next === fallback) search.delete(key);
      else search.set(key, next);
      const query = search.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [key, fallback, params, pathname, router],
  );

  return [value, set];
}

/** Raqamli holat — masalan tanlangan tahlil raqami. */
export function useQueryNumber(
  key: string,
): [number | null, (next: number | null) => void] {
  const [raw, setRaw] = useQueryState(key, "");
  const value = raw ? Number(raw) : null;
  const set = React.useCallback(
    (next: number | null) => setRaw(next == null ? "" : String(next)),
    [setRaw],
  );
  return [Number.isFinite(value) ? value : null, set];
}
