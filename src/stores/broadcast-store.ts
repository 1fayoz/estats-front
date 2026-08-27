"use client";

import { create } from "zustand";

import { fetchBroadcasts } from "@/lib/api";
import type { BroadcastResult } from "@/lib/types";

/**
 * Ketayotgan e'lonlar.
 *
 * E'lon SERVERDA ketadi, brauzerda emas. Bu do'kon shuning uchun hech
 * narsani o'zi bajarmaydi — u faqat serverdagi holatni o'qiydi. Natijada:
 *
 * - sahifa almashsa ish to'xtamaydi (do'kon layout'da yashaydi);
 * - brauzer yopilib qayta ochilsa, birinchi o'qishda ketayotgan e'lon
 *   o'sha joyidan ko'rinadi;
 * - ikkita oyna ochiq bo'lsa ikkalasi ham bir xil holatni ko'radi.
 *
 * Shuning uchun bu yerda `persist` YO'Q: brauzer xotirasidagi nusxa
 * serverdagi haqiqatdan orqada qolishi va yolg'on ko'rsatishi mumkin.
 */

//: Ish ketayotganda tez-tez, tinch paytda kamdan-kam so'raymiz.
const ACTIVE_MS = 2_000;
const IDLE_MS = 30_000;

interface BroadcastState {
  items: BroadcastResult[];
  loading: boolean;
  /** Foydalanuvchi yopgan vazifalar — qayta ko'rsatilmaydi. */
  dismissed: number[];

  refresh: () => Promise<void>;
  watch: () => () => void;
  dismiss: (id: number) => void;
  put: (broadcast: BroadcastResult) => void;
}

export const useBroadcastStore = create<BroadcastState>((set, get) => ({
  items: [],
  loading: false,
  dismissed: [],

  refresh: async () => {
    try {
      const rows = await fetchBroadcasts({ limit: 10 });
      set({ items: rows });
    } catch {
      // Tarmoq uzilishi — keyingi urinishda o'zi tuzaladi. Bu fon
      // holati, uning uchun xato ko'rsatishning ma'nosi yo'q.
    }
  },

  /**
   * Kuzatuvni boshlaydi va to'xtatuvchi qaytaradi.
   *
   * Sur'at ishga qarab o'zgaradi: ketayotgan e'lon bor ekan ikki
   * soniyada, yo'q bo'lsa yarim daqiqada. Ikkinchisi umuman kerak,
   * chunki e'lon boshqa oynadan ham boshlangan bo'lishi mumkin.
   */
  watch: () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      await get().refresh();
      if (stopped) return;
      const active = get().items.some((b) => b.active);
      timer = setTimeout(tick, active ? ACTIVE_MS : IDLE_MS);
    };

    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  },

  dismiss: (id) =>
    set((state) => ({ dismissed: [...state.dismissed, id] })),

  /** Yangi boshlangan e'lonni darhol ko'rsatish — so'rovni kutmasdan. */
  put: (broadcast) =>
    set((state) => ({
      items: [broadcast, ...state.items.filter((b) => b.id !== broadcast.id)],
    })),
}));

/**
 * Ko'rsatishga arziydigan vazifalar: ketayotgani va yopilmagan natijalar.
 *
 * Bu ATAYLAB oddiy funksiya, selektor emas. `useSyncExternalStore` har
 * chaqiruvda bir xil havola qaytishini talab qiladi; filtrlash esa har
 * safar YANGI massiv yasaydi va do'kondan to'g'ridan-to'g'ri shunday
 * tanlash cheksiz qayta chizishga olib keladi. Shuning uchun komponent
 * `items` va `dismissed` ni alohida oladi va natijani o'zi eslab qoladi.
 */
export function visibleBroadcasts(
  items: BroadcastResult[],
  dismissed: number[],
): BroadcastResult[] {
  return items.filter((b) => !dismissed.includes(b.id));
}
