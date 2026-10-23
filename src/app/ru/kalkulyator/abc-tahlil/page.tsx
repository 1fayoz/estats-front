import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { AbcAnalysisCalculator } from "@/features/calculators/abc-analysis-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ABC-Анализ Товаров и Склада (Правило Парето 80/20)",
  description:
    "Онлайн ABC-анализ товарной матрицы для Uzum Market, Wildberries и Ozon: товары группы А (80% выручки), стабильные (B) и неликвид (C).",
  path: "/ru/kalkulyator/abc-tahlil",
  keywords: [
    "abc анализ товаров калькулятор",
    "abc анализ онлайн маркетплейсы",
    "правило парето товарная матрица",
    "анализ склада uzum market",
    "неликвид на складе выявление",
  ],
  ogTitle: "ABC-Анализ Товарного Портфеля Маркетплейсов — eStats",
  ogDescription: "Разделите ассортимент по выручке: выявите локомотивы продаж и избавьтесь от неликвида.",
});

const FAQ_ITEMS = [
  {
    question: "Зачем селлеру маркетплейса нужен ABC-анализ?",
    answer:
      "ABC-анализ позволяет понять, какие именно 20% товаров приносят 80% чистой прибыли, а какие замораживают оборотный капитал на полках склада. Это основа грамотного управления закупками.",
  },
  {
    question: "Как работать с товарами группы А?",
    answer:
      "Для товаров группы А недопустим Out of Stock (обнуление остатков). Они требуют повышенного страхового запаса и приоритетных поставок.",
  },
  {
    question: "Что делать с позициями группы C?",
    answer:
      "Группа C генерирует менее 5% оборота. Рекомендуется распродать их со скидкой, сформировать наборы (бандлы) или прекратить повторные закупки.",
  },
];

export default function RuAbcAnalysisPage() {
  return (
    <article className="space-y-12">
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "ABC-анализ товаров", url: "/ru/kalkulyator/abc-tahlil" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <AbcAnalysisCalculator locale="ru" />
    </article>
  );
}
