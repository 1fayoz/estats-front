import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shirt, TrendingUp, Users, Check } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Одежда и Обувь на Uzum Market — Продажи и Сезонные Тренды | eStats",
  description:
    "Анализ категории одежды, обуви и текстиля на маркетплейсах Узбекистана: средний чек, процент возвратов, популярные размеры, сезонные пики и расчет маржинальности.",
  keywords: [
    "аналитика одежды uzum market",
    "продажи обуви uzum",
    "процент возвратов одежда uzum",
    "маржа на одежде маркетплейс",
    "сезонные тренды одежды узбекистан",
    "рынок текстиля узбекистан",
  ],
  alternates: {
    canonical: "/ru/kategoriya/kiyim-va-poyabzal",
    languages: {
      uz: "/kategoriya/kiyim-va-poyabzal",
      ru: "/ru/kategoriya/kiyim-va-poyabzal",
    },
  },
  openGraph: {
    title: "Аналитика Одежды и Обуви — Uzum Market | eStats",
    description: "Как зарабатывать в нише одежды с учетом процента возвратов?",
    url: "https://estats.uz/ru/kategoriya/kiyim-va-poyabzal",
  },
};

const FAQ_ITEMS = [
  {
    question: "Какой процент возвратов считается нормальным в одежде на Uzum Market?",
    answer:
      "В категории одежды и обуви средняя доля невыкупов составляет 15–25% из-за ошибок в подборе размера. В eStats предусмотрен специальный калькулятор убытков от возвратов для безопасного планирования юнит-экономики.",
  },
  {
    question: "Когда наступает пик продаж одежды?",
    answer:
      "Традиционные сезонные всплески приходятся на март-апрель (весна/Рамазан), август-сентябрь (школьный сезон и осень) и ноябрь-декабрь (зимние теплые вещи).",
  },
];

export default function RussianFashionCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Одежда и Обувь", url: "/ru/kategoriya/kiyim-va-poyabzal" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Shirt className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Одежда и Обувь</span> на Uzum Market
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Высокомаржинальная ниша, требующая точной работы с размерными сетками, цветовыми вариациями
          и партионным учетом себестоимости по методу FIFO.
        </p>
      </header>

      {/* Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~24%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Стабильный объем заказов</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек</div>
          <div className="mt-2 text-2xl font-bold text-foreground">165 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Базовый гардероб</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средняя маржинальность</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">35% – 55%</div>
          <div className="mt-1 text-xs text-muted-foreground">Высокая наценка</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Процент возвратов</div>
          <div className="mt-2 text-2xl font-bold text-rose-500">18% – 25%</div>
          <div className="mt-1 text-xs text-muted-foreground">Важна размерная сетка</div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Управляйте продажами одежды без кассовых разрывов</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Синхронизируйте остатки по размерам и цветам, автоматически списывайте себестоимость и контролируйте возвратные расходы.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Попробовать eStats бесплатно</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
