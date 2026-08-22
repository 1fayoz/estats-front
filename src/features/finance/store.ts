"use client";

import * as React from "react";
import { create } from "zustand";

import { fetchFinanceReport } from "@/lib/api";
import type { FinanceReport } from "./types";
import { presetRange, rangeKey, type DateRange } from "@/lib/date-range";

type EntryStatus = "loading" | "success" | "error";

interface CacheEntry {
  status: EntryStatus;
  data: FinanceReport | null;
  error: string | null;
  /** In-flight request, so concurrent callers dedupe onto one fetch. */
  promise: Promise<void> | null;
}

interface FinanceStore {
  /** Selected range — lives in the store so it survives finance tab switches. */
  range: DateRange;
  setRange: (range: DateRange) => void;
  /** Keyed by `from_to`. In-memory only — a hard reload clears it and refetches. */
  entries: Record<string, CacheEntry>;
  fetch: (range: DateRange, force?: boolean) => Promise<void>;
}

/** Uzum's own ledger for the range, aggregated server-side. */
async function requestReport(range: DateRange): Promise<FinanceReport> {
  return fetchFinanceReport<FinanceReport>(range.from, range.to);
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  range: presetRange("30d"),
  setRange: (range) => set({ range }),
  entries: {},

  fetch: (range, force = false) => {
    const key = rangeKey(range);
    const existing = get().entries[key];

    // Serve from cache unless a refresh is forced — this is what keeps tab
    // switches and re-renders from re-hitting the backend.
    if (!force && existing) {
      if (existing.status === "success") return Promise.resolve();
      if (existing.status === "loading" && existing.promise) return existing.promise;
    }

    const patch = (entry: Partial<CacheEntry>) =>
      set((s) => ({
        entries: {
          ...s.entries,
          [key]: { ...s.entries[key], ...entry } as CacheEntry,
        },
      }));

    const promise = requestReport(range)
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
          data: existing?.data ?? null, // keep stale data visible while refreshing
          error: null,
          promise,
        },
      },
    }));

    return promise;
  },
}));

export interface UseFinanceReport {
  data: FinanceReport | null;
  status: EntryStatus;
  error: string | null;
  /** True on the very first load (no data yet); false during a background refresh. */
  isInitialLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
}

/**
 * Reads the cached report for a range and lazily fetches it once. Switching the
 * finance tabs re-mounts this hook with the SAME range key, so it hits the cache
 * and never re-fetches — exactly the requested behaviour.
 */
export function useFinanceReport(range: DateRange): UseFinanceReport {
  const key = rangeKey(range);
  const entry = useFinanceStore((s) => s.entries[key]);
  const fetchReport = useFinanceStore((s) => s.fetch);

  React.useEffect(() => {
    void fetchReport(range);
    // Depend on the serialized key, not the object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetchReport]);

  const status = entry?.status ?? "loading";
  const data = entry?.data ?? null;

  return {
    data,
    status,
    error: entry?.error ?? null,
    isInitialLoading: status === "loading" && !data,
    isRefreshing: status === "loading" && !!data,
    refresh: React.useCallback(() => void fetchReport(range, true), [fetchReport, key]), // eslint-disable-line react-hooks/exhaustive-deps
  };
}
