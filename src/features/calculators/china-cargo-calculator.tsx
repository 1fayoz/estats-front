"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plane, Truck, Box, ShieldCheck, Sparkles, AlertCircle, Share2, Check } from "lucide-react";
import { formatSum } from "@/lib/format";

export type CargoCalcLocale = "uz" | "ru";

interface Texts {
  title: string;
  subtitle: string;
  currencyLabel: string;
  cnyRateLabel: string;
  usdRateLabel: string;
  unitPriceLabel: string;
  quantityLabel: string;
  weightLabel: string;
  cargoModeLabel: string;
  autoMode: string;
  airMode: string;
  cbmMode: string;
  cargoRateLabel: string;
  chinaDeliveryLabel: string;
  packagingLabel: string;
  insuranceLabel: string;
  defectLabel: string;
  resultsTitle: string;
  landedCostPerUnit: string;
  landedCostUsd: string;
  cargoCostPerUnit: string;
  totalInvestment: string;
  totalWeight: string;
  costStructureTitle: string;
  costPurchase: string;
  costCargo: string;
  costChinaDelivery: string;
  costPackaging: string;
  costBuffer: string;
  recommendedPricesTitle: string;
  marginMin: string;
  marginOpt: string;
  marginHigh: string;
  adviceTitle: string;
  adviceText: string;
  copiedNotice: string;
  copyButton: string;
  ctaButton: string;
}

const TEXTS: Record<CargoCalcLocale, Texts> = {
  uz: {
    title: "Xitoy (1688 / Taobao / Kargo) Tan Narx Kalkulyatori",
    subtitle:
      "1688, Taobao va Xitoy fabrikalaridan tovar olib kelishda yuan kursi, kargo yetkazib berish, sug'urta va qadoqni hisoblab, Toshkentgacha 1 dona tovarning sof tan narxini chiqaring.",
    currencyLabel: "Sotib olish valyutasi",
    cnyRateLabel: "1 Yuan kursi (so'm)",
    usdRateLabel: "1 Dollar kursi (so'm)",
    unitPriceLabel: "1 dona tovar narxi Xitoyda",
    quantityLabel: "Partiya miqdori (dona)",
    weightLabel: "1 dona tovar og'irligi (gramm)",
    cargoModeLabel: "Yetkazib berish (Kargo) usuli",
    autoMode: "Avto / Temiryo'l (14-22 kun, $4.5/kg)",
    airMode: "Avia ekspress (5-8 kun, $7.5/kg)",
    cbmMode: "Hajm / Kub (m³ bo'yicha, $220/m³)",
    cargoRateLabel: "Kargo tarifi ($/kg yoki $/m³)",
    chinaDeliveryLabel: "Xitoy ichida kargogacha yetkazish (Yuan)",
    packagingLabel: "Toshkentda qadoqlash & termo-stiker (so'm/dona)",
    insuranceLabel: "Sug'urta foizi (%)",
    defectLabel: "Brak va yo'qotish zaxirasi (%)",
    resultsTitle: "Toshkentgacha sof tan narx va investitsiya hisobi",
    landedCostPerUnit: "1 dona tovarning to'liq tan narxi",
    landedCostUsd: "Dollarda 1 dona tan narxi",
    cargoCostPerUnit: "1 dona uchun kargo xarajati",
    totalInvestment: "Partiyaning umumiy investitsiyasi",
    totalWeight: "Partiyaning umumiy og'irligi",
    costStructureTitle: "Tan narx tarkibi va xarajatlar taqsimoti",
    costPurchase: "Mahsulot sotib olish",
    costCargo: "Xalqaro kargo",
    costChinaDelivery: "Xitoy ichidagi dostavka",
    costPackaging: "Qadoq va stiker",
    costBuffer: "Sug'urta va brak zaxirasi",
    recommendedPricesTitle: "Uzum Market uchun tavsiya etiladigan sotuv narxlari",
    marginMin: "Minimal narx (30% sof marja)",
    marginOpt: "Optimal narx (50% sof marja)",
    marginHigh: "Maksimal narx (80% sof marja)",
    adviceTitle: "Kargo xarajatini kamaytirish va FIFO hisobini yuritish",
    adviceText:
      "Ko'p sotuvchilar kargo xarajatini tovar ustiga qo'shishni unutib, Uzumda zararga sotishadi. eStats Ombor ERP tizimi Xitoydan kelgan har bir partiyaning kargo va bojxona xarajatlarini avtomatik FIFO usulida tan narxga bog'laydi.",
    copiedNotice: "Hisob natijasi nusxalandi!",
    copyButton: "Natijani ulashish",
    ctaButton: "Partiyani eStats Omborda hisobga olish",
  },
  ru: {
    title: "Калькулятор Себестоимости и Карго из Китая (1688 / Taobao)",
    subtitle:
      "Точный расчет реальной себестоимости товаров из Китая под ключ: курс юаня, тариф карго за кг, доставка по Китаю, упаковка и рекомендуемая розничная цена на Uzum.",
    currencyLabel: "Валюта закупки",
    cnyRateLabel: "Курс юаня (CNY к UZS)",
    usdRateLabel: "Курс доллара (USD к UZS)",
    unitPriceLabel: "Цена за единицу в Китае",
    quantityLabel: "Размер партии (шт.)",
    weightLabel: "Вес 1 единицы (в граммах)",
    cargoModeLabel: "Способ доставки (Карго)",
    autoMode: "Авто / ЖД (14-22 дня, $4.5/кг)",
    airMode: "Авиа экспресс (5-8 дней, $7.5/кг)",
    cbmMode: "Объемная доставка ($220/м³)",
    cargoRateLabel: "Тариф карго ($/кг или $/м³)",
    chinaDeliveryLabel: "Доставка по Китаю до склада карго (Юань)",
    packagingLabel: "Упаковка и термоэтикетка в Ташкенте (сум/шт)",
    insuranceLabel: "Страховка груза (%)",
    defectLabel: "Резерв на брак и бой (%)",
    resultsTitle: "Себестоимость в Ташкенте и расчет партии",
    landedCostPerUnit: "Итого себестоимость 1 единицы",
    landedCostUsd: "Себестоимость в долларах",
    cargoCostPerUnit: "Доля карго на 1 единицу",
    totalInvestment: "Общие инвестиции в партию",
    totalWeight: "Общий вес партии",
    costStructureTitle: "Структура себестоимости под ключ",
    costPurchase: "Закупка товара",
    costCargo: "Международное карго",
    costChinaDelivery: "Доставка по Китаю",
    costPackaging: "Упаковка и маркировка",
    costBuffer: "Страховка и брак",
    recommendedPricesTitle: "Рекомендуемые цены продажи на Uzum Market",
    marginMin: "Минимальная цена (30% маржа)",
    marginOpt: "Оптимальная цена (50% маржа)",
    marginHigh: "Максимальная цена (80% маржа)",
    adviceTitle: "Как не уйти в минус на поставках из Китая?",
    adviceText:
      "Многие селлеры учитывают только цену 1688, забывая про вес коробки, доставку по Китаю и брак. eStats автоматически распределяет расходы на логистику по методу FIFO для каждой пришедшей партии.",
    copiedNotice: "Результат расчета скопирован!",
    copyButton: "Поделиться расчетом",
    ctaButton: "Вести учет партий в eStats WMS",
  },
};

