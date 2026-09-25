import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Яндекс Маркет Узбекистан — Управление Продажами, FBS и Аналитика | eStats",
  description:
    "Экосистема для продавцов Яндекс Маркет в Узбекистане: экспресс-доставка, склад FBS, оптимизация рекламных ставок (Буст продаж) и точный расчет чистой прибыли.",
  keywords: [
    "яндекс маркет узбекистан",
    "yandex market seller uzbekistan",
    "яндекс маркет ташкент",
    "буст продаж яндекс маркет",
    "fbs яндекс маркет узбекистан",
    "аналитика яндекс маркет",
  ],
  alternates: {
    canonical: "/ru/bozorlar/yandex-market",
    languages: {
      uz: "/bozorlar/yandex-market",
      ru: "/ru/bozorlar/yandex-market",
      en: "/en/solutions/marketplace-analytics",
      "x-default": "/bozorlar/yandex-market",
    },
  },
  openGraph: {
    title: "Яндекс Маркет Узбекистан — Управление Продажами eStats",
    description: "Автоматизация склада, заказов и рекламы для селлеров Яндекс Маркет в Ташкенте.",
    url: "https://estats.uz/ru/bozorlar/yandex-market",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Как работает модель Экспресс и FBS на Яндекс Маркете в Ташкенте?",
    answer:
      "Селлер хранит товар на собственном складе. При поступлении заказа в модели Экспресс курьер забирает товар в течение 1-2 часов, при классическом FBS — товар передается в сортировочный центр в течение суток.",
  },
  {
    question: "Поддерживает ли eStats синхронизацию Экспресс-заказов?",
    answer:
      "Да! eStats моментально резервирует товар на складе при поступлении заказа с Яндекс Маркета, не позволяя продать один и тот же товар дважды.",
  },
];

export default function RussianYandexMarketPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Маркетплейсы", url: "/ru" },
          { name: "Яндекс Маркет Узбекистан", url: "/ru/bozorlar/yandex-market" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
          <Zap className="size-3.5" /> Yandex Market Tashkent
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Управление магазином на <span className="text-yellow-600">Яндекс Маркет Узбекистан</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Быстрая обработка Экспресс-заказов, контроль рентабельности рекламных ставок Буста продаж и синхронизация складских остатков.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Zap className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Экспресс-доставка без задержек</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Автоматическая печать маркировочных ярлыков и мгновенная отправка статусов сборки заказа в приложение курьера.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
          <h2 className="text-lg font-bold">Оптимизация Буста продаж</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Отслеживайте долю рекламных расходов (ДРР) на Яндекс Маркете и отключайте ставки на нерентабельных позициях.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-yellow-500/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">Подключите Яндекс Маркет к eStats</h2>
          <p className="text-sm text-muted-foreground">
            Объедините продажи с Uzum и другими маркетплейсами в единую экосистему.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Начать бесплатно</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
