"use client";

import * as React from "react";
import { Calculator, Loader2, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { ApiError, patchAiDraft } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiDraft } from "@/lib/types";

/**
 * «Tan narx va foyda» tabi — ombordagi tovar sahifasidagi «Beziyon
 * nuqta» bloki bilan BIR XIL: sotuvchi kirim narxini kiritadi va
 * qaysi narxda qancha foyda qolishini ko'radi, beziyon nuqtadan
 * boshlab.
 *
 * FARQI: bu yerda hali sotuv tarixi yo'q, shuning uchun komissiya
 * foizi va dona-logistikasi ham SOTUVCHIDAN olinadi (taxminiy
 * qiymatlar oldindan to'ldirilgan). Sukut bo'yicha tavsiya
 * etiladigan narx — bozor o'rtachasi (median), avvalgidek.
 */
export function PricePanel({
  draft,
  locked,
  onChange,
}: {
  draft: AiDraft;
  locked: boolean;
  onChange: (draft: AiDraft) => void;
}) {
  const econ = draft.economics;
  const pricing = draft.pricing ?? {};
  const median = draft.market?.priceMedian ?? 0;

  const [cost, setCost] = React.useState(String(pricing.unitCost ?? ""));
  const [commission, setCommission] = React.useState(
    pricing.commissionPct != null ? String(pricing.commissionPct) : "",
  );
  const [logistics, setLogistics] = React.useState(
    pricing.logisticsPerUnit != null ? String(pricing.logisticsPerUnit) : "",
  );
  const [check, setCheck] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Qoralama tashqaridan yangilanганда (masalan bozor qayta
  // yuritilib median o'zgarsa) maydonlar ham moslashadi.
  React.useEffect(() => {
    setCost(String(draft.pricing?.unitCost ?? ""));
    setCommission(
      draft.pricing?.commissionPct != null ? String(draft.pricing.commissionPct) : "",
    );
    setLogistics(
      draft.pricing?.logisticsPerUnit != null
        ? String(draft.pricing.logisticsPerUnit)
        : "",
    );
  }, [draft.id, draft.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (patch: Record<string, number | null>) => {
    setSaving(true);
    try {
      onChange(await patchAiDraft(draft.id, { pricing: patch }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  const commitCost = () => {
    const v = cost.trim() === "" ? null : Math.max(0, Math.round(Number(cost) || 0));
    if (v === (draft.pricing?.unitCost ?? null)) return;
    void save({ unitCost: v });
  };
  const commitCommission = () => {
    const v = commission.trim() === "" ? null : Number(commission);
    if (v === (draft.pricing?.commissionPct ?? null)) return;
    void save({ commissionPct: v });
  };
  const commitLogistics = () => {
    const v =
      logistics.trim() === "" ? null : Math.max(0, Math.round(Number(logistics) || 0));
    if (v === (draft.pricing?.logisticsPerUnit ?? null)) return;
    void save({ logisticsPerUnit: v });
  };

  const recommend = async (price: number) => {
    const rounded = Math.round(price);
    setSaving(true);
    try {
      onChange(await patchAiDraft(draft.id, { suggestedPrice: rounded }));
      toast.success(`Tavsiya narx ${formatSum(rounded)} qilib qo'yildi.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setSaving(false);
    }
  };

  // Sotuvchi tekshirib ko'rgan narx — client tarafda o'sha formula:
  // payout = narx·(1−komissiya) − logistika,  foyda = payout − tan narx
  const checkPrice = Number(check);
  const hasCheck = check !== "" && Number.isFinite(checkPrice) && checkPrice > 0;
  const rate = (econ?.commissionRate ?? 0) / 100;
  const payout = hasCheck
    ? checkPrice * (1 - rate) - (econ?.logisticsPerUnit ?? 0)
    : 0;
  const profit = hasCheck ? payout - (econ?.unitCost ?? 0) : 0;
  const margin = hasCheck && payout > 0 ? (profit / payout) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* ── Kirim ma'lumoti ─────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="air-label">Tan narx (bir dona, so&apos;m)</label>
          <input
            className="air-input"
            type="number"
            inputMode="numeric"
            value={cost}
            disabled={locked}
            onChange={(e) => setCost(e.target.value)}
            onBlur={commitCost}
            placeholder="qancha kelgan"
          />
        </div>
        <div>
          <label className="air-label">Uzum komissiyasi (%)</label>
          <input
            className="air-input"
            type="number"
            inputMode="decimal"
            value={commission}
            disabled={locked}
            onChange={(e) => setCommission(e.target.value)}
            onBlur={commitCommission}
            placeholder={econ ? String(econ.commissionRate.toFixed(0)) : "23"}
          />
        </div>
        <div>
          <label className="air-label">Yetkazib berish / dona</label>
          <input
            className="air-input"
            type="number"
            inputMode="numeric"
            value={logistics}
            disabled={locked}
            onChange={(e) => setLogistics(e.target.value)}
            onBlur={commitLogistics}
            placeholder="0"
          />
        </div>
      </div>
      <p className="text-[11px] text-[color:var(--air-label)]">
        {saving && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
        Komissiya va yetkazib berish — <b>taxminiy</b>: bu tovarda hali sotuv
        yo&apos;q. Sotuv boshlangach ombordagi tovar sahifasi haqiqiy foizni
        o&apos;zi hisoblaydi.
      </p>

      {!econ?.hasCost ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <div className="font-medium">Tan narx kiritilmagan</div>
            <div className="text-[color:var(--air-label)]">
              Kirim narxini yozing — qaysi narxdan foyda boshlanishini va har
              marjada qancha qolishini shu yerda ko&apos;rasiz.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Beziyon nuqta ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Tan narx" value={formatSum(econ.unitCost)} />
            <Metric label="Komissiya" value={`${econ.commissionRate.toFixed(1)}%`} />
            <Metric label="Yetkazish / dona" value={formatSum(econ.logisticsPerUnit)} />
            <Metric
              label="Beziyon nuqta"
              value={econ.breakEvenPrice ? formatSum(econ.breakEvenPrice) : "—"}
              accent
            />
          </div>

          {econ.breakEvenPrice != null && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <span className="font-medium">{formatSum(econ.breakEvenPrice)}</span> dan
                past narxda sotsangiz — <span className="font-medium air-bad">zarar</span>.
                {median > 0 && (
                  <>
                    {" "}Bozor o&apos;rtachasi <b>{formatSum(median)}</b> — sukut bo&apos;yicha
                    tavsiya shu.
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Narxni tekshirib ko'rish ────────────────────── */}
          <div className="space-y-2 rounded-lg border border-[color:var(--air-line)] p-3">
            <label className="air-label">Narxni tekshirib ko&apos;ring</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="air-input h-9 w-36"
                inputMode="decimal"
                placeholder={String(Math.round(median || econ.breakEvenPrice || 0))}
                value={check}
                onChange={(e) => setCheck(e.target.value)}
              />
              {hasCheck && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="text-[color:var(--air-label)]">
                    Uzum to&apos;laydi:{" "}
                    <span className="font-medium text-[color:var(--air-head)]">
                      {formatSum(payout)}
                    </span>
                  </span>
                  <span className={cn("font-semibold", profit >= 0 ? "air-ok" : "air-bad")}>
                    {profit >= 0 ? "Foyda" : "Zarar"}: {formatSum(profit)}
                    {payout > 0 && ` (${margin.toFixed(1)}%)`}
                  </span>
                  {!locked && (
                    <button
                      type="button"
                      className="air-btn-flat h-7 px-2 text-xs"
                      disabled={saving}
                      onClick={() => void recommend(checkPrice)}
                    >
                      Tavsiya qilish
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Qaysi narxda qancha foyda ───────────────────── */}
          {econ.priceLadder.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[color:var(--air-label)]">
                <TrendingUp className="h-3.5 w-3.5" /> Qaysi narxda qancha foyda
              </div>
              <div className="overflow-x-auto rounded-lg border border-[color:var(--air-line)]">
                <table className="w-full min-w-[440px] text-sm">
                  <thead className="border-b border-[color:var(--air-line)] bg-black/[.03] text-[11px] uppercase text-[color:var(--air-label)]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Sotuv narxi</th>
                      <th className="px-3 py-2 text-right font-medium">Uzum to&apos;laydi</th>
                      <th className="px-3 py-2 text-right font-medium">Sof foyda</th>
                      <th className="px-3 py-2 text-right font-medium">Marja</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--air-line)]">
                    {econ.priceLadder.map((rung) => (
                      <tr key={rung.price} className={cn(rung.isCurrent && "bg-primary/5")}>
                        <td className="px-3 py-2 tabular-nums">
                          {formatSum(rung.price)}
                          {rung.isCurrent && (
                            <span className="ml-2 rounded bg-primary/15 px-1.5 py-px text-[10px] text-primary">
                              tavsiya
                            </span>
                          )}
                          {Math.abs(rung.profit) < 1 && (
                            <span className="ml-2 rounded bg-black/[.06] px-1.5 py-px text-[10px]">
                              beziyon
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[color:var(--air-label)]">
                          {formatSum(rung.payout)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right font-medium tabular-nums",
                            rung.profit > 0 ? "air-ok" : rung.profit < 0 ? "air-bad" : "",
                          )}
                        >
                          {formatSum(rung.profit)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[color:var(--air-label)]">
                          {rung.margin.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!locked && !rung.isCurrent && (
                            <button
                              type="button"
                              className="air-btn-flat h-7 px-2 text-xs"
                              disabled={saving}
                              onClick={() => void recommend(rung.price)}
                            >
                              Tavsiya
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        accent ? "border-primary/40 bg-primary/5" : "border-[color:var(--air-line)]",
      )}
    >
      <div className="text-[10px] text-[color:var(--air-label)]">{label}</div>
      <div className={cn("mt-0.5 text-sm font-semibold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
    </div>
  );
}
