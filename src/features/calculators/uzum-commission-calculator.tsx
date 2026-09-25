"use client";

import { useId, useState } from "react";
import { Calculator } from "lucide-react";

export type CalculatorLocale = "uz" | "ru" | "en";

interface CategoryRate {
  name: Record<CalculatorLocale, string>;
  commission: number; // in percent
  logisticsFee: number; // in UZS
}

const CATEGORIES: CategoryRate[] = [
  {
    name: {
      uz: "Kiyim va poyabzal (18%)",
      ru: "Одежда и обувь (18%)",
      en: "Clothing & Footwear (18%)",
    },
    commission: 18,
    logisticsFee: 8000,
  },
  {
    name: {
      uz: "Elektronika va maishiy texnika (8%)",
      ru: "Электроника и бытовая техника (8%)",
      en: "Electronics & Appliances (8%)",
    },
    commission: 8,
    logisticsFee: 12000,
  },
  {
    name: {
      uz: "Aksessuarlar va gadjetlar (15%)",
      ru: "Аксессуары и гаджеты (15%)",
      en: "Accessories & Gadgets (15%)",
    },
    commission: 15,
    logisticsFee: 6000,
  },
  {
    name: {
      uz: "Go'zallik va parvarish (16%)",
      ru: "Красота и уход (16%)",
      en: "Beauty & Personal Care (16%)",
    },
    commission: 16,
    logisticsFee: 6000,
  },
  {
    name: {
      uz: "Uy-ro'zg'or va oshxona (15%)",
      ru: "Дом и кухня (15%)",
      en: "Home & Kitchen (15%)",
    },
    commission: 15,
    logisticsFee: 7000,
  },
  {
    name: {
      uz: "Bolalar tovarlari va o'yinchoqlar (14%)",
      ru: "Детские товары и игрушки (14%)",
      en: "Kids & Toys (14%)",
    },
    commission: 14,
    logisticsFee: 7000,
  },
  {
    name: {
      uz: "Avtotovarlar (12%)",
      ru: "Автотовары (12%)",
      en: "Automotive (12%)",
    },
    commission: 12,
    logisticsFee: 9000,
  },
  {
    name: {
      uz: "Boshqa toifalar (15%)",
      ru: "Другие категории (15%)",
      en: "Other categories (15%)",
    },
    commission: 15,
    logisticsFee: 7000,
  },
];

const TEXTS = {
  uz: {
    title: "Uzum Komissiyasi va Foyda Kalkulyatori",
    subtitle: "Sotuv narxi, toifa va xarajatlaringizni kiriting — natija darhol hisoblanadi.",
    sellingPrice: "Sotuv narxi (so'm)",
    costPrice: "Tovarning sotib olish narxi (Tan narx, so'm)",
    category: "Tovar toifasi (Kategoriya)",
    packaging: "Qadoqlash va boshqa xarajatlar (so'm)",
    calculatedCosts: "Hisoblangan xarajatlar",
    commission: "Uzum komissiyasi",
    logistics: "Logistika va yetkazish",
    totalMarketCosts: "Jami bozor xarajati",
    totalCosts: "Umumiy xarajatlar",
    profitPerUnit: "1 dona tovardan sof foyda",
    margin: "Marja",
    roi: "ROI",
    currency: "so'm",
  },
  ru: {
    title: "Калькулятор Комиссии и Прибыли Uzum Market",
    subtitle: "Укажите цену продажи, себестоимость и категорию — расчет будет выполнен мгновенно.",
    sellingPrice: "Розничная цена продажи (сум)",
    costPrice: "Себестоимость закупки (сум)",
    category: "Категория товара",
    packaging: "Упаковка, маркировка и прочие расходы (сум)",
    calculatedCosts: "Структура расходов",
    commission: "Комиссия Uzum Market",
    logistics: "Логистика FBO и доставка",
    totalMarketCosts: "Суммарные комиссии маркетплейса",
    totalCosts: "Итоговая себестоимость и затраты",
    profitPerUnit: "Чистая прибыль с 1 единицы",
    margin: "Маржинальность",
    roi: "ROI (Окупаемость)",
    currency: "сум",
  },
  en: {
    title: "Uzum Market Commission & Profit Calculator",
    subtitle: "Enter retail price, unit cost, and category to calculate net profit instantly.",
    sellingPrice: "Retail Selling Price (UZS)",
    costPrice: "Purchase Cost / COGS (UZS)",
    category: "Product Category",
    packaging: "Packaging & Prep Costs (UZS)",
    calculatedCosts: "Fee Breakdown",
    commission: "Uzum Commission",
    logistics: "Fulfillment & Logistics Fee",
    totalMarketCosts: "Total Marketplace Fees",
    totalCosts: "Total Delivered Cost",
    profitPerUnit: "Net Profit per Unit",
    margin: "Margin",
    roi: "ROI",
    currency: "UZS",
  },
};

