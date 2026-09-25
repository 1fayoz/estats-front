import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { ReturnsLossCalculator } from "@/features/calculators/returns-loss-calculator";

export const metadata: Metadata = {
  title: "Калькулятор Убытков от Возвратов (Невыкупов) — Uzum Market и Wildberries | eStats",
  description:
    "Рассчитайте финансовые потери от возвратов, невыкупов и обратной логистики на маркетплейсах Uzum Market, Wildberries и Ozon в Узбекистане.",
  keywords: [
    "калькулятор возвратов маркетплейс",
    "убытки от возвратов uzum",
    "стоимость невыкупа wildberries",
    "обратная логистика узбекистан",
    "себестоимость возвратов fifo",
    "аналитика брака uzum market",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/vozvrat-zarari",
    languages: {
      uz: "/kalkulyator/vozvrat-zarari",
      ru: "/ru/kalkulyator/vozvrat-zarari",
    },
  },
  openGraph: {
    title: "Калькулятор Убытков от Возвратов на Маркетплейсах",
    description: "Узнайте точную сумму скрытых потерь на возвратах и логистике.",
    url: "https://estats.uz/ru/kalkulyator/vozvrat-zarari",
  },
};

const FAQ_ITEMS = [
  {
    question: "Как возвраты влияют на маржинальность товара?",
    answer:
      "Каждый возврат влечет расходы на обратную доставку, утилизацию или замену упаковки, а также выводит товар из оборота на срок до 2 недель.",
  },
  {
    question: "Как снизить долю невыкупов на Uzum Market?",
    answer:
      "Основная причина возвратов — несоответствие ожиданий. Точные размерные сетки, качественные фото с инфографикой и подробное описание состава снижают возвраты на 5-8%.",
  },
];

export default function RussianReturnsLossPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Калькулятор возвратов", url: "/ru/kalkulyator/vozvrat-zarari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
          Финансовый контроль
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Калькулятор Убытков от Возвратов и Невыкупов на Маркетплейсах
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Точный расчет прямых и скрытых расходов селлера: обратная логистика, переупаковка, повреждение товара
          и замороженные оборотные средства.
        </p>
      </header>

      <ReturnsLossCalculator locale="ru" />
    </article>
  );
}
