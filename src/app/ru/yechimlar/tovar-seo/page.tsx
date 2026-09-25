import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "AI SEO Оптимизация Карточек Товаров для Uzum Market | eStats",
  description:
    "Выводите товары на 1-е место в поиске Uzum Market с помощью искусственного интеллекта eStats. Генерация ключевых слов, SEO-названий, продающих описаний и аудит индексации.",
  keywords: [
    "ai seo uzum market",
    "оптимизация карточек uzum",
    "продвижение товаров узбекистан",
    "сео описание узум маркет",
    "ключевые слова uzum",
    "вывод в топ uzum market",
  ],
  alternates: {
    canonical: "/ru/yechimlar/tovar-seo",
    languages: {
      uz: "/yechimlar/tovar-seo",
      ru: "/ru/yechimlar/tovar-seo",
      en: "/en/solutions/ai-seo",
      "x-default": "/yechimlar/tovar-seo",
    },
  },
  openGraph: {
    title: "AI SEO Оптимизация Карточек Товаров для Uzum Market — eStats",
    description: "Автоматический подбор высокочастотных поисковых запросов и генерация продающих текстов.",
    url: "https://estats.uz/ru/yechimlar/tovar-seo",
    locale: "ru_RU",
  },
};

export default function RussianSeoSolutionPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Решения", url: "/ru" },
          { name: "AI SEO карточек", url: "/ru/yechimlar/tovar-seo" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> AI Копирайтер &amp; SEO
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          AI SEO оптимизация карточек для <span className="text-primary">Uzum Market</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Увеличьте органические показы и продажи в 2-3 раза. Наш искусственный интеллект анализирует поисковые запросы покупателей и генерирует идеальные карточки на двух языках.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">1. Сбор целевых поисковых запросов</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            eStats находит реальные фразы, которые покупатели вводят в поисковой строке Uzum, и вставляет их в заголовок и характеристики товара.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-bold">2. Двуязычные продающие описания</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Генерация структурированного текста на узбекском и русском языках с перечислением ключевых преимуществ товара и закрытием частых возражений.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Поднимите ваши карточки в ТОП выдачи</h2>
          <p className="text-sm text-muted-foreground mt-1">Оптимизируйте первый товар с помощью AI бесплатно.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Запустить AI оптимизацию</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
