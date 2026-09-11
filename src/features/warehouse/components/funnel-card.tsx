"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { ApiError, syncProductFunnel } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Funnel, FunnelDiagnosis } from "@/lib/types";

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

      {funnel.diagnosis && <DiagnosisBlock diagnosis={funnel.diagnosis} />}

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
 * Eng zaif bosqich va uni kuchaytirish uchun amaliy yordam.
 *
 * Ikki qatlamli: Uzum'ning O'Z rasmiy qo'llanmasi (`why`,
 * `actions`, `note` — sotuvchi kabinetidan so'zma-so'z) + shu
 * tovar uchun BIZDA bor o'lchangan topilmalar (`findings`) —
 * ular bo'lsa, umumiy tavsiyani aniq raqamga bog'laydi.
 *
 * "O'lchandi" va "Uzum tavsiyasi" ATAYLAB ajratiladi — bittasi
 * shu tovar haqida aniq fakt, ikkinchisi umumiy yo'l-yo'riq.
 * Ularni aralashtirish taxminni faktdek ko'rsatardi (§9.9 dagi
 * "Aniqlangan" / "Taxmin" qoidasi bilan bir xil).
 */
function DiagnosisBlock({ diagnosis }: { diagnosis: FunnelDiagnosis }) {
  const [open, setOpen] = React.useState(true);
  const hasBenchmark = diagnosis.metric !== null && diagnosis.benchmarkMin !== null;

  return (
    <div className="mt-3 rounded-xl border border-[color:var(--primary)]/25 bg-[color:var(--primary)]/[.05] p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4 shrink-0 text-[color:var(--primary)]" />
          Eng zaif bosqich: {diagnosis.stageTitle}
          {diagnosis.confidence === "kam_malumot" && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-normal text-amber-700 dark:text-amber-400">
              kam ma&apos;lumot
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[color:var(--air-label)] transition-transform", open && "rotate-180")}
        />
      </button>

      {hasBenchmark && (
        <p className="mt-1 text-[11px] tabular-nums text-[color:var(--air-label)]">
          Sizda {diagnosis.metric}% — odatiy oraliq {diagnosis.benchmarkMin}
          –{diagnosis.benchmarkMax}%
        </p>
      )}

      {open && (
        <>
          <p className="mt-2 text-xs leading-relaxed text-[color:var(--air-head)]">
            {diagnosis.why}
          </p>

          {diagnosis.findings.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {diagnosis.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed">
                  <span className="mt-0.5 shrink-0 rounded bg-[color:var(--ok)]/15 px-1 py-px text-[9px] font-medium uppercase tracking-wide text-[color:var(--ok)]">
                    O&apos;lchandi
                  </span>
                  <span className="text-[color:var(--air-head)]">{f.text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 border-t border-[color:var(--air-line)] pt-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--air-head)]">
              <Sparkles className="h-3.5 w-3.5" />
              Nima qilish kerak?
            </div>
            <ul className="mt-1.5 space-y-1">
              {diagnosis.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--ok)]" />
                  <span className="text-[color:var(--air-head)]">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-2.5 text-[11px] italic leading-relaxed text-[color:var(--air-label)]">
            {diagnosis.note}
          </p>
        </>
      )}
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
