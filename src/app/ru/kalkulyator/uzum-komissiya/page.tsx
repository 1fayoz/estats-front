import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Check, HelpCircle } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { UzumCommissionCalculator } from "@/features/calculators/uzum-commission-calculator";

export const metadata: Metadata = {
  title: "Калькулятор Комиссии Uzum Market (2026) — Расчет Чистой Прибыли Онлайн | eStats",
  description:
    "Бесплатный онлайн калькулятор комиссии и тарифов Uzum Market. Расчет логистики FBO, себестоимости партии и чистой прибыли по актуальным ставкам для селлеров.",
  keywords: [
    "калькулятор комиссии uzum market",
    "комиссия узум маркет 2026",
    "расчет прибыли uzum",
    "тарифы узбекских маркетплейсов",
    "логистика fbo uzum стоимость",
    "калькулятор селлера узбекистан",
    "чистая прибыль uzum market",
  ],
  alternates: {
    canonical: "/ru/kalkulyator/uzum-komissiya",
    languages: {
      uz: "/kalkulyator/uzum-komissiya",
      ru: "/ru/kalkulyator/uzum-komissiya",
      en: "/en/tools/commission-calculator",
      "x-default": "/kalkulyator/uzum-komissiya",
    },
  },
  openGraph: {
    title: "Калькулятор Комиссии и Прибыли Uzum Market — eStats",
    description: "Рассчитайте комиссию маркетплейса, логистику и чистую прибыль до запуска продаж.",
    url: "https://estats.uz/ru/kalkulyator/uzum-komissiya",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Какова комиссия Uzum Market в 2026 году?",
    answer:
      "Комиссия зависит от категории товара и варьируется от 3% до 25%. Например, для электроники и техники — 5-10%, для одежды и аксессуаров — 15-20%.",
  },
  {
    question: "Как рассчитывается стоимость логистики FBO на Uzum?",
    answer:
      "Логистический сбор зависит от габаритов и веса товара, а также стоимости доставки до пунктов выдачи заказов (ПВЗ) по городам Узбекистана.",
  },
  {
    question: "Можно ли автоматизировать расчет прибыли по всем моим товарам?",
    answer:
      "Да! Подключите ваш магазин к eStats, и система будет автоматически сопоставлять продажи с себестоимостью партий по методу FIFO и строить отчет PnL каждый день.",
  },
];

export default function RussianCommissionCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Калькуляторы", url: "/ru" },
          { name: "Калькулятор Uzum Market", url: "/ru/kalkulyator/uzum-komissiya" },
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
          <Calculator className="size-3.5" /> Актуальные тарифы 2026
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Калькулятор комиссии <span className="text-primary">Uzum Market</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Точный расчет чистой маржи, стоимости логистики FBO и окупаемости инвестиций (ROI) на одну единицу товара.
        </p>
      </header>

      <UzumCommissionCalculator locale="ru" />

      {/* Advice section */}
      <section className="space-y-6 rounded-3xl border bg-card p-6 sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight">
          Как селлеру не уйти в минус на комиссиях?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2 rounded-2xl border bg-background/50 p-4">
            <h3 className="font-bold text-foreground">1. Учитывайте скрытые расходы</h3>
            <p className="text-xs">
              Помимо базовой комиссии категории закладывайте стоимость термоэтикеток, индивидуальных zip-пакетов, логистики до распредцентра и комиссии банка за вывод денег.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border bg-background/50 p-4">
            <h3 className="font-bold text-foreground">2. Следите за возвратами</h3>
            <p className="text-xs">
              В категориях одежды и обуви процент выкупа составляет 50-70%. Закладывайте процент невыкупа в юнит-экономику заранее.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">Автоматический PnL и себестоимость в eStats</p>
            <p className="text-xs text-muted-foreground">Избавьтесь от ручных расчетов и ведения таблиц Excel.</p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
          >
            <span>Попробовать eStats бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