export function ChinaCargoCalculator({ locale = "uz" }: { locale?: CargoCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  // State
  const [currency, setCurrency] = useState<"cny" | "usd">("cny");
  const [cnyRate, setCnyRate] = useState<number>(1820);
  const [usdRate, setUsdRate] = useState<number>(12950);
  const [unitPurchasePrice, setUnitPurchasePrice] = useState<number>(15); // e.g. 15 Yuan
  const [quantity, setQuantity] = useState<number>(500); // 500 pcs
  const [unitWeightGrams, setUnitWeightGrams] = useState<number>(180); // 180 grams
  const [cargoMode, setCargoMode] = useState<"auto" | "air" | "cbm">("auto");
  const [cargoRate, setCargoRate] = useState<number>(4.5); // $4.50 / kg
  const [chinaDeliveryCny, setChinaDeliveryCny] = useState<number>(40); // 40 Yuan
  const [packagingPerUnit, setPackagingPerUnit] = useState<number>(1200); // 1,200 UZS
  const [insurancePercent, setInsurancePercent] = useState<number>(1.5); // 1.5%
  const [defectPercent, setDefectPercent] = useState<number>(2.5); // 2.5%
  const [copied, setCopied] = useState<boolean>(false);

  // Auto cargo rate change when switching modes
  const handleCargoModeChange = (mode: "auto" | "air" | "cbm") => {
    setCargoMode(mode);
    if (mode === "auto") setCargoRate(4.5);
    else if (mode === "air") setCargoRate(7.5);
    else if (mode === "cbm") setCargoRate(220);
  };

  // Calculations
  const activeExchangeRate = currency === "cny" ? cnyRate : usdRate;
  const purchaseCostUzs = unitPurchasePrice * activeExchangeRate;

  const totalWeightKg = (quantity * unitWeightGrams) / 1000;
  
  // Cargo cost per unit in UZS
  let cargoCostUzs = 0;
  if (cargoMode === "cbm") {
    // Approx volumetric: standard 1000kg = 5-6 m3 or simple estimate
    const estimatedCbm = (quantity * unitWeightGrams * 0.000003); // approx cubic meter
    cargoCostUzs = quantity > 0 ? (estimatedCbm * cargoRate * usdRate) / quantity : 0;
  } else {
    cargoCostUzs = (unitWeightGrams / 1000) * cargoRate * usdRate;
  }

  // China delivery per unit in UZS
  const chinaDeliveryUzs = quantity > 0 ? (chinaDeliveryCny * cnyRate) / quantity : 0;

  // Insurance & defect buffers
  const insuranceUzs = purchaseCostUzs * (insurancePercent / 100);
  const defectBufferUzs = purchaseCostUzs * (defectPercent / 100);

  // Total Landed Cost per unit in UZS
  const landedCostUzs = Math.round(
    purchaseCostUzs + cargoCostUzs + chinaDeliveryUzs + packagingPerUnit + insuranceUzs + defectBufferUzs
  );

  const landedCostUsd = usdRate > 0 ? (landedCostUzs / usdRate).toFixed(2) : "0.00";
  const cargoCostUsd = usdRate > 0 ? (cargoCostUzs / usdRate).toFixed(2) : "0.00";
  const totalInvestmentUzs = landedCostUzs * quantity;

  // Share percentages
  const pctPurchase = landedCostUzs > 0 ? Math.round((purchaseCostUzs / landedCostUzs) * 100) : 0;
  const pctCargo = landedCostUzs > 0 ? Math.round((cargoCostUzs / landedCostUzs) * 100) : 0;
  const pctDelivery = landedCostUzs > 0 ? Math.round((chinaDeliveryUzs / landedCostUzs) * 100) : 0;
  const pctPackaging = landedCostUzs > 0 ? Math.round((packagingPerUnit / landedCostUzs) * 100) : 0;
  const pctBuffer = 100 - (pctPurchase + pctCargo + pctDelivery + pctPackaging);

  // Recommended selling prices on Uzum (assuming ~20% avg marketplace commission + logistics)
  // formula: Price = LandedCost / (1 - UzumComm(0.20) - NetMargin)
  const calcSellingPrice = (targetMargin: number) => {
    const divisor = 1 - 0.20 - targetMargin;
    if (divisor <= 0.1) return Math.round(landedCostUzs * 2.5);
    return Math.round(landedCostUzs / divisor);
  };

  const price30 = calcSellingPrice(0.30);
  const price50 = calcSellingPrice(0.50);
  const price80 = calcSellingPrice(0.80);

  const handleCopy = () => {
    const text = `${t.title}\n` +
      `📦 1 dona tovar tan narxi: ${formatSum(landedCostUzs)} so'm ($${landedCostUsd})\n` +
      `✈️ Kargo ulushi: ${formatSum(Math.round(cargoCostUzs))} so'm ($${cargoCostUsd})\n` +
      `💰 Partiya investitsiyasi: ${formatSum(totalInvestmentUzs)} so'm\n` +
      `🏷 Uzumda tavsiya sotuv narxi: ${formatSum(price50)} so'm (50% marja)\n` +
      `👉 Hisob-kitob: https://estats.uz/kalkulyator/kargo`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Truck className="w-4 h-4" />
          <span>1688 • Taobao • Alibaba • Yiwu</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Parameters Column */}
        <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
            <span>Parametrlar</span>
            <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setCurrency("cny")}
                className={`px-3 py-1 rounded font-semibold transition ${
                  currency === "cny" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ¥ Yuan (CNY)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("usd")}
                className={`px-3 py-1 rounded font-semibold transition ${
                  currency === "usd" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                $ Dollar (USD)
              </button>
            </div>
          </h2>

          {/* Currency exchange rate settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.cnyRateLabel}
              </label>
              <input
                type="number"
                value={cnyRate}
                onChange={(e) => setCnyRate(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.usdRateLabel}
              </label>
              <input
                type="number"
                value={usdRate}
                onChange={(e) => setUsdRate(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Product basic params */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.unitPriceLabel} ({currency === "cny" ? "¥" : "$"})
              </label>
              <input
                type="number"
                step="0.1"
                value={unitPurchasePrice}
                onChange={(e) => setUnitPurchasePrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.quantityLabel}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.weightLabel}
              </label>
              <input
                type="number"
                value={unitWeightGrams}
                onChange={(e) => setUnitWeightGrams(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Cargo mode tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              {t.cargoModeLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCargoModeChange("auto")}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition text-left ${
                  cargoMode === "auto"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <Truck className="w-4 h-4 shrink-0" />
                <span>Avto / Temiryo'l ($4.5/kg)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCargoModeChange("air")}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition text-left ${
                  cargoMode === "air"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <Plane className="w-4 h-4 shrink-0" />
                <span>Avia Express ($7.5/kg)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCargoModeChange("cbm")}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition text-left ${
                  cargoMode === "cbm"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:border-muted-foreground/30 bg-background text-muted-foreground"
                }`}
              >
                <Box className="w-4 h-4 shrink-0" />
                <span>Hajmiy / Kub ($220/m³)</span>
              </button>
            </div>
          </div>

          {/* Cargo rate custom override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.cargoRateLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={cargoRate}
                onChange={(e) => setCargoRate(Math.max(0.1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.chinaDeliveryLabel}
              </label>
              <input
                type="number"
                value={chinaDeliveryCny}
                onChange={(e) => setChinaDeliveryCny(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Packaging, Insurance, Defect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.packagingLabel}
              </label>
              <input
                type="number"
                value={packagingPerUnit}
                onChange={(e) => setPackagingPerUnit(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.insuranceLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={insurancePercent}
                onChange={(e) => setInsurancePercent(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.defectLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={defectPercent}
                onChange={(e) => setDefectPercent(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Results Column */}
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

            {/* Giant Landed Cost Card */}
            <div className="bg-background/80 backdrop-blur rounded-xl p-5 border border-primary/30 space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {t.landedCostPerUnit}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-primary">
                  {formatSum(landedCostUzs)}
                </span>
                <span className="text-sm font-bold text-muted-foreground">so'm</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ <span className="font-semibold text-foreground">${landedCostUsd}</span> / dona ({t.landedCostUsd})
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                  {t.cargoCostPerUnit}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatSum(Math.round(cargoCostUzs))} so'm
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  (${cargoCostUsd})
                </span>
              </div>

              <div className="bg-background rounded-xl p-3 border border-border">
                <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                  {t.totalWeight}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {totalWeightKg.toFixed(1)} kg
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {quantity} dona
                </span>
              </div>
            </div>

            <div className="bg-background rounded-xl p-3 border border-border">
              <span className="block text-[11px] font-medium text-muted-foreground mb-0.5">
                {t.totalInvestment}
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatSum(totalInvestmentUzs)} so'm
              </span>
              <span className="block text-[11px] text-muted-foreground">
                ≈ ${(totalInvestmentUzs / usdRate).toFixed(0)} investitsiya
              </span>
            </div>

            {/* Cost breakdown progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{t.costStructureTitle}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                <div style={{ width: `${pctPurchase}%` }} className="bg-indigo-500" title={`${t.costPurchase}: ${pctPurchase}%`} />
                <div style={{ width: `${pctCargo}%` }} className="bg-sky-500" title={`${t.costCargo}: ${pctCargo}%`} />
                <div style={{ width: `${pctDelivery}%` }} className="bg-amber-500" title={`${t.costChinaDelivery}: ${pctDelivery}%`} />
                <div style={{ width: `${pctPackaging}%` }} className="bg-emerald-500" title={`${t.costPackaging}: ${pctPackaging}%`} />
                <div style={{ width: `${Math.max(0, pctBuffer)}%` }} className="bg-rose-500" title={`${t.costBuffer}: ${pctBuffer}%`} />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> {t.costPurchase}: {pctPurchase}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> {t.costCargo}: {pctCargo}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> {t.costChinaDelivery}: {pctDelivery}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {t.costPackaging}: {pctPackaging}%</span>
              </div>
            </div>

            {/* Recommended Selling Prices for Uzum */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.recommendedPricesTitle}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border text-xs">
                  <span className="font-medium text-muted-foreground">{t.marginMin}</span>
                  <span className="font-bold text-foreground">{formatSum(price30)} so'm</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-xs">
                  <span className="font-semibold text-primary">{t.marginOpt}</span>
                  <span className="font-extrabold text-primary">{formatSum(price50)} so'm</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border text-xs">
                  <span className="font-medium text-muted-foreground">{t.marginHigh}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatSum(price80)} so'm</span>
                </div>
              </div>
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

          {/* Expert tip banner */}
          <div className="p-4 rounded-xl border border-border bg-card/60 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block">{t.adviceTitle}</span>
              <p>{t.adviceText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
