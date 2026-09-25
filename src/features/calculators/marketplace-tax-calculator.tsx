"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Landmark, ShieldAlert, Sparkles, Check, Share2, HelpCircle, FileText } from "lucide-react";
import { formatSum } from "@/lib/format";

export type TaxCalcLocale = "uz" | "ru";

interface Texts {
  title: string;
  subtitle: string;
  entityTypeLabel: string;
  yatt: string;
  mchj: string;
  monthlyRevenueLabel: string;
  taxRateLabel: string;
  taxRate4: string;
  taxRate2: string;
  taxRate1: string;
  hasEmployeesLabel: string;
  employeesCountLabel: string;
  cogsPercentLabel: string;
  uzumCommPercentLabel: string;
  resultsTitle: string;
  turnoverTax: string;
  socialTax: string;
  totalTax: string;
  taxBurdenPct: string;
  netIncome: string;
  vatLimitTitle: string;
  vatLimitRemaining: string;
  vatWarningText: string;
  vatSafeText: string;
  optimizationTipsTitle: string;
  optimizationTipsText: string;
  copiedNotice: string;
  copyButton: string;
  ctaButton: string;
}

const TEXTS: Record<TaxCalcLocale, Texts> = {
  uz: {
    title: "O'zbekiston Marketpleys Soliq Kalkulyatori (2026)",
    subtitle:
      "Uzum Market, Wildberries va Yandex'da savdo qiluvchi YaTT va MChJlar uchun 4% aylanma soliq, ijtimoiy soliq va 1 mlrd so'mlik QQS chegarasini aniq hisoblang.",
    entityTypeLabel: "Tadbirkorlik shakli",
    yatt: "YaTT (Yakka tartibdagi tadbirkor)",
    mchj: "MChJ (Yuridik shaxs / OOO)",
    monthlyRevenueLabel: "Oylik umumiy aylanma (sotuv tushumi, so'm)",
    taxRateLabel: "Aylanmadan soliq stavkasi",
    taxRate4: "4% — Standart aylanma soliq",
    taxRate2: "2% — Maxsus / Hududiy chegirma",
    taxRate1: "1% — E-tijorat imtiyozli stavkasi",
    hasEmployeesLabel: "Xodimlar bormi?",
    employeesCountLabel: "Xodimlar soni (kishi)",
    cogsPercentLabel: "Tovar tan narxi ulushi (% da)",
    uzumCommPercentLabel: "Uzum komissiyasi & logistika ulushi (% da)",
    resultsTitle: "Oylik soliq majburiyatlari va sof foyda",
    turnoverTax: "Aylanmadan olinadigan soliq (4%)",
    socialTax: "Ijtimoiy soliq (BHM)",
    totalTax: "Jami to'lanadigan soliqlar",
    taxBurdenPct: "Aylanmaga nisbatan soliq yuki",
    netIncome: "Soliq va xarajatlardan keyingi sof foyda",
    vatLimitTitle: "QQS 12% (1 milliard so'm) xavfi tahlili",
    vatLimitRemaining: "1 mlrd QQS chegarasigacha qolgan oylik zaxira",
    vatWarningText:
      "DIQQAT: Joriy sur'atda yillik aylanmangiz 1 milliard so'mdan oshadi va avtomatik 12% QQS to'lovchisiga aylanasiz! Moliya auditini rejalashtiring.",
    vatSafeText:
      "Sizning aylanmangiz 1 milliard so'mlik xavfsiz zonada. QQS to'lash majburiyati yuzaga kelmaydi.",
    optimizationTipsTitle: "Marketpleysda soliqni qonuniy optimallashtirish",
    optimizationTipsText:
      "Uzum Market chek urib berganda, soliq aylanmasi umumiy savdodan hisoblanadi. Agar to'lovlar elektron tijorat mezonlariga javob bersa, imtiyozli 1-2% stavkani qo'llash orqali har oy millionlab so'm tejash mumkin. eStats Moliya moduli barcha tushum va xarajatlarni 1 daqiqada tayyorlab beradi.",
    copiedNotice: "Hisob natijasi nusxalandi!",
    copyButton: "Natijani ulashish",
    ctaButton: "Moliyaviy PnL hisobotini eStats'da ko'rish",
  },
  ru: {
    title: "Налоговый Калькулятор Маркетплейсов в Узбекистане (2026)",
    subtitle:
      "Расчет налога 4% с оборота, социального налога и лимита НДС 1 млрд сумов для ИП и ООО, торгующих на Uzum Market, Wildberries и Яндекс Маркет.",
    entityTypeLabel: "Форма деятельности",
    yatt: "ИП (ЯТТ — Индивидуальный предприниматель)",
    mchj: "ООО (МЧЖ — Юридическое лицо)",
    monthlyRevenueLabel: "Общий месячный оборот (выручка, сум)",
    taxRateLabel: "Ставка налога с оборота",
    taxRate4: "4% — Стандартный налог с оборота",
    taxRate2: "2% — Региональная льготная ставка",
    taxRate1: "1% — Льгота электронной коммерции",
    hasEmployeesLabel: "Есть наемные сотрудники?",
    employeesCountLabel: "Количество сотрудников (чел.)",
    cogsPercentLabel: "Доля себестоимости закупки товаров (%):",
    uzumCommPercentLabel: "Комиссия и логистика Uzum (%):",
    resultsTitle: "Расчет налогов и чистый остаток на руки",
    turnoverTax: "Налог с оборота",
    socialTax: "Социальный налог",
    totalTax: "Итого налоговые выплаты",
    taxBurdenPct: "Налоговая нагрузка от выручки",
    netIncome: "Чистая прибыль после налогов и расходов",
    vatLimitTitle: "Мониторинг порога НДС 12% (1 млрд сумов)",
    vatLimitRemaining: "Запас оборота до порога НДС 1 млрд",
    vatWarningText:
      "ВНИМАНИЕ: При таких темпах ваш годовой оборот превысит 1 млрд сумов, что обязывает перейти на НДС 12% и налог на прибыль! Подготовьте учет.",
    vatSafeText:
      "Ваш оборот находится в безопасной зоне до 1 миллиарда сумов. Риска принудительного перехода на НДС нет.",
    optimizationTipsTitle: "Как законно снизить налоги на маркетплейсах?",
    optimizationTipsText:
      "Поскольку Uzum Market формирует фискальные чеки, выручка фиксируется в ОФД автоматически. Использование льготных ставок электронной торговли позволяет существенно сократить платежи. eStats автоматически формирует PnL отчетность.",
    copiedNotice: "Результат расчета скопирован!",
    copyButton: "Поделиться расчетом",
    ctaButton: "Автоматизировать учет налогов в eStats",
  },
};

