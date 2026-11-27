"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Puzzle, X } from "lucide-react";

import { ApiError, fetchCabinetExtensionSummary } from "@/lib/api";
import {
  type CabinetExtensionSummary,
  dismissKey,
  extensionBannerView,
  extensionIssue,
  isDismissed,
} from "@/lib/cabinet-extension";
import { useUserStore } from "@/stores/user-store";

/**
 * Sahifa tepasidagi banner: kabinet vazifalari (voronka, Bust narxlari,
 * reklama, moderatsiya sababi, kartochka nusxasi) bajarilishi uchun eStats
 * Lens kengaytmasidan nima kerak. 2026-11-24 dan server brauzer OCHMAYDI —
 * bu ishlar faqat sotuvchining o'z brauzerida (`lib/cabinet-extension.ts`).
 *
 * Holat 60 soniyada yangilanadi. Ruxsat yo'q (403) yoki xato — banner
 * chiqmaydi. «×» shu do'kon va shu holat uchun 24 soatga yashiradi; holat
 * o'zgarsa (masalan oflayndan «kirilmagan»ga) banner qaytadi.
 */
export function CabinetExtensionBanner() {
  const shopId = useUserStore((s) => s.activeShopId);
  const [summary, setSummary] = React.useState<CabinetExtensionSummary | null>(null);
  // Yopish belgisi o'qilgandan keyin qayta chizish uchun.
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    setSummary(null);
    const check = async () => {
      try {
        const next = await fetchCabinetExtensionSummary();
        if (alive) setSummary(next);
      } catch (err) {
        if (!alive) return;
        setSummary(null);
        // Ruxsat yo'q — boshqa so'ralmaydi (sahifa yangilanguncha).
        if (err instanceof ApiError && err.status === 403) return;
      }
      if (alive) timer = window.setTimeout(check, 60_000);
    };
    void check();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [shopId]);

  const issue = extensionIssue(summary);
  if (!issue) return null;

  const key = dismissKey(shopId, issue);
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(key);
  } catch {
    /* shaxsiy oynada localStorage yopiq bo'lishi mumkin */
  }
  if (isDismissed(stored)) return null;

  const view = extensionBannerView(issue, summary?.minVersion ?? "");
  const dismiss = () => {
    try {
      window.localStorage.setItem(key, String(Date.now()));
    } catch {
      /* yozib bo'lmasa — shu seansda baribir yashiriladi */
    }
    setTick((n) => n + 1);
  };

  const actionClass = "shrink-0 rounded-xl bg-[var(--warn)] px-3 py-1.5 font-medium text-black";
  return (
    <div
      role="status"
      className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-4 py-3 text-sm"
    >
      <Puzzle className="size-5 shrink-0 text-[var(--warn)]" aria-hidden />
      <span className="min-w-0 flex-1 basis-64 leading-relaxed">{view.text}</span>
      <span className="flex items-center gap-1">
        {view.action.external ? (
          <a href={view.action.href} target="_blank" rel="noreferrer" className={actionClass}>
            {view.action.label}
          </a>
        ) : (
          <Link href={view.action.href as Route} className={actionClass}>
            {view.action.label}
          </Link>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[var(--warn)]/15 hover:text-foreground"
          aria-label="Yopish (24 soatga)"
          title="24 soatga yashirish"
        >
          <X className="size-4" aria-hidden />
        </button>
      </span>
    </div>
  );
}
