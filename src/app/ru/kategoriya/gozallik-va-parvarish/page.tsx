import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Heart } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Косметика и Уход на Uzum Market — Продажи и Тренды | eStats",
  description:
    "Анализ категории красоты, парфюмерии и уходовой косметики на Uzum Market: самые популярные бренды, корейская косметика, процент выкупа и сезонный спрос.",
  keywords: [
    "аналитика косметики uzum market",
    "корейская косметика узбекистан продажи",
    "парфюмерия uzum спрос",
    "маржа на косметике маркетплейс",
    "тренды красоты узбекистан",
  ],
  alternates: {
    canonical: "/ru/kategoriya/gozallik-va-parvarish",
    languages: {
      uz: "/kategoriya/gozallik-va-parvarish",
      ru: "/ru/kategoriya/gozallik-va-parvarish",
    },
  },
  openGraph: {
    title: "Аналитика Ниши Косметика и Уход — Uzum Market | eStats",
    description: "Продажи косметики и парфюмерии на Uzum Market в деталях.",
    url: "https://estats.uz/ru/kategoriya/gozallik-va-parvarish",
  },
};

const FAQ_ITEMS = [
  {
    question: "Какой процент выкупа в категории косметики?",
    answer:
      "Косметика и парфюмерия имеют один из самых высоких показателей выкупа на маркетплейсах — свыше 90–93%, поскольку большинство товаров не подлежат примерке.",
  },
];

export default function RussianBeautyCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Красота и Уход", url: "/ru/kategoriya/gozallik-va-parvarish" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Heart className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Красота и Уход</span> на Uzum Market
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Быстрорастущая категория с высоким процентом повторных заказов (LTV), минимальным возвратом
          и высокой лояльностью покупательниц в Узбекистане.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~16%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Высокий темп роста</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек</div>
          <div className="mt-2 text-2xl font-bold text-foreground">85 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Частые повторные заказы</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Процент выкупа</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">92% – 95%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Минимальный брак и возврат</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Маржинальность</div>
          <div className="mt-2 text-2xl font-bold text-foreground">40% – 60%</div>
          <div className="mt-1 text-xs text-muted-foreground">Высокая прибыль с единицы</div>
        </div>
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Зарабатывайте в нише косметики с eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Отслеживайте остатки партий по срокам годности и запускайте автоматический постинг товаров в Telegram и Instagram.
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
