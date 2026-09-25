import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Wildberries Узбекистан — Аналитика Продаж, Склад FBO/FBS и Учет | eStats",
  description:
    "Профессиональная система учета и аналитики для селлеров Wildberries в Узбекистане. Синхронизация остатков, расчет процента выкупа, учет логистики и чистой прибыли по FIFO.",
  keywords: [
    "wildberries узбекистан",
    "вайлдберриз узбекистан селлер",
    "аналитика wildberries узбекистан",
    "склад wildberries ташкент",
    "fbs wildberries uzbekistan",
    "программа для вайлдберриз",
  ],
  alternates: {
    canonical: "/ru/bozorlar/wildberries",
    languages: {
      uz: "/bozorlar/wildberries",
      ru: "/ru/bozorlar/wildberries",
      en: "/en/solutions/marketplace-analytics",
      "x-default": "/bozorlar/wildberries",
    },
  },
  openGraph: {
    title: "Wildberries Узбекистан — Аналитика и Складской Учет eStats",
    description: "Контролируйте продажи, выкупы и чистую прибыль на Wildberries в едином окне.",
    url: "https://estats.uz/ru/bozorlar/wildberries",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Как селлеру из Узбекистана продавать на Wildberries?",
    answer:
      "Селлеры могут зарегистрировать юридическое лицо (YaTT или MChJ) и работать по схемам FBS (продажи со своего склада в Ташкенте и сдача в сортировочные центры WB) или FBO (поставка партий на склады Wildberries).",
  },
  {
    question: "Как eStats помогает продавцам Wildberries?",
    answer:
      "eStats объединяет продажи на Wildberries с Uzum Market и другими площадками, предотвращает пересортицу и Out-of-Stock, рассчитывает реальный процент выкупа и выводит чистую прибыль с учетом комиссий и логистики.",
  },
];

export default function RussianWildberriesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Маркетплейсы", url: "/ru" },
          { name: "Wildberries Узбекистан", url: "/ru/bozorlar/wildberries" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
          <Sparkles className="size-3.5" /> WB Узбекистан &amp; СНГ
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналитика и учет для <span className="text-purple-600">Wildberries Узбекистан</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Полный контроль над выкупами, логистическими удержаниями, складами FBO/FBS и финансовыми отчетами в одной панели.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Boxes className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Синхронизация остатков FBS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Если один и тот же товар продается на Uzum и Wildberries, eStats автоматически корректирует остатки при покупке, предотвращая штрафы за отмену заказов.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Учет выкупов и возвратов</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Wildberries имеет высокий процент возвратов, особенно в категории одежды. eStats рассчитывает чистую прибыль только по фактически выкупленным заказам.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-purple-500/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">Готовы масштабировать продажи на WB?</h2>
          <p className="text-sm text-muted-foreground">
            Подключите личный кабинет продавца Wildberries к eStats и управляйте бизнесом на автопилоте.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Подключить бесплатно</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
