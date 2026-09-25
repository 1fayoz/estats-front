"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Plus, Trash2, Sparkles, Check, Share2, AlertTriangle, Layers, RotateCcw } from "lucide-react";
import { formatSum } from "@/lib/format";

export type AbcCalcLocale = "uz" | "ru" | "en";

interface ProductItem {
  id: string;
  name: string;
  revenue: number;
}

const DEFAULT_PRODUCTS: Record<AbcCalcLocale, ProductItem[]> = {
  uz: [
    { id: "1", name: "Simsiz quloqchin Pro Max", revenue: 45000000 },
    { id: "2", name: "Smart soat Ultra 8", revenue: 28000000 },
    { id: "3", name: "Powerbank 20000 mAh", revenue: 14000000 },
    { id: "4", name: "Avtomobil telefon ushlagich", revenue: 7000000 },
    { id: "5", name: "Fast Charge Type-C kabel", revenue: 4000000 },
    { id: "6", name: "Silikon chexol iPhone", revenue: 1500000 },
    { id: "7", name: "Zashitnik shisha 9D", revenue: 800000 },
  ],
  ru: [
    { id: "1", name: "Беспроводные наушники Pro", revenue: 45000000 },
    { id: "2", name: "Умные часы Ultra 8", revenue: 28000000 },
    { id: "3", name: "Повербанк 20000 mAh", revenue: 14000000 },
    { id: "4", name: "Автодержатель для телефона", revenue: 7000000 },
    { id: "5", name: "Кабель Type-C Fast Charge", revenue: 4000000 },
    { id: "6", name: "Силиконовый чехол iPhone", revenue: 1500000 },
    { id: "7", name: "Защитное стекло 9D", revenue: 800000 },
  ],
  en: [
    { id: "1", name: "Wireless Earbuds Pro Max", revenue: 45000000 },
    { id: "2", name: "Smart Watch Ultra 8", revenue: 28000000 },
    { id: "3", name: "Power Bank 20000 mAh", revenue: 14000000 },
    { id: "4", name: "Car Phone Mount Holder", revenue: 7000000 },
    { id: "5", name: "Fast Charge Type-C Cable", revenue: 4000000 },
    { id: "6", name: "Silicone Phone Case", revenue: 1500000 },
    { id: "7", name: "9D Screen Protector", revenue: 800000 },
  ],
};

