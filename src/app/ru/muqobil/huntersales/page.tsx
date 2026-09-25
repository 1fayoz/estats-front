import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Аналог HunterSales для Uzum Market — eStats | Сравнение и Преимущества",
  description:
    "Ищете альтернативу HunterSales? Платформа eStats предлагает расширенную внешнюю аналитику ниш, точный учет себестоимости по FIFO, складской контроль и AI SEO для продавцов Uzum Market и Wildberries.",
  keywords: [
    "аналог huntersales uzum",
    "huntersales узбекистан",
    "huntersales или estats",
    "аналитика uzum market отзывы",
    "разведка ниш uzum",
    "парсер узбекских маркетплейсов",
  ],
  alternates: {
    canonical: "/ru/muqobil/huntersales",
    languages: {
      uz: "/muqobil/huntersales",
      ru: "/ru/muqobil/huntersales",
    },
  },
  openGraph: {
    title: "Аналог HunterSales для Uzum Market — eStats",
    description: "Комплексная аналитика и управление магазином в едином сервисе.",
    url: "https://estats.uz/ru/muqobil/huntersales",
  },
};

const FAQ_ITEMS = [
  {
    question: "Чем eStats превосходит HunterSales?",
    answer:
      "HunterSales специализируется преимущественно на парсинге рынка. eStats идет дальше: это сквозная ERP-система, объединяющая поиск прибыльных ниш с внутренней операционкой — складским учетом, расчетом чистой прибыли по партионному методу FIFO и генерацией карточек через AI.",
  },
  {
    question: "Предоставляется ли бесплатный доступ?",
    answer:
      "Да, новым пользователям доступен полноценный бесплатный тестовый период, а также открытые калькуляторы комиссий и сканер карточек без регистрации.",
  },
];

export default function RussianHuntersalesAlternativePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Сравнение", url: "/ru/muqobil/zoomselling" },
          { name: "Аналог HunterSales", url: "/ru/muqobil/huntersales" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> HunterSales vs eStats
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Аналог HunterSales для Uzum Market: <span className="text-primary">Почему выбирают eStats?</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Узнайте, почему профессиональные селлеры переходят с узкопрофильных парсеров на полноценную систему управления eStats.
        </p>
      </header>

      {/* Comparison table */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold">Сравнение ключевых модулей</h2>
          <p className="text-xs text-muted-foreground mt-1">HunterSales против eStats</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="p-4 sm:p-5">Функционал</th>
                <th className="p-4 sm:p-5">HunterSales</th>
                <th className="p-4 sm:p-5 text-primary">eStats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium">Анализ ниш и топ-товаров Uzum</td>
                <td className="p-4 text-muted-foreground"><Check className="size-4 text-emerald-500 inline" /> Базовый</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Глубокий с динамикой</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Учет партий и себестоимости FIFO</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Полный партионный учет</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Контроль FBO и FBS складов</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Да (с точкой перезаказа)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Поддержка нескольких площадок (WB, Yandex, Ozon)</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Только Uzum</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> 4 маркетплейса в 1 окне</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">AI оптимизация SEO карточек</td>
                <td className="p-4 text-muted-foreground"><X className="size-4 text-rose-500 inline" /> Нет</td>
                <td className="p-4 font-bold text-emerald-600"><Check className="size-4 inline" /> Встроенный генератор</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Оцените возможности eStats бесплатно</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Подключите ваш магазин и получите полный доступ к аналитике, учету остатков и финансам.
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
