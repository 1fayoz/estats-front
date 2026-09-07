"use client";

import * as React from "react";
import { ApiError } from "@/lib/api";

export function useSocialResource<Value>(loader: () => Promise<Value>, enabled = true) {
  const [data, setData] = React.useState<Value | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const sequence = React.useRef(0);
  const mounted = React.useRef(true);
  const pending = React.useRef<Promise<void> | null>(null);
  const loaded = React.useRef(false);

  const refresh = React.useCallback(() => {
    if (!mounted.current) return Promise.resolve();
    if (pending.current) return pending.current;
    const request = ++sequence.current;
    setLoading(true);
    setError(null);
    const work = loader()
      .then((value) => {
        if (sequence.current !== request) return;
        loaded.current = true;
        setData(value);
      })
      .catch((reason: unknown) => {
        if (sequence.current === request) {
          setError(reason instanceof ApiError ? reason.message : "Ma’lumot yuklanmadi. Qayta urinib ko‘ring.");
        }
      })
      .finally(() => {
        if (sequence.current !== request) return;
        pending.current = null;
        setLoading(false);
      });
    pending.current = work;
    return work;
  }, [loader]);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sequence.current += 1;
      pending.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (enabled && !loaded.current) void refresh();
  }, [enabled, refresh]);

  return { data, loading: loading || (enabled && data === null && !error), error, refresh };
}
