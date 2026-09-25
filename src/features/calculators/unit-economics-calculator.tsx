"use client";

import { useId, useState } from "react";
import { TrendingUp } from "lucide-react";

export type UnitEcoLocale = "uz" | "ru" | "en";

const TEXTS = {
  uz: {
    title: "Unit Iqtisodiyoti (Unit Economics) Kalkulyatori",
    subtitle: "1 dona tovar bo'yicha barcha o'zgaruvchan xarajatlar va zararsizlik nuqtasi (Break-even).",
    retailPrice: "Chakana sotuv narxi (so'm)",
    cogs: "Tovarning tan narxi (COGS, so'm)",
    shipping: "Logistika va qadoqlash xarajati (so'm)",
    adSpend: "1 dona tovar uchun reklama xarajati (CAC/DRR, so'm)",
    commissionRate: "Marketpleys komissiyasi (%)",
    taxRate: "Soliq stavkasi (masalan, aylanmadan 4%)",
    costBreakdown: "Xarajatlar tarkibi",
    commissionAmount: "Marketpleys komissiyasi",
    taxAmount: "Soliq to'lovi",
    totalCosts: "Jami o'zgaruvchan xarajatlar",
    contributionMargin: "1 dona tovardan sof marja",
    marginPercent: "Marja",
    roiPercent: "ROI",
    breakEven: "Zararsizlik nuqtasi narxi (Break-even)",
    breakEvenDesc: "Tovarni ushbu narxdan past sotsangiz, har bir savdo zarar keltiradi.",
    currency: "so'm",
  },
  ru: {
    title: "Калькулятор Юнит-Экономики для Маркетплейсов",
    subtitle: "Расчет чистой маржи, точки безубыточности (Break-even) и ROI на 1 единицу товара.",
    retailPrice: "Розничная цена продажи (сум)",
    cogs: "Себестоимость закупки (COGS, сум)",
    shipping: "Логистика, доставка и упаковка (сум)",
    adSpend: "Затраты на рекламу на 1 продажу (ДРР/CAC, сум)",
    commissionRate: "Комиссия маркетплейса (%)",
    taxRate: "Ставка налога (например, 4% с оборота)",
    costBreakdown: "Структура себестоимости",
    commissionAmount: "Комиссия площадки",
    taxAmount: "Налог",
    totalCosts: "Суммарные переменные затраты",
    contributionMargin: "Чистая прибыль с 1 единицы",
    marginPercent: "Маржа",
    roiPercent: "ROI (Окупаемость)",
    breakEven: "Точка безубыточности (Break-even цена)",
    breakEvenDesc: "Минимальная цена продажи для покрытия всех комиссий и расходов в ноль.",
    currency: "сум",
  },
  en: {
    title: "Unit Economics Calculator for Marketplaces",
    subtitle: "Calculate contribution margin, break-even pricing, and unit ROI.",
    retailPrice: "Retail Selling Price (UZS)",
    cogs: "Cost of Goods Sold (COGS, UZS)",
    shipping: "Fulfillment & Packaging (UZS)",
    adSpend: "Ad Spend per Unit / CAC (UZS)",
    commissionRate: "Marketplace Commission Rate (%)",
    taxRate: "Tax Rate (e.g. 4% turnover tax)",
    costBreakdown: "Variable Cost Breakdown",
    commissionAmount: "Marketplace Commission",
    taxAmount: "Tax Liability",
    totalCosts: "Total Variable Costs",
    contributionMargin: "Contribution Margin per Unit",
    marginPercent: "Margin",
    roiPercent: "ROI",
    breakEven: "Break-Even Price",
    breakEvenDesc: "Floor price required to break even after covering all fees.",
    currency: "UZS",
  },
};

export function UnitEconomicsCalculator({ locale = "uz" }: { locale?: UnitEcoLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;
  const retailPriceId = useId();
  const cogsId = useId();
  const shippingId = useId();
  const adSpendId = useId();
  const commissionRateId = useId();
  const taxRateId = useId();

  const [retailPrice, setRetailPrice] = useState<number>(200000);
  const [cogs, setCogs] = useState<number>(90000);
  const [shipping, setShipping] = useState<number>(10000);
  const [adSpendPerUnit, setAdSpendPerUnit] = useState<number>(15000);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [taxRate, setTaxRate] = useState<number>(4);

  const commissionAmount = Math.round((retailPrice * commissionRate) / 100);
  const taxAmount = Math.round((retailPrice * taxRate) / 100);
  const totalVariableCosts = cogs + shipping + adSpendPerUnit + commissionAmount + taxAmount;
  const contributionMargin = retailPrice - totalVariableCosts;
  const marginPercent = retailPrice > 0 ? Math.round((contributionMargin / retailPrice) * 100) : 0;
  const roiPercent = cogs > 0 ? Math.round((contributionMargin / cogs) * 100) : 0;
  const divisor = 1 - (commissionRate + taxRate) / 100;
  const breakEvenPrice = divisor > 0 ? Math.round((cogs + shipping + adSpendPerUnit) / divisor) : 0;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={retailPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.retailPrice}
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
              {t.cogs}
            </label>
            <input
              id={cogsId}
              type="number"
              value={cogs || ""}
              onChange={(e) => setCogs(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor={shippingId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.shipping}
            </label>
            <input
              id={shippingId}
              type="number"
              value={shipping || ""}
              onChange={(e) => setShipping(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor={adSpendId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.adSpend}
            </label>
            <input
              id={adSpendId}
              type="number"
              value={adSpendPerUnit || ""}
              onChange={(e) => setAdSpendPerUnit(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={commissionRateId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.commissionRate}
              </label>
              <input
                id={commissionRateId}
                type="number"
                value={commissionRate || ""}
                onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor={taxRateId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.taxRate}
              </label>
              <input
                id={taxRateId}
                type="number"
                value={taxRate || ""}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.costBreakdown}
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.commissionAmount} ({commissionRate}%):</span>
              <span className="font-semibold">{commissionAmount.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.taxAmount} ({taxRate}%):</span>
              <span className="font-semibold">{taxAmount.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.totalCosts}:</span>
              <span className="font-semibold text-rose-500">{totalVariableCosts.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-card p-4 border space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-muted-foreground">{t.contributionMargin}:</span>
                <span className={`text-xl font-extrabold ${contributionMargin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {contributionMargin.toLocaleString("uz-UZ")} {t.currency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
                <span>{t.marginPercent}: <strong className="text-foreground">{marginPercent}%</strong></span>
                <span>{t.roiPercent}: <strong className="text-foreground">{roiPercent}%</strong></span>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">{t.breakEven}:</span>
                <span className="font-bold text-primary text-sm">{breakEvenPrice.toLocaleString("uz-UZ")} {t.currency}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t.breakEvenDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
