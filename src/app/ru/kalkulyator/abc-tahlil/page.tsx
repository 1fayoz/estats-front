import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { AbcAnalysisCalculator } from "@/features/calculators/abc-analysis-calculator";

export const metadata: Metadata = {
  title: "ABC-Анализ Товаров и Склада (Правило Парето 80/20) | eStats",
  description:
    "Онлайн калькулятор ABC-анализа товарной матрицы для Uzum Market, Wildberries и Ozon. Выявите товары группы А (80% выручки), стабильные товары (B) и замороженный неликвид (C).",
  keywords: [
    "abc анализ товаров калькулятор",
    "abc анализ онлайн маркетплейсы",
    "правило парето товарная матрица",
    "анализ склада uzum market",
    "неликвид на складе выявление",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/abc-tahlil",
    languages: {
      uz: "/kalkulyator/abc-tahlil",
      ru: "/ru/kalkulyator/abc-tahlil",
      en: "/en/tools/abc-analysis",
    },
  },
  openGraph: {
    title: "ABC-Анализ Товарного Портфеля Маркетплейсов — eStats",
    description: "Разделите ассортимент по выручке: выявите локомотивы продаж и избавьтесь от неликвида.",
    url: "https://estats.uz/ru/kalkulyator/abc-tahlil",
    images: ["https://estats.uz/api/og?title=ABC-Анализ+Склада+и+Товаров&badge=eStats+Инструменты"],
  },
};

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
