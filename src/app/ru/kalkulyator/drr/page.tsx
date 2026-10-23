import type { Metadata } from "next";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";
import { DrrCalculator } from "@/features/calculators/drr-calculator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Калькулятор ДРР и ROAS — Uzum и Wildberries",
  description:
    "Рассчитайте долю рекламных расходов (ДРР), возврат инвестиций (ROAS) и предельно допустимую стоимость клика/заказа в кампаниях Boost TOP и внутренней рекламе.",
  path: "/ru/kalkulyator/drr",
  keywords: [
    "калькулятор дрр uzum",
    "доля рекламных расходов wildberries",
    "расчет roas маркетплейс",
    "окупаемость boost top uzum",
    "предельный дрр формула",
    "эффективность рекламы узбекистан",
  ],
  ogTitle: "Калькулятор ДРР и Окупаемости Рекламы (ROAS)",
  ogDescription: "Проверьте, окупается ли реклама ваших товаров на маркетплейсах.",
});

const FAQ_ITEMS = [
  {
    question: "Что такое ДРР (Доля рекламных расходов)?",
    answer:
      "ДРР — это процентное соотношение суммы рекламных затрат к полученной выручке. Формула: (Рекламные расходы / Рекламная выручка) × 100%.",
  },
  {
    question: "Какой ДРР считается хорошим для маркетплейсов?",
    answer:
      "ДРР должен быть строго меньше валовой маржинальности товара. Если ваша маржа составляет 25%, то ДРР до 15-18% оставляет чистую прибыль, а ДРР выше 25% генерирует прямые убытки с каждого заказа.",
  },
];

export default function RussianDrrPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru/kalkulyator/uzum-komissiya" },
          { name: "Калькулятор ДРР и ROAS", url: "/ru/kalkulyator/drr" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Рекламная Аналитика
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Калькулятор ДРР и Окупаемости Рекламы (ROAS / ROMI)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Оцените реальную отдачу от рекламных ставок Boost TOP на Uzum Market и авторекламы Wildberries.
          Узнайте, приносит ли кампания прибыль или сжигает ваш бюджет.
        </p>
      </header>

      <DrrCalculator locale="ru" />
    </article>
  );
}
