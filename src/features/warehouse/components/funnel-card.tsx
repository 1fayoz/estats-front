"use client";

import * as React from "react";
import { AlertTriangle, Loader2, RefreshCw, TrendingDown } from "lucide-react";
import { toast } from "sonner";

import { ApiError, syncProductFunnel } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Funnel } from "@/lib/types";

/**
 * Uzum «Voronka» — sotuvchi kabinetidagi analitikaning O'ZI.
 *
 * Eng muhim savolga javob beradi va uni boshqa hech qayer
 * bermaydi: *tovar sotilmayaptimi, yoki umuman KO'RINMAYAPTIMI?*
 * Sotuv hisoboti "0 ta sotildi" deydi, lekin sabab butunlay
 * boshqa bo'lishi mumkin — qidiruvda chiqmayapti (ko'rsatish
 * kam), kartochka ochilmayapti (rasm/nom zaif) yoki savatdan
 * buyurtmaga o'tmayapti (narx/yetkazish).
 *
 * Sonlar Uzum bergan holda ko'rsatiladi — biz qayta
 * hisoblamaymiz. Sotuvchi ularni kabinetdagi sonlar bilan
 * solishtiradi va ular aynan teng bo'lishi kerak.
 */
export function FunnelCard({
  productId,
  funnel,
  onChange,
}: {
  productId: number;
  funnel: Funnel | null | undefined;
  onChange?: (funnel: Funnel) => void;
}) {
  const [busy, setBusy] = React.useState(false);

  const sync = async () => {
    setBusy(true);
    try {
      const fresh = await syncProductFunnel(productId);
      onChange?.(fresh);
      toast.success("Voronka yangilandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yangilanmadi.");
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <TrendingDown className="h-4 w-4" />
        Uzum voronkasi
        {funnel?.periodFrom && (
          <span className="text-xs font-normal text-[color:var(--air-label)]">
            {funnel.periodFrom} — {funnel.periodTo}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => void sync()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--air-ctl-line)] px-2.5 py-1 text-xs text-[color:var(--air-head)] transition hover:bg-black/[.04] disabled:opacity-50"
        title="Uzumdan darhol yangilaydi (~30 soniya). Jadval buni har 3 soatda o'zi ham qiladi."
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        Yangilash
      </button>
    </div>
  );

  if (!funnel) {
    return (
      <section className="air-surface rounded-xl p-4">
        {header}
        {/*
          "Hali o'lchanmagan" va "o'lchandi, nol chiqdi" —
          BOSHQA-BOSHQA holatlar. Nollar ko'rsatilsa sotuvchi
          tovar umuman ko'rinmayapti deb o'ylardi.
        */}
        <p className="mt-3 text-sm text-[color:var(--air-label)]">
          Voronka hali olinmagan. Jadval har 3 soatda o&apos;zi yangilaydi —
          yoki hozir «Yangilash» bosing.
        </p>
      </section>
    );
  }

  return (
    <section className="air-surface rounded-xl p-4">
      {header}

      {/* Zanjir: har bosqichda nechtadan nechtaga tushdi. */}
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Step
          label="Ko'rsatildi"
          value={formatNumber(funnel.impressions)}
          hint="Qidiruv va katalogda"
        />
        <Step
          label="Ochildi"
          value={formatNumber(funnel.views)}
          conv={funnel.convImpressionToView}
          hint="Kartochkaga kirildi"
        />
        <Step
          label="Savatga"
          value={formatNumber(funnel.addToCart)}
          conv={funnel.convViewToCart}
        />
        <Step
          label="Buyurtma"
          value={formatNumber(funnel.orders)}
          conv={funnel.convCartToOrder}
          accent
        />
      </div>

      {/* Buyurtmadan keyingi taqdiri. */}
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <Step label="Yetkazildi" value={formatNumber(funnel.completed)} />
        <Step label="Bekor qilindi" value={formatNumber(funnel.canceled)} bad />
        <Step label="Qaytarildi" value={formatNumber(funnel.returned)} bad />
        <Step
          label="Sotib olish"
          value={`${funnel.redemption}%`}
          hint="Yetkazilgan / buyurtma"
        />
      </div>

      {/* Pul. */}
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <Step label="GMV (buyurtma)" value={formatSum(funnel.gmvGenerated)} />
        <Step label="GMV (yetkazilgan)" value={formatSum(funnel.gmvCompleted)} />
        <Step
          label="GMV (qaytgan)"
          value={formatSum(funnel.gmvReturnedCanceled)}
          bad
        />
        <Step
          label="O'rtacha chek"
          value={funnel.avgOrderPrice ? formatSum(funnel.avgOrderPrice) : "—"}
          hint={`Kuniga ${funnel.avgOrdersPerDay} buyurtma`}
        />
      </div>

      {funnel.impressions === 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-[color:var(--air-label)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>
            Bu davrda tovar qidiruvda umuman <b>ko&apos;rsatilmagan</b> — muammo
            matn yoki sotuvda emas, ko&apos;rinishda.
          </span>
        </p>
      )}

      {funnel.daily.length > 0 && <Sparks daily={funnel.daily} />}

      {funnel.syncedAt && (
        <p className="mt-2 text-[11px] text-[color:var(--air-label)]">
          Uzumdan olingan: {new Date(funnel.syncedAt).toLocaleString("uz-UZ")}
        </p>
      )}
    </section>
  );
}

function Step({
  label,
  value,
  conv,
  hint,
  accent,
  bad,
}: {
  label: string;
  value: string;
  conv?: number;
  hint?: string;
  accent?: boolean;
  bad?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--air-line)] p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[color:var(--air-label)]">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums",
          accent && "text-[color:var(--ok)]",
          bad && Number(value.replace(/\D/g, "")) > 0 && "text-[color:var(--bad)]",
        )}
      >
        {value}
      </div>
      {conv !== undefined && (
        <div className="text-[11px] tabular-nums text-[color:var(--air-label)]">
          oldingi bosqichdan {conv}%
        </div>
      )}
      {hint && <div className="text-[11px] text-[color:var(--air-label)]">{hint}</div>}
    </div>
  );
}

/**
 * Kunlik dinamika — oddiy ustunlar.
 *
 * Grafik kutubxonasi qo'shilmadi: bu yerda kerak bo'lgani
 * "ko'tarilyaptimi yoki tushyaptimi" degan savolga javob, uning
 * uchun esa nisbatlar yetarli.
 */
function Sparks({ daily }: { daily: Funnel["daily"] }) {
  const max = Math.max(...daily.map((d) => d.impressions), 1);
  return (
    <div className="mt-3">
      <div className="mb-1 text-[11px] text-[color:var(--air-label)]">
        Kunlik ko&apos;rsatishlar
      </div>
      <div className="flex items-end gap-0.5">
        {daily.map((day) => (
          <div
            key={day.date}
            className="flex-1 rounded-t bg-[color:var(--primary)]/70"
            style={{ height: `${Math.max(2, (day.impressions / max) * 48)}px` }}
            title={`${day.date}: ${day.impressions} ko'rsatish, ${day.views} ochilish, ${day.orders} buyurtma`}
          />
        ))}
      </div>
    </div>
  );
}
