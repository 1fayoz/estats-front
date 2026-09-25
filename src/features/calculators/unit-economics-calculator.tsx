"use client";

import { useId, useState } from "react";
import { Check, DollarSign, TrendingUp } from "lucide-react";

export function UnitEconomicsCalculator() {
  const retailPriceId = useId();
  const cogsId = useId();
  const shippingId = useId();
  const adSpendId = useId();
  const commissionRateId = useId();
  const taxRateId = useId();

  const [retailPrice, setRetailPrice] = useState<number>(200000);
  const [cogs, setCogs] = useState<number>(90000); // Tan narx
  const [shipping, setShipping] = useState<number>(10000); // Yetkazish
  const [adSpendPerUnit, setAdSpendPerUnit] = useState<number>(15000); // 1 dona tovar uchun reklama
  const [commissionRate, setCommissionRate] = useState<number>(15); // Bozor komissiyasi %
  const [taxRate, setTaxRate] = useState<number>(4); // Soliq %

  const commissionAmount = Math.round((retailPrice * commissionRate) / 100);
  const taxAmount = Math.round((retailPrice * taxRate) / 100);
  const totalVariableCosts = cogs + shipping + adSpendPerUnit + commissionAmount + taxAmount;
  const contributionMargin = retailPrice - totalVariableCosts;
  const marginPercent = retailPrice > 0 ? Math.round((contributionMargin / retailPrice) * 100) : 0;
  const roiPercent = cogs > 0 ? Math.round((contributionMargin / cogs) * 100) : 0;
  const breakEvenPrice = Math.round((cogs + shipping + adSpendPerUnit) / (1 - (commissionRate + taxRate) / 100));

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Unit Iqtisodiyoti (Unit Economics) Kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            1 dona tovar bo&apos;yicha barcha o&apos;zgaruvchan xarajatlar va zararsizlik nuqtasi (Break-even).
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={retailPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Chakana sotuv narxi (so&apos;m)
            </label>
            <input
              id={retailPriceId}
              type="number"
              value={retailPrice || ""}
              onChange={(e) => setRetailPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor={cogsId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tovarning tan narxi (COGS, so&apos;m)
            </label>
            <input
              id={cogsId}
              type="number"
              value={cogs || ""}
              onChange={(e) => setCogs(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={shippingId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Logistika/Yetkazish
              </label>
              <input
                id={shippingId}
                type="number"
                value={shipping || ""}
                onChange={(e) => setShipping(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={adSpendId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Reklama (1 dona uchun)
              </label>
              <input
                id={adSpendId}
                type="number"
                value={adSpendPerUnit || ""}
                onChange={(e) => setAdSpendPerUnit(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={commissionRateId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Bozor komissiyasi (%)
              </label>
              <input
                id={commissionRateId}
                type="number"
                value={commissionRate || ""}
                onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={taxRateId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Soliq stavkasi (%)
              </label>
              <input
                id={taxRateId}
                type="number"
                value={taxRate || ""}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tahlil ko&apos;rsatkichlari
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Bozor komissiyasi:</span>
              <span className="font-semibold">{commissionAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Aylanma solig&apos;i:</span>
              <span className="font-semibold">{taxAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Jami o&apos;zgaruvchan xarajat:</span>
              <span className="font-semibold text-rose-500">{totalVariableCosts.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Zararsizlik narxi (Break-even):</span>
              <span className="font-semibold">{breakEvenPrice.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 border space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-muted-foreground">1 donadan qoladigan foyda:</span>
              <span className={`text-xl font-extrabold ${contributionMargin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {contributionMargin.toLocaleString("uz-UZ")} so&apos;m
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>Marja: <strong className="text-foreground">{marginPercent}%</strong></span>
              <span>ROI: <strong className="text-foreground">{roiPercent}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
