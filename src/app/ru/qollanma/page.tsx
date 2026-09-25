import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "База Знаний и Инструкции для Селлеров Маркетплейсов | eStats",
  description:
    "Пошаговые руководства по торговле на Uzum Market, Wildberries и Яндекс Маркет в Узбекистане: открытие магазина, SEO оптимизация карточек, выбор схемы FBO/FBS и реклама Boost TOP.",
  keywords: [
    "как открыть магазин на uzum market",
    "инструкция селлера uzum",
    "fbo fbs разница узбекистан",
    "seo оптимизация карточек uzum",
    "настройка boost top узбекистан",
    "база знаний маркетплейсов",
  ],
  alternates: {
    canonical: "/ru/qollanma",
    languages: {
      uz: "/qollanma",
      ru: "/ru/qollanma",
    },
  },
  openGraph: {
    title: "База Знаний для Продавцов Маркетплейсов — eStats",
    description: "Практические инструкции от открытия ИП до масштабирования продаж.",
    url: "https://estats.uz/ru/qollanma",
  },
};

const GUIDES = [
  {
    title: "Как открыть магазин на Uzum Market: Полное руководство (2026)",
    slug: "/ru/qollanma/uzumda-dokon-ochish",
    category: "Старт",
    description:
      "Регистрация ИП/ООО, подписание оферты, требования к сертификатам и отгрузка первой партии товаров на склад.",
  },
  {
    title: "Как правильно оформить карточку товара для выхода в ТОП",
    slug: "/ru/qollanma/kartochka-toldirish",
    category: "SEO Карточки",
    description:
      "Секреты подбора поисковых ключей, создания продающей инфографики и конверсионного описания с помощью AI.",
  },
  {
    title: "FBO или FBS: Какую схему работы выбрать новичку на Uzum?",
    slug: "/ru/qollanma/fbo-fbs-farqi",
    category: "Логистика",
    description:
      "Сравнение комиссий, стоимости хранения, скорости доставки и рисков заморозки остатков при разных моделях торговли.",
  },
  {
    title: "Настройка рекламы Boost TOP на Uzum без слива бюджета",
    slug: "/ru/qollanma/boost-top-sozlash",
    category: "Маркетинг",
    description:
      "Контроль доли рекламных расходов (ДРР), расчет окупаемости ROAS и отключение неэффективных поисковых запросов.",
  },
  {
    title: "Как находить прибыльные ниши с низкой конкуренцией на Uzum",
    slug: "/ru/qollanma/top-nishalar",
    category: "Анализ рынка",
    description:
      "Методика поиска дефицитных товаров, оценка емкости категории и проверка монополизации рынка топ-селлерами.",
  },
];

export default function RussianGuidesHubPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" /> База Знаний eStats
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Практические руководства для селлеров маркетплейсов
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Экспертные статьи и пошаговые инструкции по развитию бизнеса на Uzum Market, Wildberries,
          Яндекс Маркет и Ozon в Узбекистане.
        </p>
      </header>

      {/* Guides Grid */}
      <section className="grid gap-6 sm:grid-cols-2">
        {GUIDES.map((guide, idx) => (
          <Link
            key={idx}
            href={guide.slug}
            className="group rounded-3xl border border-border bg-card p-6 sm:p-8 transition hover:border-primary/50 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary mb-3">
                {guide.category}
              </span>
              <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                {guide.title}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {guide.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition">
              <span>Читать инструкцию</span>
              <ArrowRight className="size-4" />
            </div>
          </Link>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Автоматизируйте рутину с eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Пока вы читаете статьи, eStats рассчитывает точную себестоимость по FIFO и контролирует остатки складов.
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
