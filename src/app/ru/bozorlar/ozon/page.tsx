import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Globe2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Ozon Узбекистан — Продажи, Экспорт в СНГ и Складской Учет | eStats",
  description:
    "Продажи на Ozon из Узбекистана: учет международной логистики, таможенных документов, синхронизация FBS складов и расчет чистой прибыли в валюте и сумах.",
  keywords: [
    "ozon узбекистан",
    "озон узбекистан селлер",
    "продажи на озон из узбекистана",
    "экспорт озон ташкент",
    "fbs ozon uzbekistan",
  ],
  alternates: {
    canonical: "/ru/bozorlar/ozon",
    languages: {
      uz: "/bozorlar/ozon",
      ru: "/ru/bozorlar/ozon",
      en: "/en/solutions/marketplace-analytics",
      "x-default": "/bozorlar/ozon",
    },
  },
  openGraph: {
    title: "Ozon Узбекистан — Продажи и Экспорт eStats",
    description: "Управление трансграничными поставками и продажами на Ozon из Узбекистана.",
    url: "https://estats.uz/ru/bozorlar/ozon",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Как продавать товары из Узбекистана на Ozon?",
    answer:
      "Селлеры из Узбекистана могут продавать национальный текстиль, обувь, сушеные фрукты и другие товары покупателям из Казахстана, России и Беларуси через Ozon Global и региональные сортировочные хабы.",
  },
  {
    question: "Как eStats помогает рассчитывать экспортную прибыль?",
    answer:
      "eStats автоматически конвертирует мультивалютные продажи (RUB, USD, KZT) в сумы по актуальному курсу ЦБ Узбекистана, вычитая таможенные сборы и международную доставку.",
  },
];

export default function RussianOzonPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Маркетплейсы", url: "/ru" },
          { name: "Ozon Узбекистан", url: "/ru/bozorlar/ozon" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
          <Globe2 className="size-3.5" /> Экспорт из Узбекистана
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Продажи и экспорт на <span className="text-blue-600">Ozon Узбекистан</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Выходите на миллионы покупателей по всему СНГ: автоматический учет кросс-бордер логистики, остатков и валютной выручки.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe2 className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Мультивалютный учет</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Автоматический пересчет выручки в национальной валюте сумах по официальному курсу на момент закрытия финансового периода.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Boxes className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Складской контроль Ozon FBS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Отгружайте заказы в сортировочные центры Ташкента со своего склада с автоматической печатью штрихкодов и актов передачи.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-blue-500/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">Масштабируйте экспорт с eStats</h2>
          <p className="text-sm text-muted-foreground">
            Объедините Ozon с внутренними продажами на Uzum в единую ERP-систему.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Подключить Ozon</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
