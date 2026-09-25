import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { UnitEconomicsCalculator } from "@/features/calculators/unit-economics-calculator";

export const metadata: Metadata = {
  title: "Калькулятор Юнит-Экономики для Маркетплейсов — Расчет Маржи и ROI | eStats",
  description:
    "Бесплатный расчет юнит-экономики товара: чистая маржа, окупаемость вложений (ROI), точка безубыточности (Break-even цена), учет налогов и рекламных расходов на маркетплейсах.",
  keywords: [
    "калькулятор юнит экономики",
    "расчет маржи маркетплейс",
    "юнит экономика узбекистан",
    "точка безубыточности товар",
    "break even цена калькулятор",
    "рентабельность продаж узбекистан",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/unit-iqtisodiyot",
    languages: {
      uz: "/kalkulyator/unit-iqtisodiyot",
      ru: "/ru/kalkulyator/unit-iqtisodiyot",
      en: "/kalkulyator/unit-iqtisodiyot",
      "x-default": "/kalkulyator/unit-iqtisodiyot",
    },
  },
  openGraph: {
    title: "Калькулятор Юнит-Экономики — eStats",
    description: "Рассчитайте чистую маржу и минимальную безубыточную цену товара.",
    url: "https://estats.uz/ru/kalkulyator/unit-iqtisodiyot",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Что такое юнит-экономика и зачем она селлеру?",
    answer:
      "Юнит-экономика оценивает прибыльность на уровне одной проданной единицы товара (юнита). Она показывает реальный чистый доход после вычета себестоимости, логистики, комиссии маркетплейса, рекламы и налогов.",
  },
  {
    question: "Что означает цена безубыточности (Break-even)?",
    answer:
      "Это минимальная розничная цена, которая полностью покрывает все расходы, но приносит 0 прибыли. Продажа ниже этой цены приносит прямой убыток бизнесу.",
  },
  {
    question: "Какая маржинальность считается хорошей на маркетплейсах?",
    answer:
      "Оптимальной считается чистая маржа от 15% до 30%. При маржинальности ниже 10% растет риск уйти в минус из-за возвратов или скачков цен на внутреннюю рекламу.",
  },
];

export default function RussianUnitEconomicsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru" },
          { name: "Юнит-экономика", url: "/ru/kalkulyator/unit-iqtisodiyot" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <TrendingUp className="size-3.5" /> Финансовый инструмент
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Калькулятор <span className="text-primary">юнит-экономики</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Узнайте, сколько чистой прибыли приносит каждая продажа, и определите безопасную минимальную цену.
        </p>
      </header>

      <UnitEconomicsCalculator locale="ru" />

      <section className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Управляйте рентабельностью в eStats</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Система eStats автоматически рассчитывает юнит-экономику каждого артикула в вашем каталоге, учитывая реальные затраты на рекламу, возвраты и партионную себестоимость по FIFO.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
          >
            <span>Попробовать eStats бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
