"use client";

import { create } from "zustand";

import { fetchSeoJobs } from "@/lib/api";
import type { SeoJob } from "@/lib/types";

/**
 * Ketayotgan SEO tahlillari.
 *
 * Tahlil SERVERDA ketadi — bu do'kon faqat holatni o'qiydi. Shuning
 * uchun sahifadan chiqib ketish ham, brauzerni yopish ham ishni
 * to'xtatmaydi, va qaytib kirganda holat o'sha joyidan ko'rinadi.
 *
 * `persist` YO'Q: brauzerdagi nusxa serverdagi haqiqatdan orqada
 * qolishi va tugagan ishni "ketmoqda" deb ko'rsatishi mumkin.
 */

//: Ish ketayotganda tez-tez, tinch paytda kamdan-kam.
const ACTIVE_MS = 3_000;
const IDLE_MS = 60_000;

interface SeoJobState {
  jobs: SeoJob[];
  refresh: () => Promise<void>;
  watch: () => () => void;
  put: (job: SeoJob) => void;
}

export const useSeoJobStore = create<SeoJobState>((set, get) => ({
  jobs: [],

  refresh: async () => {
    try {
      set({ jobs: await fetchSeoJobs() });
    } catch {
      // Tarmoq uzilishi — keyingi urinishda o'zi tuzaladi.
    }
  },

  watch: () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      await get().refresh();
      if (stopped) return;
      const active = get().jobs.some((j) => j.active);
      timer = setTimeout(tick, active ? ACTIVE_MS : IDLE_MS);
    };

    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  },

  put: (job) =>
    set((state) => ({ jobs: [job, ...state.jobs.filter((j) => j.id !== job.id)] })),
}));

/** Shu tovar hozir navbatdami. */
export function queuedProductIds(jobs: SeoJob[]): Set<number> {
  const ids = new Set<number>();
  for (const job of jobs) {
    if (!job.active) continue;
    for (const item of job.items) {
      if (item.status === "pending" || item.status === "running") ids.add(item.productId);
    }
  }
  return ids;
}
