"use client";

import { useId, useState } from "react";
import { AlertTriangle, Boxes, Check } from "lucide-react";

export type InventoryCalcLocale = "uz" | "ru";

interface TextContent {
  title: string;
  subtitle: string;
  dailySalesLabel: string;
  dailySalesPlaceholder: string;
  leadTimeLabel: string;
  leadTimePlaceholder: string;
  bufferDaysLabel: string;
  currentStockLabel: string;
  summaryTitle: string;
  ropLabel: string;
  safetyStockLabel: string;
  daysOfStockLabel: string;
  pcs: string;
  days: string;
  alertReorderTitle: string;
  alertReorderText: (stock: number, rop: number) => string;
  alertSafeTitle: string;
  alertSafeText: (days: number) => string;
}

const TEXTS: Record<InventoryCalcLocale, TextContent> = {
  uz: {
    title: "Ombor Zaxirasini Rejalashtirish Kalkulyatori",
    subtitle: "Tovaringiz tugab qolmasligi (Out of Stock bo'lmasligi) uchun qachon va qancha zaxira saqlash kerakligini biling.",
    dailySalesLabel: "Kunlik o'rtacha sotuv hajmi (dona/kun)",
    dailySalesPlaceholder: "Masalan: 15",
    leadTimeLabel: "Yetkazib kelish muddati (Lead time, kunlarda)",
    leadTimePlaceholder: "Masalan: 18 (Xitoy yoki zavoddan)",
    bufferDaysLabel: "Kutilmagan kechikish (kun)",
    currentStockLabel: "Ombordagi hozirgi qoldiq (dona)",
    summaryTitle: "Zaxira hisob-kitobi",
    ropLabel: "Qayta buyurtma berish nuqtasi (ROP):",
    safetyStockLabel: "Xavfsizlik zaxirasi (Safety Stock):",
    daysOfStockLabel: "Hozirgi qoldiq necha kunga yetadi:",
    pcs: "dona",
    days: "kunga",
    alertReorderTitle: "Zudlik bilan yangi partiya buyurtma qiling!",
    alertReorderText: (stock, rop) =>
      `Omborda ${stock} dona qolgan, xavfsiz chegara esa ${rop} dona. Yangi tovar kelguncha zaxira tugab qolish xavfi juda yuqori!`,
    alertSafeTitle: "Zaxirangiz hozircha xavfsiz holatda",
    alertSafeText: (days) =>
      `Yangi buyurtma berishgacha yana taxminan ${days} kun vaqt bor. Tovarlar tugashidan oldin buyurtma berishni unutmang.`,
  },
  ru: {
    title: "Калькулятор Складских Остатков и Точки Перезаказа (ROP)",
    subtitle: "Рассчитайте дату нового закупа партии, чтобы не допустить обнуления остатков (Out of Stock) на маркетплейсе.",
    dailySalesLabel: "Среднесуточные продажи (шт/день)",
    dailySalesPlaceholder: "Например: 15",
    leadTimeLabel: "Срок поставки новой партии (Lead time, дни)",
    leadTimePlaceholder: "Например: 18 (с фабрики или Китая)",
    bufferDaysLabel: "Страховой буфер задержки (дни)",
    currentStockLabel: "Текущий фактический остаток на складе (шт)",
    summaryTitle: "Расчет показателей склада",
    ropLabel: "Точка повторного заказа (ROP):",
    safetyStockLabel: "Страховой запас (Safety Stock):",
    daysOfStockLabel: "Остатка хватит на:",
    pcs: "шт.",
    days: "дней",
    alertReorderTitle: "Срочно оформите заказ новой партии!",
    alertReorderText: (stock, rop) =>
      `На складе осталось ${stock} шт., а минимальный порог — ${rop} шт. Высокий риск Out of Stock до прибытия партии!`,
    alertSafeTitle: "Запас товаров в безопасной зоне",
    alertSafeText: (days) =>
      `До оформления следующего заказа у вас в запасе еще около ${days} дн. Планируйте закупки заблаговременно.`,
  },
};

export function InventoryReorderCalculator({ locale = "uz" }: { locale?: InventoryCalcLocale }) {
  const t = TEXTS[locale] || TEXTS.uz;

  const dailySalesId = useId();
  const leadTimeDaysId = useId();
  const bufferDaysId = useId();
  const currentStockId = useId();

  const [dailySales, setDailySales] = useState<number>(15);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(18);
  const [bufferDays, setBufferDays] = useState<number>(5);
  const [currentStock, setCurrentStock] = useState<number>(120);

  const safetyStock = bufferDays * dailySales;
  const reorderPoint = leadTimeDays * dailySales + safetyStock;
  const daysOfStockLeft = dailySales > 0 ? Math.floor(currentStock / dailySales) : 0;
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
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor={dailySalesId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.dailySalesLabel}
            </label>
            <input
              id={dailySalesId}
              type="number"
              value={dailySales || ""}
              onChange={(e) => setDailySales(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t.dailySalesPlaceholder}
            />
          </div>

          <div>
            <label htmlFor={leadTimeDaysId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
              {t.leadTimeLabel}
            </label>
            <input
              id={leadTimeDaysId}
              type="number"
              value={leadTimeDays || ""}
              onChange={(e) => setLeadTimeDays(Number(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={t.leadTimePlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={bufferDaysId} className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t.bufferDaysLabel}
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
                {t.currentStockLabel}
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
              {t.summaryTitle}
            </span>

            <div className="flex justify-between items-baseline py-1 border-b">
              <span className="text-xs text-muted-foreground">{t.ropLabel}</span>
              <span className="text-base font-bold text-foreground">
                {reorderPoint} {t.pcs}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">{t.safetyStockLabel}</span>
              <span className="font-semibold">
                {safetyStock} {t.pcs} ({bufferDays} {t.days})
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-muted-foreground">{t.daysOfStockLabel}</span>
              <span className="font-semibold">{daysOfStockLeft} {t.days}</span>
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
                  <span className="text-sm font-bold">{t.alertReorderTitle}</span>
                </>
              ) : (
                <>
                  <Check className="size-5 text-emerald-600" />
                  <span className="text-sm font-bold">{t.alertSafeTitle}</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {needsReorder
                ? t.alertReorderText(currentStock, reorderPoint)
                : t.alertSafeText(daysUntilReorder)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