const TEXTS: Record<AbcCalcLocale, {
  title: string;
  subtitle: string;
  addProduct: string;
  resetDefault: string;
  productCol: string;
  revenueCol: string;
  shareCol: string;
  groupCol: string;
  totalRevenue: string;
  groupATitle: string;
  groupBTitle: string;
  groupCTitle: string;
  groupADesc: string;
  groupBDesc: string;
  groupCDesc: string;
  adviceTitle: string;
  adviceText: string;
  copyButton: string;
  copiedNotice: string;
  ctaButton: string;
}> = {
  uz: {
    title: "ABC / XYZ Tovar Portfeli va Savdo Tahlili Kalkulyatori",
    subtitle:
      "Pareto qoidasi bo'yicha tovarlaringizni A (80% tushum), B (15%) va C (5%) toifalarga ajrating. Qaysi tovarlar ko'proq foyda keltirishi va qaysilari pulni muzlatib yotganini aniqlang.",
    addProduct: "Yangi tovar qo'shish",
    resetDefault: "Namunani qaytarish",
    productCol: "Tovar nomi / SKU",
    revenueCol: "Oylik tushum (so'm)",
    shareCol: "Ulush va Akkumulyatsiya",
    groupCol: "ABC Toifasi",
    totalRevenue: "Jami oylik tushum",
    groupATitle: "A Toifasi (Lokomotivlar — 80%)",
    groupBTitle: "B Toifasi (Barqaror — 15%)",
    groupCTitle: "C Toifasi (O'lik zaxira — 5%)",
    groupADesc: "Do'koningiz daromadining asosiy qismini tashkil qiladi. Zaxirasini doim nazorat qiling, hech qachon tugab qolmasin.",
    groupBDesc: "O'rtacha aylanmali barqaror tovarlar. Ularni me'yoriy partiyalar bilan ta'minlang.",
    groupCDesc: "Kam aylanmali tovarlar. Ularni zudlik bilan chegirma va aksiyalarga qo'yib, aylanma mablag'ni qaytarib oling.",
    adviceTitle: "eStats Ombor bilan zaxirani avtomatlashtirish",
    adviceText:
      "eStats avtomatlashgan ABC-tahlili orqali A toifasidagi tovarlar uchun Reorder Point (zaxira buyurtma vaqti)ni o'zi hisoblab, tovar tugashidan 10 kun oldin ogohlantiradi.",
    copyButton: "Natijani ulashish",
    copiedNotice: "Nusxalandi!",
    ctaButton: "Tovarlarni eStats Omborda boshqarish",
  },
  ru: {
    title: "ABC-Анализ Товаров и Склада для Маркетплейсов",
    subtitle:
      "Сегментация товарной матрицы по правилу Парето: выявите локомотивы (группа А — 80% выручки), стабильные товары (B) и неликвид (C), замораживающий деньги.",
    addProduct: "Добавить товар",
    resetDefault: "Сбросить к образцу",
    productCol: "Название товара / SKU",
    revenueCol: "Выручка за месяц (сум)",
    shareCol: "Доля и накопление",
    groupCol: "Группа ABC",
    totalRevenue: "Общая выручка матрицы",
    groupATitle: "Группа А (Локомотивы — 80%)",
    groupBTitle: "Группа B (Стабильные — 15%)",
    groupCTitle: "Группа C (Неликвид — 5%)",
    groupADesc: "Главные генераторы прибыли. Обеспечьте нулевой риск Out of Stock.",
    groupBDesc: "Товары со средней стабильной оборачиваемостью. Поддерживайте базовый складской остаток.",
    groupCDesc: "Замороженный капитал. Запустите распродажи или акции, чтобы высвободить оборотные средства.",
    adviceTitle: "Как eStats автоматизирует управление остатками?",
    adviceText:
      "eStats WMS ежедневно проводит ABC/XYZ анализ ваших карточек и подсказывает, какие поставки нужно срочно оформить, а какие карточки отключить от рекламы.",
    copyButton: "Поделиться расчетом",
    copiedNotice: "Скопировано!",
    ctaButton: "Подключить eStats WMS",
  },
  en: {
    title: "Marketplace Inventory ABC Analysis Calculator",
    subtitle:
      "Classify your product catalog using Pareto's 80/20 rule: identify revenue drivers (Group A), steady sellers (Group B), and dead stock (Group C).",
    addProduct: "Add product",
    resetDefault: "Reset to sample",
    productCol: "Product name / SKU",
    revenueCol: "Monthly revenue (UZS)",
    shareCol: "Share & Cumulative",
    groupCol: "ABC Group",
    totalRevenue: "Total catalog revenue",
    groupATitle: "Group A (Top Drivers — 80%)",
    groupBTitle: "Group B (Steady Sellers — 15%)",
    groupCTitle: "Group C (Deadweight Stock — 5%)",
    groupADesc: "Core high-revenue earners. Keep in stock at all times to prevent sales drops.",
    groupBDesc: "Moderate and consistent sellers. Order regular safety stock batches.",
    groupCDesc: "Low velocity items. Discount or bundle to liberate working capital.",
    adviceTitle: "Automated Inventory Replenishment with eStats",
    adviceText:
      "eStats provides live ABC/XYZ analytics, calculating real-time safety stock and reorder dates for your multi-channel marketplace operations.",
    copyButton: "Share analysis",
    copiedNotice: "Copied!",
    ctaButton: "Manage Inventory with eStats",
  },
};

