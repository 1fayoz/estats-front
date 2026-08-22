"use client";

import * as React from "react";
import { create } from "zustand";

import { fetchProducts, fetchSyncStatus, triggerCatalogSync } from "@/lib/api";
import type { WarehouseProduct } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

interface ProductsState {
  status: Status;
  items: WarehouseProduct[];
  error: string | null;
  promise: Promise<void> | null;
  /** True while a catalog import from Uzum is running server-side. */
  syncing: boolean;

  load: (force?: boolean) => Promise<void>;
  /** Patch one product in place after an intake, without refetching the whole list. */
  patch: (id: number, changes: Partial<WarehouseProduct>) => void;
  syncCatalog: () => Promise<void>;
}

export const useWarehouseStore = create<ProductsState>((set, get) => ({
  status: "idle",
  items: [],
  error: null,
  promise: null,
  syncing: false,

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

  /**
   * Ask the backend to re-import the Uzum catalog, then poll until it finishes.
   * The import runs detached server-side, so polling is how the UI learns it's done.
   */
  syncCatalog: async () => {
    set({ syncing: true });
    try {
      await triggerCatalogSync();
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const status = await fetchSyncStatus();
        if (!status.running) break;
      }
      await get().load(true);
    } finally {
      set({ syncing: false });
    }
  },
}));

/** Load the catalog once on mount and expose it with derived loading flags. */
export function useWarehouseProducts() {
  const status = useWarehouseStore((s) => s.status);
  const items = useWarehouseStore((s) => s.items);
  const error = useWarehouseStore((s) => s.error);
  const syncing = useWarehouseStore((s) => s.syncing);
  const load = useWarehouseStore((s) => s.load);
  const syncCatalog = useWarehouseStore((s) => s.syncCatalog);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    status,
    error,
    syncing,
    isInitialLoading: status === "loading" && items.length === 0,
    isRefreshing: status === "loading" && items.length > 0,
    refresh: React.useCallback(() => void load(true), [load]),
    syncCatalog,
  };
}
