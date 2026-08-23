"use client";

import * as React from "react";
import { AlertTriangle, Calculator, Target, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UnitEconomics } from "@/lib/types";

/**
 * Where the money goes on one unit, and from which price it starts earning.
 *
 * The rates are the seller's OWN averages, not Uzum's headline commission: what
 * actually lands after promotions and delivery fees is what decides whether a price
 * is profitable.
 */
export function BreakEvenCard({ economics }: { economics: UnitEconomics }) {
  const [customPrice, setCustomPrice] = React.useState("");

  const price = Number(customPrice);
  const hasCustom = customPrice !== "" && Number.isFinite(price) && price > 0;
  // Bir joyda hisoblanadigan formula: payout = narx·(1−komissiya) − logistika
  const payout = hasCustom ? price * (1 - economics.commissionRate / 100) - economics.logisticsPerUnit : 0;
  const profit = hasCustom ? payout - economics.unitCost : 0;
  const margin = hasCustom && payout > 0 ? (profit / payout) * 100 : 0;

  if (!economics.hasCost) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" /> Beziyon nuqta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <div className="font-medium">Tan narx kiritilmagan</div>
              <div className="text-muted-foreground">
                Bu tovarga kirim qo&apos;shsangiz, qaysi narxdan foyda boshlanishini
                hisoblab beramiz.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" /> Beziyon nuqta va narx tanlash
            </CardTitle>
            <CardDescription>
              Bir dona uchun: tan narx, Uzum komissiyasi va yetkazib berish ayirilgandan
              keyin qancha qolishi.
            </CardDescription>
          </div>
          {economics.isEstimated && (
            <Badge variant="secondary" className="shrink-0">taxminiy</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Tan narx (keyingi dona)" value={formatSum(economics.unitCost)} />
          <Metric label="Uzum komissiyasi" value={`${economics.commissionRate.toFixed(1)}%`} />
          <Metric label="Yetkazib berish / dona" value={formatSum(economics.logisticsPerUnit)} />
          <Metric
            label="Beziyon nuqta"
            value={economics.breakEvenPrice ? formatSum(economics.breakEvenPrice) : "—"}
            accent
          />
        </div>

        {economics.breakEvenPrice != null && (
          <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <span className="font-medium">{formatSum(economics.breakEvenPrice)}</span> dan
              past narxda sotsangiz — <span className="text-destructive font-medium">zarar</span>.
              Aynan shu narxda foyda ham, zarar ham bo&apos;lmaydi.
            </div>
          </div>
        )}

        {/* Narx kalkulyatori — sotuvchi o'zi kiritib ko'radi */}
        <div className="space-y-2 rounded-lg border p-3">
          <Label htmlFor="price-check" className="text-xs">
            Narxni tekshirib ko&apos;ring
          </Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="price-check"
              inputMode="decimal"
              placeholder={String(Math.round(economics.avgSellPrice || economics.breakEvenPrice || 0))}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="h-9 w-36"
            />
            {hasCustom && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Uzum to&apos;laydi: <span className="font-medium text-foreground">{formatSum(payout)}</span>
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                  )}
                >
                  {profit >= 0 ? "Foyda" : "Zarar"}: {formatSum(profit)}
                  {payout > 0 && ` (${margin.toFixed(1)}%)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {economics.priceLadder.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Qaysi narxda qancha foyda
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[420px] text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Sotuv narxi</th>
                    <th className="px-3 py-2 text-right font-medium">Uzum to&apos;laydi</th>
                    <th className="px-3 py-2 text-right font-medium">Sof foyda</th>
                    <th className="px-3 py-2 text-right font-medium">Marja</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {economics.priceLadder.map((rung) => (
                    <tr
                      key={rung.price}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        rung.isCurrent && "bg-primary/5"
                      )}
                    >
                      <td className="px-3 py-2 tabular-nums">
                        {formatSum(rung.price)}
                        {rung.isCurrent && (
                          <Badge variant="info" className="ml-2 text-[10px]">hozirgi</Badge>
                        )}
                        {Math.abs(rung.profit) < 1 && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">beziyon</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatSum(rung.payout)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-medium tabular-nums",
                          rung.profit > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : rung.profit < 0
                              ? "text-destructive"
                              : ""
                        )}
                      >
                        {formatSum(rung.profit)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {rung.margin.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", accent && "border-primary/40 bg-primary/5")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-semibold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
    </div>
  );
}
