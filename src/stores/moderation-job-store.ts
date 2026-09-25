"use client";

import { create } from "zustand";

import { fetchModerationJobs, syncModerationReasons } from "@/lib/api";
import type { ModerationJob } from "@/lib/types";

/**
 * «Uzum sababini aniqlash» ishlari (backend §9.38).
 *
 * Ish SERVERDA ketadi — bu do'kon faqat holatni o'qiydi: sahifadan chiqib
 * ketish ishni to'xtatmaydi, qaytib kirganda o'sha joyidan ko'rinadi.
 * `seo-job-store` bilan bir xil naqsh: ish ketayotganda tez-tez, tinch
 * paytda kamdan-kam so'raladi.
 */

const ACTIVE_MS = 2_000;
const IDLE_MS = 60_000;

export function moderationJobActive(job: ModerationJob | null | undefined): boolean {
  return job?.status === "queued" || job?.status === "running";
}

interface ModerationJobState {
  jobs: ModerationJob[];
  /** Panelda yopilgan tugagan ishlar (`key:startedAt`). */
  dismissed: Set<string>;
  refresh: () => Promise<void>;
  watch: () => () => void;
  start: (productId?: number) => Promise<ModerationJob>;
  dismiss: (job: ModerationJob) => void;
}

let wake: (() => void) | null = null;

export const useModerationJobStore = create<ModerationJobState>((set, get) => ({
  jobs: [],
  dismissed: new Set(),

  refresh: async () => {
    try {
      set({ jobs: await fetchModerationJobs() });
    } catch {
      // Tarmoq uzilishi yoki eski backend — keyingi urinishda o'zi tuzaladi.
    }
  },

  watch: () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (timer) clearTimeout(timer);
      await get().refresh();
      if (stopped) return;
      timer = setTimeout(tick, get().jobs.some(moderationJobActive) ? ACTIVE_MS : IDLE_MS);
    };
    // Yangi ish boshlanganda tinch (60 s) kutishni kutmay darhol tezlashsin.
    wake = () => void tick();

    void tick();
    return () => {
      stopped = true;
      wake = null;
      if (timer) clearTimeout(timer);
    };
  },

  start: async (productId) => {
    const job = await syncModerationReasons(productId);
    set((state) => ({ jobs: [job, ...state.jobs.filter((j) => j.key !== job.key)] }));
    wake?.();
    return job;
  },

  dismiss: (job) =>
    set((state) => ({ dismissed: new Set(state.dismissed).add(`${job.key}:${job.startedAt}`) })),
}));

export function isDismissed(dismissed: Set<string>, job: ModerationJob): boolean {
  return dismissed.has(`${job.key}:${job.startedAt}`);
}
