"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import { formatSum } from "@/lib/format";

export type ReturnCalcLocale = "uz" | "ru";

interface Texts {
  title: string;
  subtitle: string;
  ordersLabel: string;
  priceLabel: string;
  cogsLabel: string;
  returnRateLabel: string;
  logisticsFeeLabel: string;
  repackRateLabel: string;
  resultsTitle: string;
  monthlyReturns: string;
  directLoss: string;
  repackLoss: string;
  totalMonthlyLoss: string;
  totalAnnualLoss: string;
  frozenCapital: string;
  adviceTitle: string;
  adviceText: string;
  ctaButton: string;
}

const TEXTS: Record<ReturnCalcLocale, Texts> = {
  uz: {
    title: "Qaytgan Tovarlar (Vozvrat) va Zarar Kalkulyatori",
    subtitle:
      "Uzum Market va Wildberries'da xaridorlar tomonidan qaytarilgan tovarlar sababli har oy qancha pul yo'qotayotganingizni aniq hisoblang.",
    ordersLabel: "Oylik buyurtmalar soni (dona)",
    priceLabel: "O'rtacha sotish narxi (so'm)",
    cogsLabel: "Tovar tan narxi (so'm)",
    returnRateLabel: "Vozvrat foizi (%)",
    logisticsFeeLabel: "Qaytarish logistika to'lovi (so'm/dona)",
    repackRateLabel: "Yaroqsiz / qayta qadoqlash foizi (%)",
    resultsTitle: "Vozvrat tufayli oylik va yillik zararlar tahlili",
    monthlyReturns: "Oylik qaytgan tovarlar soni",
    directLoss: "To'g'ridan-to'g'ri logistika yo'qotishi",
    repackLoss: "Qadoq va yaroqsizlik zarari",
    totalMonthlyLoss: "Oylik jami sof zarar",
    totalAnnualLoss: "Yillik yashirin yo'qotish",
    frozenCapital: "Yo'lda muzlab qolgan aylanma mablag'",
    adviceTitle: "eStats orqali vozvratni qanday kamaytirish mumkin?",
    adviceText:
      "eStats analitikasi qaysi o'lcham, rang yoki tovar partiyasi eng ko'p vozvrat bo'layotganini ko'rsatadi. Kartochkadagi AI tavsiyalar va o'lcham jadvallarini to'g'rilash orqali qaytarilish darajasini 3-7% ga tushirib, millionlab so'mni saqlab qolishingiz mumkin.",
    ctaButton: "Zararlarni to'xtatish — eStats'ni ulash",
  },
  ru: {
    title: "Калькулятор Убытков от Возвратов на Маркетплейсах",
    subtitle:
      "Рассчитайте реальные финансовые потери от возвратов и невыкупов на Uzum Market, Wildberries и Ozon с учетом логистики и брака.",
    ordersLabel: "Количество заказов в месяц (шт.)",
    priceLabel: "Средний чек / цена продажи (сум)",
    cogsLabel: "Себестоимость товара (сум)",
    returnRateLabel: "Процент возвратов / невыкупов (%)",
    logisticsFeeLabel: "Стоимость обратной логистики (сум/шт.)",
    repackRateLabel: "Доля поврежденной упаковки и брака (%)",
    resultsTitle: "Финансовый отчет по скрытым убыткам",
    monthlyReturns: "Возвратов в месяц",
    directLoss: "Прямые расходы на обратную логистику",
    repackLoss: "Потери на переупаковке и уценке брака",
    totalMonthlyLoss: "Итого чистый убыток в месяц",
    totalAnnualLoss: "Годовой скрытый ущерб бизнесу",
    frozenCapital: "Замороженный капитал в пути",
    adviceTitle: "Как eStats помогает сократить процент возвратов?",
    adviceText:
      "Система eStats анализирует отзывы и причины отказов по каждому SKU. Оптимизация размерных сеток и описаний карточек с помощью AI снижает процент возвратов на 3-7%, сберегая миллионы сумов чистой прибыли.",
    ctaButton: "Остановить потери — Подключить eStats",
  },
};

export function ReturnsLossCalculator({ locale = "uz" }: { locale?: ReturnCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const [orders, setOrders] = useState<number>(600);
  const [sellingPrice, setSellingPrice] = useState<number>(140000);
  const [cogs, setCogs] = useState<number>(55000);
  const [returnRate, setReturnRate] = useState<number>(15);
  const [logisticsFee, setLogisticsFee] = useState<number>(12000);
  const [damagedRate, setDamagedRate] = useState<number>(15);

  // Calculations
  const returnsCount = Math.round((orders * returnRate) / 100);
  const directLogisticsLoss = returnsCount * logisticsFee;
  const damagedUnits = Math.round((returnsCount * damagedRate) / 100);
  const packagingAndDamageLoss = damagedUnits * (cogs * 0.3 + 6000);
  const totalMonthlyLoss = directLogisticsLoss + packagingAndDamageLoss;
  const totalAnnualLoss = totalMonthlyLoss * 12;
  const frozenCapital = returnsCount * cogs;

  const formatVal = (val: number) => {
    if (locale === "ru") {
      return `${Math.round(val).toLocaleString("ru-RU")} сум`;
    }
    return formatSum(val);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.ordersLabel}
            </label>
            <input
              type="number"
              min="1"
              value={orders}
              onChange={(e) => setOrders(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.priceLabel}
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.cogsLabel}
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              value={cogs}
              onChange={(e) => setCogs(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.returnRateLabel}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={returnRate}
              onChange={(e) => setReturnRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.logisticsFeeLabel}
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={logisticsFee}
              onChange={(e) => setLogisticsFee(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t.repackRateLabel}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={damagedRate}
              onChange={(e) => setDamagedRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-4">
          <AlertTriangle className="size-4" />
          <span>{t.resultsTitle}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{t.monthlyReturns}</div>
            <div className="mt-2 text-2xl font-black text-foreground">
              {returnsCount} <span className="text-sm font-normal text-muted-foreground">ta tovar</span>
            </div>
            <div className="mt-1 text-xs text-rose-500 font-medium">Jami zakazning {returnRate}% qismi</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{t.directLoss}</div>
            <div className="mt-2 text-2xl font-black text-rose-600">
              {formatVal(directLogisticsLoss)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Logistika va kuryerlikka</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{t.totalMonthlyLoss}</div>
            <div className="mt-2 text-2xl font-black text-rose-600">
              {formatVal(totalMonthlyLoss)}
            </div>
            <div className="mt-1 text-xs text-rose-500 font-bold">Har oy cho'ntagingizdan</div>
          </div>

          <div className="rounded-2xl border border-rose-600 bg-rose-600/10 p-5">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              {t.totalAnnualLoss}
            </div>
            <div className="mt-2 text-2xl font-black text-rose-700">
              {formatVal(totalAnnualLoss)}
            </div>
            <div className="mt-1 text-xs text-rose-600 font-medium">Yo'qotilayotgan toza foyda</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t.frozenCapital}: </span>
            <span className="font-bold text-foreground">{formatVal(frozenCapital)}</span> (aylanmada bo'lmagan tovarlar)
          </div>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-700"
          >
            <span>{t.ctaButton}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Advisory Insight */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span>{t.adviceTitle}</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.adviceText}
        </p>
      </div>
    </div>
  );
}
