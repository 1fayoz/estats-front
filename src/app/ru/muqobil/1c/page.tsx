import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Облачный Складской Учет вместо 1С и МойСклад для Маркетплейсов | eStats",
  description:
    "Ищете удобную замену 1С и МойСклад в Узбекистане? eStats — легкая облачная система учета для продавцов маркетплейсов: партионный учет себестоимости по FIFO, синхронизация FBO/FBS, штрихкоды и PnL.",
  keywords: [
    "1с склад узбекистан",
    "мой склад узбекистан",
    "аналог 1с узбекистан",
    "программа складского учета маркетплейс",
    "учет товаров узбекистан",
    "себестоимость партий fifo",
    "облачный склад ташкент",
  ],
  alternates: {
    canonical: "/ru/muqobil/1c",
    languages: {
      uz: "/muqobil/1c",
      ru: "/ru/muqobil/1c",
      en: "/en/solutions/inventory-management",
      "x-default": "/muqobil/1c",
    },
  },
  openGraph: {
    title: "eStats вместо 1С и МойСклад — Облачный Учет для Маркетплейсов",
    description: "Простой, быстрый и доступный учет товаров и финансов без тяжелой 1С.",
    url: "https://estats.uz/ru/muqobil/1c",
    locale: "ru_RU",
  },
};

const FAQ_ITEMS = [
  {
    question: "Почему eStats удобнее 1С для работы с маркетплейсами?",
    answer:
      "1С создавалась как универсальная бухгалтерская система для офлайн-предприятий. Ее внедрение требует дорогостоящих серверов и программистов. eStats изначально спроектирован под специфику электронной коммерции: автоматический импорт отчетов комиссионера Uzum, учет возвратов, работа по FBS и мгновенная печать маркировок прямо из браузера.",
  },
  {
    question: "Поддерживает ли eStats правильный бухгалтерский метод FIFO?",
    answer:
      "Да! eStats строго списывает себестоимость по партиям прихода (First-In, First-Out). Если вы купили первую партию по 50 000 сум, а вторую по 60 000 сум, сервис точно рассчитает прибыль по мере их реализации.",
  },
];

export default function Russian1CAlternativePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-16 space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Сравнение", url: "/ru" },
          { name: "Вместо 1С и МойСклад", url: "/ru/muqobil/1c" },
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
          <Zap className="size-3.5" /> Облачное решение
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Облачный складской учет <span className="text-primary">вместо 1С и МойСклад</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Легкий, быстрый и специализированный сервис для селлеров в Узбекистане. Начните работу за 5 минут без программистов и серверов.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 space-y-2">
          <h2 className="text-base font-bold">1С:Предприятие</h2>
          <p className="text-xs text-rose-500 font-semibold">Сложно и дорого</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Требует покупки лицензий, настройки серверов и постоянной оплаты программистов. Не умеет синхронизировать маркетплейсы из коробки.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-2">
          <h2 className="text-base font-bold">МойСклад</h2>
          <p className="text-xs text-amber-500 font-semibold">Высокая цена в валюте</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Дорогие тарифы за каждого пользователя. Нет встроенной глубокой интеграции с узбекским Uzum Market и местными платежными системами.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6 space-y-2">
          <h2 className="text-base font-bold text-primary">eStats ERP</h2>
          <p className="text-xs text-emerald-600 font-semibold">Идеально для селлеров</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Создан специально для Uzum, WB и Yandex Market. Точный FIFO, мультивалютный учет в сумах, мобильный доступ и доступная стоимость.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold">Замените 1С современным eStats</h2>
          <p className="text-sm text-muted-foreground">
            Попробуйте учет склада и себестоимости бесплатно прямо сейчас.
          </p>
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
