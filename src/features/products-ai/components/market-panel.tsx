"use client";

import * as React from "react";
import { AlertTriangle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ApiError, refreshAiDraftMarket } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import type { AiDraft } from "@/lib/types";

/**
 * «Bozor» tabi — raqobatchilar tovarning O'ZI kabi ko'rsatiladi:
 * rasm, narx, buyurtma, reyting. Ilgari bu yerda faqat matnli
 * jadval turardi va sotuvchi «yetakchi rasm qanaqa» degan savolga
 * javob ololmasdi (aynan shu savol rasm qadamining kirishi).
 *
 * «Bozorni yangilash» — turkum quvurdan keyin o'zgargan bo'lsa
 * (qo'lda yoki «o'xshash tovar havolasi»), ro'yxatni yangi turkum
 * bo'yicha qayta yig'adi. Turkum tanlanganda fonda o'zi ham
 * ishga tushadi — bu tugma sotuvchi darhol ko'rmoqchi bo'lganda.
 */
export function MarketPanel({
  draft,
  locked,
  onChange,
}: {
  draft: AiDraft;
  locked: boolean;
  onChange: (draft: AiDraft) => void;
}) {
  const [refreshing, setRefreshing] = React.useState(false);
  const market = draft.market;

  const refresh = async () => {
    setRefreshing(true);
    try {
      onChange(await refreshAiDraftMarket(draft.id));
      toast.success("Bozor tahlili yangilandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setRefreshing(false);
    }
  };

  const rivals = market?.rivals ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[color:var(--air-label)]">
          {market?.category
            ? <>«<b className="text-[color:var(--air-head)]">{market.category}</b>» turkumi bo&apos;yicha</>
            : "Uzum katalogidagi o'xshash tovarlar"}
        </p>
        {!locked && (
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--air-ctl-line)] px-2.5 py-1 text-xs text-[color:var(--air-head)] transition hover:bg-black/[.04] disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Bozorni yangilash
          </button>
        )}
      </div>

      {market?.error && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-[color:var(--air-label)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>{market.error}</span>
        </p>
      )}

      {(market?.priceMin || market?.priceMedian || market?.priceMax) && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Eng arzon" value={market?.priceMin ? formatSum(market.priceMin) : "—"} />
          <Stat label="O'rtacha (median)" value={market?.priceMedian ? formatSum(market.priceMedian) : "—"} accent />
          <Stat label="Eng qimmat" value={market?.priceMax ? formatSum(market.priceMax) : "—"} />
        </div>
      )}

      {rivals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rivals.map((rival, index) => (
            <a
              key={`${rival.url}-${index}`}
              href={rival.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-lg border border-[color:var(--air-line)] transition-colors hover:bg-black/[.03]"
            >
              <div className="aspect-square w-full overflow-hidden bg-black/[.04]">
                {rival.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rival.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-2">
                <span className="text-sm font-semibold tabular-nums">
                  {rival.price ? formatSum(rival.price) : "—"}
                </span>
                <span className="line-clamp-2 text-[11px] text-[color:var(--air-label)]">
                  {rival.title}
                </span>
                <div className="mt-auto flex items-center gap-2 pt-1 text-[10px] text-[color:var(--air-label)] tabular-nums">
                  {rival.orders > 0 && <span>{formatNumber(rival.orders)} buyurtma</span>}
                  {rival.rating ? <span>⭐ {rival.rating.toFixed(1)}</span> : null}
                  <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[color:var(--air-ctl-line)] p-6 text-center text-sm text-[color:var(--air-label)]">
          {market?.error
            ? "Raqobatchilar olinmadi."
            : "Bu nishada o'xshash tovar topilmadi."}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        "rounded-lg border p-2.5 " +
        (accent
          ? "border-primary/40 bg-primary/5"
          : "border-[color:var(--air-line)]")
      }
    >
      <div className="text-[10px] text-[color:var(--air-label)]">{label}</div>
      <div
        className={
          "mt-0.5 text-sm font-semibold tabular-nums " +
          (accent ? "text-primary" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
