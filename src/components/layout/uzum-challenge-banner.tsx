"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ShieldAlert } from "lucide-react";

import { fetchUzumChallenge } from "@/lib/api";

/**
 * Uzum kabineti Cloudflare «Verify you are human» tekshiruvini so'rasa — sahifa tepasida
 * banner. Belgini avtomatik bosib bo'lmaydi (xavfsizlik chegarasi): sotuvchi bir marta
 * bosadi va Bust narxlari, voronka, joylash o'zi davom etadi. Havola oynani DARHOL ochadi.
 */
export function UzumChallengeBanner() {
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const check = () =>
      fetchUzumChallenge()
        .then((r) => alive && setPending(Boolean(r.pending)))
        .catch(() => undefined); // eski backend (404) yoki ruxsat yo'q — banner chiqmaydi
    void check();
    const t = window.setInterval(check, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  if (!pending) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-4 py-3 text-sm">
      <ShieldAlert className="size-5 shrink-0 text-[var(--warn)]" />
      <span className="min-w-0 flex-1">
        Uzum kabineti «Verify you are human» tekshiruvini so&apos;rayapti — Bust narxlari, voronka va joylash
        to&apos;xtab turibdi. Bir marta belgi qo&apos;ysangiz, qolganini eStats o&apos;zi davom ettiradi.
      </span>
      <Link
        href={"/integrations?connect=uzum" as Route}
        className="rounded-xl bg-[var(--warn)] px-3 py-1.5 font-medium text-black"
      >
        Hozir o&apos;tish
      </Link>
    </div>
  );
}
