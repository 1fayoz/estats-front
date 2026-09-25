import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Globe2, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналог MPSTATS для Uzum Market и Узбекистана — eStats | Сравнение",
  description:
    "Ищете аналог MPSTATS для рынка Узбекистана? eStats объединяет глубокую аналитику Uzum Market, Wildberries, Yandex Market и Ozon. Оплата в сумах, себестоимость по FIFO и цены в разы ниже.",
  keywords: [
    "аналог mpstats uzum",
    "mpstats узбекистан",
    "mpstats для uzum market",
    "аналитика маркетплейсов узбекистан",
    "сравнение mpstats и estats",
    "wildberries узбекистан аналитика",
    "сервис аналитики uzum",
  ],
  alternates: {
    canonical: "/ru/muqobil/mpstats",
    languages: {
      uz: "/muqobil/mpstats",
      ru: "/ru/muqobil/mpstats",
    },
  },
  openGraph: {
    title: "Аналог MPSTATS для Узбекистана — eStats",
    description: "Комплексная аналитика Uzum Market, WB, Ozon и Yandex по доступной цене.",
    url: "https://estats.uz/ru/muqobil/mpstats",
  },
};

const FAQ_ITEMS = [
  {
    question: "Почему MPSTATS не подходит большинству селлеров в Узбекистане?",
    answer:
      "Тарифы MPSTATS начинаются от сотен долларов в месяц и не покрывают специфику главного узбекского маркетплейса — Uzum Market. eStats с самого начала создавался под рынок Центральной Азии, поддерживает оплату через Payme/Click/Uzcard и расчет в национальной валюте.",
  },
  {
    question: "Поддерживает ли eStats учет себестоимости?",
    answer:
      "Да! В отличие от MPSTATS, eStats — это не просто внешняя аналитика, а полноценная учетная система с расчетом себестоимости партий по методу FIFO, контролем FBO/FBS складов и автоматическим учетом возвратов.",
  },
];

export default function RussianMpstatsAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Сравнение", url: "/ru/muqobil/zoomselling" },
          { name: "Аналог MPSTATS", url: "/ru/muqobil/mpstats" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Globe2 className="size-3.5" /> Альтернатива MPSTATS
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          MPSTATS для Узбекистана: <span className="text-primary">Почему eStats эффективнее?</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Зачем переплачивать за громоздкие российские сервисы, если есть eStats — специализированная платформа
          для селлеров Uzum Market, Wildberries, Yandex Market и Ozon.
        </p>
      </header>

      {/* Comparison table */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold">Сравнительная таблица возможностей</h2>
          <p className="text-xs text-muted-foreground mt-1">MPSTATS против eStats в реалиях рынка Узбекистана</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="p-4 sm:p-5">Возможности</th>
                <th className="p-4 sm:p-5">MPSTATS</th>
                <th className="p-4 sm:p-5 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium">Аналитика Uzum Market</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Недоступно</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Полный парсинг и аудит</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Мульти-маркетплейс (WB, Yandex, Ozon)</td>
                <td className="p-4 text-muted-foreground"><Check className="size-4 text-emerald-500 inline" /> Да</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Да (единое окно)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Точный партионный учет FIFO</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Да (партиями)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Оплата в сумах (Payme, Click, Б/Н)</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Валютные карты</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Мгновенно в сумах</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Автопостинг в Telegram и Instagram</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Встроенный модуль</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Переходите на eStats сегодня</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Получите профессиональную аналитику продаж, складской учет и расчет чистой прибыли без валютных переплат.
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
