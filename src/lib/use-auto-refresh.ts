"use client";

import * as React from "react";

/** Ochiq turgan sahifa qancha vaqtdan keyin o'zi yangilansin (ms). */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

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
    const run = () => {
      if (document.visibilityState === "visible") latest.current();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") latest.current();
    };

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
