"use client";

import { useId, useState } from "react";
import { AlertTriangle, Boxes, Check, Clock, ShieldCheck } from "lucide-react";

export function InventoryReorderCalculator() {
  const dailySalesId = useId();
  const leadTimeDaysId = useId();
  const bufferDaysId = useId();
  const currentStockId = useId();

  const [dailySales, setDailySales] = useState<number>(15); // Kunlik sotuv (dona)
  const [leadTimeDays, setLeadTimeDays] = useState<number>(18); // Keltirish vaqti (kun)
  const [bufferDays, setBufferDays] = useState<number>(5); // Xavfsizlik zaxirasi kunlarda
  const [currentStock, setCurrentStock] = useState<number>(120); // Ombordagi joriy qoldiq

  // Safety Stock (Xavfsizlik zaxirasi) = bufferDays * dailySales
  const safetyStock = bufferDays * dailySales;
  // Reorder Point (Qayta buyurtma nuqtasi) = (leadTimeDays * dailySales) + safetyStock
  const reorderPoint = leadTimeDays * dailySales + safetyStock;
  // Qoldiq necha kunga yetadi
  const daysOfStockLeft = dailySales > 0 ? Math.floor(currentStock / dailySales) : 0;
  // Yangi zakaz berish kerakmi?
  const needsReorder = currentStock <= reorderPoint;
  const daysUntilReorder =
    dailySales > 0 && currentStock > reorderPoint
      ? Math.floor((currentStock - reorderPoint) / dailySales)
      : 0;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Boxes className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ombor Zaxirasini Rejalashtirish Kalkulyatori</h2>
          <p className="text-xs text-muted-foreground">
            Tovaringiz tugab qolmasligi (Out of Stock bo&apos;lmasligi) uchun qachon va qancha zaxira saqlash kerakligini biling.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={dailySalesId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Kunlik o&apos;rtacha sotuv hajmi (dona/kun)
            </label>
            <input
              id={dailySalesId}
              type="number"
              value={dailySales || ""}
              onChange={(e) => setDailySales(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 15"
            />
          </div>

          <div>
            <label htmlFor={leadTimeDaysId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Yetkazib kelish muddati (Lead time, kunlarda)
            </label>
            <input
              id={leadTimeDaysId}
              type="number"
              value={leadTimeDays || ""}
              onChange={(e) => setLeadTimeDays(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Masalan: 18 (Xitoy yoki zavoddan)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={bufferDaysId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Kutilmagan kechikish (kun)
              </label>
              <input
                id={bufferDaysId}
                type="number"
                value={bufferDays || ""}
                onChange={(e) => setBufferDays(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor={currentStockId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Ombordagi hozirgi qoldiq
              </label>
              <input
                id={currentStockId}
                type="number"
                value={currentStock || ""}
                onChange={(e) => setCurrentStock(Number(e.target.value) || 0)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Natijalar paneli */}
        <div className="rounded-2xl border bg-muted/30 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Zaxira hisob-kitobi
            </span>

            <div className="flex justify-between items-baseline py-1 border-b">
              <span className="text-xs text-muted-foreground">Qayta buyurtma berish nuqtasi (ROP):</span>
              <span className="text-base font-bold text-foreground">
                {reorderPoint} dona
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">Xavfsizlik zaxirasi (Safety Stock):</span>
              <span className="font-semibold">{safetyStock} dona ({bufferDays} kunlik)</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">Hozirgi qoldiq necha kunga yetadi:</span>
              <span className="font-semibold">{daysOfStockLeft} kunga</span>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 border space-y-2 ${
              needsReorder
                ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {needsReorder ? (
                <>
                  <AlertTriangle className="size-5 text-rose-600" />
                  <span className="text-sm font-bold">Zudlik bilan yangi partiya buyurtma qiling!</span>
                </>
              ) : (
                <>
                  <Check className="size-5 text-emerald-600" />
                  <span className="text-sm font-bold">Zaxirangiz hozircha xavfsiz holatda</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {needsReorder
                ? `Omborda ${currentStock} dona qolgan, xavfsiz chegara esa ${reorderPoint} dona. Yangi tovar kelguncha zaxira tugab qolish xavfi juda yuqori!`
                : `Yangi buyurtma berishgacha yana taxminan ${daysUntilReorder} kun vaqt bor. Tovarlar tugashidan oldin buyurtma berishni unutmang.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