export function UzumCommissionCalculator({ locale = "uz" }: { locale?: CalculatorLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;
  const sellingPriceId = useId();
  const costPriceId = useId();
  const categoryId = useId();
  const packagingFeeId = useId();

  const [sellingPrice, setSellingPrice] = useState<number>(150000);
  const [costPrice, setCostPrice] = useState<number>(75000);
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [packagingFee, setPackagingFee] = useState<number>(3000);

  const selectedCategory = CATEGORIES[categoryIndex] || CATEGORIES[0];
  const commissionAmount = Math.round((sellingPrice * selectedCategory.commission) / 100);
  const logisticsAmount = selectedCategory.logisticsFee;
  const totalMarketplaceCosts = commissionAmount + logisticsAmount;
  const totalCost = costPrice + packagingFee + totalMarketplaceCosts;
  const netProfit = sellingPrice - totalCost;
  const marginPercent = sellingPrice > 0 ? Math.round((netProfit / sellingPrice) * 100) : 0;
  const roiPercent = costPrice > 0 ? Math.round((netProfit / costPrice) * 100) : 0;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Calculator className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor={sellingPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.sellingPrice}
            </label>
            <input
              id={sellingPriceId}
              type="number"
              value={sellingPrice || ""}
              onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="150 000"
            />
          </div>

          <div>
            <label htmlFor={costPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.costPrice}
            </label>
            <input
              id={costPriceId}
              type="number"
              value={costPrice || ""}
              onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="75 000"
            />
          </div>

          <div>
            <label htmlFor={categoryId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.category}
            </label>
            <select
              id={categoryId}
              value={categoryIndex}
              onChange={(e) => setCategoryIndex(Number(e.target.value))}
              aria-label={t.category}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((cat, idx) => (
                <option key={idx} value={idx}>
                  {cat.name[locale] || cat.name.uz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={packagingFeeId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.packaging}
            </label>
            <input
              id={packagingFeeId}
              type="number"
              value={packagingFee || ""}
              onChange={(e) => setPackagingFee(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="3 000"
            />
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.calculatedCosts}
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.commission} ({selectedCategory.commission}%):</span>
              <span className="font-semibold">{commissionAmount.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.logistics}:</span>
              <span className="font-semibold">{logisticsAmount.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.totalMarketCosts}:</span>
              <span className="font-semibold text-rose-500">{totalMarketplaceCosts.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">{t.totalCosts}:</span>
              <span className="font-semibold">{totalCost.toLocaleString("uz-UZ")} {t.currency}</span>
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 border space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-muted-foreground">{t.profitPerUnit}:</span>
              <span className={`text-xl font-extrabold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {netProfit.toLocaleString("uz-UZ")} {t.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>{t.margin}: <strong className="text-foreground">{marginPercent}%</strong></span>
              <span>{t.roi}: <strong className="text-foreground">{roiPercent}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
