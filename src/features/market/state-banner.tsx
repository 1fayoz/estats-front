"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Database } from "lucide-react";

import { market, type MarketState } from "@/lib/market";
import { formatNumber } from "@/lib/format";

/**
 * «Ma'lumot qaysi kungacha» chizig'i.
 *
 * ENG MUHIM SABAB. Uzum tokeni uch soat yashaydi, ya'ni o'lchov
 * to'xtab qolishi — istisno emas, odatdagi holat. To'xtaganda ham
 * yig'ilgan ma'lumot KO'RSATILAVERADI (u bazada), lekin
 * foydalanuvchi uning qaysi kungacha ekanini bilishi SHART.
 *
 * Busiz u uch kunlik eski raqamlarni bugungi deb o'qiydi va
 * «bozor to'xtab qoldi» degan xulosa chiqaradi — bu mahsulotdagi
 * eng xavfli yanglishish.
 */
export function StateBanner() {
  const [state, setState] = React.useState<MarketState | null>(null);

  React.useEffect(() => {
    market.state().then(setState).catch(() => setState(null));
  }, []);

  if (!state || !state.data_until) return null;

  const stale = state.stale_days ?? 0;
  const warn = stale > 0 || state.missing_days > 0 || state.token_likely_expired;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl px-3.5 py-2.5 text-xs ${
        warn ? "air-notice" : "border bg-card text-muted-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5 font-medium">
        {warn ? <AlertTriangle className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
        Ma&apos;lumot <b>{state.data_until}</b> kungacha
      </span>

      {stale > 0 && <span>{formatNumber(stale)} kun o&apos;lchanmagan</span>}
      {state.missing_days > 0 && (
        <span>{formatNumber(state.missing_days)} kun tushib qolgan</span>
      )}
      <span>jami {formatNumber(state.measured_days)} kun</span>

      {!state.token_configured ? (
        <Link href="/market/source" className="ml-auto font-medium underline underline-offset-2">
          Token kiriting — o&apos;lchov davom etadi
        </Link>
      ) : state.token_likely_expired ? (
        <Link href="/market/source" className="ml-auto font-medium underline underline-offset-2">
          Token muddati o&apos;tgan bo&apos;lishi mumkin — yangilang
        </Link>
      ) : null}
    </div>
  );
}
