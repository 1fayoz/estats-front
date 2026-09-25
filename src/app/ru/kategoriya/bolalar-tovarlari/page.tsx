import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Baby, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналитика Ниши Детские Товары и Игрушки на Uzum Market — Продажи и Спрос | eStats",
  description:
    "Анализ рынка детских товаров в Узбекистане на Uzum Market: развивающие игрушки, одежда для новорожденных, подгузники и коляски. Маржинальность и объем спроса.",
  keywords: [
    "детские товары uzum market",
    "игрушки продажи узбекистан",
    "одежда для новорожденных uzum",
    "подгузники маркетплейс узбекистан",
    "прибыльные детские товары",
  ],
  alternates: {
    canonical: "/ru/kategoriya/bolalar-tovarlari",
    languages: {
      uz: "/kategoriya/bolalar-tovarlari",
      ru: "/ru/kategoriya/bolalar-tovarlari",
    },
  },
  openGraph: {
    title: "Аналитика Ниши Детские Товары — Uzum Market | eStats",
    description: "Продажи детских товаров и развивающих игрушек в Узбекистане.",
    url: "https://estats.uz/ru/kategoriya/bolalar-tovarlari",
  },
};

const FAQ_ITEMS = [
  {
    question: "Почему рынок детских товаров в Узбекистане растет быстрее других?",
    answer:
      "Узбекистан имеет самый высокий уровень рождаемости в Центральной Азии (около 1 млн новорожденных в год). Спрос на детские товары, одежду и питание стабильно увеличивается.",
  },
];

export default function RussianKidsCategoryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Категории", url: "/ru/kategoriya/elektronika" },
          { name: "Детские товары", url: "/ru/kategoriya/bolalar-tovarlari" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Baby className="size-3.5" /> Анализ Ниши Маркетплейса
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика ниши <span className="text-primary">Детские Товары и Игрушки</span> на Uzum
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Самый быстрорастущий демографический рынок Центральной Азии. Развивающие игры, одежда, уход
          и гигиена для детей.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Доля рынка на Uzum</div>
          <div className="mt-2 text-2xl font-bold text-foreground">~13%</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Высочайшая динамика</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средний чек</div>
          <div className="mt-2 text-2xl font-bold text-foreground">95 000 сум</div>
          <div className="mt-1 text-xs text-muted-foreground">Регулярные покупки</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Процент выкупа</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">92% – 95%</div>
          <div className="mt-1 text-xs text-muted-foreground">Минимальные отказы</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground">Средняя маржа</div>
          <div className="mt-2 text-2xl font-bold text-foreground">35% – 50%</div>
          <div className="mt-1 text-xs text-muted-foreground">Высокая прибыль</div>
        </div>
      </section>

      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Развивайте продажи детских товаров в eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Контролируйте складские партии, сертификаты и прогнозируйте спрос на сезонные новинки.
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
