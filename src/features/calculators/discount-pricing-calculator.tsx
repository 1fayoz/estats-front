"use client";

import { useId, useState } from "react";
import { Check, Percent, Sparkles, Tag } from "lucide-react";

export function DiscountPricingCalculator() {
  const costPriceId = useId();
  const targetMarginId = useId();
  const discountPercentId = useId();
  const commissionRateId = useId();
  const shippingFeeId = useId();

  const [costPrice, setCostPrice] = useState<number>(60000); // Tan narx
  const [targetMargin, setTargetMargin] = useState<number>(25); // Maqsad qilingan sof foyda %
  const [discountPercent, setDiscountPercent] = useState<number>(40); // E'londagi chegirma %
  const [commissionRate, setCommissionRate] = useState<number>(15); // Bozor komissiyasi %
  const [shippingFee, setShippingFee] = useState<number>(8000); // Logistika

  // 1. Kerakli sof foyda (so'm)
  // Sotuv narxi = (Tan narx + Logistika + Sof foyda) / (1 - komissiya%)
  // Sof foyda = Sotuv narxi * (targetMargin / 100)
  // Sotuv narxi = (Tan narx + Logistika) / (1 - (komissiya + targetMargin)/100)
  const totalVariableRate = (commissionRate + targetMargin) / 100;
  const actualSellingPrice =
    totalVariableRate < 1
      ? Math.round((costPrice + shippingFee) / (1 - totalVariableRate))
      : 0;

  // 2. Chizilgan asl narx (Strikethrough Price)
  // actualSellingPrice = originalPrice * (1 - discountPercent / 100)
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
          <h2 className="text-xl font-bold">Chegirma va Narx Belgilash Kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            Uzumda katta chegirma ko&apos;rsatib ham mo&apos;ljallangan sof foydada qolish uchun narxlarni hisoblang.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={costPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tovarning tan narxi (so&apos;m)
            </label>
            <input
              id={costPriceId}
              type="number"
              value={costPrice || ""}
              onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 60 000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={targetMarginId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Kutilgan sof marja (%)
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
                Ko&apos;rsatiladigan chegirma (%)
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
              <label htmlFor={shippingFeeId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Logistika/Yetkazish (so&apos;m)
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
              Kartochkaga qo&apos;yiladigan narxlar
            </span>

            <div className="flex justify-between items-baseline py-1 border-b">
              <span className="text-xs text-muted-foreground">Eski narx (Chizilgan narx):</span>
              <span className="text-sm font-medium line-through text-muted-foreground">
                {originalPrice.toLocaleString("uz-UZ")} so&apos;m
              </span>
            </div>

            <div className="flex justify-between items-baseline py-1.5 border-b">
              <span className="text-sm font-semibold text-foreground">Haqiqiy sotuv narxi:</span>
              <span className="text-xl font-extrabold text-primary">
                {actualSellingPrice.toLocaleString("uz-UZ")} so&apos;m
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">Uzum komissiyasi ({commissionRate}%):</span>
              <span className="font-medium">{commissionAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">Uzum chegirmasi:</span>
              <span className="font-semibold text-rose-500">-{discountPercent}%</span>
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 border space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-muted-foreground">Har bir sotuvdan sof foyda:</span>
              <span className="text-lg font-bold text-emerald-600">
                {netProfit.toLocaleString("uz-UZ")} so&apos;m
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Haqiqiy marja: <strong className="text-foreground">{realMargin}%</strong></span>
              <span>Reja marja: <strong className="text-foreground">{targetMargin}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
