"use client";

import * as React from "react";
import { create } from "zustand";

import { fetchPnl } from "@/lib/api";
import { presetRange, rangeKey, type DateRange } from "@/lib/date-range";
import type { PnlReport } from "@/lib/types";

type Status = "loading" | "success" | "error";

interface CacheEntry {
  status: Status;
  data: PnlReport | null;
  error: string | null;
  /** In-flight request, so concurrent callers dedupe onto one fetch. */
  promise: Promise<void> | null;
}

interface PnlStore {
  range: DateRange;
  setRange: (range: DateRange) => void;
  /** Show goods with no movement in the range too. */
  allProducts: boolean;
  setAllProducts: (value: boolean) => void;
  /** Keyed by `from_to_all`. In-memory only — a hard reload refetches. */
  entries: Record<string, CacheEntry>;

  fetch: (range: DateRange, allProducts: boolean, force?: boolean) => Promise<void>;
}

const keyOf = (range: DateRange, all: boolean) => `${rangeKey(range)}_${all ? "all" : "active"}`;

export const usePnlStore = create<PnlStore>((set, get) => ({
  range: presetRange("30d"),
  setRange: (range) => set({ range }),
  allProducts: false,
  setAllProducts: (allProducts) => set({ allProducts }),
  entries: {},

  fetch: (range, allProducts, force = false) => {
    const key = keyOf(range, allProducts);
    const existing = get().entries[key];

    if (!force && existing) {
      if (existing.status === "success") return Promise.resolve();
      if (existing.status === "loading" && existing.promise) return existing.promise;
    }

    const patch = (entry: Partial<CacheEntry>) =>
      set((s) => ({ entries: { ...s.entries, [key]: { ...s.entries[key], ...entry } as CacheEntry } }));

    const promise = fetchPnl(range.from, range.to, allProducts)
      .then((data) => patch({ status: "success", data, error: null, promise: null }))
      .catch((err: unknown) =>
        patch({
          status: "error",
          error: err instanceof Error ? err.message : "Noma'lum xatolik",
          promise: null,
        })
      );

    set((s) => ({
      entries: {
        ...s.entries,
        [key]: {
          status: "loading",
          data: existing?.data ?? null, // keep stale numbers on screen while refreshing
          error: null,
          promise,
        },
      },
    }));

    return promise;
  },

}));

/** Read the report for the current range, loading it on mount and on range change. */
export function usePnlReport() {
  const range = usePnlStore((s) => s.range);
  const allProducts = usePnlStore((s) => s.allProducts);
  const entry = usePnlStore((s) => s.entries[keyOf(s.range, s.allProducts)]);
  const fetch = usePnlStore((s) => s.fetch);

  React.useEffect(() => {
    void fetch(range, allProducts);
  }, [fetch, range, allProducts]);

  return {
    data: entry?.data ?? null,
    error: entry?.error ?? null,
    isInitialLoading: (!entry || entry.status === "loading") && !entry?.data,
    isRefreshing: entry?.status === "loading" && Boolean(entry?.data),
    refresh: React.useCallback(
      () => void fetch(range, allProducts, true),
      [fetch, range, allProducts]
    ),
  };
}
