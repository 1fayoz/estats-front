"use client";

import * as React from "react";
import { create } from "zustand";

import { fetchProducts } from "@/lib/api";
import type { WarehouseProduct } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

interface ProductsState {
  status: Status;
  items: WarehouseProduct[];
  error: string | null;
  promise: Promise<void> | null;

  load: (force?: boolean) => Promise<void>;
  /** Patch one product in place after an intake, without refetching the whole list. */
  patch: (id: number, changes: Partial<WarehouseProduct>) => void;
}

/** Backend sahifa hajmining yuqori chegarasi (`src/utils/pagination.py`: `le=500`). */
const MAX_PAGE_SIZE = 500;

/**
 * Faol katalog TO'LIQ — barcha sahifalari bilan.
 *
 * Ilgari bitta `size=200` so'rov olinardi: 200 dan ortiq tovarli do'konda
 * qolganlari (nom bo'yicha tartibda oxirgilari) ro'yxatdan ham, ombor
 * jamlamalaridan ham jimgina tushib qolardi. Odatiy do'kon bitta so'rovga
 * sig'adi; kattasi uchun qolgan sahifalar ketma-ket olinadi.
 */
async function fetchAllProducts(): Promise<WarehouseProduct[]> {
  const first = await fetchProducts({ size: MAX_PAGE_SIZE });
  const items = [...first.results];
  // Fon sinxronini faqat birinchi so'rov boshlaydi.
  for (let page = 2; page <= first.pages; page++) {
    const next = await fetchProducts({ page, size: MAX_PAGE_SIZE, sync: false });
    items.push(...next.results);
  }
  return items;
}

export const useWarehouseStore = create<ProductsState>((set, get) => ({
  status: "idle",
  items: [],
  error: null,
  promise: null,

  load: (force = false) => {
    const { status, promise } = get();
    if (!force && status === "success") return Promise.resolve();
    if (!force && promise) return promise;

    const p = fetchAllProducts()
      .then((items) =>
        set({ status: "success", items, error: null, promise: null })
      )
      .catch((err: unknown) =>
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Noma'lum xatolik",
          promise: null,
        })
      );

    set({ status: "loading", error: null, promise: p });
    return p;
  },

  patch: (id, changes) =>
    set((s) => ({
      items: s.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    })),

}));

/** Load the catalog once on mount and expose it with derived loading flags. */
export function useWarehouseProducts() {
  const status = useWarehouseStore((s) => s.status);
  const items = useWarehouseStore((s) => s.items);
  const error = useWarehouseStore((s) => s.error);
  const load = useWarehouseStore((s) => s.load);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    status,
    error,
    isInitialLoading: status === "loading" && items.length === 0,
    isRefreshing: status === "loading" && items.length > 0,
    refresh: React.useCallback(() => void load(true), [load]),
  };
}
