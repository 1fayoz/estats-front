import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналог ZoomSelling — eStats | Аналитика Uzum Market, Склад и PnL",
  description:
    "Ищете лучшую альтернативу ZoomSelling в Узбекистане? eStats предлагает больше возможностей: точный расчет чистой прибыли по FIFO, складской учет, поддержка Wildberries, Yandex и Ozon, AI карточки товаров.",
  keywords: [
    "zoomselling аналог",
    "альтернатива zoomselling",
    "zoomselling узбекистан",
    "зумселлинг аналитика",
    "estats vs zoomselling",
    "программа для uzum market",
    "учет прибыли uzum market",
  ],
  alternates: {
    canonical: "/ru/muqobil/zoomselling",
    languages: {
      uz: "/muqobil/zoomselling",
      ru: "/ru/muqobil/zoomselling",
      en: "/en/alternatives/zoomselling",
      "x-default": "/muqobil/zoomselling",
    },
  },
  openGraph: {
    title: "Аналог ZoomSelling в Узбекистане — eStats",
    description: "Сравните eStats и ZoomSelling: мульти-маркетплейс, себестоимость по FIFO и склад.",
    url: "https://estats.uz/ru/muqobil/zoomselling",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "В чем главное преимущество eStats перед ZoomSelling?",
    answer:
      "ZoomSelling сфокусирован только на оценке выручки Uzum Market. eStats — это полноценная платформа управления: партионный учет себестоимости по FIFO, расчет реальной чистой прибыли (PnL), управление собственным складом, контроль остатков FBO/FBS и поддержка всех ключевых маркетплейсов (Uzum, WB, Yandex, Ozon).",
  },
  {
    question: "Сложно ли перейти с ZoomSelling на eStats?",
    answer:
      "Переход занимает менее 2 минут. Вы подключаете API-ключ вашего магазина, и eStats автоматически импортирует все карточки, заказы и продажи за прошлые периоды.",
  },
];

const COMPARISON = [
  { feature: "Аналитика продаж на Uzum Market", zoomselling: true, estats: true },
  { feature: "Подключение Wildberries, Yandex Market, Ozon", zoomselling: false, estats: true },
  { feature: "Партионная себестоимость FIFO и чистая прибыль PnL", zoomselling: false, estats: true },
  { feature: "Учет собственного склада и поставок FBO/FBS", zoomselling: false, estats: true },
  { feature: "Распределение постоянных расходов на единицу товара", zoomselling: false, estats: true },
  { feature: "AI генерация продающих карточек на русском и узбекском", zoomselling: false, estats: true },
  { feature: "Мгновенные Telegram-уведомления о заказах и возвратах", zoomselling: false, estats: true },
  { feature: "Расширение для браузера (аналитика прямо на сайте)", zoomselling: true, estats: true },
  { feature: "Современный быстрый интерфейс без зависаний", zoomselling: "Базовый", estats: true },
];

export default function RussianZoomSellingComparisonPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Сравнение", url: "/ru" },
          { name: "Аналог ZoomSelling", url: "/ru/muqobil/zoomselling" },
        ]}
      />
      <FAQSchema
        items={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Сравнение решений
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Современный аналог <span className="text-primary">ZoomSelling</span> в Узбекистане
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Почему тысячи успешных продавцов выбирают eStats для контроля реальной прибыли, складских остатков и роста продаж.
        </p>
      </header>

      {/* Comparison Table */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="p-6 border-b bg-muted/20 sm:p-8">
          <h2 className="text-xl font-bold">Сравнительная таблица возможностей</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Наглядное сопоставление функционала ZoomSelling и платформы eStats.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="p-4 sm:p-5">Возможность / Функция</th>
                <th className="p-4 text-center sm:p-5 w-36">ZoomSelling</th>
                <th className="p-4 text-center sm:p-5 w-36 bg-primary/5 text-primary font-bold">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {COMPARISON.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition">
                  <td className="p-4 sm:p-5 font-medium text-foreground">{row.feature}</td>
                  <td className="p-4 text-center sm:p-5">
                    {row.zoomselling === true ? (
                      <Check className="size-5 text-emerald-600 inline" />
                    ) : row.zoomselling === false ? (
                      <X className="size-5 text-rose-500 inline opacity-40" />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">{row.zoomselling}</span>
                    )}
                  </td>
                  <td className="p-4 text-center sm:p-5 bg-primary/5">
                    {row.estats === true ? (
                      <Check className="size-5 text-primary inline font-bold" />
                    ) : (
                      <X className="size-5 text-rose-500 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Switch CTA */}
      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">Переходите на eStats уже сегодня</h2>
          <p className="text-sm text-muted-foreground">
            Попробуйте бесплатно все функции eStats и оцените разницу в управлении бизнесом.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          <span>Зарегистрироваться в eStats</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
