"use client";

import { useId, useState } from "react";
import { AlertCircle, Check, Megaphone } from "lucide-react";

export type DrrCalcLocale = "uz" | "ru";

interface DrrTexts {
  title: string;
  subtitle: string;
  adSpendLabel: string;
  adSpendPlaceholder: string;
  salesRevenueLabel: string;
  salesRevenuePlaceholder: string;
  profitMarginLabel: string;
  summaryTitle: string;
  drrLabel: string;
  roasLabel: string;
  maxDrrLabel: string;
  profitableTitle: string;
  unprofitableTitle: string;
  profitableText: (diff: number) => string;
  unprofitableText: (diff: number) => string;
}

const TEXTS: Record<DrrCalcLocale, DrrTexts> = {
  uz: {
    title: "DRR va Reklama Rentabelligi (ROAS) Kalkulyatori",
    subtitle: "Reklama xarajati va keltirgan savdosini kiriting — reklama foyda keltiryaptimi yoki zararga ishlayaptimi, bilib oling.",
    adSpendLabel: "Reklamaga ketgan xarajat (so'm)",
    adSpendPlaceholder: "Masalan: 1 500 000",
    salesRevenueLabel: "Reklama orqali qilingan savdo tushumi (so'm)",
    salesRevenuePlaceholder: "Masalan: 7 500 000",
    profitMarginLabel: "Tovarning o'rtacha marjasi (%)",
    summaryTitle: "Reklama samaradorligi",
    drrLabel: "DRR (Xarajat ulushi):",
    roasLabel: "ROAS (Har 1 so'm sarfdan qaytgan tushum):",
    maxDrrLabel: "Ruxsat etilgan maksimal DRR:",
    profitableTitle: "Reklama foyda keltirmoqda!",
    unprofitableTitle: "Reklama zararga ishlayapti!",
    profitableText: (diff) =>
      `Sizning DRR ko'rsatkichingiz tovar marjasidan ${diff}% past. Har bir reklama savdosidan foyda qolyapti.`,
    unprofitableText: (diff) =>
      `DRR tovar marjasidan ${diff}% yuqori bo'lib ketgan. Har bir sotilgan tovarda zarar ko'ryapsiz.`,
  },
  ru: {
    title: "Калькулятор ДРР и Окупаемости Рекламы (ROAS / ROMI)",
    subtitle: "Оцените долю рекламных расходов (ДРР) на Uzum Market, Wildberries и Яндекс Маркет. Работает ли реклама в плюс?",
    adSpendLabel: "Затраты на рекламу (сум)",
    adSpendPlaceholder: "Например: 1 500 000",
    salesRevenueLabel: "Выручка от рекламных продаж (сум)",
    salesRevenuePlaceholder: "Например: 7 500 000",
    profitMarginLabel: "Маржинальность товара (%)",
    summaryTitle: "Эффективность рекламной кампании",
    drrLabel: "ДРР (Доля рекламных расходов):",
    roasLabel: "ROAS (Возврат на рекламные расходы):",
    maxDrrLabel: "Предельно допустимый ДРР:",
    profitableTitle: "Реклама работает с прибылью!",
    unprofitableTitle: "Реклама уходит в убыток!",
    profitableText: (diff) =>
      `Ваш ДРР на ${diff}% ниже маржинальности. Каждая продажа приносит бизнесу чистую прибыль.`,
    unprofitableText: (diff) =>
      `ДРР превышает маржу на ${diff}%. Каждая рекламная продажа генерирует прямой убыток.`,
  },
};

export function DrrCalculator({ locale = "uz" }: { locale?: DrrCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const adSpendId = useId();
  const salesRevenueId = useId();
  const profitMarginId = useId();

  const [adSpend, setAdSpend] = useState<number>(1500000);
  const [salesRevenue, setSalesRevenue] = useState<number>(7500000);
  const [profitMargin, setProfitMargin] = useState<number>(25);

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
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={adSpendId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.adSpendLabel}
            </label>
            <input
              id={adSpendId}
              type="number"
              value={adSpend || ""}
              onChange={(e) => setAdSpend(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t.adSpendPlaceholder}
            />
          </div>

          <div>
            <label htmlFor={salesRevenueId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.salesRevenueLabel}
            </label>
            <input
              id={salesRevenueId}
              type="number"
              value={salesRevenue || ""}
              onChange={(e) => setSalesRevenue(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t.salesRevenuePlaceholder}
            />
          </div>

          <div>
            <label htmlFor={profitMarginId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.profitMarginLabel}
            </label>
            <input
              id={profitMarginId}
              type="number"
              value={profitMargin || ""}
              onChange={(e) => setProfitMargin(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.summaryTitle}
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.drrLabel}</span>
              <span className="text-lg font-bold">{drrPercent}%</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.roasLabel}</span>
              <span className="font-semibold">{roas}x</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.maxDrrLabel}</span>
              <span className="font-semibold">{maxAllowableDrr}%</span>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-2 ${
              isProfitable
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {isProfitable ? (
                <>
                  <Check className="size-5 text-emerald-600" />
                  <span className="text-sm font-bold">{t.profitableTitle}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-5 text-rose-600" />
                  <span className="text-sm font-bold">{t.unprofitableTitle}</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isProfitable
                ? t.profitableText(profitDifference)
                : t.unprofitableText(Math.abs(profitDifference))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
