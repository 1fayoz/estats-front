import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Товары для Дома и Кухни на Uzum Market — Объемы и Тренды | eStats",
  description:
    "Анализ ниши товаров для дома, посуды, органайзеров и текстиля на Uzum Market: средний чек, всесезонный спрос, маржинальность и ТОП продаваемых позиций.",
  keywords: [
    "товары для дома uzum market",
    "посуда и кухня продажи узбекистан",
    "органайзеры uzum аналитика",
    "маржа товары для дома",
    "прибыльные ниши для дома",
  ],
  alternates: {
    canonical: "/ru/kategoriya/uy-rozgor",
    languages: {
      uz: "/kategoriya/uy-rozgor",
      ru: "/ru/kategoriya/uy-rozgor",
    },
  },
  openGraph: {
    title: "Аналитика Товаров для Дома — Uzum Market | eStats",
    description: "Спрос и продажи товаров для дома и уюта на Uzum Market.",
    url: "https://estats.uz/ru/kategoriya/uy-rozgor",
  },
};

const FAQ_ITEMS = [
  {
    question: "Почему товары для дома считаются надежной нишей для новичков?",
    answer:
      "В отличие от одежды, здесь нет проблем с размерными сетками и минимален процент возвратов. Спрос стабилен круглый год, особенно на кухонные принадлежности и органайзеры.",
  },
];

export default function RussianHomeCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Товары для Дома", url: "/ru/kategoriya/uy-rozgor" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Home className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Товары для Дома и Кухни</span> на Uzum
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Всесезонный сегмент с минимальным процентом возвратов и высокой регулярностью покупок: посуда,
          текстиль, хранение вещей и декор.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~18%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Стабильный объем</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек</div>
          <div className="mt-2 text-2xl font-bold text-foreground">110 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Хорошая корзина</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Процент выкупа</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">93% – 96%</div>
          <div className="mt-1 text-xs text-muted-foreground">Очень низкий возврат</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средняя маржа</div>
          <div className="mt-2 text-2xl font-bold text-foreground">30% – 50%</div>
          <div className="mt-1 text-xs text-muted-foreground">Высокая рентабельность</div>
        </div>
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Запускайте продажи товаров для дома с eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Автоматический расчет складских поставок, учет себестоимости партий и мониторинг цен конкурентов.
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
