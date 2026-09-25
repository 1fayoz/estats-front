"use client";

import { useId, useState } from "react";
import { Calculator, Check, Info } from "lucide-react";

interface CategoryRate {
  name: string;
  commission: number; // foizda
  logisticsFee: number; // so'mda
}

const CATEGORIES: CategoryRate[] = [
  { name: "Kiyim va poyabzal (18%)", commission: 18, logisticsFee: 8000 },
  { name: "Elektronika va maishiy texnika (8%)", commission: 8, logisticsFee: 12000 },
  { name: "Aksessuarlar va gadjetlar (15%)", commission: 15, logisticsFee: 6000 },
  { name: "Go'zallik va parvarish (16%)", commission: 16, logisticsFee: 6000 },
  { name: "Uy-ro'zg'or va oshxona (15%)", commission: 15, logisticsFee: 7000 },
  { name: "Bolalar tovarlari va o'yinchoqlar (14%)", commission: 14, logisticsFee: 7000 },
  { name: "Avtotovarlar (12%)", commission: 12, logisticsFee: 9000 },
  { name: "Boshqa toifalar (15%)", commission: 15, logisticsFee: 7000 },
];

export function UzumCommissionCalculator() {
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
          <h2 className="text-xl font-bold">Uzum Komissiyasi va Foyda Kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            Sotuv narxi, toifa va xarajatlaringizni kiriting — natija darhol hisoblanadi.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Inputlar */}
        <div className="space-y-4">
          <div>
            <label htmlFor={sellingPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Sotuv narxi (so&apos;m)
            </label>
            <input
              id={sellingPriceId}
              type="number"
              value={sellingPrice || ""}
              onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 150 000"
            />
          </div>

          <div>
            <label htmlFor={costPriceId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tovarning sotib olish narxi (Tan narx, so&apos;m)
            </label>
            <input
              id={costPriceId}
              type="number"
              value={costPrice || ""}
              onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 75 000"
            />
          </div>

          <div>
            <label htmlFor={categoryId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Tovar toifasi (Kategoriya)
            </label>
            <select
              id={categoryId}
              value={categoryIndex}
              onChange={(e) => setCategoryIndex(Number(e.target.value))}
              aria-label="Tovar toifasi"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((cat, idx) => (
                <option key={cat.name} value={idx}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={packagingFeeId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Qadoqlash va boshqa xarajatlar (so&apos;m)
            </label>
            <input
              id={packagingFeeId}
              type="number"
              value={packagingFee || ""}
              onChange={(e) => setPackagingFee(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 3 000"
            />
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hisoblangan xarajatlar
            </span>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Uzum komissiyasi ({selectedCategory.commission}%):</span>
              <span className="font-semibold">{commissionAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Logistika va yetkazish:</span>
              <span className="font-semibold">{logisticsAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Jami bozor xarajati:</span>
              <span className="font-semibold text-rose-500">{totalMarketplaceCosts.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b">
              <span className="text-muted-foreground">Umumiy xarajatlar:</span>
              <span className="font-semibold">{totalCost.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          </div>

          <div className="rounded-xl bg-card p-4 border space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-muted-foreground">1 dona tovardan sof foyda:</span>
              <span className={`text-xl font-extrabold ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {netProfit.toLocaleString("uz-UZ")} so&apos;m
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
