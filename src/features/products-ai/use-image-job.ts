"use client";

import * as React from "react";

import { fetchAiImageJob, type AiImageJob, type AiImageJobFrame } from "@/lib/api";

/**
 * Fondagi rasm yasash holati — har kadr bo'yicha (navbatda / yasalmoqda /
 * tayyor / xato) va taxminiy tugash vaqti.
 *
 * Sotuvchi talabi (2026-09-27): «Yetishmaganlarni yasash» bosilganda faqat
 * «yasalmoqda» ko'rinardi — qaysi kadr, qaysi rangda va qachon tugashi
 * noma'lum edi. Endi aynan o'sha plitkaning joyida progress turadi.
 */
export function useImageJob(draftId: number | undefined, active: boolean) {
  const [job, setJob] = React.useState<AiImageJob | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  // Server va brauzer soatlari farqi — ETA to'g'ri chiqsin.
  const skew = React.useRef(0);

  React.useEffect(() => {
    if (!draftId) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = async () => {
      try {
        const next = await fetchAiImageJob(draftId);
        if (stop) return;
        if (next.serverTime) skew.current = Date.parse(next.serverTime) - Date.now();
        setJob(next);
        if (next.running || active) timer = setTimeout(tick, 2500);
      } catch {
        if (!stop && active) timer = setTimeout(tick, 5000);
      }
    };
    void tick();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [draftId, active]);

  const running = Boolean(job?.running);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const serverNow = now + skew.current;
  const frameSeconds = job?.frameSeconds || 45;
  const concurrency = Math.max(1, job?.concurrency || 3);
  const frames = job?.frames ?? {};
  const list = Object.values(frames);
  const done = list.filter((f) => f.status === "done").length;
  const failed = list.filter((f) => f.status === "failed").length;
  const runningFrames = list.filter((f) => f.status === "running");
  const queued = list.filter((f) => f.status === "queued").length;

  const percentOf = (frame: AiImageJobFrame | undefined): number => {
    if (!frame) return 0;
    if (frame.status === "done" || frame.status === "failed") return 100;
    if (frame.status !== "running" || !frame.startedAt) return 0;
    const elapsed = (serverNow - Date.parse(frame.startedAt)) / 1000;
    return Math.min(95, Math.max(3, Math.round((elapsed / frameSeconds) * 100)));
  };

  // Qolgan vaqt: yasalayotganlarning qolgani + navbatdagilar parallel oqimda.
  const runningLeft = runningFrames.reduce((max, f) => {
    const elapsed = f.startedAt ? (serverNow - Date.parse(f.startedAt)) / 1000 : 0;
    return Math.max(max, Math.max(5, frameSeconds - elapsed));
  }, 0);
  const etaSeconds = running
    ? Math.round(runningLeft + Math.ceil(queued / concurrency) * frameSeconds)
    : 0;

  return {
    job,
    running,
    frames,
    total: list.length,
    done,
    failed,
    runningCount: runningFrames.length,
    queued,
    etaSeconds,
    percentOf,
  };
}

/** «~2 daq 10 s qoldi» */
export function formatEta(seconds: number): string {
  if (seconds <= 0) return "";
  if (seconds < 60) return `~${seconds} s qoldi`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `~${m} daq${s >= 10 ? ` ${s} s` : ""} qoldi`;
}