const BHM = 375000; // Bazaviy hisoblash miqdori (2026)

export function MarketplaceTaxCalculator({ locale = "uz" }: { locale?: TaxCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const [entityType, setEntityType] = useState<"yatt" | "mchj">("yatt");
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(60000000); // 60M UZS default
  const [taxRate, setTaxRate] = useState<number>(4); // 4% default
  const [hasEmployees, setHasEmployees] = useState<boolean>(false);
  const [employeesCount, setEmployeesCount] = useState<number>(1);
  const [cogsPercent, setCogsPercent] = useState<number>(45); // 45% COGS
  const [uzumCommPercent, setUzumCommPercent] = useState<number>(20); // 20% commission
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const turnoverTaxAmount = Math.round(monthlyRevenue * (taxRate / 100));

  let socialTaxAmount = 0;
  if (entityType === "yatt") {
    // YaTT pays 1 BHM for self + 0.5 BHM per employee if any
    socialTaxAmount = BHM + (hasEmployees ? employeesCount * (BHM * 0.5) : 0);
  } else {
    // MChJ minimum social tax estimation (~12% of minimum wage per worker)
    const count = hasEmployees ? employeesCount : 1;
    socialTaxAmount = count * BHM * 1.2;
  }

  const totalTaxAmount = turnoverTaxAmount + Math.round(socialTaxAmount);
  const taxBurdenPercentage = monthlyRevenue > 0 ? ((totalTaxAmount / monthlyRevenue) * 100).toFixed(1) : "0";

  // Approximate Net Profit
  const cogsAmount = Math.round(monthlyRevenue * (cogsPercent / 100));
  const commissionAmount = Math.round(monthlyRevenue * (uzumCommPercent / 100));
  const netIncomeAmount = Math.max(0, monthlyRevenue - cogsAmount - commissionAmount - totalTaxAmount);

  // Annualized turnover & VAT limit check (1,000,000,000 UZS)
  const annualProjectedRevenue = monthlyRevenue * 12;
  const isVatRisk = annualProjectedRevenue >= 1000000000;
  const vatLimitBuffer = Math.max(0, 1000000000 - annualProjectedRevenue);

  const handleCopy = () => {
    const text = `${t.title}\n` +
      `🏛️ Faoliyat turi: ${entityType === "yatt" ? "YaTT" : "MChJ"}\n` +
      `📈 Oylik tushum: ${formatSum(monthlyRevenue)} so'm\n` +
      `💰 Aylanma soliq (${taxRate}%): ${formatSum(turnoverTaxAmount)} so'm\n` +
      `👥 Ijtimoiy soliq: ${formatSum(Math.round(socialTaxAmount))} so'm\n` +
      `💵 Sof qoladigan daromad: ${formatSum(netIncomeAmount)} so'm\n` +
      `👉 Hisob-kitob: https://estats.uz/kalkulyator/soliq`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Landmark className="w-4 h-4" />
          <span>O'zbekiston Soliq Kodeksi • YaTT & MChJ • QQS 12%</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Soliq parametrlari</span>
            <span className="text-xs font-normal text-muted-foreground">BHM = {formatSum(BHM)} so'm</span>
          </h2>

          {/* Entity Type Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              {t.entityTypeLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEntityType("yatt")}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                  entityType === "yatt"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <span>{t.yatt}</span>
                {entityType === "yatt" && <Check className="w-4 h-4 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setEntityType("mchj")}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                  entityType === "mchj"
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <span>{t.mchj}</span>
                {entityType === "mchj" && <Check className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>

          {/* Monthly Revenue Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t.monthlyRevenueLabel}
              </label>
              <span className="text-xs font-bold text-primary">
                {formatSum(monthlyRevenue)} so'm
              </span>
            </div>
            <input
              type="number"
              step="1000000"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
            {/* Quick shortcuts */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[20000000, 50000000, 80000000, 150000000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setMonthlyRevenue(amount)}
                  className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition"
                >
                  {formatSum(amount / 1000000)} mln
                </button>
              ))}
            </div>
          </div>

          {/* Tax rate select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              {t.taxRateLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaxRate(4)}
                className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                  taxRate === 4
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span>{t.taxRate4}</span>
              </button>

              <button
                type="button"
                onClick={() => setTaxRate(2)}
                className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                  taxRate === 2
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span>{t.taxRate2}</span>
              </button>

              <button
                type="button"
                onClick={() => setTaxRate(1)}
                className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                  taxRate === 1
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span>{t.taxRate1}</span>
              </button>
            </div>
          </div>

          {/* Employees */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{t.hasEmployeesLabel}</span>
              <button
                type="button"
                onClick={() => setHasEmployees(!hasEmployees)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasEmployees ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                    hasEmployees ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {hasEmployees && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t.employeesCountLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={employeesCount}
                  onChange={(e) => setEmployeesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Margin & Commission Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span>{t.cogsPercentLabel}</span>
                <span className="font-bold text-foreground">{cogsPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={cogsPercent}
                onChange={(e) => setCogsPercent(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span>{t.uzumCommPercentLabel}</span>
                <span className="font-bold text-foreground">{uzumCommPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={uzumCommPercent}
                onChange={(e) => setUzumCommPercent(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-card to-muted/40 border-2 border-primary/20 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>{t.resultsTitle}</span>
              </h2>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-background border border-border hover:bg-muted transition text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedNotice : t.copyButton}</span>
              </button>
            </div>

            {/* Total Tax Payment */}
            <div className="bg-background/80 backdrop-blur rounded-xl p-5 border border-primary/30 space-y-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {t.totalTax}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-500 dark:text-rose-400">
                  {formatSum(totalTaxAmount)}
                </span>
                <span className="text-sm font-bold text-muted-foreground">so'm/oy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Aylanmaning <span className="font-bold text-foreground">{taxBurdenPercentage}%</span> qismi soliqqa ketadi
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                  {t.turnoverTax}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatSum(turnoverTaxAmount)} so'm
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Stavka: {taxRate}%
                </span>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                  {t.socialTax}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatSum(Math.round(socialTaxAmount))} so'm
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Har oy qat'iy
                </span>
              </div>
            </div>

            {/* Net take-home profit */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {t.netIncome}
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatSum(netIncomeAmount)} so'm
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tan narx ({cogsPercent}%) va Uzum komissiyasi ({uzumCommPercent}%) chiqarib tashlangandan so'ng.
              </p>
            </div>

            {/* 1 Billion VAT Limit Alert */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              isVatRisk
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : "bg-background border-border text-muted-foreground"
            }`}>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldAlert className={`w-4 h-4 ${isVatRisk ? "text-amber-500" : "text-emerald-500"}`} />
                <span>{t.vatLimitTitle}</span>
              </div>
              <p className="leading-relaxed">
                {isVatRisk ? t.vatWarningText : t.vatSafeText}
              </p>
              {!isVatRisk && (
                <div className="text-[11px] font-medium text-foreground pt-1">
                  {t.vatLimitRemaining}: <span className="font-bold text-primary">{formatSum(vatLimitBuffer)} so'm</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-md text-sm"
            >
              <span>{t.ctaButton}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Advice callout */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block">{t.optimizationTipsTitle}</span>
              <p>{t.optimizationTipsText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
