"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ShieldAlert } from "lucide-react";

import { fetchUzumChallenge } from "@/lib/api";
import type { UzumChallenge } from "@/lib/types";
import { challengeBannerView } from "@/lib/uzum-challenge";

/**
 * Uzum (Cloudflare) serverimizni tekshiruvga tushirgan bo'lsa — sahifa tepasida banner.
 * Matn va tugmalar holatga qarab — `lib/uzum-challenge.ts` (nega shunday — o'sha yerda).
 * Belgini avtomatik bosib bo'lmaydi va bosilmaydi (xavfsizlik chegarasi).
 */
export function UzumChallengeBanner() {
  const [state, setState] = React.useState<UzumChallenge | null>(null);

  React.useEffect(() => {
    let alive = true;
    const check = () =>
      fetchUzumChallenge()
        .then((r) => alive && setState(r))
        .catch(() => undefined); // eski backend (404) yoki ruxsat yo'q — banner chiqmaydi
    void check();
    const t = window.setInterval(check, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  if (!state?.pending) return null;
  const view = challengeBannerView(state);
  return (
    <div
      role="status"
      className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-4 py-3 text-sm"
    >
      <ShieldAlert className="size-5 shrink-0 text-[var(--warn)]" />
      <span className="min-w-0 flex-1 basis-64 leading-relaxed">
        {view.text}
        {view.note && <span className="mt-0.5 block text-xs text-muted-foreground">{view.note}</span>}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        {view.secondary && (
          <Link
            href={view.secondary.href as Route}
            className="rounded-xl border border-[var(--warn)]/50 px-3 py-1.5 font-medium transition-colors hover:bg-[var(--warn)]/10"
          >
            {view.secondary.label}
          </Link>
        )}
        <Link
          href={view.primary.href as Route}
          className="rounded-xl bg-[var(--warn)] px-3 py-1.5 font-medium text-black"
        >
          {view.primary.label}
        </Link>
      </span>
    </div>
  );
}
