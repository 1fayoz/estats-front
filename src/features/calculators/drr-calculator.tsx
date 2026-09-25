"use client";

import { useId, useState } from "react";
import { AlertCircle, Check, Megaphone, Target } from "lucide-react";

export function DrrCalculator() {
  const adSpendId = useId();
  const salesRevenueId = useId();
  const profitMarginId = useId();

  const [adSpend, setAdSpend] = useState<number>(1500000); // Reklama xarajati (so'm)
  const [salesRevenue, setSalesRevenue] = useState<number>(7500000); // Reklamadan tushgan savdo (so'm)
  const [profitMargin, setProfitMargin] = useState<number>(25); // Tovarning umumiy marjasi %

  const drrPercent = salesRevenue > 0 ? Number(((adSpend / salesRevenue) * 100).toFixed(1)) : 0;
  const roas = adSpend > 0 ? Number((salesRevenue / adSpend).toFixed(2)) : 0;
  const maxAllowableDrr = profitMargin;
  const isProfitable = drrPercent <= maxAllowableDrr;
  const profitDifference = Number((maxAllowableDrr - drrPercent).toFixed(1));

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Megaphone className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">DRR va Reklama Rentabelligi (ROAS) Kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            Reklama xarajati va keltirgan savdosini kiriting — reklama foyda keltiryaptimi yoki zararga ishlayaptimi, bilib oling.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={adSpendId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Reklamaga ketgan xarajat (so&apos;m)
            </label>
            <input
              id={adSpendId}
              type="number"
              value={adSpend || ""}
              onChange={(e) => setAdSpend(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 1 500 000"
            />
          </div>

          <div>
            <label htmlFor={salesRevenueId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Reklama orqali qilingan savdo tushumi (so&apos;m)
            </label>
            <input
              id={salesRevenueId}
              type="number"
              value={salesRevenue || ""}
              onChange={(e) => setSalesRevenue(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 7 500 000"
            />
          </div>

          <div>
            <label htmlFor={profitMarginId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tovarning o&apos;rtacha marjasi (%)
            </label>
            <input
              id={profitMarginId}
              type="number"
              value={profitMargin || ""}
              onChange={(e) => setProfitMargin(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 25"
            />
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reklama samaradorligi
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">DRR (Xarajat ulushi):</span>
              <span className="text-lg font-bold">{drrPercent}%</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">ROAS (Har 1 so&apos;m sarfdan qaytgan tushum):</span>
              <span className="font-semibold">{roas}x</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Ruxsat etilgan maksimal DRR:</span>
              <span className="font-semibold">{maxAllowableDrr}%</span>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-2 ${
              isProfitable ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100" : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {isProfitable ? (
                <>
                  <Check className="size-5 text-emerald-600" />
                  <span className="text-sm font-bold">Reklama foyda keltirmoqda!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-5 text-rose-600" />
                  <span className="text-sm font-bold">Reklama zararga ishlayapti!</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isProfitable
                ? `Sizning DRR ko'rsatkichingiz tovar marjasidan ${profitDifference}% past. Har bir reklama savdosidan foyda qolyapti.`
                : `DRR tovar marjasidan ${Math.abs(profitDifference)}% yuqori bo'lib ketgan. Har bir sotilgan tovarda zarar ko'ryapsiz.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
