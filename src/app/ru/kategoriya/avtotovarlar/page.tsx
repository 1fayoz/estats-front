import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Автотовары и Аксессуары на Uzum Market — Продажи и Спрос | eStats",
  description:
    "Анализ рынка автотоваров в Узбекистане на Uzum Market: видеорегистраторы, автохимия, чехлы, органайзеры и лампы. Средний чек и доходность селлеров.",
  keywords: [
    "автотовары uzum market",
    "автоаксессуары узбекистан продажи",
    "видеорегистраторы uzum",
    "автохимия маркетплейс",
    "прибыльные автотовары узбекистан",
  ],
  alternates: {
    canonical: "/ru/kategoriya/avtotovarlar",
    languages: {
      uz: "/kategoriya/avtotovarlar",
      ru: "/ru/kategoriya/avtotovarlar",
    },
  },
  openGraph: {
    title: "Аналитика Ниши Автотовары — Uzum Market | eStats",
    description: "Продажи автотоваров и аксессуаров в Узбекистане.",
    url: "https://estats.uz/ru/kategoriya/avtotovarlar",
  },
};

const FAQ_ITEMS = [
  {
    question: "Каковы особенности рынка автотоваров в Узбекистане?",
    answer:
      "Узбекистан — один из самых автомобилизированных рынков региона с огромным парком Chevrolet (Cobalt, Gentra, Tracker, Onix). Аксессуары под конкретные модели авто имеют взрывной спрос и минимальную конкуренцию.",
  },
];

export default function RussianAutoCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Автотовары", url: "/ru/kategoriya/avtotovarlar" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Car className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Автотовары и Аксессуары</span> на Uzum
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Уникальный для рынка Узбекистана сегмент с платежеспособной мужской аудиторией и высоким средним чеком.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~11%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Быстрый рост</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек</div>
          <div className="mt-2 text-2xl font-bold text-foreground">175 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Высокая покупательная способность</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Процент выкупа</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">91% – 94%</div>
          <div className="mt-1 text-xs text-muted-foreground">Целевые покупки</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средняя маржа</div>
          <div className="mt-2 text-2xl font-bold text-foreground">35% – 55%</div>
          <div className="mt-1 text-xs text-muted-foreground">Отличная доходность</div>
        </div>
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Используйте потенциал ниши автотоваров</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Находите востребованные модели чехлов, освещения и электроники для авторынка Узбекистана в eStats.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
