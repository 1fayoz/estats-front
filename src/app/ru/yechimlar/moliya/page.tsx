import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, DollarSign, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Финансовый Учет PnL и Себестоимость FIFO для Маркетплейсов | eStats",
  description:
    "Точный расчет чистой прибыли для селлеров маркетплейсов в Узбекистане. Отчет о прибылях и убытках (PnL), партионная себестоимость по FIFO, учет комиссий, возвратов и постоянных расходов.",
  keywords: [
    "финансовый учет маркетплейс",
    "pnl отчет маркетплейс узбекистан",
    "чистая прибыль uzum market",
    "себестоимость fifo узбекистан",
    "бухгалтерия маркетплейс ташкент",
  ],
  alternates: {
    canonical: "/ru/yechimlar/moliya",
    languages: {
      uz: "/yechimlar/moliya",
      ru: "/ru/yechimlar/moliya",
      en: "/en/solutions/marketplace-analytics",
      "x-default": "/yechimlar/moliya",
    },
  },
  openGraph: {
    title: "Финансовый Учет PnL и Себестоимость FIFO — eStats",
    description: "Знайте свою реальную прибыль с каждого проданного товара на Uzum и других площадках.",
    url: "https://estats.uz/ru/yechimlar/moliya",
    locale: "ru_RU",
  },
};

export default function RussianFinanceSolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Решения", url: "/ru" },
          { name: "Финансы и FIFO", url: "/ru/yechimlar/moliya" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <DollarSign className="size-3.5" /> Управленческий учет
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Финансы, отчет PnL и <span className="text-primary">себестоимость по FIFO</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Многие селлеры путают выручку с прибылью. eStats рассчитывает точную сумму, которую вы действительно заработали и можете вывести из бизнеса без ущерба для оборота.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">1. Бухгалтерский стандарт FIFO</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Автоматическое списание стоимости товаров строго по очередности партий поступления. Это предотвращает кассовые разрывы при изменении курса валют или цен поставщиков.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">2. Учет всех операционных затрат</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Вносите аренду склада, зарплаты сотрудников, налоги и рекламу — система справедливо распределит постоянные расходы на проданные товары.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Управляйте деньгами на основе точных цифр</h2>
          <p className="text-sm text-muted-foreground mt-1">Откройте финансовый модуль eStats бесплатно.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Попробовать бесплатно</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
