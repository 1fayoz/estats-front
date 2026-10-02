"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { draftHref } from "@/lib/api";

/**
 * Qoralama ENDI ALOHIDA SAHIFADA (2026-10-03, sotuvchi talabi):
 * `/warehouse/ai/new` — yangi tovar, `/warehouse/ai/12?tab=images` —
 * mavjud qoralama. Ilgari `?draft=12` parametrli oyna edi; ikki sahifa
 * (ombor va tovar) uni o'z nusxasi bilan ochardi va uzun forma tor
 * oynaga sig'masdi.
 *
 * Sahifa Next routeri bilan ochiladi — orqaga tugmasi omborga qaytaradi,
 * havola ulashiladi, yangilanganda o'sha tab qoladi.
 */
export function useDraftNav() {
  const router = useRouter();
  const openAi = React.useCallback(
    (id: number | null, tab?: string) => {
      router.push(draftHref(id, tab));
    },
    [router],
  );
  return { openAi, draftHref };
}
