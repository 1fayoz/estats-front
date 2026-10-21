"use client";

import * as React from "react";

/** Ochiq turgan sahifa qancha vaqtdan keyin o'zi yangilansin (ms). */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
/** Ketma-ket triggerlar (focus + visibilitychange) bitta yangilanishga birlashadi. */
const MIN_GAP_MS = 5 * 1000;

/**
 * Keep a page's data fresh without a refresh button.
 *
 * Two triggers, both chosen because they match how the data actually goes stale:
 * returning to the tab (you were away, something may have synced) and a slow timer
 * for a page left open. Both are skipped while the tab is hidden — refreshing a
 * page nobody is looking at is pure waste.
 */
export function useAutoRefresh(refresh: () => void, intervalMs = DEFAULT_INTERVAL_MS) {
  // Ref orqali: `refresh` har renderda yangi funksiya bo'lsa ham, effekt
  // qayta o'rnatilmaydi va taymer nolga qaytmaydi.
  const latest = React.useRef(refresh);
  latest.current = refresh;

  React.useEffect(() => {
    // Tabga qaytilganda brauzer `focus` va `visibilitychange` ni KETMA-KET
    // yuboradi — ikkalasi ham yangilasa bir xil so'rov ikki marta ketardi.
    // Sahifa ochilganda esa ma'lumot allaqachon yuklanmoqda (sahifaning o'z
    // effekti), shuning uchun ochilgandan keyingi birinchi `focus` ham
    // qayta so'rov yubormasin. Sanoq shu effekt o'rnatilgan paytdan.
    let lastRun = Date.now();
    const trigger = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRun < MIN_GAP_MS) return;
      lastRun = now;
      latest.current();
    };
    const run = trigger;
    const onVisible = trigger;

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(run, intervalMs);

    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [intervalMs]);
}
