import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Cpu, Flame, Smartphone, TrendingUp, Users } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Электроника и Техника на Uzum Market — Объемы Продаж и ТОП Товары | eStats",
  description:
    "Глубокий анализ категории электроники на Uzum Market: ежемесячный оборот, средний чек, самые продаваемые аксессуары для смартфонов, наушники и свободные прибыльные ниши.",
  keywords: [
    "аналитика электроники uzum market",
    "топ товары электроника узбекистан",
    "продажи наушников uzum",
    "чехлы и аксессуары uzum market",
    "оборот категории электроника",
    "прибыльные ниши uzum",
  ],
  alternates: {
    canonical: "/ru/kategoriya/elektronika",
    languages: {
      uz: "/kategoriya/elektronika",
      ru: "/ru/kategoriya/elektronika",
    },
  },
  openGraph: {
    title: "Аналитика Категории Электроника — Uzum Market | eStats",
    description: "Какие товары приносят максимальную выручку в электронике на Uzum?",
    url: "https://estats.uz/ru/kategoriya/elektronika",
  },
};

const FAQ_ITEMS = [
  {
    question: "Легко ли новому селлеру зайти в нишу электроники на Uzum Market?",
    answer:
      "Электроника лидирует по объему выручки, но отличается жесткой конкуренцией. Вместо перегретых позиций (простые чехлы и кабели) рекомендуется выбирать субкатегории: автоэлектроника, умные гаджеты для дома или специализированные переходники.",
  },
  {
    question: "Какова комиссия Uzum Market в категории электроники?",
    answer:
      "В зависимости от типа электроники и бытовой техники комиссия составляет от 5% до 12%. Точные ставки по всем подкатегориям можно рассчитать в нашем бесплатном калькуляторе комиссий.",
  },
];

export default function RussianElectronicsCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Электроника и Техника", url: "/ru/kategoriya/elektronika" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Cpu className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Электроника и Техника</span> на Uzum Market
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Самая крупная по денежному обороту категория в Узбекистане. Оцените средний чек, объем рынка,
          уровень монополизации и динамику спроса на гаджеты.
        </p>
      </header>

      {/* Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~28%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">№1 по объему оборота</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек категории</div>
          <div className="mt-2 text-2xl font-bold text-foreground">185 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Широкий ценовой разброс</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средняя комиссия Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">5% – 12%</div>
          <div className="mt-1 text-xs text-muted-foreground">Выгоднее, чем одежда</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Конкуренция в выдаче</div>
          <div className="mt-2 text-2xl font-bold text-amber-500">Высокая</div>
          <div className="mt-1 text-xs text-muted-foreground">Требуется точное SEO карточки</div>
        </div>
      </section>

      {/* Sub-niches analysis */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Популярные подкатегории электроники</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <Smartphone className="size-6 text-primary mb-3" />
            <h3 className="font-bold text-foreground">Аксессуары для смартфонов</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Защитные стекла, быстрые зарядные устройства GaN, кабели Type-C. Высокая оборачиваемость, стабильный всесезонный спрос.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <Flame className="size-6 text-rose-500 mb-3" />
            <h3 className="font-bold text-foreground">Беспроводные TWS наушники</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Один из лидеров по числу заказов. Ключевые факторы успеха — качественная инфографика и видеообзоры звука.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <TrendingUp className="size-6 text-emerald-500 mb-3" />
            <h3 className="font-bold text-foreground">Умный дом и автогаджеты</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Растущий сегмент с низкой конкуренцией: видеорегистраторы, FM-трансмиттеры, датчики и портативные пылесосы.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Находите прибыльные ниши электроники в eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Исследуйте миллионы транзакций, динамику цен, дефицит товаров и выручку конкурентов прямо сейчас.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Открыть модуль Аналитики</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