export function AbcAnalysisCalculator({ locale = "uz" }: { locale?: AbcCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS[locale] || DEFAULT_PRODUCTS.uz);
  const [copied, setCopied] = useState<boolean>(false);

  // Sorting & ABC calculations
  const analysisData = useMemo(() => {
    const totalRev = products.reduce((acc, p) => acc + (Number(p.revenue) || 0), 0);
    const sorted = [...products].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));

    let accumulatedRev = 0;
    const classified = sorted.map((p) => {
      const rev = Number(p.revenue) || 0;
      accumulatedRev += rev;
      const share = totalRev > 0 ? (rev / totalRev) * 100 : 0;
      const cumulativeShare = totalRev > 0 ? (accumulatedRev / totalRev) * 100 : 0;

      let group: "A" | "B" | "C" = "C";
      // standard cutoff: up to 80% -> A, 80-95% -> B, >95% -> C
      if (cumulativeShare - share < 80) {
        group = "A";
      } else if (cumulativeShare - share < 95) {
        group = "B";
      } else {
        group = "C";
      }

      return {
        ...p,
        revenue: rev,
        share: Number(share.toFixed(1)),
        cumulativeShare: Number(cumulativeShare.toFixed(1)),
        group,
      };
    });

    const countA = classified.filter((p) => p.group === "A").length;
    const countB = classified.filter((p) => p.group === "B").length;
    const countC = classified.filter((p) => p.group === "C").length;

    const revA = classified.filter((p) => p.group === "A").reduce((acc, p) => acc + p.revenue, 0);
    const revB = classified.filter((p) => p.group === "B").reduce((acc, p) => acc + p.revenue, 0);
    const revC = classified.filter((p) => p.group === "C").reduce((acc, p) => acc + p.revenue, 0);

    return {
      totalRev,
      items: classified,
      countA,
      countB,
      countC,
      revA,
      revB,
      revC,
    };
  }, [products]);

  const handleUpdate = (id: string, field: "name" | "revenue", value: string | number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "revenue" ? Math.max(0, Number(value)) : value,
          };
        }
        return item;
      })
    );
  };

  const handleAddRow = () => {
    const newId = String(Date.now());
    setProducts((prev) => [
      ...prev,
      { id: newId, name: `Yangi tovar #${prev.length + 1}`, revenue: 2000000 },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (products.length <= 1) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReset = () => {
    setProducts(DEFAULT_PRODUCTS[locale] || DEFAULT_PRODUCTS.uz);
  };

  const handleCopy = () => {
    const text = `${t.title}\n` +
      `💰 Jami tushum: ${formatSum(analysisData.totalRev)} so'm\n` +
      `🟢 A toifasi: ${analysisData.countA} ta tovar (${formatSum(analysisData.revA)} so'm)\n` +
      `🟡 B toifasi: ${analysisData.countB} ta tovar (${formatSum(analysisData.revB)} so'm)\n` +
      `🔴 C toifasi: ${analysisData.countC} ta tovar (${formatSum(analysisData.revC)} so'm)\n` +
      `👉 Hisob-kitob: https://estats.uz/kalkulyator/abc-tahlil`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <BarChart3 className="w-4 h-4" />
          <span>Pareto 80/20 • Ombor Nazorati • SKU Auditi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-muted-foreground block mb-1">
            {t.totalRevenue}
          </span>
          <div className="text-xl font-black text-foreground">
            {formatSum(analysisData.totalRev)} so'm
          </div>
          <span className="text-[11px] text-muted-foreground">
            {products.length} ta SKU tahlil qilindi
          </span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              🟢 A toifasi (80%)
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              {analysisData.countA} ta
            </span>
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {formatSum(analysisData.revA)} so'm
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Asosiy lokomotivlar</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              🟡 B toifasi (15%)
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
              {analysisData.countB} ta
            </span>
          </div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400">
            {formatSum(analysisData.revB)} so'm
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Barqaror aylanma</p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              🔴 C toifasi (5%)
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300">
              {analysisData.countC} ta
            </span>
          </div>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400">
            {formatSum(analysisData.revC)} so'm
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">O'lik zaxira / Sekin</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Tovar matritsasi</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDefault}</span>
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addProduct}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedNotice : t.copyButton}</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">№</th>
                <th className="py-2.5 px-3 min-w-[200px]">{t.productCol}</th>
                <th className="py-2.5 px-3 min-w-[150px]">{t.revenueCol}</th>
                <th className="py-2.5 px-3 min-w-[130px]">{t.shareCol}</th>
                <th className="py-2.5 px-3 min-w-[100px] text-center">{t.groupCol}</th>
                <th className="py-2.5 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {analysisData.items.map((item, index) => {
                let badgeClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
                if (item.group === "A") {
                  badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black";
                } else if (item.group === "B") {
                  badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold";
                }

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3 text-center text-muted-foreground font-mono font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdate(item.id, "name", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-input bg-background font-medium text-foreground focus:ring-1 focus:ring-primary outline-none text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="100000"
                        value={item.revenue}
                        onChange={(e) => handleUpdate(item.id, "revenue", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-input bg-background font-bold text-foreground focus:ring-1 focus:ring-primary outline-none text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-foreground">{item.share}%</span>
                          <span className="text-muted-foreground">({item.cumulativeShare}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            style={{ width: `${item.share}%` }}
                            className={`h-full ${
                              item.group === "A" ? "bg-emerald-500" : item.group === "B" ? "bg-amber-500" : "bg-rose-500"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs border ${badgeClass}`}>
                        Guruh {item.group}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(item.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t.groupATitle}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.groupADesc}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{t.groupBTitle}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.groupBDesc}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>{t.groupCTitle}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.groupCDesc}
          </p>
        </div>
      </div>

      {/* Bottom Advice Banner */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t.adviceTitle}</span>
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {t.adviceText}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm text-xs whitespace-nowrap"
        >
          <span>{t.ctaButton}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
