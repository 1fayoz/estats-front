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

export const useWarehouseStore = create<ProductsState>((set, get) => ({
  status: "idle",
  items: [],
  error: null,
  promise: null,

  load: (force = false) => {
    const { status, promise } = get();
    if (!force && status === "success") return Promise.resolve();
    if (!force && promise) return promise;

    const p = fetchProducts()
      .then((page) =>
        set({ status: "success", items: page.results, error: null, promise: null })
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
