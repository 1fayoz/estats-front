import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Check, X } from "lucide-react";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "FBO или FBS на Uzum Market: Разница, Плюсы и Минусы для Селлера | eStats",
  description:
    "Сравнение схем FBO (продажи со склада маркетплейса) и FBS (продажи со своего склада) на Uzum Market в Узбекистане: комиссии, скорость доставки, заморозка капитала и риски.",
  keywords: [
    "fbo fbs разница uzum",
    "fbo uzum market что это",
    "fbs uzum market плюсы и минусы",
    "схемы работы маркетплейс узбекистан",
    "складские тарифы uzum",
  ],
  alternates: {
    canonical: "/ru/qollanma/fbo-fbs-farqi",
    languages: {
      uz: "/qollanma/fbo-fbs-farqi",
      ru: "/ru/qollanma/fbo-fbs-farqi",
    },
  },
  openGraph: {
    title: "FBO против FBS на Uzum Market — eStats Руководство",
    description: "Какую модель работы выбрать селлеру в 2026 году?",
    url: "https://estats.uz/ru/qollanma/fbo-fbs-farqi",
  },
};

const FAQ_ITEMS = [
  {
    question: "Что выгоднее для начинающего селлера?",
    answer:
      "FBO дает преимущество в виде доставки за 1 день по всему Узбекистану и более высоких позиций в поиске. FBS удобен для тестирования новых товаров или для крупногабаритных позиций, чтобы не платить за хранение.",
  },
  {
    question: "Можно ли совмещать FBO и FBS?",
    answer:
      "Да, большинство опытных продавцов держат ходовые топ-товары на FBO для быстрой отгрузки, а редкие или дорогие позиции отгружают по схеме FBS.",
  },
];

export default function RussianFboFbsGuidePage() {
  return (
    <article className="space-y-12">
      <BreadcrumbSchema
        items={[
          { name: "Главная", url: "/ru" },
          { name: "Инструкции", url: "/ru/qollanma" },
          { name: "Разница FBO и FBS", url: "/ru/qollanma/fbo-fbs-farqi" },
        ]}
      />
      <FaqSchema items={FAQ_ITEMS} />

      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Boxes className="size-3.5" /> Складская Логистика
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          FBO или FBS на <span className="text-primary">Uzum Market</span>: Что выбрать?
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Детальный разбор двух главных логистических моделей торговли на маркетплейсах в Узбекистане.
        </p>
      </header>

      {/* Comparison Grid */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="inline-block rounded-xl bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
            FBO (Fulfillment by Operator)
          </div>
          <h2 className="text-xl font-bold text-foreground">Товары на складе Uzum</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Вы отгружаете партию на центральный склад Uzum. Маркетплейс сам собирает, упаковывает и доставляет заказы за 1 день.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground pt-2">
            <li className="flex items-center gap-2 text-foreground font-medium">
              <Check className="size-4 text-emerald-600" /> Доставка за 1 день в любую точку Узбекистана
            </li>
            <li className="flex items-center gap-2 text-foreground font-medium">
              <Check className="size-4 text-emerald-600" /> Выше позиции в поиске благодаря скорости доставки
            </li>
            <li className="flex items-center gap-2 text-rose-500 font-medium">
              <X className="size-4 text-rose-500" /> Платное хранение неликвидных остатков
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="inline-block rounded-xl bg-muted text-foreground px-3 py-1 text-xs font-bold">
            FBS (Fulfillment by Seller)
          </div>
          <h2 className="text-xl font-bold text-foreground">Товары на вашем складе</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Товары хранятся у вас. При поступлении заказа вы упаковываете товар и передаете его в пункт приёма (ПВЗ).
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground pt-2">
            <li className="flex items-center gap-2 text-foreground font-medium">
              <Check className="size-4 text-emerald-600" /> Нет платы за хранение на складе Uzum
            </li>
            <li className="flex items-center gap-2 text-foreground font-medium">
              <Check className="size-4 text-emerald-600" /> Идеально для тестирования новинок без заморозки партии
            </li>
            <li className="flex items-center gap-2 text-rose-500 font-medium">
              <X className="size-4 text-rose-500" /> Необходимость быстрой ежедневной отгрузки заказов
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Управляйте FBO и FBS в едином окне</h2>
        <p className="mt-3 text-sm opacity-90 max-w-xl mx-auto">
          Платформа eStats синхронизирует остатки на складах маркетплейсов и заранее предупреждает о риске Out of Stock.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-background px-8 py-3.5 text-sm font-bold text-foreground shadow-md transition hover:bg-background/90"
          >
            <span>Попробовать eStats</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}
