"use client";

import * as React from "react";

/**
 * Animate a number up to its value.
 *
 * Uses `requestAnimationFrame` rather than a timer so the count follows the
 * display's actual frame rate and pauses when the tab is hidden — a number
 * silently counting in a background tab is wasted work.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = React.useState(0);
  const from = React.useRef(0);

  React.useEffect(() => {
    const start = from.current;
    const delta = target - start;
    if (delta === 0) return;

    let frame = 0;
    let startedAt: number | null = null;

    const step = (now: number) => {
      if (startedAt === null) startedAt = now;
      const t = Math.min((now - startedAt) / durationMs, 1);
      // easeOutCubic — oxiriga borib sekinlashadi, tabiiy ko'rinadi.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = start + delta * eased;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step);
      else from.current = target;
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
