import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Check, Clock, ShieldAlert } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { InventoryReorderCalculator } from "@/features/calculators/inventory-reorder-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Калькулятор Остатков и Точки Заказа (ROP)",
  description:
    "Расчет даты закупа и страхового запаса (Safety Stock) для Uzum Market и Wildberries: без обнуления остатков и падения карточки в поиске.",
  path: "/ru/kalkulyator/ombor-zaxirasi",
  keywords: [
    "калькулятор остатков склад",
    "точка перезаказа rop формула",
    "out of stock маркетплейс",
    "страховой запас uzum",
    "расчет запасов wildberries",
    "оборачиваемость склада узбекистан",
  ],
  ogTitle: "Калькулятор Складских Остатков и Точки Перезаказа (ROP)",
  ogDescription: "Точный расчет даты заказа товаров для селлеров маркетплейсов.",
});

const FAQ_ITEMS = [
  {
    question: "Почему обнуление остатка (Out of Stock) критично для карточки?",
    answer:
      "Алгоритмы ранжирования Uzum Market и Wildberries мгновенно понижают позиции карточки с нулевым остатком. Вернуть товар в ТОП после выпадения из выдачи значительно сложнее и требует дополнительных рекламных бюджетов.",
  },
  {
    question: "Что такое точка перезаказа (Reorder Point)?",
    answer:
      "Это минимальный уровень складского остатка, при достижении которого необходимо немедленно оформить заказ на новую партию поставщику, чтобы товар прибыл до исчерпания текущего запаса.",
  },
];

export default function RussianInventoryCalculatorPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Планирование запасов (ROP)", url: "/ru/kalkulyator/ombor-zaxirasi" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Складская Аналитика
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Калькулятор Складских Остатков и Точки Заказа (ROP)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Рассчитайте оптимальную дату закупа, страховой буфер и количество дней до следующего заказа партии,
          чтобы ваши товары всегда оставались в наличии и сохраняли позиции в ТОПе.
        </p>
      </header>

      <InventoryReorderCalculator locale="ru" />
    </article>
  );
}
