"use client";

import { useId, useState } from "react";
import { Tag } from "lucide-react";

export type DiscountCalcLocale = "uz" | "ru";

interface DiscountCalcTexts {
  title: string;
  subtitle: string;
  costPriceLabel: string;
  costPricePlaceholder: string;
  targetMarginLabel: string;
  discountPercentLabel: string;
  commissionRateLabel: string;
  shippingFeeLabel: string;
  summaryTitle: string;
  originalPriceLabel: string;
  actualPriceLabel: string;
  commissionAmountLabel: (rate: number) => string;
  discountBadge: string;
  netProfitLabel: string;
  realMarginLabel: string;
  targetMarginRefLabel: string;
  currency: string;
}

const TEXTS: Record<DiscountCalcLocale, DiscountCalcTexts> = {
  uz: {
    title: "Chegirma va Narx Belgilash Kalkulyatori",
    subtitle: "Uzumda katta chegirma ko'rsatib ham mo'ljallangan sof foydada qolish uchun narxlarni hisoblang.",
    costPriceLabel: "Tovarning tan narxi (so'm)",
    costPricePlaceholder: "Masalan: 60 000",
    targetMarginLabel: "Kutilgan sof marja (%)",
    discountPercentLabel: "Ko'rsatiladigan chegirma (%)",
    commissionRateLabel: "Bozor komissiyasi (%)",
    shippingFeeLabel: "Logistika/Yetkazish (so'm)",
    summaryTitle: "Kartochkaga qo'yiladigan narxlar",
    originalPriceLabel: "Eski narx (Chizilgan narx):",
    actualPriceLabel: "Haqiqiy sotuv narxi:",
    commissionAmountLabel: (rate) => `Uzum komissiyasi (${rate}%):`,
    discountBadge: "Uzum chegirmasi:",
    netProfitLabel: "Har bir sotuvdan sof foyda:",
    realMarginLabel: "Haqiqiy marja:",
    targetMarginRefLabel: "Reja marja:",
    currency: "so'm",
  },
  ru: {
    title: "Калькулятор Скидок и Ценообразования на Маркетплейсе",
    subtitle: "Рассчитайте зачеркнутую и фактическую цену, чтобы участвовать в акциях без потери плановой прибыли.",
    costPriceLabel: "Себестоимость товара (сум)",
    costPricePlaceholder: "Например: 60 000",
    targetMarginLabel: "Целевая чистая маржа (%)",
    discountPercentLabel: "Размер скидки в карточке (%)",
    commissionRateLabel: "Комиссия маркетплейса (%)",
    shippingFeeLabel: "Логистика/Доставка (сум)",
    summaryTitle: "Расчет цен для карточки товара",
    originalPriceLabel: "Зачеркнутая (старая) цена:",
    actualPriceLabel: "Реальная цена продажи:",
    commissionAmountLabel: (rate) => `Комиссия маркетплейса (${rate}%):`,
    discountBadge: "Скидка селлера:",
    netProfitLabel: "Чистая прибыль с 1 шт.:",
    realMarginLabel: "Фактическая маржа:",
    targetMarginRefLabel: "Плановая маржа:",
    currency: "сум",
  },
};

export function DiscountPricingCalculator({ locale = "uz" }: { locale?: DiscountCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const costPriceId = useId();
  const targetMarginId = useId();
  const discountPercentId = useId();
  const commissionRateId = useId();
  const shippingFeeId = useId();

  const [costPrice, setCostPrice] = useState<number>(60000);
  const [targetMargin, setTargetMargin] = useState<number>(25);
  const [discountPercent, setDiscountPercent] = useState<number>(40);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [shippingFee, setShippingFee] = useState<number>(8000);

  const totalVariableRate = (commissionRate + targetMargin) / 100;
  const actualSellingPrice =
    totalVariableRate < 1
      ? Math.round((costPrice + shippingFee) / (1 - totalVariableRate))
      : 0;

  const discountRate = discountPercent / 100;
  const originalPrice =
    discountRate < 1
      ? Math.round(actualSellingPrice / (1 - discountRate))
      : actualSellingPrice;

  const commissionAmount = Math.round((actualSellingPrice * commissionRate) / 100);
  const netProfit = actualSellingPrice - (costPrice + shippingFee + commissionAmount);
  const realMargin = actualSellingPrice > 0 ? Math.round((netProfit / actualSellingPrice) * 100) : 0;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Tag className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={costPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.costPriceLabel}
            </label>
            <input
              id={costPriceId}
              type="number"
              value={costPrice || ""}
              onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t.costPricePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={targetMarginId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.targetMarginLabel}
              </label>
              <input
                id={targetMarginId}
                type="number"
                value={targetMargin || ""}
                onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={discountPercentId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.discountPercentLabel}
              </label>
              <input
                id={discountPercentId}
                type="number"
                value={discountPercent || ""}
                onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={commissionRateId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.commissionRateLabel}
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
              <label htmlFor={shippingFeeId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.shippingFeeLabel}
              </label>
              <input
                id={shippingFeeId}
                type="number"
                value={shippingFee || ""}
                onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.summaryTitle}
            </span>

            <div className="flex justify-between items-baseline py-1 border-b">
              <span className="text-xs text-muted-foreground">{t.originalPriceLabel}</span>
              <span className="text-sm font-medium line-through text-muted-foreground">
                {originalPrice.toLocaleString("uz-UZ")} {t.currency}
              </span>
            </div>

            <div className="flex justify-between items-baseline py-1.5 border-b">
              <span className="text-sm font-semibold text-foreground">{t.actualPriceLabel}</span>
              <span className="text-xl font-extrabold text-primary">
                {actualSellingPrice.toLocaleString("uz-UZ")} {t.currency}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">{t.commissionAmountLabel(commissionRate)}</span>
              <span className="font-medium">{commissionAmount.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">{t.discountBadge}</span>
              <span className="font-semibold text-rose-500">-{discountPercent}%</span>
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 border space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-muted-foreground">{t.netProfitLabel}</span>
              <span className="text-lg font-bold text-emerald-600">
                {netProfit.toLocaleString("uz-UZ")} {t.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.realMarginLabel} <strong className="text-foreground">{realMargin}%</strong></span>
              <span>{t.targetMarginRefLabel} <strong className="text-foreground">{targetMargin}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
