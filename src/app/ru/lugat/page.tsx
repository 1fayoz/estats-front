import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Search, Sparkles } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Глоссарий Терминов Маркетплейсов — FIFO, ДРР, FBO, FBS, ROAS, SKU | eStats",
  description:
    "Полный словарь понятий и аббревиатур для селлеров Uzum Market, Wildberries и Ozon: FIFO, FBO, FBS, ДРР, ROAS, SKU, Out of Stock, Юнит-экономика простыми словами.",
  keywords: [
    "глоссарий маркетплейсов",
    "что такое fifo",
    "разница fbo и fbs",
    "что такое дрр",
    "sku это",
    "out of stock значение",
    "термины uzum market",
  ],
  alternates: {
    canonical: "/ru/lugat",
    languages: {
      uz: "/lugat",
      ru: "/ru/lugat",
    },
  },
  openGraph: {
    title: "Глоссарий Терминов Маркетплейсов — eStats База Знаний",
    description: "Энциклопедия терминов электронной коммерции для селлеров.",
    url: "https://estats.uz/ru/lugat",
  },
};

const TERMS = [
  {
    term: "FIFO (First-In, First-Out)",
    category: "Финансы & Склад",
    definition:
      "Метод партионного учета, при котором товары списываются по себестоимости первой поступившей партии. Позволяет рассчитывать реальную чистую прибыль (PnL) без искусственных искажений при изменении закупочных цен.",
  },
  {
    term: "FBO (Fulfillment by Operator)",
    category: "Логистика",
    definition:
      "Модель торговли, при которой товары хранятся на складе маркетплейса (Uzum Market или Wildberries). Маркетплейс берет на себя хранение, сборку заказов и доставку покупателю за 1 день.",
  },
  {
    term: "FBS (Fulfillment by Seller)",
    category: "Логистика",
    definition:
      "Схема, при которой селлер хранит товар на собственном складе и после поступления заказа самостоятельно упаковывает его и привозит в сортировочный центр или ПВЗ маркетплейса.",
  },
  {
    term: "ДРР (Доля рекламных расходов / ACoS)",
    category: "Маркетинг",
    definition:
      "Процентное отношение затрат на рекламу к полученной выручке. Формула: (Рекламные расходы / Рекламная выручка) × 100%. Чем ниже ДРР, тем выше рентабельность рекламной кампании.",
  },
  {
    term: "ROAS (Return on Ad Spend)",
    category: "Маркетинг",
    definition:
      "Коэффициент возврата рекламных инвестиций. Показывает, сколько сумов выручки принес каждый вложенный в рекламу сум. Формула: Рекламная выручка / Затраты на рекламу.",
  },
  {
    term: "SKU (Stock Keeping Unit)",
    category: "Складской учет",
    definition:
      "Уникальный идентификатор товарной позиции с учетом размера, цвета и характеристик. Каждая отдельная вариация товара имеет свой индивидуальный SKU и штрихкод.",
  },
  {
    term: "Out of Stock (Обнуление остатков)",
    category: "Складской учет",
    definition:
      "Ситуация, когда товар полностью распродан и на складе числится 0 шт. Приводит к мгновенному падению карточки в поисковой выдаче маркетплейса и потере позиций в ТОПе.",
  },
  {
    term: "Reorder Point (Точка перезаказа, ROP)",
    category: "Складской учет",
    definition:
      "Пороговый остаток товара на складе, при достижении которого необходимо оформить новый заказ поставщику, чтобы избежать дефицита до прибытия новой партии.",
  },
];

export default function RussianGlossaryPage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Глоссарий", url: "/ru/lugat" },
        ]}
      />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="size-3.5" /> Терминология Селлера
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Глоссарий терминов маркетплейсов
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Понятные объяснения ключевых понятий торговли на Uzum Market, Wildberries, Yandex Market и Ozon:
          от складских схем до финансовых метрик.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {TERMS.map((item, idx) => (
          <div key={idx} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{item.term}</h2>
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.definition}
            </p>
          </div>
        ))}
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Применяйте правильные метрики в eStats</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          eStats берет на себя все математические расчеты: от FIFO себестоимости до ДРР и Reorder Point.
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
