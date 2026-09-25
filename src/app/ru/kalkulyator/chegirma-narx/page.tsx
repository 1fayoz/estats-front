import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { DiscountPricingCalculator } from "@/features/calculators/discount-pricing-calculator";

export const metadata: Metadata = {
  title: "Калькулятор Скидок и Акций на Uzum Market — Расчет Зачеркнутой Цены | eStats",
  description:
    "Рассчитайте оптимальную зачеркнутую и фактическую цену для участия в акциях на Uzum Market и Wildberries без ухода в минус. Сохраните плановую маржинальность.",
  keywords: [
    "калькулятор скидок uzum market",
    "расчет зачеркнутой цены маркетплейс",
    "скидки и акции wildberries",
    "маржинальность со скидкой",
    "ценообразование uzum market",
    "калькулятор акций маркетплейс",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/chegirma-narx",
    languages: {
      uz: "/kalkulyator/chegirma-narx",
      ru: "/ru/kalkulyator/chegirma-narx",
    },
  },
  openGraph: {
    title: "Калькулятор Скидок и Ценообразования на Uzum Market",
    description: "Устанавливайте привлекательные скидки с гарантией чистой прибыли.",
    url: "https://estats.uz/ru/kalkulyator/chegirma-narx",
  },
};

const FAQ_ITEMS = [
  {
    question: "Зачем показывать большую зачеркнутую скидку на Uzum Market?",
    answer:
      "Покупатели активнее кликают по товарам с заметным бейджем скидки (-30%..-50%). Правильный расчет позволяет указать привлекательную зачеркнутую цену, при этом фактическая цена полностью покрывает себестоимость и комиссию.",
  },
  {
    question: "Как не уйти в минус во время распродаж?",
    answer:
      "Используйте калькулятор для фиксации минимальной точки безубыточности. Учитывайте комиссию категории и расходы на логистику до выставления финальной цены.",
  },
];

export default function RussianDiscountPricingPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Калькулятор скидок", url: "/ru/kalkulyator/chegirma-narx" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Ценообразование
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Калькулятор Скидок и Зачеркнутой Цены на Uzum Market
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Рассчитайте зачеркнутую цену и реальную стоимость продажи товара так, чтобы показывать максимальную скидку
          покупателю и при этом сохранять плановую чистую прибыль.
        </p>
      </header>

      <DiscountPricingCalculator locale="ru" />
    </article>
  );
}
